// JavaScript Document

// JavaScript Document

function WizardClass(){
	this.Param = {
		"app" : "wizard",
		"action" : "",
		"data" : ""
	}	
	
	this.ByPassNotify = 0;
	
	this.CurrentStep = 'landing';
	
	this.Init = function Init() {
	
		App.Log('Starting Wizrd');
		

			
		
	}
  

	this.Listener = function Listener(data,response){	
		

		console.warn(data,response);
		
		
		
	}


	this.Step = function Step(step){
		
		App.View = 'wizard';
		App.Log('Wizard Loading Step:'+ step)
		
		if(step == 'landing'){
			//GREETING
			this.Landing();
			
		}else if(step == 1){
			//INSTALLATION
			if(App.Installable == false){
				//CANNOT INSTALL
				Wizard.SkipInstall(); //AUTOMATCIALLY CALLS WIZARDS NEXT STEP
				
			}else if(App.Installable == true && App.RunMode == 'installed'){
				//INSTALLABLE AND INSTALLED -- GO TO STEP 2
				Display.UpdateDisplay({'field':'run','value':'installed'});
				
			}else{
			
				this.Step1();
				
			}
			
		}else if(step == 2){
			//PERMISSIONS - Notifications
			this.Step2();
		
		}else if(step == 3){
			//PERMISSIONS - Location
			this.Step3();		
		
		}else if(step == 4){
			//PAIRING
						
			
		}
		

		
	}

	this.Landing = function Landing (){

		
		
		App.View = 'wizard';
		Wizard.CurrentStep = 'landing';
		
		var Body =  '<div class="setup">';
			Body += '<div class="left">';
			Body += '<img src="images/wizard/start.png" alt="start">';
			Body += '</div>';
			Body += '<div class="right">';
			Body += '<h1>Welcome to the RealVue Player</h1>';
			
			
			if (App.NetCon)	{
				
				Body += '<h3 style="margin-bottom:80px;">This setup wizard is going to help you get your display setup.</h3>';
				Body += '<button class="btn" id="btn_register" onclick="Wizard.RegisterDisplay()">NEXT</button>';
			
			}else{

				Body += '<h3 style="margin-bottom:80px;">No network connection detected. Close player and connect to a network.</h3>';
				Body += '<button class="btn" id="btn_register" onclick="App.CloseApp()">CLOSE</button>';
			}

			Body += '</div>';
			Body += '</div>';
		
			Body += '<p style="position:absolute; bottom: 15px; right:15px;font-size:12px;"><strong>Version: </strong><span style="opacity:0.5">' + (App.Version / 10000) + '</span></p>';
		
		
		
		_("viewer").innerHTML = Body;	
	}
	
	this.Step1 = function Step1 (){
		
				
		App.View = 'wizard';
		Wizard.CurrentStep = 1;
			
			
		var Body =  '<div class="setup">';

			Body += '<div class="full">';
			Body += '<h1>Install Player</h1>';
		
			Body += '<h3 style="margin-bottom:80px;">You can install this player on your device for quicker access.</h3>';	
			Body += '<button class="btn" onclick="App.InstallApp()">INSTALL</button><br>';
			Body += '<button class="btn textonly" style="margin-top:12px;" onclick="Wizard.SkipInstall()">Keep running in browser</button>';
		
			Body += '</div>';
			Body += '</div>';
		
		
		_("viewer").innerHTML = Body;	
		
		if(App.PiPlayer){
			//SKIP IF PI PLAYER
			Wizard.SkipInstall();
			
		}
	
		
	}

	this.Step2 = function Step2 (){
		
		//PUSH NOTIFICATION PERMISSION
		
		App.View = 'wizard';
		Wizard.CurrentStep = 2;
		
		var PushSkip = false;
			
		
		
		var Body =  '<div class="setup" style="max-width:600px;">';

			Body += '<div class="full">';
			Body += '<h1>Setup Permissions</h1>';
			Body += '<h3 style="margin-bottom:30px;">In order to properly function, we need the following permissions.</h3>';
			Body += '<p>Click on the following permissions and when prompted, be sure to approve them. Not allowing these permissions can cause player issues.</p>';
			
			
			if(App.PushSupport){
				
				
				//HANDLE ALREADY AUTHORIZED
				if(App.PushStatus == 'granted' && App.Display.method == '' ){
					
					Body += '<p class="permission granted"><span class="title">Notifications </span><span id="notify_result" class="status"><i class="fas fa-check"></i></span></p>';
					
					//RUN FIREBASE
					this.RequestNotification();
					
					
				}else{
				

					if( App.PushStatus == 'granted'){

						Body += '<p class="permission granted"><span class="title">Notifications </span><span id="notify_result" class="status"><i class="fas fa-check"></i></span></p>';
						PushSkip = true;
						
						if(App.PiPlayer){
							//Auto Next
							Wizard.Step(3);
						}

					}else if( App.PushStatus == 'denied'){

						Body += '<p class="permission denied"><span class="title">Notifications </span><span id="notify_result" class="status"><i class="fas fa-times"></i></span></p>';
						

					}else if( App.PushStatus == 'default'){

						Body += '<p class="permission" onclick="Wizard.RequestNotification();"><span class="title">Notifications </span><span id="notify_result" class="status"><i class="fas fa-plus"></i></span></p>';

					}
					
				}
				
			}else{
				
				if(App.Display.method == ''){
				
					//NOTIFICATIONS NOT SUPPORTED 
					Display.UpdateDisplay({'field':'method','value':'long'});
					
				}else{
					PushSkip = true;
				}
				
				Body += '<p class="permission"><span class="title">Notifications (Not Supported)</span><span id="notify_result" class="status"><i class="fas fa-ban"></i></span></p>';
				
				
			}
			

		
			Body += '<button class="btn" onclick="Wizard.Step(3)" ' + ((PushSkip)? '' : 'disabled')+'>NEXT</button>';
			
			Body += '</div>';
			Body += '</div>';
		
		
		_("viewer").innerHTML = Body;				
	
		
	}	
	
	this.Step3 = function Step3(){
		
		//LOCATION PERMISSION
		
		App.View = 'wizard';
		Wizard.CurrentStep = 3;		
		
		var LocationSkip	= false;
		

		
		
		
		var Body =  '<div class="setup" style="max-width:600px;">';
			Body += '<div class="full">';
			Body += '<h1>Setup Permissions</h1>';
			Body += '<h3 style="margin-bottom:30px;">In order to properly function, we need the following permissions.</h3>';
			Body += '<p>Click on the following permissions and when prompted, be sure to approve them. Not allowing these permissions can cause player issues.</p>';		
		

		if(App.PiPlayer){
			//LOCATION NOT SUPPORTED - THE CALLBACK AFTER UPDATE SHOULD RUN PAIRING
			Display.UpdateDisplay({'field':'location','value':'unsupported'});
			
			
		}else{		
		
			if(Location.Support){
				
				if(Location.Status == 'granted' && App.Display.location == ''){
					
					Body += '<p class="permission granted"><span class="title">Location </span><span id="location_result" class="status"><i class="fas fa-check"></i></span></p>';
					
					this.RequestLocation();
					
					
				}else{
				
					if( Location.Status == 'granted'){
						
						Body += '<p class="permission granted"><span class="title">Location </span><span id="location_result" class="status"><i class="fas fa-check"></i></span></p>';
						LocationSkip = true;

					} else if( Location.Status == 'denied' || Location.Status == 'unavailable'){
						
						Body += '<p class="permission denied"><span class="title">Location </span><span id="location_result" class="status"><i class="fas fa-times"></i></span></p>';
						LocationSkip = true;
						
					}else if ( Location.Status == 'prompt'){
						
						Body += '<p class="permission" onclick="Wizard.RequestLocation();"><span class="title">Location </span><span id="location_result" class="status"><i class="fas fa-plus"></i></span></p>';
					}
					
				}
			
				
				
				
			}else{
				
				if(App.Display.location == ''){
					
					Display.UpdateDisplay({'field':'location','value':'unsupported'});
					
				}else{
					LocationSkip = true;
				}
				
				Body += '<p class="permission"><span class="title">Location (Not Supported)</span><span id="location_result" class="status"><i class="fas fa-ban"></i></span></p>';
				
				LocationSkip = true;
				
			}		
		
		}
		
			Body += '<button class="btn" onclick="Wizard.Pairing()" ' + ((LocationSkip)? '' : 'disabled')+'>NEXT</button>';
			
			Body += '</div>';
			Body += '</div>';		
		
		_("viewer").innerHTML = Body;	
		
	}
	
	this.Step4 = function Step4 (){
		
		//THIS STEP IS DEPRECATED AND MOVED TO PAIRING
		console.warn('This function has moved to pairing');
		
	}	
	
	
	this.RegisterDisplay = function RegisterDisplay(){
		
		//_("btn_register").disabled = true;
		App.Log('Wizard: Attempting to register display');		
		Display.Register(); //REGISTER DISPLAY - NO CALLBACK
	
	}
	
	
	this.SkipInstall = function SkipInstall(){
		
		//CANNOT OR DO NOT WANT TO INSTALL
		Display.UpdateDisplay({'field':'run','value':App.RunMode});
		
	}
	
	this.RequestNotification = function RequestNotification(){
		
		Notify.Init();
		this.ByPassNotify++;
		
		if(this.ByPassNotify == 5){
			
			Display.UpdateDisplay({'field':'method','value':'long'});	
			this.ByPassNotify = 0;
		}
		
	}
	
	this.RequestLocation = function RequestLocation(){
		
		
		Location.GetLocation();
		
	}

	
	this.Pairing = function Pairing (){
		
		_("maindisplay").classList.add('wizard');
		
		//MAKE SURE SIDEBAR IS CLOSED DURING PAIRING
		Display.DisplaySidebar('close');
		
		
		App.View = 'wizard';
		Wizard.CurrentStep = 'pairing';
		
		var Body =  '<div class="setup" style="max-width:600px;">';

			Body += '<div class="full">';
			Body += '<h1>Connect to Channel</h1>';
			Body += '<h3 style="margin-bottom:20px;">Go to your channel\'s dashboard and add the display to your channel by clicking Add Display and entering the pair code below.</h3>';	
				
			Body += '<h2 style="font-size:60px;font-weight:100;letter-spacing:12px;margin:10px;">' + App.Display.otc + '</h2>';
			Body += '<h3>PAIR CODE</h3>';
			
			if(App.Display.method == 'push'){
				
				Body += '<p class="blink">Waiting for display pairing</p>'
			
			}else if( App.Display.method == 'long'){
				
				Body += '<p>Only click continue once you\'ve paired the display with your channel. Your dashboard will instruct you when to do this.</p>';
				Body += '<button class="btn" onclick="App.Reload()">CONTINUE</button>';
				
			}

		
			
			if(App.Display.channel != 0){
				//ASSUMING WE ARE CONNECTED TO A CHANNEL
				Body += '<button class="btn textonly" style="margin-top:12px;" onclick="Display.ChangeChannel(\'cancel\')">Cancel Pairing</button>';
			}
		
		
			
			Body += '</div>';
			Body += '</div>';		
		
		_("viewer").innerHTML = Body;
		
		
		
	}
	
	
	this.ChannelSwitcher = function ChannelSwitcher (){
		
		_("maindisplay").classList.add('wizard');
		
		
		App.View = 'wizard';
		Wizard.CurrentStep = 'channelpicker';
		
		var Body =  '<div class="setup" style="max-width:600px;">';

			Body += '<div class="full">';
			Body += '<h1>Change Channel</h1>';
			Body += '<h3 style="margin-bottom:20px;">Connect to another Channel</h3>';	
				
			Body += '<h2 style="font-size:60px;font-weight:100;letter-spacing:12px;margin:10px;">' + App.Display.otc + '</h2>';
			Body += '<h3>PAIR CODE</h3>';
			
			if(App.Display.method == 'push'){
				
				Body += '<p class="blink">Waiting for display pairing</p>'
			
			}else if( App.Display.method == 'long'){
				
				Body += '<p>Only click continue once you\'ve paired the display with your channel. Your dashboard will instruct you when to do this.</p>';
				Body += '<button class="btn" onclick="App.Reload">CONTINUE</button>';
				
			}
			
			Body += '</div>';
			Body += '</div>';
		
		
		
		
		
		_("viewer").innerHTML = Body;
		
		
		
	}	
	
}

var Wizard = new WizardClass();

App.AddComponent(Wizard);