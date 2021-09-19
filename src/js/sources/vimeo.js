// JavaScript Document

function VimeoManager (){
		this.Param = {
		"app" : "vimeo",
		"action" : "",
		"data" : ""
	}	
	
	this.Data;
	this.APIReady = false;
	this.Player;
	
	this.State;
	this.TimeCheck; //USED FOR MONITORING TIMEOUT 
	this.PlayPos	= {'current':0,'last':0}; //PLAYER PLAY POSITION (SECONDS IN VIDEO)
	this.Playing	= false;
	this.PlayFailed	= 0;
	
	
	this.Quality = 'small';
	
	this.Init = function Init(data){
		
		console.log('Starting Vimeo Player');
		this.Data = data;
		
		this.RunAPI(data);
		
		
		//console.log('6 hour reload');
		 setInterval(function(){
				
				 App.Reload();
				 
			 }, 21600000);	//5 Minutes	
		
		
	}
	
	this.Listener = function Listener(data,response){	
		
		
		
		
		
		
	}
	
	this.RunPlayer = function RunPlayer(videoid){
		
//		Body = '<iframe id="ytplayer" type="text/html" width="100%" height="100%" src="https://www.youtube.com/embed/' + videoid + '?autoplay=1&controls=1&mute=1&loop=1&playsinline=1&modestbranding=1&playlist=' + videoid + '&iv_load_policy=3" frameborder="0" allowfullscreen></iframe>';
//		
//		
//		_("viewer").innerHTML = Body;
		
	}
	
	this.RunAPI = function RunAPI (data){
		
		//console.log('Running Youtube API');
		
		
		_("viewer").innerHTML = '<div id="vimeo_player"></div>';
		
		
		var videoId = this.Data;
		var width 	= App.Resolution.w;
		
		var playback_options = {
			id: videoId,
			autoplay: true,
			background: false,
			loop: true,
			width: width
		}
  		
		
		
		this.Player = new Vimeo.Player('vimeo_player',playback_options);
		
		VimeoPlayer.Player.on('play', function(){
			
				console.log('playing vimeo video');
			
				VimeoPlayer.MonitorPlayer();
				VimeoPlayer.Playing = true;
			
			
		});
		
		VimeoPlayer.Player.on('pause', function(){
			
			VimeoPlayer.Playing = false;
			
			
		});
		
		VimeoPlayer.Player.on('timeupdate', function(data){
			
			//UPDATE CURRENT PLAY POSITION IN VIDEO IN SECONDS
			VimeoPlayer.PlayPos.current = data.seconds;
			VimeoPlayer.Playing = true;
			
		});
		
		
	}
	
	this.BuildPlayer = function BuildPlayer(){
			
			var videoId = this.Data;
			


		
	}
	
	
	this.onPlayerReady = function onPlayerReady(event){
		
		//console.log(event);
		
		event.target.playVideo();
		
		//CLEAN UP
	
	
	
		//START MONITORING SERVICE
		VimeoPlayer.MonitorPlayer();	
		
	}
    
	this.onPlayerStateChange = function onPlayerStateChange(event) {
       

	}
     
	this.stopVideo = function stopVideo() {
      
	 }	
	 
	this.onPlaybackQualityChange = function onPlaybackQualityChange(e){

		 
	 }
	 
	this.MonitorPlayer = function MonitorPlayer(){

		//MAKE SURE THERE ARE NO OTHER TIMEOUTS RUNNING ON PLAYER MONITOR
		 clearTimeout(VimeoPlayer.TimeCheck);
		 
		let TimeLimit = 5000;
		
		 if(Presenter.PresentationData.data.source == 'vimeo'){
			
			App.Log('Monitor System Running');
			 
			 
			 if(VimeoPlayer.PlayPos.current == VimeoPlayer.PlayPos.last){
				 //NO DETECTED PROGRESS
				 
				 if(VimeoPlayer.Playing == true){
					 //PLAYER SHOULD BE PLAYING BUT DOESNT APPEAR TO BE
					 //console.warn ('Player appears to not be playing');
				 	 toast.error('Player appears to not be playing.')		 
					 
					 
					 VimeoPlayer.PlayFailed ++;
					 
				 }else{
					 
					 //PLAYER HAS BEEN MANUALLY PAUSED
					 
					 
				 }
				 
				 
			 
				 //LOG ERROR
				 
				 
			 }else{
				
				 //PLAYER APPEARS TO BE PROGRESSING - UPDATE THE LAST TIMESTAMP
				 VimeoPlayer.PlayPos.last = VimeoPlayer.PlayPos.current;
				 VimeoPlayer.PlayFailed = 0; //ALWAYS RESET ON SUCCESS
			 }
			 
			 
			 if(VimeoPlayer.PlayFailed > 3){
				 
				 //SLOW MONITOR
				 TimeLimit = 20000
				 //FAILED TO MANY TIMES - RELOADING
				 
				 if(App.NetCon){
					 
					 Display.Log('ds-vm-fail',VimeoPlayer.PlayPos.last); //LOG FAILED EVENT
					 
					 //MAKE SURE THERE IS A NETWORK CONNECTION
					 App.Reload();
					 
				 }else{
					 
					 toast.warning('No Network Connection. Retrying in 20 seconds');
					 
				 }
				 
				
				 
				 
			 }
			 
			 //var State = VimeoPlayer.Player.getPlayerState();
			 
			 VimeoPlayer.CheckSize();	 
			 
			 VimeoPlayer.TimeCheck = setTimeout(VimeoPlayer.MonitorPlayer, TimeLimit); //CHECK EVERY 5 SECONDS
			 
			 
			
			 
			 //App.Log('Youtube State: ' + Youtube.GetState(State));
			 

			 
			 
		 }		

		 
	 }
	 
	this.ResumePlay = function ResumePlay(){
		 

		 
	 }
	 
	this.CheckSize = function CheckSize(){
		 
		
		 var iframe 		= document.querySelector('iframe');
		 var playerWidth	= _("vimeo_player").width;
		 var playerHeight	= _("vimeo_player").height;
		 
		 if(iframe.width != App.Resolution.w || iframe.height != App.Resolution.h){
		 
			 //UPDATE PLAYER SIZE
			iframe.width 	= App.Resolution.w;
			iframe.height	= App.Resolution.h;	
			 
			 //Display.Log('ds-yt-size', App.Resolution.w +'px X ' + App.Resolution.h + 'px');
			
			 console.log('Vimeo Player has changed sizes from ' + playerWidth + 'px X ' + playerHeight + 'px to ' + App.Resolution.w + 'px X ' + App.Resolution.h + 'px');
			 
		 }	 
	 
	 }
	 
	this.GetState = function GetState(id){
		 
		 
		 
	 }
	
	this.PauseState = function PauseState (){
		
		
		VimeoPlayer.Player.getPaused().then(function(paused) {
		  // `paused` indicates whether the player is paused
			console.log('Vimeo Paused:', paused)
		});
		
		
	}

	this.GetCurrentTime = function GetCurrentTime(){
		
		this.getCurrentTime().then(function(seconds) {
		  // `seconds` indicates the current playback position of the video
			
			console.log('Vimeo Seconds:', paused)
			
		});		
		
		
	}
	
	
}

var VimeoPlayer = new VimeoManager();

Presenter.AddSource(VimeoPlayer);

