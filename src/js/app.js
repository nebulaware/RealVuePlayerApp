// RealVue Player Application
// Version 	2.1041
// Author	Nathan Pearce

"use strict";

const { fstat } = require("original-fs");

//** MAIN APPLICATION **//
function ApplicationManager(){
	//APPLICATION DATA
	this.Data			= {};
	this.Version		= 21041;
	this.VersionPhase	= 'ALPHA';
	this.View			= 'Viewer';
	
	this.Display		= {'code':'','token':'','channel':0,'otc':0,'run':'','method':'','pushtoken':'','location':''};
	this.Channels		= {}; //CHANNELS STORED ON THIS DEVICE
	this.Files			= {}; //FILES STORED IN MEDIA

	this.Key			= 'e38e64ecdd5df53cbad321651137cd4791606c3e8347403e3ee710d31f113d21'; //PUBLIC KEY
	this.Components 	= [];

	this.CurrentStatus	= ''; //Apps current status
	
	this.AppInitStart	= false; //TO DETERMINE IF THE APP REACHED 
	this.AppFrame		= '';
	this.AppNotice		= '';
	this.AppLoader		= '';
	this.AppContent		= '';
	this.ComCount 		= 0;
	this.Communicating	= false;
	
	
	this.PiPlayer 		= true;
	
	this.FirebaseOn		= false;
	
	// *** PWA *** //
	this.RunMode		= 'app'; //RUN MODE: Browser / Installed / Legacy
	this.Installable	= false; //Whether the app is installable
	this.InstallPrompt	= '';
	
	// ** NOTIFICATIONS ** //
	this.PushSupport	= false;
	this.PushStatus		= 'default';
	this.PushRunning	= false;
	
	// *** PERMISSIONS *** //

	
	
	// *** APP STATES *** //
	this.Debug 			= true;
	this.IsFullScreen	= false;
	this.NetCon			= true; //NETWORK CONNECTION
	
	
	this.Timer			= '';
	this.SyncTimer		= '';
	this.TimeOut		= null;	
	
	this.AllowRefresh	= true;
	
	this.Resolution		= {"w":0,"h":0};	
	
	this.DelayPreloader	= false;
	
	this.Log = function Log (obj){ if(this.Debug==true){console.log(obj);}}
		
	this.Init = function Init(){

		this.Log('Starting App');

		//INIT
		this.AppInitStart = true;
		
		NetMon.init(); //Intialize Network Monitor		
		this.GetRunMode();
		
		this.Log ('Run Mode:'+ this.RunMode);
		
		this.UpdateResolution();
		
		//Initialize File Manager
		FM.Init();
		
		//CHECK LOCAL STORAGE FOR SESSION
		if(this.LoadDisplay()){
			
			//INITIALIZE REALTIME COMMUNICATION
			RT.Init();

			//AUTO RUN
			
			if(App.PushStatus == 'granted'){
				//ALREADY HAVE PERMISSION
				Notify.Init();
			}	
			
			//MAKE SURE DISPLAY IS PROPERLY CONFIGURED
			if(this.Display.run == ''){
				
				this.Log('Display Found - Setup Install');
				
				Wizard.Step(1); //INSTALL
				this.Preloader();
				
			}else if(this.Display.method == ''){
				
				this.Log('Display Found - Setup Method');
				
				Wizard.Step(2);
				this.Preloader();
				
			}else if (this.Display.location == ''){
				
				this.Log('Display Found - Setup Location');
				
				Wizard.Step(3);
				this.Preloader();
				
			}else{
				
				this.Log('Display Found - Setup Completed');
				
				
				Display.LoadDisplay();
				
			}
			
			
		}else{
			
			this.Log('No Display Found - Starting Wizard');
			
			//NO SETUP
			Wizard.Step('landing');
			this.Preloader();
			
		}
		
		
		//Window Hash
		if(window.location.hash){
			App.Log(window.location.hash);
		}else{
			
			App.Log('no hash');	
		}
		
		
		//START DISPLAY TICKER
		Display.Tick();
		
		
	}
	

	//====== S E N D   D A T A ==========
	this.Send = function Send(data){
			
			//NETWORK MONITOR
			if(this.NetCon == false){
				toast.error('You appear to have lost your internet connection. Please reconnect.');
				return false;
			}			
				
		
			var resolution = App.Resolution.w + 'x' + App.Resolution.h;
		
			var transmit = {"code":App.Display.code,"token":App.Display.token,"cid":App.Display.cid,"key":App.Key,"version":App.Version,"resolution":resolution,"app":data.app,"action":data.action,"data":data.data};	
		
			App.Log(transmit);
		
			var ajax = ajaxObj("POST", "https://api.realvue.app/v2/index.php", "json");
	
			ajax.onreadystatechange = function() {
	
				if(ajaxReturn(ajax) == true) {

						//CHECK IF GLOBAL ERROR BEING SENT BACK
						if(ajax.responseText=='error_key'){
							toast.error('There was a problem communicating with the server.','Error');
						}else if(ajax.responseText=='error_app'){
							toast.error('There was a problem with the application.','Error');
						}else if(ajax.responseText=='Critical Error'){
							toast.error('There was a critical error communicating with the application.','Error');	
						}else if(ajax.responseText=='error'){
							toast.error('There was a problem. Please try your request again.','Error');							
						}else{
						
							var response;
							
							try {
								
								response = JSON.parse(ajax.responseText);
								
							} catch (e){
								
								console.error (ajax.responseText);
								toast.error('An error occured on the server and has been logged. Please try again in a little bit.','Server Error');
								
								response.status = 'error';
								response.data	= 'There was an unknown issue.';
							}

							//API GENERAL RESPONSES
							if(response.status == 'refresh'){

								App.Reload();

							}else if(response.status == 'invalid_session'){

								App.DumpData();
								return false;

							}

							App.Components[data.app].Listener(data,response);
					
					
					}
				}
				
			}
	
			
			ajax.send(JSON.stringify(transmit)); 
		
	}
	
	this.AddComponent = function AddComponent(comp){

		this.Components[comp.Param.app] = comp;
			
	}
	

	
	this.Save = function Save (field){
	
		if(field === 'display'){
			
			Storage.set('display',JSON.stringify(App.Display));	

		}else if( field === 'channel' ){

			Storage.set('channel',JSON.stringify(Display.ChannelData));	
		
		}else if( field === 'channels'){

			Storage.set('channels',JSON.stringify(App.Channels));

		}
		
		
	}
	
	
	this.Preloader	= function Preloader(s){
		
		if(s == '' || s == undefined){
			_("preloader").classList.remove('loading');
			_("preloader").classList.add('loaded');
		}else{
			_("preloader").classList.remove('loaded');
			_("preloader").classList.add('loading');	
		}
		
	}

	this.Ready	= function Ready(){
		
		App.Log('Application Ready');
		
		if(!this.DelayPreloader){
			App.Preloader();
		}
		
		
	}

	this.LoadDisplay = function LoadDisplay(){
		
		this.Log('Loading Display');
		
		var Display = Storage.get('display');
		
		if(Display){
		   
			//Display Found - Loading
			this.Display = JSON.parse(Display);	   
			return true;
			
		 }else{
			 //NO DISPLAY 			 
			return false; 
			 
		 }	
		
	}

	this.Reload = function Reload(){
		//Reloads the Renderer
		if(App.AllowRefresh){
		
			location.reload();
			//document.getElementById('frame').contentWindow.location.reload();
		}else{
			console.log('A reload was requested but the app is set not to allow.')
		}
	}
	this.Relaunch = function Relaunch(){
		//Relaunches the Electron Application
		ipcRenderer.send('app:relaunch');

	}

	this.CloseApp = function CloseApp (){

		ipcRenderer.send('app:close');

	}

	this.UpdateApp = function UpdateApp(){

		ipcRenderer.send('app:update');
	}


	this.DumpData = function DumpData(){

		//Dumps the display session and local data
		App.Log('Dumping Data');
		
		FM.Purge(); //Dump all media files

		Storage.remove('display');
		Storage.remove('files');
		Storage.remove('channel');
	
		
		//Storage.remove('token');
		//PAUSE
		setTimeout(function(){ location.reload(); }, 1000);

	}

	this.PurgeFiles = function PurgeFiles (){

		FM.Purge(); //Dump all media files
		setTimeout(function(){ location.reload(); }, 2000);
	}

	this.RemoveDisplay = function RemoveDisplay(){
		
		Storage.remove('display');
		this.Token = '';
		//DEREGISTER DEVICE IN PLATFORM
		/*
		var data = {"app":"login","action":"deregister","data":{}};	
		App.SendData(data);	
		*/
	}	

	this.Debugger = function Debugger (action){

		if(action == 'show'){

			App.Debug = true; //TURN ON DEBUGGING IF NOT ALREADY
	
			document.getElementById('console').classList.remove('hide');
			ConsoleLogHTML.connect(document.getElementById("console_log"));
			console.log('On Screen Debugging Activated');

		}else if(action == 'hide'){

			document.getElementById('console').classList.add('hide');
			

		}else if(action == 'advanced'){
			
			this.Debug = true;

			ipcRenderer.send('launch-console', 'now')
		
		}

	}
	
	this.NetworkChanged = function NetworkChanged (status, event){
		
		//EMPTY
		_("network_status").className = status;
		
		console.log('Network Status Changed: ' + status,event);
		
		if(status == 'online'){
			//REPORT THAT THE NETWORK CONNECTION HAS BEEN RESTORED
			Display.Log('app-net-change', status);
		
		}
		
		
	}
	
	this.GetRunMode	= function GetRunMode(){
		
		//NOT SUPPORTED FOR APPLICATION		
	
		
	}
	
	this.InstallApp	= function InstallApp(){
		

		
	}
	this.PushTokenUpdate = function PushTokenUpdate(token){
		
		App.PushStatus = 'granted';
		
		//COMPARE TOKEN TO WHATS STORED TO SEE IF THE SERVER NEEDS THE NEW TOKEN	
		if(App.Display.pushtoken != token){
			
			App.Display.method = 'push';
			Display.UpdateDisplay({'field':'pushtoken','value':token});
			
		}
		
		
	}
	
	this.PushResponse = function PushResponse(payload){
		
		console.log(payload);
		
		var data = payload;
		
		if(data.action == 'pair'){
			
			//RELOAD WHOLE PAGE
			App.Reload();
			//Display.PairDisplay()
			
		}else if(data.action == 'reload'){
			
			//RELOAD WHOLE PAGE
			App.Reload();
			
		}else if(data.action == 'refresh'){
			
			//JUST REFRESH CHANNEL
			Display.LoadChannel();
		
		}else if(data.action == 'purge'){

			App.PurgeFiles();

		}else if(data.action == 'update'){
			
			Display.CheckForUpdates('auto');
			
		}else if(data.action == 'alert'){
			
			toast.show(data.data);
			
		}
				
	}
	
	this.PushStatusBar = function PushStatusBar(){
		
		var icon, status_class;
		

		icon			= '<i class="fas fa-exchange-alt"></i>';
		status_class	= 'online pulsing';	


		
		_("notification_status").className = status_class;
		_("notification_status").innerHTML = icon;
				
		
		
	}
	
	this.Console = function Console(action){
		
		
		if(action == 'shrink'){
							
			_("console").classList.toggle('shrink');
			
		
		}else if( action == 'open'){
			
			_("console").className = '';
			
		}else if( action == 'close'){
			
			_("console").className = 'hide';
		}
	
	}

	this.UpdateResolution = function UpdateResolution(){
		
		this.Resolution.w = _("maindisplay").offsetWidth; //player width;
		this.Resolution.h = _("maindisplay").offsetHeight; //player width;
		
		App.Log('Resolution Set: ' + this.Resolution.w + 'px X ' + this.Resolution.h + 'px');
		
	}
	
}

