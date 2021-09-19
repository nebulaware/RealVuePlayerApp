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
	
	
	this.Run = function Run(data){
		
		
		var Body = '<img src="' + data +'" style="width:100%;height:100%;">';
		
		_("viewer").innerHTML = Body;
		
	}
	
}

var Image = new ImageManager();

Presenter.AddSource(Image);