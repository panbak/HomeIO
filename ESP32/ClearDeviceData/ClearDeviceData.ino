#include "time.h"
#include <Preferences.h>

Preferences preferences;

void setup() {
  Serial.begin(115200);
  Serial.println("Deleting all keys for homeio-store namespace.");
  
  preferences.begin("homeio-store", false);  

  preferences.clear();

  preferences.end();

}

void loop() {
  delay(1000);
}
