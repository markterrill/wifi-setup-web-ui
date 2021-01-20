const WebSocket = require('isomorphic-ws');

const md5 = require('md5');

var ws = new WebSocket("ws://smartfire.local/rpc");


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
    let user = "appuser";
    let realm = "sdbproduct";
    let pass = "appUserfiveoh";

    user = 'serialAdmin';
    pass = '444SerialKeyboardWarrior';

    let qop = '';

    let cnonce = new Date().getTime(); //md5(String(new Date().getTime()));  313673957; //



    let nonce = challenge.nonce;
    let nc = challenge.nc;

    /*

    {"id":1602514362591,"src":"SF_CTL5_D0BE3C","dst":"mos","error":{"code":401,"message":"{\"auth_type\": \"digest\",
    \"nonce\": 1611048929, \"nc\": 1, \"realm\": \"sdbproduct\"}"}}

    {"src":"mos","id":1602514362591,"method":"Config.Get","auth":{"realm":"sdbproduct","username":"serialAdmin",
    "nonce":1611048929,"cnonce":313673957,"response":"66e9cdd290e93ea623b1f415f10e62a7"}

    Got 401 challenge {"auth_type": "digest", "nonce": 1611049154, "nc": 1, "realm": "sdbproduct"}

working
{"src":"mos","id":1373120017684,"method":"Config.Get","auth":{"realm":"sdbproduct","username":"serialAdmin","nonce":1611051797,"cnonce":1955363828,"response":"5ded50da1c0dee25e2f9a56e1ef815b4"}}
not
{"src":"rpc","id":1611051886168,"method":"Config.Get","auth":{"realm":"sdbproduct","username":"appuser","cnonce":313673957,"response":"ec3e58ee6fc53d5f390f0d3820e2561b"}}


     Got auth: Realm:sdbproduct, Username:serialAdmin, Nonce: 1611052267, CNonce:748545482, Response:7a374cd93d622a2a9e659389bce62351
     Got auth: Realm:sdbproduct, Username:serialAdmin, Nonce: 1611052290, CNonce:313673957, Response:2a4d6b45cd34e5d8bdbf5da897bba2ab
     */


    /*
    HA1 = MD5(username:realm:password);
    HA2 = MD5(method:digestURI);
    response = MD5(HA1:nonce:HA2);
     */


    let HA1 = md5(user + ":" + realm + ":" + pass);
    let HA2 = md5(digestURI.method + ":" + digestURI.path);
    /*
    console.log("HA1: \t",  user + ":" + realm + ":" + pass);
    console.log("HA2: \t",  digestURI.method + ":" + digestURI.path);

     */

    /*
    respArr := md5.Sum([]byte(fmt.Sprintf(
        "%s:%d:%d:%d:%s:%s",
        ha1, nonce, nc, cnonce, "auth", ha2,
    )))

     */

    let combined = HA1 + ":" + nonce + ":" + nc + ":" + cnonce + ":" + "auth" + ":" + HA2;

    console.log("\n\n", combined);

    //let response = md5(HA1 + ":" + nonce + HA2); //":00000001:" + cnonce + ":" + qop + ":" + HA2);
    let response = md5(combined); //":00000001:" + cnonce + ":" + qop + ":" + HA2);
    //options.headers.Authorization = "Digest username=\"" + user + "\",realm=\"" + realm + "\",nonce=\"" + nonce + "\",uri=\"" + options.path + "\",cnonce=\"" + cnonce + "\",nc=00000001,algorithm=MD5,response=\"" + response + "\",qop=\"" + qop + "\"";


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

        console.log('sending conf8');

        conf8();

    }, timeout +=increase);

    setTimeout(()=>{

        console.log('retrieving config.get');
        ws.send(createCmd('Config.Get', {}));

    }, timeout +=increase);




};

function conf8(){
    let deviceID= 'SF_CTL5_D0BC64';

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
            "project": "firebase-sdb",
            "region": "us-central1",
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
    let pub64 ="LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFdzltbFhxKzNEWFBqTnZlQ1R4MnBVYVhjT2x5ZgpHQ3RhaHJMRzJiMDQ5M1BNNW5HMVJ6ZGpabGFFR3cveTdKb2RIY0QwZHo3Zkg4M1RVWlFPVmhKY1ZnPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";

    let key64="LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSUtTZm1mM21YNTg0bHgvSHljV1lUa3JxUWNrN1hodG92Y0RDVUdaUGxmWXBvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFdzltbFhxKzNEWFBqTnZlQ1R4MnBVYVhjT2x5ZkdDdGFockxHMmIwNDkzUE01bkcxUnpkagpabGFFR3cveTdKb2RIY0QwZHo3Zkg4M1RVWlFPVmhKY1ZnPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=";

    let params =
        {
            "filename": "gcp-SF_CTL5_D0BC64.pub.pem",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": pub64 //pubBuf.toString('base64')     // Required. Data to write.
        };

    //let content = JSON.stringify(params);
    ws.send(createCmd('FS.Put', params));


}


function getpem(){

    let params = {
        "filename": "gcp-SF_CTL5_D0BC64.pub.pem",    // Required. Name of the file to write to.
    };

    let content = JSON.stringify(params);
    ws.send(createCmd('FS.Get', params));

}


function keypem(){
    let key64="LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSUtTZm1mM21YNTg0bHgvSHljV1lUa3JxUWNrN1hodG92Y0RDVUdaUGxmWXBvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFdzltbFhxKzNEWFBqTnZlQ1R4MnBVYVhjT2x5ZkdDdGFockxHMmIwNDkzUE01bkcxUnpkagpabGFFR3cveTdKb2RIY0QwZHo3Zkg4M1RVWlFPVmhKY1ZnPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=";

    let params =
        {
            "filename": "gcp-SF_CTL5_D0BC64.key.pem",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": key64 //pubBuf.toString('base64')     // Required. Data to write.
        };

    let content = JSON.stringify(params);
    ws.send(createCmd('FS.Put', params));


}


function keyget(){

    let params = {
        "filename": "gcp-SF_CTL5_D0BC64.key.pem",    // Required. Name of the file to write to.
    };

    let content = JSON.stringify(params);
    ws.send(createCmd('FS.Get', params));

}


let mybool = false;
ws.onmessage = function incoming(event) {
    console.log("received: ", event.data);


    document.getElementById('text1').innerHTML += "\n\n\n\n" +  event.data;

    let parsed = JSON.parse(event.data);

    // See if unauthorised
    if (parsed.hasOwnProperty('error') && parsed.error.hasOwnProperty('code') && parsed.error.code == 401){

        console.log("Got 401 challenge", parsed.error.message);

        let challenge = JSON.parse(parsed.error.message);

        if (mybool){


            ws.send(textVersion);



        }


    }

};
