// const { app } = require("electron");
// const { fstat } = require("original-fs");

function DownloadManager (){
    this.Param = {
    "app" : "download",
    "action" : "",
    "data" : ""
    }	

    this.Source;
    this.URL                = '';
    this.UsedFiles          = []; //
    this.IsDownloading      = false;
    this.DownloadFailed 	= 0;
    this.DownloadProgress   = {'current':0,'last':0,'friendly':''}; //Download Percent (to track progression)
    this.TimeCheck; //USED FOR MONITORING TIMEOUT 

    this.Download = function Download (source, url){
        
        //RESET
        this.IsDownloading              = false;
        this.DownloadFailed             = 0;
        this.DownloadProgress.current   = 0;
        this.DownloadProgress.last      = 0;
        this.DownloadProgress.friendly  = '';


        //Takes source requesting download and the url of the source
        this.Source = source;
        this.URL    = url;

        let File = FM.CheckForFile(url);

        this.ActiveFile(url); //Log this file is actively used

        if(File){
            //File Exists
            Presenter.Sources[Downloader.Source].Completed(File);
        }else{
            //File DOES NOT Exist
            App.Log('Downloading File:' + url);
            ipcRenderer.send('download-single', url)
        }
        
    }
    this.Completed = function Completed (data){

        console.log(data);

        clearTimeout(Downloader.TimeCheck);
        Downloader.IsDownloading = false;

        //Notify the source the file is downloaded
        Presenter.Sources[Downloader.Source].Completed(data);  
 
    }

    this.Progress = function Progress (data){

        //Update progress with downloader
        Downloader.IsDownloading                = true;
        Downloader.DownloadProgress.current     = data.downloadBytes; //SET CURRENT PROGRESS
        Downloader.DownloadProgress.friendly    = data.download;

        //Send progress status to source
        Presenter.Sources[Downloader.Source].Progress(data);

    }

    //GARBAGE MANAGEMENT - Keep Files Clean
    this.ActiveFile = function ActiveFile (url){

        //Part of Garbage Management
        Downloader.UsedFiles.indexOf(url) === -1 ? Downloader.UsedFiles.push(url) : '';

    }

    this.CleanUpFiles = function CleanUpFiles (){

        //Part of Garbage Management
        //Compare Active File list to Stored Files to which ones can be deleted
        let ActiveFiles = this.UsedFiles;

        let StoredFilesCount = FM.Files.remote.length;

        let FilesToDelete = [];

        App.Log('Starting File Cleanup');

        //Cycle through stored files to see if it appears in active
        for(i = 0; i < StoredFilesCount; i++){

           //See if stored file is active, if not add to files to be deleted
           ActiveFiles.indexOf(FM.Files.remote[i]) === -1 ? FilesToDelete.push(FM.Files.remote[i]) : ''; 
        }

        if(FilesToDelete.length > 0){
            //Here are the files that need to be deleted
            for (d = 0; d < FilesToDelete.length; d++){
                FM.Delete(FilesToDelete[d]);
            }
        }
        
        App.Log(FilesToDelete.length + ' Files Deleted');

    }


    this.MonitorDownload = function MonitorDownload (){

		//If app is downloading, check progress to make sure it didn't stop

		//MAKE SURE THERE ARE NO OTHER TIMEOUTS RUNNING ON PLAYER MONITOR
		clearTimeout(Downloader.TimeCheck);
		
		console.log('Monitoring Downloader Download: Current:' + Downloader.DownloadProgress.current + ' | Last:' + Downloader.DownloadProgress.last);

		let TimeLimit = 10000;
		
		 if(Downloader.IsDownloading){
			 
			 
			 if(Downloader.DownloadProgress.current == Downloader.DownloadProgress.last){
				 //NO DETECTED PROGRESS
				  					 				 
                 Downloader.DownloadFailed ++;

				 //LOG ERROR
				 
				 
			 }else{
				
				 //PLAYER APPEARS TO BE PROGRESSING - UPDATE THE LAST TIMESTAMP
				 Downloader.DownloadProgress.last = Downloader.DownloadProgress.current;
				 Downloader.DownloadFailed = 0; //ALWAYS RESET ON SUCCESS
			 }
			 
			 
			 if(Downloader.DownloadFailed > 3){
				 
				 //SLOW MONITOR
				 TimeLimit = 20000
				 //FAILED TO MANY TIMES - RELOADING
				 
				 if(App.NetCon){
					 
                    var message = Downloader.URL + ' @ ' + Downloader.DownloadProgress.friendly;

					 Display.Log('ds-dm-dlfailed',message); //LOG FAILED EVENT
					 
					 //MAKE SURE THERE IS A NETWORK CONNECTION
					 App.Reload();
					 
				 }else{
					 
					 toast.warning('No Network Connection. Retrying in 20 seconds');
					 
				 }

				 
			 }
			 
 
			 
			 Downloader.TimeCheck = setTimeout(Downloader.MonitorDownload, TimeLimit); //CHECK EVERY 10 SECONDS
			 
			 
		 }	


	}

}

let Downloader = new DownloadManager();