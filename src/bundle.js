(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;

},{}],2:[function(require,module,exports){
(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();

},{}],3:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],4:[function(require,module,exports){
(function (global){(function (){
// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

var ws = null

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof global !== 'undefined') {
  ws = global.WebSocket || global.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

module.exports = ws

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function(){
  var crypt = require('crypt'),
      utf8 = require('charenc').utf8,
      isBuffer = require('is-buffer'),
      bin = require('charenc').bin,

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message) && message.constructor !== Uint8Array)
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();

},{"charenc":1,"crypt":2,"is-buffer":3}],6:[function(require,module,exports){
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

    ws.send(createCmd('Config.Get', {}));

    setTimeout(()=>{

        pubpem();

    }, 1000);


    setTimeout(()=>{

        getpem();

    }, 3000);





};


function pubpem(){
    let pub64 ="LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFdzltbFhxKzNEWFBqTnZlQ1R4MnBVYVhjT2x5ZgpHQ3RhaHJMRzJiMDQ5M1BNNW5HMVJ6ZGpabGFFR3cveTdKb2RIY0QwZHo3Zkg4M1RVWlFPVmhKY1ZnPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";

    let key64="LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSUtTZm1mM21YNTg0bHgvSHljV1lUa3JxUWNrN1hodG92Y0RDVUdaUGxmWXBvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFdzltbFhxKzNEWFBqTnZlQ1R4MnBVYVhjT2x5ZkdDdGFockxHMmIwNDkzUE01bkcxUnpkagpabGFFR3cveTdKb2RIY0QwZHo3Zkg4M1RVWlFPVmhKY1ZnPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=";

    let params =
        {
            "filename": "gcp-SF_CTL5_D0BC64.pub.pem",    // Required. Name of the file to write to.
            "append": false,          // Optional. Overwrite or append.
            "data": pub64 //pubBuf.toString('base64')     // Required. Data to write.
        };

    let content = JSON.stringify(params);
    ws.send(createCmd('FS.Put', params));


}


function getpem(){

    let params = {
        "filename": "gcp-SF_CTL5_D0BC64.pub.pem",    // Required. Name of the file to write to.
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

},{"isomorphic-ws":4,"md5":5}]},{},[6]);
