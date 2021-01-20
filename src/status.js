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

    myStatusInterval = null;

    state = {
      connected: false,
      ssid: '',
      pass: '',
      status: null,
        config: null,
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
            rpc.call('RPC.List').then(res => {
                console.log(res);




            });
            this.myStatusInterval = setInterval(() => {
                this.checkStatus();
            }, 10000);

            setTimeout(() => {
                this.checkStatus();
            }, 100); // cheeky after this.rpc is assigned

            setTimeout(() => {
                this.rpc.call('SF.Config')
                    .then(data => {
                        console.log('Config:', data);

                        if (data.result && data.result.hasOwnProperty('settings')){
                            console.log('Current device config:', data.result.settings);
                            this.setState({status: null, config: data.result.settings});
                        }


                    })
                    .catch(err => {
                        window.alert('Smartfire connection failed');
                        console.error('Config call failed: ' + err);
                        this.setState({status: null, config:null, connected:false});
                    });
            }, 250); // cheeky after this.rpc is assigned


        };
        rpc.onclose = ev => this.setState({connected: false});
        rpc.onout = ev => logframe('-> ', ev);
        rpc.onin = ev => logframe('<- ', ev);
        this.rpc = rpc;
    }

    checkStatus(){
        //console.log('interval fired');
        this.rpc.call('SF.Status')
            .then(data => {
                console.log('Status:', data);
                if (data.hasOwnProperty('result')){
                    let classes = {
                        'alert': 'exclamation-triangle',
                        'good': 'check-square',
                        'offline': 'times'
                    };

                    let res = data.result;

                    /*
                    res.fan = 30;
                    res.pt = 275;
                    res.pit = 272.55;

                     */

                    if (!res.pt || res.pt > 800){
                        res.pt = 400;
                    }

                    if (res.pit <= 32){
                        res.pit_class = 'offline';
                        res.pit_icon = classes.offline;
                    }
                    else if (res.pt > 32 && Math.abs(res.pt - res.pit) < 0.015 * res.pt){
                        res.pit_class = 'good';
                        res.pit_icon = classes.good;
                    }
                    else if (res.pit >= res.pt ){
                        res.pit_class = 'alert';
                        res.pit_icon = classes.alert;
                    }
                    else {
                        res.pit_class = 'cooking';
                        res.pit_icon = classes['good'];
                    }

                    if (res.f1 <= 32){
                        res.f1_class = 'offline';
                        res.f1_icon = classes[res.f1_class];
                    }
                    else if (res.f1t > res.f1 && Math.abs(res.f1t - res.f1) < 0.015 * res.pt){
                        res.f1_class = 'good';
                        res.f1_icon = classes[res.f1_class];
                    }
                    else if (res.f1 >= res.f1t){
                        res.f1_class = 'alert';
                        res.f1_icon = classes[res.f1_class];
                    }
                    else {
                        res.f1_class = 'cooking';
                        res.f1_icon = classes['good'];
                    }

                    if (res.f2 <= 32){
                        res.f2_class = 'offline';
                        res.f2_icon = classes[res.f2_class];
                    }
                    else if (res.f2t > res.f2 && Math.abs(res.f2t - res.f2) < 0.015 * res.pt){
                        res.f2_class = 'good';
                        res.f2_icon = classes[res.f2_class];
                    }
                    else if (res.f2 >= res.f2t){
                        res.f2_class =  'alert';
                        res.f2_icon = classes[res.f2_class];
                    }
                    else {
                        res.f2_class = 'cooking';
                        res.f2_icon = classes['good'];
                    }

                    if (res.f3 <= 32){
                        res.f3_class = 'offline';
                        res.f3_icon = classes[res.f3_class];
                    }
                    else if (res.f3t > res.f3 && Math.abs(res.f3t - res.f3) < 0.015 * res.pt){
                        res.f3_class =  'good';
                        res.f3_icon = classes[res.f3_class];
                    }
                    else if (res.f3 >= res.f3t){
                        res.f3_class =  'alert';
                        res.f3_icon = classes[res.f3_class];
                    }
                    else {
                        res.f3_class = 'cooking';
                        res.f3_icon = classes['good'];
                    }




                    this.setState({status: res});
                }
            })
            .catch(err => {

                //window.alert('Smartfire connection failed');

                console.error('Status call failed: ' + err);

                clearInterval(this.myStatusInterval);
                this.myStatusInterval = null;

                this.setState({status: null, connected:false});
            });
    }

    targetPopup(data){

            console.log('got target ', data, this.state.config);


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
                .then(ev => {this.setState({spin: false}); });
        };



        return html`
		
         <div class="splash-container darkgray">
            <div>
                <h1 class="white">Direct mode: ${state.connected ? 'Connected' : 'Not Connected!'}</h1>
            </div>
        </div>
    
        <div class="content-wrapper ">
            <div class="pure-g status">
                <div class="pure-u-1-2 pure-u-md-1-2 tempboxes ${state.status ? state.status.pit_class : ''}">
                    <h3><i class="fas fa-${state.status ? state.status.pit_icon : 'times'}"></i> Pit</h3>
                    <h1 class="bigtemp">${state.status ? Math.round(state.status.pit * 10) / 10 : 'Off' }</h1>
                    <h4 >Target ${state.status && state.status.pt > 32 ? Math.round(state.status.pt) : 'N/A' }</h4>
                </div>
                <div class="pure-u-1-2 pure-u-md-1-2 tempboxes ">
                    <h3><i class="fas fa-fan"></i>
                        Fan </h3>
                    <h1 class="bigtemp"  onClick=${() => this.targetPopup('fan')}>${state.status && state.status.fan > 0 ? state.status.fan + "%" : 'Off' }</h1>
                </div>
                <div class="pure-u-sm-1-2 pure-u-md-1-4 tempboxes ${state.status ? state.status.f1_class : ''}">
                    <h3><i class="fas fa-${state.status ? state.status.f1_icon : 'times'}"></i> Food 1</h3>
                    <h1 class="bigtemp">${state.status ? Math.round(state.status.f1 * 10) / 10 : 'Off' }</h1>
                    <h4  >Target ${state.status && state.status.f1t > 32 ? Math.round(state.status.f1t) : 'N/A' }</h4>
                </div>
                <div class="pure-u-sm-1-2 pure-u-md-1-4 tempboxes ${state.status ? state.status.f2_class : ''}">
                    <h3><i class="fas fa-${state.status ? state.status.f2_icon : 'times'}"></i> Food 2</h3>
                    
                    
                    <h1 class="bigtemp">${state.status ? Math.round(state.status.f2 * 10) / 10 : 'Off' }</h1>
                    <h4>Target ${state.status && state.status.f2t > 32 ? Math.round(state.status.f2t) : 'N/A' }</h4>
                    
                </div>
                <div class="pure-u-sm-1-2 pure-u-md-1-4 tempboxes ${state.status ? state.status.f3_class : ''}">
                    <h3><i class="fas fa-${state.status ? state.status.f3_icon : 'times'}"></i> Food 3</h3>
                    <h1 class="bigtemp">${state.status ? Math.round(state.status.f3 * 10) / 10  : 'Off' }</h1>
                    <h4>Target ${state.status && state.status.f3t > 32 ? Math.round(state.status.f3t) : 'N/A' }</h4>
                </div>
    
            </div>
    
    
        </div>
        
        <div class="splash-container lightgray">
            <div class="devicelog">
                <h2 class="content-head is-left white">Device log</h2>
                <pre class="log white ">
                    ${state.frames.slice(Math.max(state.frames.length - 10, 0)).join('\n')}
                    ${state.connected ? '' : '!! DISCONNECTED, unable to contact to device WS RPC'}
                </pre>
                
            </div>
        </div>
        
		`;
    }
}

render(html`<${App} title="Smartfire Wi-Fi" />`,
    document.body,
    document.getElementById('container-status')
);
