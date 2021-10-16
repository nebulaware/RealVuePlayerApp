// JavaScript Document
function StreamManager (){
		this.Param = {
		"app" : "stream",
		"action" : "",
		"data" : ""
	}	
	
	
	this.Init = function Init(){
		
		
		
		
		
	}
	
	this.Preload = function Preload(data){
		Display.Preload('next'); //Nothing to Preload	
	}	

	this.Listener = function Listener(data,response){	
		
		
		
		
		
		
	}
	
	
	this.CheckStatus = function CheckStatus(){
		//Called by the display to check the status of source (if active)


		
	}		
	
}

var Stream = new StreamManager();

Presenter.AddSource(Stream);