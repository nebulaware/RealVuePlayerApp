function WebsiteManager (){
		this.Param = {
		"app" : "website",
		"action" : "",
		"data" : ""
	}	
	
	this.Data;
	this.URL;
	
	this.Init = function Init(data){
		
		
		this.Data = data;
		this.RunFrame();
		
		
	}
	
	this.Listener = function Listener(data,response){	
		
		
		
	}
	
	this.Preload = function Preload(data){
		Display.Preload('next'); //Nothing to Preload	
	}

	this.RunFrame = function RunFrame(){
		
		if(!this.validateURL(this.Data)){
			
			this.Error('Invalid URL','The URL stored is invalid')
		}
		
		
		_("viewer").innerHTML = '<iframe src="' + this.URL.href + '" width="100%" height="100%" style="border:0px;overflow:hidden;"></iframe>';
		
		
	}
	
	this.Error = function Error(title,error){
		
		//SHOW ERROR	
		var Body =  '<div class="standby">';
		Body += '<img src="images/logo.svg">';
		Body += '<h1>' + title + '</h1>';
		Body += '<h3>' + error + '</h3>';	
		Body += '<p></p>';	
		Body += '</div>';	
	
	
		
		
		_("viewer").innerHTML = Body;	
		

		
	}
	
	this.validateURL = function validateURL(str) {
	  
		var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		
		
		//SECOND VALIDATION;
		if(!!pattern.test(str)){
			
			try{
			
				Website.URL = new URL(str);				
				return true;
				
				}
			
			catch (err){
				toast.error('Invalid URL');
				return false;			
			}
			
			
		}else{

			toast.error('Invalid URL');
			return false;

		}
		
		
	}
	
	this.CheckStatus = function CheckStatus(){
		//Called by the display to check the status of source (if active)


		
	}	
		
}

var Website = new WebsiteManager();

Presenter.AddSource(Website);