//---------STOREAGE -----------//
function StorageClass(){
	
	this.get = function get(k){
		
		return window.localStorage.getItem(k);
		
	}
	this.set = function set(k,v){
		
		return window.localStorage.setItem(k,v);
			
	}
	this.remove = function remove(k){
		
		return window.localStorage.removeItem(k);
		
	}

	this.viewStorage = function viewStorage(){
		
		console.log( window.localStorage );
		
	}
}

//----------NOTIFICATIONS------------//
function ToastClass (){
	this.Time = 3000;
	this.Style = '';
	
	this.error = function error(msg){
		this.Time = 3000;
		this.Style = '';
		this.Callback = '';		
		this.show(msg);
	}
	
	this.success = function success(msg){
		this.Time = 3000;
		this.Style = '';
		this.Callback = '';	
		this.show(msg);	
	}
	
	this.custom = function custom(msg,time,style,callback){
		this.Time = time;
		this.Style = style;
		this.Callback = callback;
		this.show(msg);	
		
	}
	
	this.show = function show(msg){
		
		App.Notice(msg);
		
	}
	
}

//*** AJAX HANDLER ***//
function ajaxObj( meth, url, header ) {

	var x = new XMLHttpRequest();

	x.open( meth, url, true );

		x.setRequestHeader("Content-type", 'application/json');

	return x;

}

