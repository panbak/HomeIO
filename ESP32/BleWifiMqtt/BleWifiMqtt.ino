#include <Arduino_JSON.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#include <PubSubClient.h>
#include <Preferences.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiServer.h>
#include <WiFiUdp.h>
#include <HTTPClient.h>

#include <SDM.h>

#define SERVICE_UUID "6f581fe2-b873-4fd5-b27f-ead4948a45db"
#define CHARACTERISTIC_UUID "d0b779be-34ee-4920-9f14-c2f3e88cddca"
#define A_CHARACTERISTIC_UUID "5afe1153-5662-44f5-8783-cd706d60ddc6"

#define RELAY_PIN 27
#define SET_MODE_WIFI_PIN 12
#define SET_MODE_BLE_PIN 14
#define RESET_PIN 18

SDM sdm(Serial1, SDM_UART_BAUD, 25, SERIAL_8N1, SDM_RX_PIN, SDM_TX_PIN);

Preferences preferences;

String JWT;

String deviceCode, deviceStateEndpoint, datetimeEndpoint, deviceLoginEndpoint;
std::string datetime="";
String ssid = "";
String password = "";

String server = "https://homeio.panbak.com";
const char* mqtt_server = "homeio.panbak.com";
int mqtt_port=2082;

int reconnectCounter = 0; //if it doesnt connect to wifi or mqtt it should do some actions

bool WIFIinitiated = false;
bool BLEinitiated = false;

bool wifiOn = true;
bool deviceState;

WiFiClientSecure espClient;

PubSubClient client(espClient);
long lastMsg = 0;
long lastInstantMsg = 0;
long lastMeasurement = 0;
float totalMeasurements = 0.0;
int measurementsCounter = 0;
char msg[50];
int value = 0;
float power=0.0;

class BLECallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();
      String tmpSsid=""; 
      String tmpPass="";
      if (value.length() > 0) {
        Serial.println("*********");
        Serial.print("New value: ");
        for (int i = 0; i < value.length(); i++){
          Serial.print(value[i]);
        }
        Serial.println();
        Serial.println("*********");
      }

      ///SPLIT WIFI STRING///
      int pos = value.find_first_of(';');
      std::string passwordString = value.substr(pos+1),
      ssidString = value.substr(0, pos);

      for (int i = 0; i < ssidString.length(); i++){
          tmpSsid = tmpSsid+ssidString[i];
      }

      for (int i = 0; i < passwordString.length(); i++){
          tmpPass = tmpPass+passwordString[i];
      }
      /////
      preferences.begin("homeio-store", false);  
      preferences.putString("ssid", tmpSsid);
      preferences.putString("password", tmpPass);
      preferences.end();
    }
};

static void resetIfNecessary(){
  if(reconnectCounter>60){
    ESP.restart();
  }
}

void initWiFi() {
  WiFi.mode(WIFI_STA);
  Serial.println(ssid.c_str());
  Serial.println(password.c_str());
  WiFi.begin(ssid.c_str(), password.c_str());

  Serial.print("Connecting to WiFi ..");
  
  while (WiFi.status() != WL_CONNECTED && wifiOn) {
    button_press_listener();
    if(!wifiOn){
      return;
    }
    Serial.print('.');
    delay(1000);
    reconnectCounter++;
    resetIfNecessary();
  }
  Serial.println(WiFi.localIP());
  espClient.setInsecure();
}

void initBLE() {
  Serial.println("Starting BLE..");

  BLEDevice::init("HomeIO");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);

  BLECharacteristic *aCharacteristic = pService->createCharacteristic(
                                         A_CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_WRITE
                                       );
  
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_READ
                                       );

  aCharacteristic->setCallbacks(new BLECallbacks());
  std::string tempDeviceCode = deviceCode.c_str();
  pCharacteristic->setValue(tempDeviceCode); //set device code as characteristic descriptor
  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("Characteristic defined.");
}

void MQTTcallback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    messageTemp += (char)message[i];
  }
  Serial.println(messageTemp);

  JSONVar mqttObject = JSON.parse(messageTemp);

  if (JSON.typeof(mqttObject) == "undefined") {
    Serial.println("[ERROR] Could not parse JSON Object.");
    return;
  }
  JSONVar state = mqttObject["value"];
  Serial.print("Changing state to:");
  Serial.println(state);
  if(state){
    digitalWrite(RELAY_PIN, HIGH);
    deviceState=true;
  }else{
    digitalWrite(RELAY_PIN, LOW);
    deviceState=false;
  }
  Serial.println();
}

void MQTTreconnect() {
  Serial.print("Attempting MQTT connection...");
  login();
  if(client.connect(deviceCode.c_str(), "", JWT.c_str())){
    Serial.println("connected");
    getCurrentState();
    client.subscribe((deviceCode+"/state").c_str());
  }else{
    Serial.print("failed, rc=");
    Serial.println(client.state());
  }
  delay(1000);
}

static void login(){
  Serial.println("Device Login");
  HTTPClient http;
  String payload;
  // Your Domain name with URL path or IP address with path
  http.begin(deviceLoginEndpoint.c_str());
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  // Send HTTP POST request
  String httpRequestData = "device_code="+deviceCode;
  Serial.println(httpRequestData);
  int httpResponseCode = http.POST(httpRequestData);
      
  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    JWT = http.getString();
    Serial.println(JWT);
  }else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
    JWT="";
  }
  // Free resources
  http.end();
}

static bool getCurrentState(){
  Serial.println("Fetching device state: ");
  HTTPClient http;
  String payload;
  // Your Domain name with URL path or IP address with path
  http.begin(deviceStateEndpoint.c_str());
      
  // Send HTTP GET request
  int httpResponseCode = http.GET();
      
  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
    Serial.println(payload);
  }else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  http.end();

  if(payload=="false"){
    deviceState=false;
    return false;
  }
  deviceState=true;
  return true;
}

