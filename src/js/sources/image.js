// JavaScript Document
function ImageManager (){
		this.Param = {
		"app" : "image",
		"action" : "",
		"data" : ""
	}	
	
	this.Data;
	
	this.Init = function Init(data){
		
	
		this.Data = data;
		
		this.Run(data);
		
		
		
	}
	
	this.Listener = function Listener(data,response){	
			
		
	}

	this.Preload = function Preload(data){
		
		//CALLED FOR PRELOADING RESOURCES
		var Path	= data;
		Downloader.Download('image',Path);

	}
	this.Run = function Run (data){

		this.Play(FM.GetLocal(data));

	}


	this.Play = function Play(source){
		
		//** DATA IS LOCAL PATH */
		var Body = '<img src="' + source +'" style="width:100%;height:100%;">';
		
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
		Body += '<h3>Please wait while we download your image</h3>';	
		Body += '<p>' + Message + '</p>';	
		Body += '</div>';	
		
		
		_("viewer").innerHTML = Body;			

	}

}

var Image = new ImageManager();

Presenter.AddSource(Image);