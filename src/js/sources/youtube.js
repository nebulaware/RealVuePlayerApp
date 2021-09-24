const ytdl = require("ytdl-core");

function YoutubeManager (){
		this.Param = {
		"app" : "youtube",
		"action" : "",
		"data" : ""
	}	
	
	this.Data;
	this.APIReady = false;
	this.Player;
	
	this.State;
	this.TimeCheck; //USED FOR MONITORING TIMEOUT 
	
	this.Quality = 'small';
	
	this.Init = function Init(data){
		
		
		this.Data = data;
		
		this.RunPlayer(data);
		//this.RunAPI(data);
		//this.RunPlayer(data); //DATA SHOULD BE VIDEO ID
		
	}
	
	this.Listener = function Listener(data,response){	
		
		
		
		
		
		
	}
	
	this.RunPlayer = function RunPlayer(data){
		
		var local	= FM.GetLocal('https://www.youtube.com/watch?v=' + data)

		Video.Play (local)
		
	}
	
	this.Preload = function Preload(data){


		const url = 'https://www.youtube.com/watch?v=' + data;
		const output = DownloadPath + '/' + data +'.mp4';
		
        let File = FM.CheckForFile(url);

        Downloader.ActiveFile(url); //Log this file is actively used

        if(File){
            //File Exists
            Display.Preload('next');
			return;

        }

		

		const video = ytdl(url);
		let starttime;
		video.pipe(fs.createWriteStream(output));
		video.once('response', () => {
		  starttime = Date.now();

		  var Body =  '<div class="standby">';
		  Body += '<img src="images/logo.svg">';
		  Body += '<h1>Downloading</h1>';
		  Body += '<h3>Please wait while we download your video</h3>';	
		  Body += '<p><span id="yt-percent"></span><br><span id="yt-downloaded"><br></span><span id="yt-running"></span><span id="yt-eta"></span></p>';	
		  Body += '</div>';	
		  
		  
		  _("viewer").innerHTML = Body;	
	  
	  
		  
		  
		  _("viewer").innerHTML = Body;
		});

		video.on('progress', (chunkLength, downloaded, total) => {
		  const percent = downloaded / total;
		  const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
		  const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
		  //readline.cursorTo(process.stdout, 0);
		  _('yt-percent').innerHTML = `${(percent * 100).toFixed(2)}% downloaded `;
		 // _('yt-downloaded').innerHTML = `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`;
		  _('yt-running').innerHTML = `running for: ${downloadedMinutes.toFixed(2)} minutes`;
		  _('yt-eta').innerHTML = `, estimated: ${estimatedDownloadTime.toFixed(2)} minutes `;
		  //readline.moveCursor(process.stdout, 0, -1);
		});
		
		video.on('end', () => {
		  
			FM.AddToList(url,output);
			Display.Preload('next');	
			//process.stdout.write('\n\n');
		});
	}


	this.RunAPI = function RunAPI (data){
		
		//console.log('Running Youtube API');
		
		
		_("viewer").innerHTML = '<div id="player"></div>';
		
		if(!this.APIReady){
			
			
		//LOAD YOUTUBE IFRAME API	
		var tag = document.createElement('script');
		  tag.src = "https://www.youtube.com/iframe_api";
		  var firstScriptTag = document.getElementsByTagName('script')[0];
		  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);	
			
			
			//ONCE API READY - CALLBACK IS PERFORMED AND WILL CALL BUILD PLAYER AND MARK API READY
			
		}else{
			
			this.BuildPlayer();
			
		}
	
  		
		
	}
	
	this.BuildPlayer = function BuildPlayer(){
			
			var videoId = this.Data;
			
			this.Player = new YT.Player('player', {
			  height: App.Resolution.h,
			  width: App.Resolution.w,
			  videoId: videoId,
			  playerVars: {
				  loop: 1,
				  playlist: videoId,
				  enablejsapi: 1,
				  iv_load_policy:0,
				  fs: 0,
				  modestbranding: 1
				  
				  
			  },
			  events: {
				'onReady': Youtube.onPlayerReady,
				'onStateChange': Youtube.onPlayerStateChange,
				'onPlaybackQualityChange': Youtube.onPlaybackQualityChange
			  }
			});		
		
		

		
	}
	
	
	this.onPlayerReady = function onPlayerReady(event){
		
		//console.log(event);
		
		event.target.playVideo();
		
		//CLEAN UP
		_("player").title = ''; //REMOVE YOUTUBE TITLE
	
	
		//START MONITORING SERVICE
		Youtube.MonitorPlayer();	
		
	}
    
	this.onPlayerStateChange = function onPlayerStateChange(event) {
       
		var done = true;
		
		Youtube.State = event.data;
		//console.log('Youtube State Change',event, event.data);
	
		
		if (event.data == YT.PlayerState.PLAYING && !done) {
          setTimeout(Youtube.stopVideo, 600000);
        
        }
		
      }
	
     this.stopVideo = function stopVideo() {
        Youtube.Player.stopVideo();
	 }	
	 
	 this.onPlaybackQualityChange = function onPlaybackQualityChange(e){
		 
		 var q = e.data;
		 
		 if(q != Youtube.Quality){
		 
			 Youtube.Quality = q; //SET NEW QUALITY
			 Display.Log('ds-yt-quality', q);
			 
		 }
		 
	 }
	 
	 this.MonitorPlayer = function MonitorPlayer(){
		
		 //MAKE SURE THERE ARE NO OTHER TIMEOUTS RUNNING ON PLAYER MONITOR
		 clearTimeout(Youtube.TimeCheck);
		 
		 if(Presenter.PresentationData.data.source == 'youtube'){
			
			 var State = Youtube.Player.getPlayerState();
			 
			 Youtube.CheckSize();
			 
			 
			 App.Log('Youtube State: ' + Youtube.GetState(State));
			 
			 if(State == 0){
				//STOPPED 
				Display.Log('ds-yt-play-stop',''); 
				toast.warning('Player is stopped and should be playing. Attempting to resume in 30 seconds');
				
				 Youtube.TimeCheck = setTimeout(Youtube.ResumePlay, 30000); //RETRY IN 30 SECONDS
				 
			 }else if(State == 2){
				 //PAUSED
				 Display.Log('ds-yt-play-paused',''); 
			 	 
				 toast.warning('Player is paused and should be playing. Attempting to resume in 30 seconds');
				 Youtube.TimeCheck = setTimeout(Youtube.ResumePlay, 30000); //RETRY IN 30 SECONDS
			
			 }else if(State == 1){
				
				 Youtube.TimeCheck = setTimeout(Youtube.MonitorPlayer, 15000); //CHECK EVERY 15 SECONDS
			 
			 }else{
			 	 
				Youtube.TimeCheck = setTimeout(Youtube.ResumePlay, 5000); //RETRY IN 5 SECONDS
		 	
				 
			 }
			 
			 
		 }
		 
		 
	 }
	 
	 this.ResumePlay = function ResumePlay(){
		 
		 Youtube.Player.playVideo();
		 
		 setTimeout(function(){
			 
			if(Youtube.State != 1){
				//UNABLE TO START PLAYER
				App.Reload();
				
			}else{
				//RESTART MONITOR
				Youtube.MonitorPlayer();
			}
			 
			 
		 },5000);
		 
		 
	 }
	 
	 this.CheckSize = function CheckSize(){
		 
		 var playerWidth	= _("player").width;
		 var playerHeight	= _("player").height;
		 
		 if(playerWidth != App.Resolution.w || playerHeight != App.Resolution.h){
		 
			 //UPDATE PLAYER SIZE
			 _("player").width 	= App.Resolution.w;
			 _("player").height	= App.Resolution.h;	
			 
			 Display.Log('ds-yt-size', App.Resolution.w +'px X ' + App.Resolution.h + 'px');
			
			 console.log('YouTube Player has changed sizes from ' + playerWidth + 'px X ' + playerHeight + 'px to ' + App.Resolution.w + 'px X ' + App.Resolution.h + 'px');
			 
		 }	 
	 
		 
	 }
	 
	 this.GetState = function GetState(id){
		 
		if(id == -1 ){
			return 'unstarted';
			
		}else if(id == 0 ){		
			return 'ended';
			
		}else if(id == 1 ){
			return 'playing';
			
		}else if(id == 2 ){
			return 'paused';
			
		}else if(id == 3 ){
			return 'buffering';
			
		}else if(id == 5 ){
			return 'video cued';
			
		}
		 
		 
	 }
}

var Youtube = new YoutubeManager();

Presenter.AddSource(Youtube);




//HAS TO BE GLOBAL SINCE YOUTUBE WONT LOAD INTO AN OBJECT
function onYouTubeIframeAPIReady() {
	Youtube.APIReady = true;
	Youtube.BuildPlayer();
}




	

