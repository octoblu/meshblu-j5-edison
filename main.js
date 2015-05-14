// Example based on Johnny-Five: https://github.com/rwaldron/johnny-five/wiki/Servo
var intel = require("galileo-io");
var five = require("johnny-five");
var meshblu = require("meshblu");
var meshbluJSON = require("./meshblu.json");
var fs = require("fs");

// Specifies how you want your message payload to be passed
// from Octoblu to your device
var MESSAGE_SCHEMA = {
  type: "object",
  properties: {
    peripheral: {
      type: "object",
      properties: {
        digital : {
          type: "string",
          title: "digital pin",
          enum: [ "2", "4", "7", "8", "10", "11", "12", "13"],
          required: false
        },
        servo: {
          type: "string",
          enum: ["3", "5", "6", "9"],
          required: false
        }
      }
    },
    digitalWrite: {
      type: "object",
      title: "Digital Write",
      properties:  {
        enable: {
          type: "boolean",
          title: "enable digitalWrite",
          required: false
        },
        state: {
          type: "string",
          enum: ["high", "low"],
          required: false
        }
      }
    },
    to: {
      type: "object",
      title: "Servo To",
      properties: {
        enable:{
          type: "boolean",
          title: "enable to",
          required: false
        },
        value: {
          type: "number",
          required: false
        }
      }
    },
    sweep: {
      type: "object",
      title: "Servo Sweep",
      properties: {
        enable:{
          type: "boolean",
          title: "enable sweep",
          required: false
        },
        min: {
          type: "number",
          required: false
        },
        max: {
          type: "number",
          required: false
        },
        interval: {
          type: "number",
          required: false
        },
        step: {
          type: "number",
          required: false
        }
      }
    }
  }
};

var conn = meshblu.createConnection({
  "uuid": meshbluJSON.uuid,
  "token": meshbluJSON.token,
  "server": "meshblu.octoblu.com", // optional- defaults to ws://meshblu.octoblu.com
  "port": 80  // optional- defaults to 80
});

conn.on("notReady", function(data) {
  console.log('UUID FAILED AUTHENTICATION!');
  console.log('not ready', data);

  // Register a device
  conn.register({
    "type": "intel-io"
  }, function (data) {
    console.log('registered device', data);
    meshbluJSON.uuid = data.uuid;
    meshbluJSON.token = data.token;
    fs.writeFile('meshblu.json', JSON.stringify(meshbluJSON), function(err) {
      if(err) return;
    });

  // Login to SkyNet to fire onready event
  conn.authenticate({
    "uuid": data.uuid,
    "token": data.token
    }, function (data) {
      console.log('authenticating', data);
    });
  });
});


