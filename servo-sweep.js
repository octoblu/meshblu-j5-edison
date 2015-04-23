// Example based on Johnny-Five: https://github.com/rwaldron/johnny-five/wiki/Servo
var raspi = require("raspi-io");
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
          type: "number",
          enum: [0, 2, 3, 7, 8, 9],
          required: false
        },
        servo: {
          type: "string",
          enum: ["PWM0", "PWM1"],
          required: false
        }
      }
    },
    digitalWrite: {
      type: "object",
      title: "Digital Write",
      properties:  {
        output: {
          type: "boolean",
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
  "server": "meshblu.octoblu.com", // optional - defaults to ws://meshblu.octoblu.com
  "port": 80  // optional - defaults to 80
});

conn.on("notReady", function(data) {
  console.log('UUID FAILED AUTHENTICATION!');
  console.log('not ready', data);

  // Register a device
  conn.register({
    "type": "rpi-servo"
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
// and specify that it's using raspi-io
  var board = new five.Board({
    io: new raspi()
  });

// Wait for the board to be ready for message passing
// board-specific code
  board.on('ready', function() {
    // Initialize servos on pin 1 & 24 (Physical pins 12 and 34, respectively)
    // https://github.com/bryan-m-hughes/raspi-io/wiki
    var servo = new five.Servo(1);
    var servo2 = new five.Servo(24);

    // Handles incoming Octoblu messages
    conn.on('message', function(data) {
     console.log('message received');
     console.log(data);

     // Let's extract the payload
     var payload = data.payload;

    /* Manipulate the servos based on the message passed
       from an Octoblu/Meshblu generic device node
       example:
      {
        "servo": "PWM0",
        "value": 180
      }
    */
    if(payload.to.enable && !payload.sweep.enable){
       if(payload.servo == "PWM0"){
         servo.stop();
         servo.to(payload.to.value);
       } else if(payload.servo == "PWM1") {
         servo2.stop();
         servo2.to(payload.to.value);
       }
    } else if(payload.sweep.enable && !payload.to.enable){
      if(payload.servo == "PWM0"){
        servo.sweep({
          range: [payload.sweep.min, payload.sweep.max],
          interval: payload.sweep.interval,
          step: payload.sweep.step
        });
      } else if(payload.servo == "PWM1") {
        servo2.sweep({
          range: [payload.sweep.min, payload.sweep.max],
          interval: payload.sweep.interval,
          step: payload.sweep.step
        });
      }
    }
  }); // end Meshblu connection onMessage
 }); // end johnny-five board onReady
}); // end Meshblu connection onReady
