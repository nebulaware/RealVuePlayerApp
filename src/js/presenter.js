// JavaScript Document

function PresenterManager (){
	
	this.CurrentPID			= 'unset';
	this.Mode				= 'auto';
	
	this.CurrentSource		= '';
	
	this.Sources			= {}; //STORE ALL THE PLUGIN SOURCES
	
	this.PresentationData;
	//this.CurrentSource		= '';
	//this.CurrentData		= {};
	
	this.Run = function Run (pid){
		
		App.Log('Presentation: ' + pid);
		
		if(this.Mode == 'auto' && this.CurrentPID != pid || this.Mode == 'manual'){
			//AUTO MODE - IF NO PRESENTATION KEEP RUNNING OR ELSE CHANGE
			
				//NO PRESENTATION
				if(pid == ''){
				
					this.CurrentPID = '';
					this.Screensaver();	
					
				}else{
	
					this.CurrentPID = pid;
					
					if(Display.Presentations[pid] == undefined){
						//PRESENTATION MISSING
						//LEAVE CURRENT PID SET TO AVOID CONSTANT LOADING ATTEMPTS
						this.Screensaver();
						
					}else{
						//RUN PRESENTATION
						this.PresentationData = Display.Presentations[pid];

						this.Launch();							
						
						
					}
									
				}

		}
		
	}
	
	this.Launch	= function Launch(){
		
		var Source	= this.PresentationData.data.source;
		var Data 	= this.PresentationData.data.data;
		
		//Set Current Source
		this.CurrentSource = Source;

		//** TO DO - See if source exists if not actually load it to the dom.
		
				
		this.Sources[Source].Init(Data);
		
		_("viewer").classList.add('presenting');
		
		Cursor.Init();
		
	}

	this.Preload = function Preload(pid){
		
		//Preload Presentation
		App.Log('Preloading Presentation:' + pid);
		
		this.PresentationData = Display.Presentations[pid];

		var Source	= this.PresentationData.data.source;
		var Data 	= this.PresentationData.data.data;

		this.Sources[Source].Preload(Data);

	}
	
	this.AddSource = function AddSource (source){
		
		this.Sources[source.Param.app] = source;	
		
	}
	
	
	
	this.Screensaver = function Screensaver(){
	
		this.PresentationData = {"pid":0, "name": "Screen Saver", "data":{"source":"screensaver"}}
		
	//SHOW ERROR	
	var Body =  '<div class="screensaver">';
		Body += '<img src="images/logo.svg">';

		Body += '</div>';	

		
		_("viewer").innerHTML = Body;		
		
		
	}
	
	
}

var Presenter = new PresenterManager();