// Wait for connection to be ready to send/receive messages
conn.on('ready', function(data) {
  console.log('ready event', data);

  conn.update({
    "uuid": meshbluJSON.uuid,
    "token": meshbluJSON.token,
    "messageSchema": MESSAGE_SCHEMA
  });

// Initialize johnny five board
// and specify that it's using edison-io
  var board = new five.Board({
    io: new intel()
  });

// Wait for the board to be ready for message passing
// board-specific code
  board.on('ready', function() {
    var p2 = new five.Led(2);
    var p4 = new five.Led(4);
    var p7 = new five.Led(7);
    var p8 = new five.Led(8);
    var p10 = new five.Led(10);
    var p12 = new five.Led(12);
    var p13 = new five.Led(13);
    var servo = new five.Servo(3);
    var servo2 = new five.Servo(5);
    var servo2 = new five.Servo(6);
    var servo2 = new five.Servo(9);

    var a0 = new five.Sensor("A0");
    var a1 = new five.Sensor("A1");
    var a2 = new five.Sensor("A2");
    var a3 = new five.Sensor("A3");
    var a4 = new five.Sensor("A4");
    var a5 = new five.Sensor("A5");

    var handleDigitalWrite = function(payload) {
      if(!payload || !payload.digitalWrite || !payload.digitalWrite.enable) {
        return;
      }

      switch(payload.peripheral.digital){
        case "2":
          if(payload.digitalWrite.state == "high"){
            p2.on();
          }else{
            p2.off();
          }
          break;
        case "4":
          if(payload.digitalWrite.state == "high"){
            p4.on();
          }else{
            p4.off();
          }
          break;
        case "7":
          if(payload.digitalWrite.state == "high"){
            p7.on();
          }else{
            p7.off();
          }
          break;
        case "8":
          if(payload.digitalWrite.state == "high"){
            p8.on();
          }else{
            p8.off();
          }
          break;
        case "10":
          if(payload.digitalWrite.state == "high"){
            p10.on();
          }else{
            p10.off();
          }
          break;
        case "11":
          if(payload.digitalWrite.state == "high"){
            p11.on();
          }else{
            p11.off();
          }
          break;
        case "12":
          if(payload.digitalWrite.state == "high"){
            p12.on();
          }else{
            p12.off();
          }
          break;
        case "13":
          if(payload.digitalWrite.state == "high"){
            p13.on();
          }else{
            p13.off();
          }
          break;
      }
    }

    var handleTo = function(payload) {
      if (!payload || !payload.to || !payload.to.enable) {
        return;
      }
      if(!payload.sweep || !payload.sweep.enable){
         if(payload.peripheral.servo == "3"){
           servo.stop();
           servo.to(payload.to.value);
         } else if(payload.peripheral.servo == "5") {
           servo2.stop();
           servo2.to(payload.to.value);
         } else if(payload.peripheral.servo == "6") {
           servo3.stop();
           servo3.to(payload.to.value);
         } else if(payload.peripheral.servo == "9") {
           servo4.stop();
           servo4.to(payload.to.value);
         }
       }
    }

    var handleSweep = function(payload) {
      if (!payload || !payload.sweep || !payload.sweep.enable) {
        return;
      }

      if(!payload.to.enable){
        if(payload.peripheral.servo == "3"){
          servo.sweep({
            range: [payload.sweep.min, payload.sweep.max],
            interval: payload.sweep.interval,
            step: payload.sweep.step
          });
        } else if(payload.peripheral.servo == "5") {
          servo2.sweep({
            range: [payload.sweep.min, payload.sweep.max],
            interval: payload.sweep.interval,
            step: payload.sweep.step
          });
        }else if(payload.peripheral.servo == "6") {
          servo3.sweep({
            range: [payload.sweep.min, payload.sweep.max],
            interval: payload.sweep.interval,
            step: payload.sweep.step
          });
        }else if(payload.peripheral.servo == "9") {
          servo4.sweep({
            range: [payload.sweep.min, payload.sweep.max],
            interval: payload.sweep.interval,
            step: payload.sweep.step
          });
        }
      }
    }

    // Handles incoming Octoblu messages
    conn.on('message', function(data) {
      console.log('message received', data);

       // Let's extract the payload
       var payload = data.payload;

      /* Manipulate the servos based on the message passed
         from an Octoblu/Meshblu generic device node
         example:
        {
          "servo": "6",
          "value": 180
        }
      */
      //checks the pin number from 'enum' in peripheral.digital, then sends it high or low
      handleDigitalWrite(payload);

      //3,5,6,9
      //checking if the enable is set for JUST the 'to' function, then sends it values
      handleTo(payload);

      //checking if the enable is set for JUST the 'sweep' function, then sends it values
      handleSweep(payload);
    }); // end Meshblu connection onMessage

  var v0, v1, v2, v3, v4, v5;

 // Read sensor data

  a0.on("change", function() {
    v0 = this.value;
  });
  a1.on("change", function() {
    v1 = this.value;
  });
  a2.on("change", function() {
    v2 = this.value;
  });
  a3.on("change", function() {
    v3 = this.value;
  });
  a4.on("change", function() {
    v4 = this.value;
  });
  a5.on("change", function() {
    v5 = this.value;
  });

 //read

 //send values to octoblu

  setInterval(function(){
    conn.message({
      "devices": "*",
      "payload": {
        "analog0": v0,
        "analog1": v1,
        "analog2": v2,
        "analog3": v3,
        "analog4": v4,
        "analog5": v5,
      }
    });

  },400);

  }); // end johnny-five board onReady
}); // end Meshblu connection onReady
