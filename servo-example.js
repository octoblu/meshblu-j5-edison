var raspi = require('raspi-io');
var five = require('johnny-five');
var meshblu = require('meshblu');
var meshbluJSON = require('./meshblu.json');

// TODO:
// if meshbluJSON does not exist, then register a device 
// and store as meshblu.json

// Creates a Meshblu connection using your
// device's credentials from your Meshblu.json
var conn = meshblu.createConnection({
  "uuid": meshbluJSON.uuid,
   "token": meshbluJSON.token
});

// Wait for connection to be ready to send/receive messages
conn.on('ready', function(data) {
  console.log('data', data);

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
     if(payload.servo == "PWM0"){
       servo.to(payload.value);
     } else if(payload.servo == "PWM1") {
       servo2.to(payload.value);
     }
   }); // end Meshblu connection onMessage
 }); // end johnny-five board onReady
}); // end Meshblu connection onReady

