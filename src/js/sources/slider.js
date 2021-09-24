// JavaScript Document
function SliderManager (){
		this.Param = {
		"app" : "slider",
		"action" : "",
		"data" : ""
	}	
	
	
	this.Data;
	
	this.Init = function Init(data){
	
		this.Data = data;
		
		this.Run();
		
	}

	this.Preload = function Preload(data){
		Display.Preload('next'); //Nothing to Preload	
	}
		
	this.Run = function Run (){
		
		var Vanity 	= Display.ChannelData.vanity;
		var Auth 	= App.Display.code + ':' + App.Display.token;
		var Data	= this.Data;
		
		if(Vanity == ''){
			return false;
			toast.error ('Missing Channel Location');
		}
		
		App.Log(this.Data);
		
		_("viewer").innerHTML = '<iframe src="https://realvue.app/' + Vanity + '/?player=slider&auth=' + Auth + '&data='+ Data + '" width="100%" height="100%" style="border:0px;overflow:hidden;"></iframe>';	
			
		
	}
	
}

var Slider = new SliderManager();

Presenter.AddSource(Slider);