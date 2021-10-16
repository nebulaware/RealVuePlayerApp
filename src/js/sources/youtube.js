const { TouchBarSegmentedControl } = require("electron");
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
	
	this.metadata	= {'id':'','url':'','local':''};

	this.State;
	this.Downloading		= false;
	this.DownloadPercent	= {'current':0,'last':0}; //Download Percent (to track progression)
	this.DownloadFailed 	= 0;
	this.HasStarted			= false; //Has the download attempted to start
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

		Video.Play (local,Youtube.MonitorVideo)
		
	}
	
	this.Preload = function Preload(data){

		//RESET
		this.DownloadPercent	= {'current':0,'last':0};	
		

		const url = 'https://www.youtube.com/watch?v=' + data;
		const output = DownloadPath + '/' + data +'.mp4';

		this.metadata.id 	= data;
		this.metadata.url	= url;
		this.metadata.local	= output;


		//this.CheckFormats(data); //SEE IF HD VERSION IS FOUND
		// return;

        let File = FM.CheckForFile(url);


        Downloader.ActiveFile(url); //Log this file is actively used

        if(File){
            //File Exists
            Display.Preload('next');
			return;

        }

		App.Log('Starting to Download Youtube Video: ' + url);


		//Monitor Start of download
		setTimeout(Youtube.MonitorStart, 10000);


		let video = ytdl(url, { quality: 'highestvideo'});
		//let video = ytdl(url, { quality: '137'});

		console.log('Video:', video);

		let starttime;
		video.pipe(fs.createWriteStream(output));
		video.once('response', () => {
		  starttime = Date.now();

		  //Monitor Download Progress
		  Youtube.Downloading = true;
		  Youtube.MonitorDownload();

		  var Body =  '<div class="standby">';
		  Body += '<img src="images/logo.svg">';
		  Body += '<h1>Downloading</h1>';
		  Body += '<h3>Please wait while we download your video</h3>';	
		  Body += '<p><span id="yt-percent"></span><br><span id="yt-downloaded"><br></span><span id="yt-running"></span><span id="yt-eta"></span></p>';	
		  Body += '</div>';	
		  
		  
		  _("viewer").innerHTML = Body;	
	  
	  
		  
		
		});

		video.on('progress', (chunkLength, downloaded, total) => {
		  
		  
		  const percent = downloaded / total;
		  const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
		  const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
		  
		  Youtube.DownloadPercent.current = (percent * 1);	
		 
		  //readline.cursorTo(process.stdout, 0);
		  _('yt-percent').innerHTML = `${(percent * 100).toFixed(2)}% downloaded `;
		  _('yt-downloaded').innerHTML = `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`;
		  _('yt-running').innerHTML = `<br> running for: ${downloadedMinutes.toFixed(2)} minutes`;
		  _('yt-eta').innerHTML = `, estimated: ${estimatedDownloadTime.toFixed(2)} minutes `;
		  //readline.moveCursor(process.stdout, 0, -1);
		});
		
		video.on('end', () => {
		  
			Youtube.Downloading = false;

			FM.AddToList(url,output);
			Display.Preload('next');	
			//process.stdout.write('\n\n');
		});
	}


	this.RunAPI = function RunAPI (data){
		
		//console.log('Running Youtube API');
		
		
		// _("viewer").innerHTML = '<div id="player"></div>';
		
		// if(!this.APIReady){
			
			
		// //LOAD YOUTUBE IFRAME API	
		// var tag = document.createElement('script');
		//   tag.src = "https://www.youtube.com/iframe_api";
		//   var firstScriptTag = document.getElementsByTagName('script')[0];
		//   firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);	
			
			
		// 	//ONCE API READY - CALLBACK IS PERFORMED AND WILL CALL BUILD PLAYER AND MARK API READY
			
		// }else{
			
		// 	this.BuildPlayer();
			
		// }
	
  		
		
	}
	
	this.GetInfo = function GetInfo (id){

			ytdl.getInfo(id).then(info => {
			console.log('title:', info.videoDetails.title);
			console.log('rating:', info.player_response.videoDetails.averageRating);
			console.log('uploaded by:', info.videoDetails.author.name);
			console.log('Info:',info);
			
			toast.info('Got Video Info for ' + info.videoDetails.title);
			// const json = JSON.stringify(info, null, 2)
			//   // eslint-disable-next-line max-len
			//   .replace(/(ip(?:=|%3D|\/))((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|[0-9a-f]{1,4}(?:(?::|%3A)[0-9a-f]{1,4}){7})/ig, '$10.0.0.0');
			// fs.writeFile(filepath, json, err2 => {
			//   if (err2) throw err2;
			// });

			Youtube.Formats(info);

		  });

	

	}

	this.Formats = function Formats(data){

		
	let Highest = ytdl.chooseFormat(data.formats, {quality: 'highestvideo'})
		console.log('Formats with highest video' + Highest.length,Highest);

	}

	this.CheckFormats = async function CheckFormats(videoID){


		let info = await ytdl.getInfo(videoID);
		let format = ytdl.chooseFormat(info.formats, { quality: '137' });
		console.log('Format found!', format);



	}

	this.MonitorDownload = function MonitorDownload (){

		//If Youtube is downloading a video, check progress to make sure it didn't stop

		//MAKE SURE THERE ARE NO OTHER TIMEOUTS RUNNING ON PLAYER MONITOR
		clearTimeout(Youtube.TimeCheck);
		
		console.log('Monitoring Youtube Download: Current:' + Youtube.DownloadPercent.current + ' | Last:' + Youtube.DownloadPercent.last);

		let TimeLimit = 10000;
		
		 if(Youtube.Downloading){
			 
			 
			 if(Youtube.DownloadPercent.current == Youtube.DownloadPercent.last){
				 //NO DETECTED PROGRESS
				  					 				 
					 Youtube.DownloadFailed ++;

				 //LOG ERROR
				 
				 
			 }else{
				
				 //PLAYER APPEARS TO BE PROGRESSING - UPDATE THE LAST TIMESTAMP
				 Youtube.DownloadPercent.last = Youtube.DownloadPercent.current;
				 Youtube.DownloadFailed = 0; //ALWAYS RESET ON SUCCESS
			 }
			 
			 
			 if(Youtube.DownloadFailed > 3){
				 
				 //SLOW MONITOR
				 TimeLimit = 20000
				 //FAILED TO MANY TIMES - RELOADING
				 
				 if(App.NetCon){
					 
					 Display.Log('ds-yt-dlfailed',Youtube.DownloadPercent.last); //LOG FAILED EVENT
					 
					 //MAKE SURE THERE IS A NETWORK CONNECTION
					 App.Reload();
					 
				 }else{
					 
					 toast.warning('No Network Connection. Retrying in 20 seconds');
					 
				 }

				 
			 }
			 
 
			 
			 Youtube.TimeCheck = setTimeout(Youtube.MonitorDownload, TimeLimit); //CHECK EVERY 10 SECONDS
			 
			 
		 }	


	}

	this.MonitorStart = function MonitorStart (){
		//Makes sure the video starts to download. If it doesn't we need to run the backup

		if(Youtube.Downloading){
			//Youtube is downloading
		}else{
			//Need to launch backup
			toast.error('Your video did not appear to start downloading, running backup');

			//TODO: LOG ERROR
			//
			Youtube.BackupDownloader();
		}

	}

	this.BackupDownloader = async function BackupDownloader (){

		let info = await ytdl.getInfo(this.metadata.id);
		let format = ytdl.chooseFormat(info.formats, { quality: '137' });
		console.log('Format found!', format,format.url);

		if(format.url != undefined){

			Downloader.Download('youtube',format.url);

		}else{

			toast.error('No HD format for this video was found');

		}



	}


	//BACKUP FILE DOWNLOAD SYSTEM

	this.Completed = function Completed (data){

		//Rename since the downloaded file doesnt match
		fs.rename(data.filePath, Youtube.metadata.local);

		//Done downloading file - Next Step
		Youtube.Downloading = false;

		FM.AddToList(Youtube.metadata.url,Youtube.metadata.local);
		Display.Preload('next');	
	

	}

	this.Progress = function Progress (data){

		var Message = 'Downloaded: ' + data.downloaded + ' @ ' + data.speed;

		
		var Body =  '<div class="standby">';
		Body += '<img src="images/logo.svg">';
		Body += '<h1>Downloading</h1>';
		Body += '<h3>Please wait while we download your Youtube video</h3>';	
		Body += '<p>' + Message + '</p>';	
		Body += '</div>';	
		
		
		_("viewer").innerHTML = Body;			

	}

	this.CheckStatus = function CheckStatus(){
		//Called by the display to check the status of source (if active)



	}

	this.MonitorVideo = function MonitorVideo(){
		//No monitor currently
	
	}

}

var Youtube = new YoutubeManager();

Presenter.AddSource(Youtube);




//HAS TO BE GLOBAL SINCE YOUTUBE WONT LOAD INTO AN OBJECT
function onYouTubeIframeAPIReady() {
	Youtube.APIReady = true;
	Youtube.BuildPlayer();
}




	

