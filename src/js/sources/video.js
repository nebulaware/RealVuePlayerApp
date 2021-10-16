const { app } = require("electron");

function VideoManager (){
		this.Param = {
		"app" : "video",
		"action" : "",
		"data" : ""
	}	
	
	this.Data;
	this.Player;
	this.PlayerIndex = 0;
	this.HasPlayer = false;
	
	//MONITOR PLAYING
	this.TimeCheck; //USED FOR MONITORING TIMEOUT 
	this.PlayPos	= {'current':0,'last':0}; //PLAYER PLAY POSITION (SECONDS IN VIDEO)
	this.Playing	= false;
	this.PlayFailed	= 0;
	
	
	this.Init = function Init(data,blob){
		
		this.Data = data;
		this.Run(data,blob);
		
		
		
	}
	
	this.Listener = function Listener(data,response){	
		
	}
	
	this.Preload = function Preload(data){
		
		//CALLED FOR PRELOADING RESOURCES
		var Path	= data;
		var File	= this.GetFile(Path);
	
		Downloader.Download('video',Path);

	}


	this.Run = function Run(data){
		
		var Path	= data;
		var local	= FM.GetLocal(data)

		this.Play (local)
	
	}

	this.Play = function Play(data,monitor){
		
		var Path	= data;
		var File	= this.GetFile(Path);
		var Ext		= File.ext;
		var PID		= Presenter.CurrentPID; //GET CURRENT PRESENTATION ID


		if(File.ext == 'invalid'){
			this.PlayError('invalid_extension');
		}
		
		//Clear any existing video monitor
		clearTimeout(Video.TimeCheck);
		
		if(this.HasPlayer){
			
			this.Player.dispose();

			
		}
		

		
		_("viewer").innerHTML = '<video id="realvue-player" class="video-js"><source src="' + Path + '" type="video/' + File.ext +'"></video>';	
		
		var options = {
			controls:	'true',
			autoplay: 	'any',
			loop:		true
			
		};
		
		this.Player = videojs('realvue-player' ,options, function onPlayerReady(){
			
			//videojs.log('Your player is ready!');
			
			this.play();

			//Start Video Monitor: Call the remote monitor if provide else call default
			if(monitor){
				monitor();
			}else{
				Video.MonitorPlayer();
			}


			//console.log(this);
			
			this.on('ended', function(){
				toast.info('Video is over :( ');
			})
			
		});
		
		//BACKUP PLAY
		
		setTimeout(Video.hasStartedMonitor,1000);
		
		this.HasPlayer = true;
		
	}
	
	this.GetFile = function GetFile(path){
		

		var File = {};
		
			try {

			File.name 	= path.substring(path.lastIndexOf('/')+1);
			File.ext	= path.split('.').pop();

			}catch (err) {
				
				console.error(err);
				toast.error('File Error:' + err);

			}
		
		
		
		return File;
		
	}
	
	this.hasStartedMonitor = function hasStartedMonitor(){
		
		//console.warn('attempting to play');
		
		if(Video.Player.hasStarted && !Video.Player.paused()){
			//DO NOTHING
			//console.log('Player should be playing');
			
		}else{
			
			
			Video.Player.play(); //attempt to play again
			
			setTimeout(Video.Player.hasStartedMonitor,1000); //Epeat check
			

			//Video.Player.remainingTimeDisplay()
			
		}		
	}

	this.MonitorPlayer = function MonitorPlayer(){

			//MAKE SURE THERE ARE NO OTHER TIMEOUTS RUNNING ON PLAYER MONITOR
			 clearTimeout(Video.TimeCheck);
			 
			let TimeLimit = 5000;
			
			 if(Presenter.PresentationData.data.source == 'video'){
				
				App.Log('Video Monitor System Running');
				
				//Set Current
				Video.PlayPos.current = Video.Player.remainingTimeDisplay();

				 
				 if(Video.PlayPos.current == Video.PlayPos.last){
					 //NO DETECTED PROGRESS
					 
					// if(Video.Player.paused()){
						 //PLAYER SHOULD BE PLAYING BUT DOESNT APPEAR TO BE
						 //console.warn ('Player appears to not be playing');
						  toast.error('Player appears to not be playing.')		 	 
						  Video.PlayFailed ++;
						 
					 //}else{
						 
						 //PLAYER HAS BEEN MANUALLY PAUSED
						 
					 //}
					 
					 
				 
					 //LOG ERROR
					 
					 
				 }else{
					
					 //PLAYER APPEARS TO BE PROGRESSING - UPDATE THE LAST TIMESTAMP
					 Video.PlayPos.last = Video.PlayPos.current;
					 Video.PlayFailed = 0; //ALWAYS RESET ON SUCCESS
				 }
				 
				 
				 if(Video.PlayFailed > 3){
					 
					 //SLOW MONITOR
					 TimeLimit = 20000
					 //FAILED TO MANY TIMES - RELOADING
					 
					 if(App.NetCon){
						 
						 Display.Log('ds-vd-fail',Video.PlayPos.last); //LOG FAILED EVENT
						 
						 //MAKE SURE THERE IS A NETWORK CONNECTION
						 toast.error('Reporting Error. Please wait')					
						 setTimeout(App.Reload,3000);
						 
					 }else{
						 
						 toast.warning('No Network Connection. Retrying in 20 seconds');
						 
					 }
					 
					
					 
					 
				 }
				 
			
				 
				 
				 
				 Video.TimeCheck = setTimeout(Video.MonitorPlayer, TimeLimit); //CHECK EVERY 5 SECONDS
				 
				 
 
			 }		
	

	}
	
	
	this.PlayError = function PlayError(error){
		
		var Heading 	= '';
		var Subtitle	= '';
		var Message 	= '';
		
		if( err == 'invalid_extension'){
			
			toast.error('Unsupported Media');
			Heading 	= 'Unsupported Media';
			Subtitle	= 'The source you included is not a supported media. Please check your source.';
			
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

	this.Completed = function Completed (data){

		// ** STORE FILE IN FILE LIST ** //
		FM.AddToList(data.url,data.filePath);


		//Done downloading file - Next Step
		Display.Preload('next');
	

	}

	this.Progress = function Progress (data){

		var Message = 'Downloaded: ' + data.downloaded + ' @ ' + data.speed;

		
		var Body =  '<div class="standby">';
		Body += '<img src="images/logo.svg">';
		Body += '<h1>Downloading</h1>';
		Body += '<h3>Please wait while we download your video</h3>';	
		Body += '<p>' + Message + '</p>';	
		Body += '</div>';	
		
		
		_("viewer").innerHTML = Body;			

	}

	this.CheckStatus = function CheckStatus(){
		//Called by the display to check the status of source (if active)


		
	}	

}

var Video = new VideoManager();

Presenter.AddSource(Video);