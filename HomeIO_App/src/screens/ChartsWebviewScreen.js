import React, { useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, PermissionsAndroid, Alert } from "react-native";
import tailwind from 'tailwind-rn';
import Icon from 'react-native-ico-material-design';
import WebView from 'react-native-webview';
import RNFS from 'react-native-fs';

const ChartsWebview = ({ navigation: { goBack }, route, navigation }) => {
    const webViewRef = useRef(null);
    const { data } = route.params;
    //console.log(data);
    const INJECTED_JAVASCRIPT = `(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({key : "${data}"}));
    })();`;

    const content = `
    <!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=0.6, maximum-scale=1, user-scalable=1">
    <style>
    .chartWrapper {
        position: relative;
    }
    
    .chartWrapper > canvas {
        position: absolute;
        left: 0;
        top: 0;
        pointer-events:none;
    }
    
    .chartAreaWrapper {
        width: 600px;
        overflow-x: scroll;
    }

    .download-button {
        background-color: #282829; /* Green */
        border: none;
        color: white;
        padding: 20px 35px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 25px;
        margin: 100px 5px;
        cursor: pointer;
        border-radius: 10px;
      }
    </style>
</head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<body>
<div class="chartWrapper" id="chart" style="margin-top: 5rem;">
    <div class="chartAreaWrapper" style="position: relative; height:100%;">
        <p style="color: gray;">Watts</p>
        <canvas id="myChart" ></canvas>
    </div>
    <canvas id="myChartAxis"></canvas>
</div>

<button onClick="downloadimage()" class="download-button">Αποθήκευση Γραφήματος</button>
<script>
//οταν εχουμε να κανουμε με περισσοτερα απο ενα dataseries υπαρχει το θεμα των διαφορετικων timestamp
//πρωτα τα κανουμε ολα merge και sort ενω παραλληλα δημιουργουμε τα αναλογα arrays για τον y αξονα
//ουσιαστικα αν εχουμε 2 τιμες για 2 μηνες αλλα τα timestamps ειναι ολα μαζι 5 θα πρεπει να γεμισουμε με 0νικα
// πχ [0,5.4,0,0,1.2]
function downloadimage() {
    let container = document.getElementById("chart");
    html2canvas(container, { allowTaint: true }).then(function (canvas) {
        var dataUrl = canvas.toDataURL("image/png");
        var link = document.createElement('a');
        //link.download = "my-image.png";
        link.href = dataUrl.replace("image/png", "image/octet-stream");
        //alert(link);
        window.ReactNativeWebView.postMessage(dataUrl);
        //link.click();
    });
}
var chartData = ${JSON.stringify(data)};
var timestamps = allTimestamps();
var datasets = [];
matchXYaxis();
(function() {
    //alert(JSON.stringify(chartData));
})();
function pluck(array, key) {
    return array.map(o => o[key]);
  }
function allTimestamps() {
    let timestamps = [];
    chartData.map(obj=>{
        obj.data.map(data=>{
            timestamps.push({x: data.x, sortIndex: data.sortIndex });
        });
    });
    timestamps.sort((a, b) => {
        return a.sortIndex - b.sortIndex;
    });
    timestamps = Array.from(new Set(pluck(timestamps, "x")));
    
    //alert(JSON.stringify(timestamps));
    return timestamps;
}
function matchXYaxis() {
    chartData.map(obj=>{
        let Y = [];
        timestamps.map(timestamp=>{
            objXs = pluck(obj.data, "x");
            let index = objXs.indexOf(timestamp);
            if(index >= 0){
                Y.push(parseFloat(obj.data[index].y));
            }else{
                Y.push(0);
            }
        });
        datasets.push({
            label: obj.device,
            data: Y,
            borderColor: obj.color,
            fill: false,
            pointRadius: 7,
        });
    });
    //alert(JSON.stringify(datasets));
}
new Chart("myChart", {
  type: "line",
  data: {
    labels: timestamps,
    datasets: datasets
  },
  options: {
    responsive: true,
    aspectRation: 0.7,
    legend: {
        display: true,
        position: 'bottom',
        align: 'start',
    },
    scales: {
        xAxes: {
            ticks: {
                font: {
                    size: 40,
                    family:'vazir'
                }
            }
        },
        yAxes: {
            ticks: {
                font: {
                    size: 40,
                    family:'vazir'
                },
            }
        }                       
    }
  },
  onAnimationComplete: function () {
    var sourceCanvas = this.chart.ctx.canvas;
    // the -5 is so that we don't copy the edges of the line
    var copyWidth = this.scale.xScalePaddingLeft - 5;
    // the +5 is so that the bottommost y axis label is not clipped off
    // we could factor this in using measureText if we wanted to be generic
    var copyHeight = this.scale.endPoint + 5;
    var targetCtx = document.getElementById("myChartAxis").getContext("2d");
    targetCtx.canvas.width = copyWidth;
    targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
  }
});
</script>
</body>
</html>
    `

    useEffect(() => {
        //get user's file paths from react-native-fs
        console.log(RNFS.DownloadDirectoryPath);
        console.log(RNFS.DocumentDirectoryPath); //alternative to MainBundleDirectory.
        console.log(RNFS.ExternalStorageDirectoryPath);

        requestPermissions();

    }, []);

    const requestPermissions = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Permissions Required",
                    message:
                        "The app requires permissions for file storage.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    const saveToDevice = async (data) => {
        if (data) {
            let date = new Date();
            var path = RNFS.DownloadDirectoryPath + '/' + date.getTime() + '.png';
            RNFS.writeFile(path, data, 'base64')
                .then(() => {
                    Alert.alert(
                        "Το γράφημα αποθηκέυτηκε.",
                        "Ελέξτε τις λήψεις σας ή την βιβλιοθήκη σας.",
                        [
                            {
                                text: "Ok",
                                style: "Ακύρωση"
                            }
                        ],
                        { cancelable: true }
                    );
                })
                .catch((err) => console.log(err.message));
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={[tailwind('flex flex-row flex-wrap justify-around'), { borderBottomColor: 'black', borderBottomWidth: 1, }]}>
                <TouchableOpacity
                    style={[tailwind('m-3 p-2 w-2/5 flex flex-row flex-wrap justify-around')]}
                    onPress={() => goBack()}>
                    <Icon
                        color="black"
                        name="go-back-left-arrow"
                        height="27"
                        width="27"
                    />
                    <Text style={[tailwind('text-black text-lg ml-1 font-bold text-center')]}>Έξοδος</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    style={[tailwind('m-3 p-2 w-2/5 flex flex-row flex-wrap justify-around')]}
                    onPress={() => downloadChart()}>
                    <Icon
                        color="black"
                        name="download-button"
                        height="27"
                        width="27"
                    />
                    <Text style={[tailwind('text-black text-lg ml-1 font-bold text-center')]}>Αποθήκευση</Text>
                </TouchableOpacity> */}
            </View>
            <WebView
                style={{ flex: 1 }}
                originWhitelist={['*']}
                source={{ html: content }}
                androidHardwareAccelerationDisabled
                injectedJavaScript={INJECTED_JAVASCRIPT}
                onMessage={(event) => {
                    const data = event.nativeEvent.data;
                    let imageData = data.split(',');
                    saveToDevice(imageData[1]);
                }}
                ref={webViewRef}
            />
        </View>
    );
};

export default ChartsWebview;