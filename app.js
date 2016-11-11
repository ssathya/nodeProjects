var Client = require("node-rest-client").Client;
var client = new Client();

function processMsg(msg) {
    var mbValues = 0;
    var rav4Values = 0;
    msg.sendEmail = false;
    var d = new Date();
    var currentDt = d.toLocaleString();
    currentDt += "\n\t";
    var msgLength = msg.payload.feeds.length;

    if (msgLength === 0) {
        msg.payload = currentDt;
        msg.payload += "Input data empty";
        return msg;
    }

    if (msgLength > 0 &&
        Number(msg.payload.feeds[msgLength - 1].field2) > 10.0 &&
        Number(msg.payload.feeds[msgLength - 1].field1) > 10.0) {
        rav4Values = msg.payload.feeds[msgLength - 1].field1;
        mbValues = msg.payload.feeds[msgLength - 1].field2;
        msg.payload = currentDt;
        msg.payload += "Normal values: Rav4: " + rav4Values.toPrecision(2) + " Benz: " + mbValues.toPrecision(2);
        return msg;
    }

    for (var i = 0; i < msgLength; i++) {
        mbValues += Number(msg.payload.feeds[i].field2);
        rav4Values += Number(msg.payload.feeds[i].field1);
    }
    mbValues = mbValues / msgLength;
    rav4Values = rav4Values / msgLength;
    msg.payload = currentDt;
    if (rav4Values <= 10.0 || mbValues <= 10.0) {
        msg.sendEmail = true;
        msg.topic = "Garage doors are open";
        if (rav4Values <= 10.0)
            msg.payload += " Rav4 door is open: " + rav4Values;
        if (mbValues <= 10.0)
            msg.payload += " Mercedes door is open: " + mbValues;
    }
    else {
        msg.payload = "Normal values: Rav4: " + rav4Values.toPrecision(2) + " Benz: " + mbValues.toPrecision(2);
    }

    return msg;
}

client.get("https://api.thingspeak.com/channels/42859/feeds.json?api_key=????????????&results=15",
    function(data, response) {
        console.log("*** DATA ***");
        console.log(data);
        console.log("*** RESPONSE ***");
        console.log(response);
        var msg = {};
        msg.payload = data;
        msg.response = response;
        processMsg(msg);
    });

console.log("App started");
