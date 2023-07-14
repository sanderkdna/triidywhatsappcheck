const fs = require("fs");
const myConsole = new console.Console(fs.createWriteStream("./logs.txt"));
const processMessage = require("../shared/processMessage");
var request = require('request');

const VerifyToken = (req, res) => {
    
    try{
        var accessToken = "RTQWWTVHBDEJHJKIKIKNDS9090DS";
        console.log(req.query);
        var token       = req.query["hub.verify_token"];
        var challenge   = req.query["hub.challenge"];

        if(challenge != null && token != null && token == accessToken){
            res.send(challenge);
        }else{
            res.status(400).send(req.query);
        }

    }catch(e){
        res.status(400).send();
    }
}

const ReceivedMessage = (req, res) => {
    try{
        var entry = (req.body["entry"])[0];
        var changes = (entry["changes"])[0];
        var value = changes["value"];
        var messageObject = value["messages"];

        var origin = value['metadata'].phone_number_Id;
        

        var contactName = (value['contacts'][0])['profile']['name'];
        var contactNumber = (value['contacts'][0])['wa_id'];
        
        if(typeof messageObject != "undefined"){
            var messages = messageObject[0];
            var number = messages["from"];
            
            var text = GetTextUser(messages);
            
            if(text != ""){
                processMessage.Process(text, number);
            } 
        }        
        
        var metaData = {
            origin: origin,
            contactName: contactName,
            contactNumber: contactNumber,
            message: text
        }

        
        var options = {
            'method': 'POST',
            'url': 'https://triidy.admhost.site/api/v1/webhook',
            'headers': { },
            formData: metaData
        };

        request(options, function (error, response) {
            console.log(response)
            if (error) throw new Error(error);
                console.log(response.body);
                console.log(error);
            });
        
        res.send("EVENT_RECEIVED");


    }catch(e){
        console.log(metaData);
        console.log(e);
        res.send("EVENT_RECEIVED");
    }
}

function GetTextUser(messages){
    var text = "";
    var typeMessge = messages["type"];
    if(typeMessge == "text"){
        text = (messages["text"])["body"];
    }
    else if(typeMessge == "interactive"){

        var interactiveObject = messages["interactive"];
        var typeInteractive = interactiveObject["type"];
        
        if(typeInteractive == "button_reply"){
            text = (interactiveObject["button_reply"])["title"];
        }
        else if(typeInteractive == "list_reply"){
            text = (interactiveObject["list_reply"])["title"];
        }else{
            myConsole.log("sin mensaje");
        }
    }else{
        myConsole.log("sin mensaje");
    }
    return text;
}

module.exports = {
    VerifyToken,
    ReceivedMessage
}
