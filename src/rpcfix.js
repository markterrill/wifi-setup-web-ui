
//console.log(process.versions);
//var process = require("node-process");

let mytestBuf = Buffer.from('test');

const httpClient = require('urllib');
const url = 'http://smartfire.local/RPC/';


let options = {
    method: 'POST',
    rejectUnauthorized: false,
    // auth: "username:password" use it if you want simple auth
    digestAuth: 'appuser:appUserfiveoh',
    //content: "Hello world. Data can be json or xml.",
    headers: {
        //'Content-Type': 'application/xml'  use it if payload is xml
        'Content-Type': 'application/json' // use it if payload is json
        //'Content-Type': 'application/text'
    }
};
const responseHandler = (err, data, res) => {
    if (err) {
        console.log(err);
    }
    //console.log(res.statusCode);
    //console.log(res.headers);
    console.log(data.toString('utf8'));
}
//httpClient.request(url + 'RPC.List', options, responseHandler);

/*
let options2 = Object.assign({}, options,
    {
        files:
            {
                //uploadfile: "conf9.json",
                "conf9.json": new Buffer.from('{"debug": {"level": 2}}'),
            }
    }
);

 */

//let mybuf = new Buffer.from('{"debug": {"level": 2}}');

//new Buffer.from("

let pub64 ="LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFYlFVSytFdWlDYjRQMWlrWFBqUXJHNVQ3ZE0vVgpmc0RGZUwxcURsYmRuM1NNdUJpWEZDeGdHMEtNM3ZRcXA5azdvMVppSi90OTNTellrdW9YVEltYmpnPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";
//let pubBuf = new Buffer.from(pub);
let key64="LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSU9JNWU5Z21NYkNoQ3FLRllUdVpqV1g0NmM0WTRLaUJFdnJwa3Y4akJQaW9vQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFYlFVSytFdWlDYjRQMWlrWFBqUXJHNVQ3ZE0vVmZzREZlTDFxRGxiZG4zU011QmlYRkN4ZwpHMEtNM3ZRcXA5azdvMVppSi90OTNTellrdW9YVEltYmpnPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo="
;
//let keyBuf = new Buffer.from(pub);

let params =
    {
        "filename": "gcp-SF_CTL5_D0BE3C.pub.pem",    // Required. Name of the file to write to.
        "append": false,          // Optional. Overwrite or append.
        "data": pub64 //pubBuf.toString('base64')     // Required. Data to write.
    };

options.content = JSON.stringify(params);

console.log(options.content);

var req = httpClient.request(url + 'FS.Put', options, responseHandler);



setTimeout(()=>{

    params =
        {
            "filename": "gcp-SF_CTL5_D0BE3C.key.pem",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": key64 //keyBuf.toString('base64')     // Required. Data to write.
        };

    options.content = JSON.stringify(params);

    console.log(options.content);

    var req = httpClient.request(url + 'FS.Put', options, responseHandler);
}, 2000);



setTimeout(()=>{

    let deviceID= 'SF_CTL5_D0BE3C';

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

    console.log(JSON.stringify(conf8));

//options.method = 'GET';
    let confBuf = new Buffer.from(JSON.stringify(conf8));
    params =
        {
            "filename": "conf8.json",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": confBuf.toString('base64')     // Required. Data to write.
        };

    options.content = JSON.stringify(params);
    var req = httpClient.request(url + 'FS.Put', options, responseHandler);

}, 4000);
