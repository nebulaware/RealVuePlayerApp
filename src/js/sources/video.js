
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

	this.Play = function Play(data){
		
		var Path	= data;
		var File	= this.GetFile(Path);
		var Ext		= File.ext;
		var PID		= Presenter.CurrentPID; //GET CURRENT PRESENTATION ID


		if(File.ext == 'invalid'){
			this.PlayError('invalid_extension');
		}
		

	
		
		
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
		
			File.name 	= path.substring(path.lastIndexOf('/')+1);
			File.ext	= path.split('.').pop();
		
		
		
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

}

var Video = new VideoManager();

Presenter.AddSource(Video);