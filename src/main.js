//import htm from './htm.min.js';
//import {Component} from './preact.min.js';
//const html = htm.bind(h);

//import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js'
/*
class App extends Component {
  state = {connected: false, ssid: '', pass: '', spin: false, frames: [], status:{}};
  componentDidMount() {
    const logframe = (marker, frame) => {
      this.setState(
          state => ({
            connected: state.connected,
            frames: state.frames.concat(marker + JSON.stringify(frame))
          }));

    };

    var destHost = location.host;
    destHost = '192.168.1.128';

    console.log('smartfire am mounted, trying ', destHost);

    // Setup JSON-RPC engine
    var rpc = mkrpc('ws://' + destHost + '/rpc');
    rpc.onopen = ev => {
      // When RPC is connected, fetch list of supported RPC services
      this.setState({connected: true});
      rpc.call('RPC.List').then(res => console.log(res));
      setInterval(() => {
        //console.log('interval fired');
        rpc.call('SF.Status').then(res =>{
          //console.log('Status:', res);
          this.setState({status: res});
        });
      }, 5000);

    };
    rpc.onclose = ev => this.setState({connected: false});
    rpc.onout = ev => logframe('-> ', ev);
    rpc.onin = ev => logframe('<- ', ev);
    this.rpc = rpc;

  }
  render(props, state) {
    const onssid = ev => this.setState({ssid: ev.target.value});
    const onpass = ev => this.setState({pass: ev.target.value});
    const onclick = ev => {
      // Button press. Update device's configuration
      var sta = {enable: true, ssid: state.ssid, pass: state.pass};
      var config = {wifi: {sta: sta, ap: {enable: false}}};
      // var config = {debug: {level: +state.ssid}};
      this.setState({spin: true});
      this.rpc.call('Config.Set', {config, save: true, reboot: true})
          .catch(err => alert('Error: ' + err))
          .then(ev => this.setState({spin: false}));
    };
    /*
    <div style="text-align: right; font-size:small;">Directly connected:
				<b> ${state.connected ? 'yes' : 'no'}</b></div>




      <div style="display: flex; flex-direction: column; margin: 2em 0;">
				<div style="display: flex; margin: 0.2em 0;">
					<label style="width: 33%;">WiFi network:</label>
					<input type="text"
					onInput=${onssid} style="flex:1;" />
				</div>
				<div style="display: flex; margin: 0.2em 0;">
					<label style="width: 33%;">WiFi password:</label>
					<input type="text"
					onInput=${onpass} style="flex:1;" />
				</div>
				<button class="btn" style="margin: 0.3em 0; width: 100%;
				background: ${state.ssid ? '#2079b0' : '#ccc'}"
				onclick=${onclick} disabled=${!state.ssid}>
		<span class=${state.spin ? 'spin' : ''} /> Save WiFi settings
				</button>
      </div>
     * /
    return html`
		<div class="container">
			<h1 style="color:darkgray;">${props.title}</h1>

			<h4>JSON-RPC over WebSocket log:</h4>
			<pre class="log">${state.frames.join('\n')}</pre>
		</div>`;
  }
}


const el = document.getElementById('container-wifi');
//render(html`<${App} title="Smartfire Basic HTTP Service" />`, el); // document.body); // document.body);

//render(h(App), el); // success
*/
//render(html`<a href="/">Hello Mark!</a>`, document.body);


//render(html`<${App} title="Mongoose OS Configurator" />`, document.body);


import htm from './htm.min.js';
import {Component, h, render} from './preact.min.js';

const html = htm.bind(h);

class App extends Component {
    state = {
      connected: false,
      ssid: '',
      pass: '',
      status: null,
      spin: false,
      frames: []};

    componentDidMount() {
        const logframe = (marker, frame) => {
            this.setState(
                state => ({
                    connected: state.connected,
                    frames: state.frames.concat(marker + JSON.stringify(frame))
                }));
        };

        //let destHost = '192.168.1.117'; // location.host

        let destHost = 'smartfire.local'; // location.host

        // Setup JSON-RPC engine
        var rpc = mkrpc('ws://' + destHost + '/rpc');
        rpc.onopen = ev => {
            // When RPC is connected, fetch list of supported RPC services
            this.setState({connected: true});
            rpc.call('RPC.List').then(res => console.log(res));

            /*
            let myStatusInterval = setInterval(() => {
                //console.log('interval fired');
                rpc.call('SF.Status')
                    .then(res => {
                    console.log('Status:', res);
                    this.setState({status: res});

                  })
                    .catch(err => {
                      alert('Status call failed: ' + err);

                      clearInterval(myStatusInterval);
                      myStatusInterval = null;

                      this.setState({status: null, connected:false});
                    });
            }, 10000);

             */


        };
        rpc.onclose = ev => this.setState({connected: false});
        rpc.onout = ev => logframe('-> ', ev);
        rpc.onin = ev => logframe('<- ', ev);
        this.rpc = rpc;
    }

    render(props, state) {
        const onssid = ev => this.setState({ssid: ev.target.value});
        const onpass = ev => this.setState({pass: ev.target.value});
        const onclick = ev => {
            // Button press. Update device's configuration
            var sta = {enable: true, ssid: state.ssid, pass: state.pass};
            var config = {wifi: {sta: sta, ap: {enable: false}}};
            // var config = {debug: {level: +state.ssid}};
            this.setState({spin: true});
            this.rpc.call('Config.Set', {config, save: true, reboot: true})
                .catch(err => alert('Error: ' + err))
                .then(ev => this.setState({spin: false}));
        };
        return html`
		<div class="container">
		
		    <h2 class="content-head is-left">${state.connected ? 'Ready' : 'Not Connected!'}</h2>
			<!---<h1>${props.title}</h1>--->
			
			<!---
			<div style="text-align: right; font-size:small;">Connected:
				<b> ${state.connected ? 'yes' : 'no'}</b></div>
				--->

            <form class="pure-form pure-form-aligned">
                <fieldset>
                    <div class="pure-control-group">
                        <label for="aligned-name">Wi-Fi Network Name</label>
                        <input type="text" onInput=${onssid} id="aligned-name" placeholder="SSID/Network" />
                        
                    </div>
                    <div class="pure-control-group">
                        <label for="aligned-password">Password</label>
                        <input type="password" onInput=${onpass} id="aligned-password" placeholder="Password to connect" />
                        
                    </div>
                    
                    <div class="pure-controls">
                        <button type="submit" class="pure-button pure-button-primary ${state.ssid && state.connected && state.pass ? '' : 'button-disabled'}"
                            onclick=${onclick} disabled=${!state.ssid || !state.connected || !state.pass}>
                        Save Wi-Fi settings
                        </button>
                    </div>
                </fieldset>
            </form>
            
        </div>
        <div class="splash-container lightgray">
            <div class="devicelog">
                <h2 class="content-head is-left white">Device log</h2>
                <pre class="log white ">
                    ${state.frames.slice(Math.max(state.frames.length - 5, 0)).join('\n')}
                    ${state.connected ? '' : '!! DISCONNECTED, unable to contact to device WS RPC'}
                </pre>
                
            </div>
        </div>
		`;
    }
}

render(html`<${App} title="Smartfire Wi-Fi" />`,
    document.body,
    document.getElementById('container-wifi')
);
