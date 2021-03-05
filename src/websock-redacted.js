const WebSocket = require('isomorphic-ws');
const md5 = require('md5');
var ws = new WebSocket("ws://myproduct.local/rpc");

let deviceID="SF_XXXX_D09CCC";
let pub64="LS0tLS1CRURbnhpQzl5cERTUAp1ZzcxOXlNRFB2RWxYWk4zdjdLTDdwR0pBYUdDb2dWU3BZcHNra2I0Q08xRU1kdEhkdVRYRExwWlRBPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";
let key64="LS0tLS1CRUdJTiRWU3d1U2UW5xMUorZVRRbnhpQzl5cERTUHVnNzE5eU1EUHZFbFhaTjN2N0tMN3BHSgpBYUdDb2dWU3BZcHNra2I0Q08xRU1kdEhkdVRYRExwWlRBPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=";


// echo '{"src":"rpc","id":'$rpcNumber''',"method":"OTA.Update","params":{"url":"'$ZIPURL'","commit_timeout":240}}' > mycommandOTA.txt

var cmdHistory = {};

let digestURI = {
    method: "POST",
    path: "/rpc"
};
// look at this shit: https://github.com/mongoose-os-libs/rpc-common/blob/9686acc677711bb69d2a3bcbdda9356bc6ca8d5c/src/mg_rpc.c#L963
digestURI.method = "dummy_method";
digestURI.path = "dummy_uri";


function createCmd(method, params){

    let id = Date.now();
    let base = {"src":"rpc","id":id,"method":method};

    if (Object.keys(params).length){
        base.params = params;
    }

    //cmdHistory[id] = base;

    cmdHistory[id] = authCmd(base, {nonce: new Date().getTime(), nc:1});

    return JSON.stringify(cmdHistory[id]);
}

function authCmd(cmd, challenge){
    let user = "myuser";
    let realm = "myproductrealm";
    let pass = "password";

    let qop = '';

    let cnonce = new Date().getTime(); //md5(String(new Date().getTime()));  313673957; //
    let nonce = challenge.nonce;
    let nc = challenge.nc;

    digestURI.method = "dummy_method";
    digestURI.path = "dummy_uri";

    let HA1 = md5(user + ":" + realm + ":" + pass);
    let HA2 = md5(digestURI.method + ":" + digestURI.path);
    let combined = HA1 + ":" + nonce + ":" + nc + ":" + cnonce + ":" + "auth" + ":" + HA2;
    let response = md5(combined);




    console.log("\n\n", combined);

    let newCmd = cmd;// cmdHistory[parsed.id];


    newCmd['auth'] = {"realm": realm, "username": user, "nonce": nonce, "cnonce": cnonce, "response": response};

    //newCmd.nonce = 'hi there mark';

    console.log("auth " + JSON.stringify(newCmd.auth));

    let textVersion = JSON.stringify(newCmd);
    console.log("responding: ", textVersion);

    //mybool = false;

    return newCmd;

}


ws.onopen = function open() {


    //

    let timeout = 0;
    let increase = 1500;

    setTimeout(()=>{

        pubpem();

    }, timeout +=increase);


    setTimeout(()=>{

        getpem();

    }, timeout +=increase);


    setTimeout(()=>{

        keypem();

    }, timeout +=increase);


    setTimeout(()=>{

        keyget();

    }, timeout +=increase);

    setTimeout(()=>{

        console.log('sending conf8 ');

        conf8();

    }, timeout +=increase);

    setTimeout(()=>{

        console.log('retrieving config.get');
        ws.send(createCmd('Config.Get', {}));

    }, timeout +=increase);



    setTimeout(()=>{

        document.getElementById('status').innerHTML = "Finished, can power cycle now";

        //console.log('Calling restart');
        //ws.send(createCmd('SF.Restart', {}));

    }, timeout +=increase ) ;



};

function conf8(){


    let conf8 = {
        "conf_acl": "wifi.*,debug.*,device.license",
        "debug": {
            "level": 2,
            "file_level": "mongoose.c=2,esp32_vfs_dev_=2,mgos_pwm_rgb_led.c=2,mgos_ads1x1x.c=2,esp32_bt_gap=2,mgos_vfs=2,mgos_event.c=2,rtttl=2,=3"
        },
        "device": {
            "id": deviceID
        },
        "gcp": {
            "enable": true,
            "server": "mqtt.2030.ltsapis.goog:8883",
            "project": "firebase-xxxxx",
            "region": "us-xxxxxx",
            "registry": "iot-registry",
            "device": deviceID,
            "key": "gcp-" + deviceID + ".key.pem",
            "ca_cert": "gcp-lts-ca.pem",
            "token_ttl": 3600,
            "enable_config": true,
            "enable_commands": true
        },
        "mqtt": {
            "enable": true,
            "server": "mqtt.googleapis.com:8883",
            "ssl_ca_cert": "gcp-lts-ca.pem"
        }
    };

    console.log("\n\nconf8:\n", JSON.stringify(conf8));

//options.method = 'GET';
    let confBuf = new Buffer.from(JSON.stringify(conf8));
    params =
        {
            "filename": "conf8.json",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": confBuf.toString('base64')     // Required. Data to write.
        };

    ws.send(createCmd('FS.Put', params));

}


function pubpem(){


    let params =
        {
            "filename": "gcp-" + deviceID + ".pub.pem",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": pub64 //pubBuf.toString('base64')     // Required. Data to write.
        };

    ws.send(createCmd('FS.Put', params));

}


function getpem(){

    let params = {
        "filename": "gcp-" + deviceID + ".pub.pem",    // Required. Name of the file to write to.
    };

    let content = JSON.stringify(params);
    ws.send(createCmd('FS.Get', params));

}


function keypem(){


    let params =
        {
            "filename": "gcp-" + deviceID + ".key.pem",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": key64 //pubBuf.toString('base64')     // Required. Data to write.
        };

    let content = JSON.stringify(params);
    ws.send(createCmd('FS.Put', params));


}


function keyget(){

    let params = {
        "filename": "gcp-" + deviceID + ".key.pem",    // Required. Name of the file to write to.
    };

    let content = JSON.stringify(params);
    ws.send(createCmd('FS.Get', params));

}


let mybool = false;
ws.onmessage = function incoming(event) {
    console.log("received: ", event.data);


    document.getElementById('text1').innerHTML += "<br><hr><br>" +  JSON.stringify(JSON.parse(event.data), null, 4);

    let parsed = JSON.parse(event.data);

    // See if unauthorised
    if (parsed.hasOwnProperty('error') && parsed.error.hasOwnProperty('code') && parsed.error.code == 401){
        // Not currently using this, as sending auth with original request!

        console.log("Got 401 challenge", parsed.error.message);

        let challenge = JSON.parse(parsed.error.message);

        if (mybool){
           ws.send(textVersion);
        }


    }

};