function ajaxReturn(x){

	if(x.readyState == 4 && x.status == 200){

	    return true;	

	}

}

function _(x){

return document.getElementById(x);	

}



//*** NETWORK MONITOR ***//
function NetworkMonitor (){
	
	
	this.init = function init(){
		
		//SET INITIAL STATUS
		App.NetCon = navigator.onLine;

		window.addEventListener('online', function (e){
			App.NetCon = true;
			App.NetworkChanged('online',e);
		});
		
		window.addEventListener('offline', function (e){
			App.NetCon = false;
			App.NetworkChanged('offline',e);
			
		});
		
		App.Log('Starting Network Monitor: ' + ((App.NetCon)? 'online' : 'offline'));
	}
	
	
}


function LocationClass(){
	
	this.Support 	= false;
	this.Status		= 'prompt';
	this.PermMon	= false; //PERMISSION MONITOR
	
	this.Init = function Init(){
		
		if(navigator.geolocation){

			this.Support = true;
			
			try {

			navigator.permissions.query({name:'geolocation'})
			  .then(function(permissionStatus) {

				Location.Status = permissionStatus.state;
				Location.UpdateStatusBar();
				
				permissionStatus.onchange = function() {
				  Location.PermissionChange(this.state);
				};
			  });	
				
			} catch (err){
				
				console.error(err.message);
				
			}


		}else{
			
			this.Status = 'unsupported';
		}		

		
		this.UpdateStatusBar();
	}
	
	this.PermissionChange = function PermissionChange (result){
		//TRIGGERED IF PERMISSION CHANGES
		Location.Status = result;
		console.log('PERMISSION CHANGED:',result);
		
		Location.UpdateStatusBar();
		
		if(App.View != 'wizard'){
			//IGNORE CHANGES IN THE WIZARD
			if(Location.Status == 'granted'){
				Location.GetLocation();	
			}
		}
		
		
	}
	
	this.GetLocation = function GetLocation(){
		
		if(Location.Support && Location.Status != 'blocked'){

			navigator.geolocation.getCurrentPosition(Location.Position,Location.Error);		
						
		}	
	}
	
	this.Position = function Position(position){
		
		let location = {'lat':position.coords.latitude,'long':position.coords.longitude};
		
		//UPDATE POSITION IF CHANGED
		if(App.Display.location != location){
			
			App.Display.location = location;
			//PUSH TO SERVER
			Display.UpdateDisplay({'field':'location','value':location});			
			
		}
		

		Location.UpdateStatusBar();

		
	}
	
	this.Error = function Error (error){
		
		switch(error.code) {
			case error.PERMISSION_DENIED:
				Location.Status = 'denied';
				console.log("User denied the request for Geolocation.");
				toast.error('You declined location permission.');
				Location.UpdateStatusBar();
				Display.UpdateDisplay({'field':'location','value':'denied'});
			break;
			case error.POSITION_UNAVAILABLE:
				Location.Status = 'unvailable';
				console.log("Location information is unavailable.");
				toast.error('Location is unavailable.');
				Location.UpdateStatusBar();
				Display.UpdateDisplay({'field':'location','value':'unavailable'});
				
			break;
			case error.TIMEOUT:
				Location.Status = 'error';
				console.log("The request to get user location timed out.");
				toast.error('Attempt to get location timed out'); 
				Location.UpdateStatusBar();
				Display.UpdateDisplay({'field':'location','value':'unavailable'});
			break;
			case error.UNKNOWN_ERROR:
				Location.Status = 'error';
				console.log("An unknown error occurred.");
				toast.error('An unknown error occured.'); 
				Location.UpdateStatusBar();
				Display.UpdateDisplay({'field':'location','value':'unavailable'});
			break;
		}		
	
		
		
	}	
	
	this.UpdateStatusBar = function UpdateStatusBar (){
		
		var status = Location.Status;
			
		var icon, status_class;
		
		if(status == 'granted'){
			icon 			= '<i class="fas fa-map-marker-alt"></i>';
			status_class	= 'online';
			
		}else if(status == 'denied' || 'error'){
			icon 			= '<i class="fas fa-map-marker-alt"></i>';
			status_class	= 'offline';
			
		}else if(status == 'unavailable' || 'prompt'){
			icon 			= '<i class="fas fa-map-marker-alt"></i>';
			status_class	= '';
		}
		
		
		
		_("location_status").className = status_class;
		_("location_status").innerHTML = icon;
		
	}
	
}





//LOAD ALL DEPENDANT CLASSES
var App 	= new ApplicationManager();
var Storage	= new StorageClass();

var toast 		= new toastClass();
var NetMon 		= new NetworkMonitor();
var Location	= new LocationClass();


//HASH COMMANDS
var HashCommand = window.location.hash;

if( HashCommand == '#debug'){
	
	console.log('Debugging on Screen');
	
	App.Debug = true; //TURN ON DEBUGGING IF NOT ALREADY
	
	document.getElementById('console').classList.remove('hide');
	ConsoleLogHTML.connect(document.getElementById("console_log"));
	console.log('On Screen Debugging Activated');

}else if( HashCommand == '#dump'){
	
	window.location.hash = ''; //Clear hash to avoid loop
	
	App.DumpData('');
	toast.success('Data Dumped')
	
	
}else if( HashCommand == '#diag'){
	
	
	
	
	
	
}else if( HashCommand == '#piplayer'){
	
	App.PiPlayer = true;
		
}


if (!window.XMLHttpRequest) {

	console.error('Ajax not supported');
}