static std::string getDateTime(){
  HTTPClient http;
  std::string payload=datetime;
  // Your Domain name with URL path or IP address with path
  http.begin(datetimeEndpoint.c_str());
      
  // Send HTTP GET request
  int httpResponseCode = http.GET();
      
  if (httpResponseCode>0) {
    Serial.print("Current DateTime: ");
    payload = std::string(http.getString().c_str());
    Serial.println(http.getString());
  }else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  http.end();

  return payload;
}

static String rand_string()
{
    srand(esp_random()); //set seed for rand
    const char charset[] = "01234567890abcdefghijklmnopqrstuvwxyz";
    String str;
    int i;
    for(i = 0; i < 64; i++) {
      str = str + charset[rand() % 36];
    }
    return str;
}

static void button_press_listener(){
  if(digitalRead(SET_MODE_BLE_PIN) && wifiOn){
    wifiOn = false;
    Serial.println("[BLE MODE ON]");
  }
  if(digitalRead(SET_MODE_WIFI_PIN) && !wifiOn){
    wifiOn = true;
    Serial.println("[WIFI MODE ON]");
  }
  if(digitalRead(RESET_PIN)){
    Serial.println("[RESET DEVICE]");
    ESP.restart();
  }
  delay(10);
}

void setup() {
  Serial.begin(115200);

  //create unique device code
  preferences.begin("homeio-store", false);  
  if(!preferences.isKey("code")){
    preferences.putString("code", rand_string());
  }
  
  if(preferences.isKey("ssid")){
    ssid = preferences.getString("ssid");
  }

  if(preferences.isKey("password")){
    password = preferences.getString("password");
  }  
  
  deviceCode = preferences.getString("code");
  Serial.println("Device Code:");
  Serial.println(deviceCode);
  deviceStateEndpoint = server+"/device/"+deviceCode+"/state";
  datetimeEndpoint = server+"/datetime";
  deviceLoginEndpoint = server+"/device/login";
  // Set WiFi to station mode and disconnect from an AP if it was previously connected
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  delay(100);

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(MQTTcallback);

  Serial.println("Setup done");
  preferences.end();

  pinMode(RELAY_PIN, OUTPUT); 

  pinMode(SET_MODE_WIFI_PIN, INPUT);
  pinMode(SET_MODE_BLE_PIN, INPUT);
  pinMode(RESET_PIN, INPUT);

  sdm.begin();

}

void loop() {
 
  // put your main code here, to run repeatedly:
  if(wifiOn){
    if(!WIFIinitiated){
      Serial.println("WIFI not initiated. Initiating..");
      BLEinitiated = false;
      initWiFi();
      WIFIinitiated = true;
      bool state = getCurrentState();
      login();
      Serial.println(JWT);
      Serial.println(state);
      datetime = getDateTime();
        if(state){
        digitalWrite(RELAY_PIN, HIGH);
      }else{
        digitalWrite(RELAY_PIN, LOW);
      }
    }
    
    while(WiFi.status() != WL_CONNECTED && wifiOn) {
      button_press_listener();
      if(!wifiOn){
        break;
      }
      Serial.println("WIFI is disconnected. Reconnecting..");
      resetIfNecessary();
      Serial.println("reconnecting wifi");
      WiFi.reconnect();
      reconnectCounter++; //count the reconnection try in order to restart
      delay(500);
    }
    reconnectCounter = 0;
    if (!client.connected() && WiFi.status() == WL_CONNECTED) {
      MQTTreconnect();
    }
    
    client.loop();


    long now = millis();

    button_press_listener();
    
    if(deviceState){ //get watts only if device is on 
      Serial.println("[DEVICE ON]");
      if (now - lastMeasurement > 1000) { //watt sampling every second. then send the average value
        lastMeasurement = now;
        Serial.println("[MEASURING]");
        power = sdm.readVal(0x000C, 0x01);
        Serial.println(power);
        if(isnan(power)){
          power=0.0;
          Serial.println("[NAN ERROR]");
        }else{
          totalMeasurements += power;
          measurementsCounter++;
        }
      }
    }else{
      power=0.0;
      totalMeasurements += power;
      measurementsCounter++;
    }
    
    
    if (now - lastMsg > 60000) {
      datetime = getDateTime();
      lastMsg = now;
        Serial.println("publishing");
        float tmpPower = totalMeasurements/measurementsCounter;
        if(isnan(tmpPower)){
          tmpPower=0.0;
          Serial.println("[NAN ERROR]");
        }
        Serial.println(tmpPower);
        client.publish((deviceCode+"/consumption").c_str(), ("{ \"device\": \""+std::string(deviceCode.c_str())+"\", \"timestamp\":"+datetime+", \"value\":"+std::to_string(tmpPower)+"}").c_str());        
        totalMeasurements=0.0;
        measurementsCounter=0;
    }
    if (now - lastInstantMsg > 3000) {
      lastInstantMsg = now;
      Serial.println("[PUBLISHING INSTANT]");
      Serial.println(power);
      client.publish((deviceCode+"/instant").c_str(), ("{ \"device\": \""+std::string(deviceCode.c_str())+"\", \"timestamp\":"+datetime+", \"value\":"+std::to_string(power)+"}").c_str());
    }
    
  }else{
    button_press_listener();
    if(!BLEinitiated){
      WIFIinitiated = false;
      initBLE();
      BLEinitiated = true;  
    }
    delay(100);
  }
  delay(100);
}
