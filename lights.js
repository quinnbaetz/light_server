var socket = require("socket.io-client")("http://10.33.38.54:8888");
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/tty.usbmodem577771", {
  baudrate: 9600
});

var opened = false;

function serialConnectionClosed(){
  opened = false;
}

function serialConnectionOpened(error){
  if(error){
    console.log("failed to open");
  }else{
    console.log("opened conection to leds");
    opened = true;
  }
}

function openSerialConnection(){
  serialPort.open(serialConnectionOpened);
}
serialPort.on("open", serialConnectionOpened);
serialPort.on("close", serialConnectionClosed);


socket.on("message", function(data){
     if(opened){
       serialPort.write(new Buffer([data[0], data[1]]), function(err, results) {
        if(err){
            console.log("error:"+err);
        }else{
            console.log("results: "+results);
        }
        //console.log('err ' + err);
        //console.log('results ' + results);
      });
    }else{
      openSerialConnection();
    }
});