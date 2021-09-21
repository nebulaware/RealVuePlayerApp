// JavaScript Document

"use strict";

function DisplayClass(){
	this.Param = {
		"app" : "display",
		"action" : "",
		"data" : ""
	}	
	
	this.PingRate 	= 1; //0 = 30 seconds, 1 = 5 minutes, 2 = 1 hour, 3 = 8 hours, 4 = 24 hours 
	this.Sidebar	= '';
	
	//LONG POLLING
	this.PollMinute = 0;
	
	//CLOCK
	this.TickRate 	= 1000; //1000 = 1 Second | 60000 = 1 Minute
	this.NextEvent	= '';
	this.Seconds	= 0;
	
	//TIME
	this.Day		= '';
	this.Hour		= '';
	this.Minute		= '';
	this.TimeBlock	= ''; //TIME BLOCK THAT IS IN THE SCHEDULE
	
	//CHANNEL DATA
	this.ChannelData	= {};
	this.Schedule 		= {};
	this.ScheduleReady	= false;
	this.Presentations	= {};
	this.PresentationKeys;
	
	this.CurrentPresentation = 0;
	
	this.SidebarScroll	= '';
	
	this.Init = function Init(code,token,cid,data) {
	
		App.Log('Starting Display');
		
		//SET CODE AND TOKEN IN APP 
		App.Code 		= code;
		App.Token		= token;
		App.ConnectID	= cid;
		
		
		

		//Start Ping Timer
		if(this.PingRate == 0){
			
			this.Timer = setInterval(Display.CheckIn, 30000); //30 seconds		
		
		}else{
			
			this.Timer = setInterval(Display.CheckIn, 300000);	//5 Minutes	
		}
			
		
		
				
			
			
		
	}
  

	this.Listener = function Listener(data,response){	
		
		
		//console.log(data,response);
		
		if(response.status == 'error'){
			
			toast.error(response.data);
			return false;
		}
			
		if(data.action == 'registerdisplay'){
			
			App.Display.otc 	= response.data.otc;
			App.Display.code	= response.data.code;
			App.Display.token	= response.data.token;
			
			//SAVE
			App.Save('display');
			
			if(App.View == 'wizard'){
			
				Wizard.Step(1); //INSTALLATION		
				
			}

		}else if( data.action == 'loaddisplay'){
			
			//console.log(response.data);
			
			App.Display.channel	= response.data.channel;
			App.Display.otc 	= response.data.otc;
			
			App.Save('display');
			
			Display.LoadChannel();
			
			
		}else if (data.action == 'updatedisplay'){
			
			
			
			//UPDATE FIELD
			App.Display[data.data.field] = data.data.value;
			
			App.Save('display');

			
			if(App.View == 'wizard'){
				
				//IF WE ARE UPDATING IN WIZARD THERE ARE SETUPS TO FOLLOW
				if(data.data.field == 'run'){
					Wizard.Step(2); //INSTALLATION		
				}else if (data.data.field == 'pushtoken' && Wizard.CurrentStep == 2 || data.data.field == 'method' && Wizard.CurrentStep == 2){
					
					if(App.PiPlayer){
						Wizard.Step(3);
					}else{
						Wizard.Step(2); //NOTIFICATION
					}
				}else if(data.data.field == 'location' && Wizard.CurrentStep == 3){
					if(App.PiPlayer){
						Wizard.Pairing()
					}else{
						Wizard.Step(3);	//LOCATION
					}
				}
			}
			
		}else if( data.action == 'loadchannel' || data.action == 'changechannel'){
			
			App.Preloader(); //TURN OFF PRELOADER
			
			App.View = 'Viewer';
			
			_("maindisplay").classList.remove('wizard');
			
			if(response.status == 'channel_error'){
				//NO ACTIVE CHANNEL - SHOULDNT HAPPEN
				Display.ChannelError(response.data);
				
			}else if(response.status == 'success'){
				
				//STORE CHANNEL DATA
				this.ChannelData = response.data;
				
				//ADD CHANNEL PULLED INTO DISPLAY
				App.Display.channel = this.ChannelData.id;
				
				App.Save('display');
				
				Display.DisplaySidebar('close');
				
				Display.ScheduleReady = false;
				
				Display.ProcessChannel();
				
			}
						
			
		}else if( data.action == 'channellist'){
			
				this.ChannelSidebar('display',response.data);
			
		}else if( data.action == 'addchannel' || data.action == 'canceladd'){
			
			App.Display.otc = response.data.otc;	
			App.Save('display');
			
			Display.DisplaySidebar('close');
			
			Display.LoadChannel();
					
			
		}else if( data.action == 'checkin'){
			
			//DO NOTHING
			
		}
		
		
		
		
	}
	this.Alert = function Alert(){
	
		toast.success('You reached the alert');
		
	}
	
	this.Log = function Log(code,details){
		
		App.Log('Reporting to Log');
	
		//LOG DISPLAY EVENT
		Display.Param.action = 'log';
		Display.Param.data = {'code':code,'details':details};
		
		App.Send(Display.Param);		
		
	}	
		
	
	this.Register = function Register(){
		
		App.Log('Registering Display');
	
		//REGISTER DISPLAY	
		Display.Param.action = 'registerdisplay';
		Display.Param.data = {};
		
		App.Send(Display.Param);		
		
	}	
	
	this.ValidateDisplay = function ValidateDisplay(){
		
		App.Log('Validating Display');
		
		//VALIDATE DISPLAY	
		Display.Param.action = 'validatedisplay';
		Display.Param.data = {};
		
		App.Send(Display.Param);			

		
	}
	
	this.UpdateDisplay = function UpdateDisplay(data){
		
		App.Log('Updating Display:',data);
		
		//UPDATE DISPLAY	
		Display.Param.action = 'updatedisplay';
		Display.Param.data = data;
		
		App.Send(Display.Param);		
		
	}
	
	this.PairDisplay = function PairDisplay(){
		
		//PAIR DISPLAY	
		Display.Param.action = 'pairdisplay';
		Display.Param.data = data;
		
		App.Send(Display.Param);			
		
	}
	
	this.LoadDisplay = function LoadDisplay(){
		
		
		//PAIR DISPLAY	
		Display.Param.action = 'loaddisplay';
		Display.Param.data = {};
		
		App.Send(Display.Param);			
	
		
	}
	
	this.CheckIn = function CheckIn(){
		
		//*** BECAUSE THIS IS BEING CALLED BY TIMER, WE CANT USE "THIS" STATEMENTS
		
		//PINGS THE SYSTEM		
		Display.Param.action = 'checkin';
		Display.Param.data = {};
		
		App.Send(Display.Param);		
		
	}	
	
	this.LoadChannel = function LoadChannel(){
		
			
		if(App.Display.otc != 0){
			
			//PAIRING MODE
			Wizard.Pairing();
			App.Preloader();				
			
		}else if(App.Display.channel != 0){
			
			Display.Param.action = 'loadchannel';
			Display.Param.data = {};

			App.Send(Display.Param);
			
		}else if( App.Display.channel == 0 && App.Display.otc == 0){
			
			console.warn('No Channel Assigned and no activation code.');
			
			Display.ChannelSidebar('load');
			
			
		}else{
			toast.error('We are not sure what happened when loading the channel','Unknown Error');
			console.error('Display | No Load Channel Condition met');
			
		}
		
		
		
	}
	
	this.ProcessChannel = function ProcessChannel(){
		//PROCESS THE DATA AND READY IT FOR DISPLAY	
		
		var Presentations	= this.ChannelData.presentations;
		var PCount			= Presentations.length;
		var p,pid;
		
		if(PCount == 0){
			
			this.ChannelError('no_presentations');
			return false;
		}
		
		for (p = 0; p < PCount; p++){
			
			pid = Presentations[p].pid;
			
			//ADD PRESENTATION
			this.Presentations[pid] = Presentations[p];
			
			//PARSE PRESENTATION DATA
			this.Presentations[pid].data = JSON.parse(this.Presentations[pid].data);
			
			
		}
		
		
		if(this.ChannelData.schedule == null || this.ChannelData.schedule == ''){
			
			this.ChannelError('no_schedule');
			return false;
			
		}
		
		
		
		this.BuildSchedule();
		
	}
	
	this.BuildSchedule = function BuildSchedule(){
		
		var Days  	= ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
		var Times	= ['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
				   	   '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30','24:00']		
		var d,t; //DAY & TIME KEYS
		this.Schedule = {};	
		
		for (d in Days){
			
			this.Schedule[Days[d]] = {};
			
			for (t in Times){
				
				this.Schedule[Days[d]][Times[t]] = '';
			}
		}
		
		
		
		//ADD EVENTS TO SCHEDULE
		//EVENT VARS
		var event,id,day,timemode,start,end,units,presentation;
		
	
		
		var Events = this.ChannelData.schedule.events;
		var e,loopcount,starttime;		
		
		
		for(e in Events){
			
			
			
			event 		= Events[e];
			
			day			= event.day;
			timemode	= event.timemode;
			start		= moment(event.start, 'HH:mm');
			end			= event.end;
			units		= event.units;
			
			//CLONE
			starttime 	= start.clone();

			
			//LOOPCOUNT
			loopcount	= 0;
			
			if(day == 'allweek'){
				/* ONLY 1 EVENT SHOULD EXIST ON A FULL WEEK EVENT */	
				for (d in Days){
					
					loopcount = 0;
					starttime = moment('00:00','HH:mm');
					
					
					while (loopcount < units){

						//ADD EVENT TO EACH TIME SLOT IT EXISTS IN	
						this.Schedule[Days[d]][starttime.format('HH:mm')] = event.presentation;

						//INCREMENT TIME
						starttime.add(30,'minutes');

						loopcount++;

					}						

				}
				
				
			}else{
				
				
				while (loopcount < units){
					
					//ADD EVENT TO EACH TIME SLOT IT EXISTS IN	
					this.Schedule[day][starttime.format('HH:mm')] = event.presentation;
		
					//INCREMENT TIME
					starttime.add(30,'minutes');
					
					loopcount++;

				}							
				
			}
			
		}		
		
		Display.ScheduleReady = true; //LETS THE TICKER KNOW THE SCHEDULE IS READY
		
		this.DisplayChannel();
		
	}
	
	
	this.DisplayChannel = function DisplayChannel(){
		
		var Heading 	= '' + this.ChannelData.name + '';
		var Subtitle	= 'Please wait while we load your channel content';
		var Message 	= '';
		
		//SHOW ERROR	
		var Body =  '<div class="standby">';
			Body += '<img src="images/logo.svg">';
			Body += '<h1>' + Heading + '</h1>';
			Body += '<h3>' + Subtitle + '</h3>';	
			Body += '<p>' + Message + '</p>';	
			Body += '</div>';	
	
		
		_("viewer").innerHTML = Body;	
		
		//MINUTE TICK WILL LAUNCH PRESENTER
		this.MinuteTick();
		
		
	}

	this.ChangeChannel = function ChangeChannel(channel){
		
		if(channel == 'add'){
		
			Display.Param.action = 'addchannel';
			Display.Param.data = {};

			App.Send(Display.Param);				
			
		}else if(channel == 'cancel'){
			
			Display.Param.action = 'canceladd';
			Display.Param.data = {};

			App.Send(Display.Param);			
					
			
		}else{
			
			Display.Param.action = 'changechannel';
			Display.Param.data = {'channel':channel};

			App.Send(Display.Param);				
			
			
		}
	
		
	}
	
	/* DEPRECATED
	this.SyncTo = function SyncTo(mod){
		//Minute of Day
		var CurrentMOD = this.GetCurrentMOD();
		var TimeLeft = ((mod - CurrentMOD) * 1000); //Find Difference and convert to milleseconds and Set timer
		
		//Start Ping Timer
		this.SyncTimer = setInterval(App.Reload, TimeLeft);		
	}
	
	this.GetCurrentMOD = function GetCurrentMOD(){
		
		var d = new Date();
		var m = d.getMinutes();
		var mh = (d.getHours() * 60);
		
		return m + mh;
		
	}

	*/
	
	this.FullScreen = function FullScreen (action){
		
		if(action === 'enable'){
			
			var element = _("maindisplay");
			
			if(element.requestFullscreen) {
				element.requestFullscreen();
			} else if(element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if(element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if(element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
			
			this.IsFullScreen = true;
			
		}else if(action === 'disable'){
			
			if(document.exitFullscreen) {
				document.exitFullscreen();
			} else if(document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if(document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
			
			this.IsFullScreen = false;
			
		}
		
		
	}
	
	this.ToggleFullscreen = function ToggleFullscreen(){
		
		if(this.IsFullScreen){
			this.FullScreen('disable');
		}else{
			this.FullScreen('enable');
		}
	}	
	
	
	this.ChannelError = function ChannelError(err){
		
		var Heading 	= '';
		var Subtitle	= '';
		var Message 	= '';
		
		if( err == 'no_active_channel'){
			
			toast.error('No Active Channel');
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: NSC';
			
		}else if (err == 'channel_not_found'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: CNF';
			Message		= '';		
			
		}else if (err == 'channel_no_sub'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: NAS';
			Message		= '';			
		
		}else if (err == 'channel_offline'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: COFF';
			Message		= '';					
			
		}else if (err == 'subchannel_offline'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: SOFF';
			Message		= '';	
			
		}else if (err == 'display_suspended'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: DS';
			Message		= '';	
			
		}else if (err == 'display_blocked'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: DB';
			Message		= '';	
		
		}else if (err == 'no_schedule'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: NS';
			Message		= '';						
			
		}else if (err == 'no_presentations'){
			
			Heading 	= 'Please Stand By';
			Subtitle	= 'Status: NP';
			Message		= '';							
			
		}else if (err == ''){
			
			Heading 	= 'Unknown Error';
			Subtitle	= 'Well this is awkward.';
			Message		= 'There was an error and we are not sure how to process it. Try refreshing the page.';
			
		}
		
		
		
		
	//SHOW ERROR	
	var Body =  '<div class="standby">';
		Body += '<img src="images/logo.svg">';
		Body += '<h1>' + Heading + '</h1>';
		Body += '<h3>' + Subtitle + '</h3>';	
		Body += '<p>' + Message + '</p>';	
		Body += '</div>';	
	
	
		
		
		_("viewer").innerHTML = Body;
		
	}
	
	
	
	/* -- CLOCK FUNCTIONS --
		Clock functions are intended for tracking the time and schedules
	*/
	this.Tick = function Tick (){
		
		
		
		Display.UpdateClock();
		
		//MINUTE TICKER
		if(Display.Seconds == '00' || Display.Minute == ''){
			Display.MinuteTick();
		}
		
		
		setTimeout(Display.Tick, Display.TickRate);
		
	}
	
	this.MinuteTick = function MinuteTick(){
		//RUNS EVER MINUTE
		Display.Minute		= moment().format('mm');
		Display.Hour		= moment().format('HH');
		Display.Day			= moment().format('dddd');
		
		//CONVERT TO LOWERCASE FOR KEY
		
		
		var minute,timeblock;
		var day = Display.Day.toLowerCase();
		
		if(Display.Minute >= 30){
			minute = '30';
		}else{
			minute = '00';
		}
		
		timeblock = Display.Hour + ':' + minute;
		
		Display.TimeBlock = timeblock;
		
		
		
		if(Display.ScheduleReady == false){
			
			//console.log('Schedule Not Ready');
			return false;
		}
		
		
		
		//CURRENT PRESENTATION
		
		var Presentation = Display.Schedule[day][timeblock];

		Presenter.Run(Presentation);
		
		
		//POLLING
		Display.PollCheck();
		

		
	}
	
	this.UpdateClock = function UpdateClock(){
		
		Display.Seconds 	= moment().format('ss');
		
		
		
		_("ctime").innerHTML = moment().format('hh:mm:ss A');
		_("cdate").innerHTML = moment().format('dddd, MMMM Do YYYY');;
		
	}
	
	this.PollCheck = function PollCheck (){
		
		//NOW INSTANT WILL POLL EVERY 120 minutes - 7/17/2020
		var Limit = ((App.Display.method == 'long')? 15 : 15);
		
		//USED FOR LONG POLLING
		if(this.PollMinute == Limit){
			this.CheckIn();
			this.PollMinute = 0; //RESET COUNTER
		}else{
			this.PollMinute++;
		}
		

		
		
	}
	
	
	
	/* 
	
	-- DISPLAY INFO
	
	*/
	
	this.DisplaySidebar = function DisplaySidebar(view){
			
		
		if(view == 'close' || view == '' || view == null){
			
			_("sidebar").classList.remove('show');
			this.Sidebar = '';
			
		}else{
			
			_("sidebar").classList.add('show');
			this.Sidebar = view;
		}

		
	}
	
	this.SidebarContent = function SidebarContent(content){

		if(Display.SidebarScroll == ''){	
			
			_("sidebar_content").innerHTML = content;
			Display.SidebarScroll = new SimpleBar(document.getElementById('sidebar_content'));
			
		}else{
			
			var container = Display.SidebarScroll.getContentElement();
			
			container.innerHTML = content;		
			
		}

		
	}
	
	this.ChannelSidebar = function ChannelSidebar(action,data){
		
		var Body	= '';;
		var Count 	= 0;
		
			
		
		
		if(action == 'load'){
			
			//TOGGLE SIDEBAR
			if(this.Sidebar == '' || this.Sidebar != 'channel'){
				this.DisplaySidebar('channel');
			}else{
				this.DisplaySidebar('close');
			}			
			
			
			
			Body = '<div class="loader"><div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>';	
			
			
			//GET CHANNEL LIST
			Display.Param.action = 'channellist';
			Display.Param.data = {};

			App.Send(Display.Param);				
			
			
		}else{
			
			if(this.Sidebar == '' || this.Sidebar != 'channel'){
				this.DisplaySidebar('channel');
			}	
			
			//console.log(data);
			
			var c,channel,status;
			
			Body = '<div class="channel_list">';
			
			for( c in data ){
				
				channel = data[c];
				

				
				if(App.Display.channel == channel.id){
				
					Body += '<div class="channel current" onclick="toast.info(\'You are already on this channel\');">';
					Body += '<span class="channelname">' + channel.name + '</span>';
					Body += '<span class="status">Current</span>';
					Body += '</div>';					
					
					
				}else if(channel.status == 1 || channel.status == 2 || channel.status == 4 || channel.status > 5){
					
					Body += '<div class="channel" onclick="Display.ChangeChannel(' + channel.id + ')">';
					Body += '<span class="channelname">' + channel.name + '</span>';
					Body += '<span class="status">Active</span>';
					Body += '</div>';					
					
				}else if(channel.status == 3){
					
					Body += '<div class="channel" onclick="toast.error(\'This channel has this display suspended.\',\'Cannot Connect\')">';
					Body += '<span class="channelname">' + channel.name + '</span>';
					Body += '<span class="status">Suspended</span>';
					Body += '</div>';				
					
				}else if(channel.status == 5){
					
					Body += '<div class="channel" onclick="toast.error(\'This channel has this display blocked.\',\'Cannot Connect\')">';
					Body += '<span class="channelname">' + channel.name + '</span>';
					Body += '<span class="status">Blocked</span>';
					Body += '</div>';						
				}
							
				Count++;
				
			}
			
				//ADD CHANNEL
				Body += '<div class="channel" onclick="Display.ChangeChannel(\'add\')" style="text-align:center;">';
				Body += '<span class="channelname">Add Channel</span>';

				Body += '</div>';			
			
			
			Body += '</div>';
			
			
		}
		

		
		
		_("sidebar_title").innerHTML = '<i class="fas fa-broadcast-tower"></i> Channel List';
		this.SidebarContent(Body);
		
	
		
	}
	
	this.ScheduleSidebar = function ScheduleSidebar (){
		
		//TOGGLE SIDEBAR
		if(this.Sidebar == '' || this.Sidebar != 'schedule'){
			this.DisplaySidebar('schedule');
		}else{
			this.DisplaySidebar('close');
		}
		
		
		
		
		var Day = this.Day;
		
		var Schedule = this.Schedule[Day.toLowerCase()];
		var s; //Schedule Key
		var pid; //PRESENTATION ID
		
		//.schedule_slot - .start_time - .end_time - .presentation
		
		var Body = '<h3>' + Day + '</h3>';
		
		var List = '<div class="schedule_list">';
		
		var count = 0;
		var currentpid;
		var previoustime;
		var presentation_name;
		
		
		
		for(s in Schedule){
			
			count++;
			
			if(count != 49){
			
				pid = Schedule[s];

				if(pid == ''){
					presentation_name = '';
				}else{
					presentation_name = this.Presentations[pid].name; 
				}
				
				//console.log(count,pid)

				if(pid != currentpid){

					if(count != 1){

						List +='<div class="end_time">' +  moment(s, 'HH:mm').format('hh:mm A') + '</div></div>';

					}


					//START NEW SECTION	
					List += '<div class="schedule_slot"><div class="start_time">' +  moment(s, 'HH:mm').format('hh:mm A') + '</div><div class="presentation">' + presentation_name + '</div>';

					currentpid = pid;
				}


				//STORE TIME FOR NEXT RECORD
				previoustime = s;



				//CLOSE IT OUT
				if(count == 48){

					List +='<div class="end_time">' +  moment('00:00', 'HH:mm').format('hh:mm A') + '</div></div>';

				}
		
			}
		}
		
		
		List += '</div>';
		
		
		Body += List;
		
		
		_("sidebar_title").innerHTML = '<i class="fas fa-calendar-alt"></i> Schedule';
		
		this.SidebarContent(Body);	
		
		
		
	}
	
	this.StatusSidebar = function StatusSidebar(){
		
		//TOGGLE SIDEBAR
		if(this.Sidebar == '' || this.Sidebar != 'status'){
			this.DisplaySidebar('status');
		}else{
			this.DisplaySidebar('close');
		}
		
		var ChannelName 	= ((this.ChannelData.name)? this.ChannelData.name : 'Not Set');
		var SubName 		= ((this.ChannelData.subname)? '<p><strong>Subchannel:</strong> ' + this.ChannelData.subname + '</p>' : '');
		var Method 			= '';
		

		
		var Body;
		
		Body = '';
		Body += '<p><strong>Device Code:</strong> ' + App.Display.code + '</p>';
		
		Body += '<p><strong>Channel Name:</strong> ' + ChannelName + '</p>';
		Body += SubName;
		Body += '<h3>Display Information</h3>';
		Body += '<p><strong>Name:</strong> ' + ((this.ChannelData.displayname)? this.ChannelData.displayname : 'Not Set') + '</p>';
		Body += '<p><strong>Location:</strong> ' + ((this.ChannelData.displaylocation)? this.ChannelData.displaylocation : 'Not Set') + '</p>';
		Body += '<p><strong>Run Mode:</strong> ' + ((App.Display.run == 'installed')? 'Installed' : 'Browser') + ((App.Display.run == 'legacy')? ' - Legacy' : '') + '</p>';
		Body += '<p><strong>Update Method:</strong> ' + ((App.Display.method == 'push')? 'Push' : 'Ping (20 minutes)') + '</p>';
		Body += '<p><strong>Dimensions:</strong> ' + App.Resolution.w + 'px X ' + App.Resolution.h + 'px</p>';
		Body += '<h3>Permissions</h3>';
		Body += '<p><strong>Notification:</strong> ' + App.PushStatus + '</p>';
		Body += '<p><strong>Location:</strong> ' + Location.Status + '</p>';
		Body += '<h3>App</h3>';
		Body += '<p><strong>Version:</strong> ' + App.Version + ' - <strong>(<i>' + App.VersionPhase + '</i>)</strong></p>';
		
		
		_("sidebar_title").innerHTML = '<i class="fas fa-tv"></i> Display Status';
		this.SidebarContent(Body);		
		
		
		
		
	}

	this.OptionsSidebar = function OptionsSidebar (){

		//TOGGLE SIDEBAR
		if(this.Sidebar == '' || this.Sidebar != 'status'){
			this.DisplaySidebar('status');
		}else{
			this.DisplaySidebar('close');
		}
		
		var ChannelName 	= ((this.ChannelData.name)? this.ChannelData.name : 'Not Set');
		var SubName 		= ((this.ChannelData.subname)? '<p><strong>Subchannel:</strong> ' + this.ChannelData.subname + '</p>' : '');
		var Method 			= '';
		

		
		var Body;
		
		Body = '<h3>Settings</h3>';
		Body += '<button class="" onclick="App.CloseApp();"><i class="far fa-times-circle"></i> Close Application</button>';
		

		
		
		_("sidebar_title").innerHTML = '<i class="fas fa-cog"></i> Settings';
		this.SidebarContent(Body);		




	}
}

var Display = new DisplayClass();

App.AddComponent(Display);

var Dis = new DisplayClass();



