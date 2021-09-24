const { app } = require("electron");

function DownloadManager (){
    this.Param = {
    "app" : "download",
    "action" : "",
    "data" : ""
    }	

    this.Source;

    this.UsedFiles = []; //

    this.Download = function Download (source, url){
        
        //Takes source requesting download and the url of the source
        this.Source = source;
        let File = FM.CheckForFile(url);

        this.ActiveFile(url); //Log this file is actively used

        if(File){
            //File Exists
            Presenter.Sources[Downloader.Source].Completed(File);
        }else{
            //File DOES NOT Exist
            ipcRenderer.send('download-single', url)
        }
        
    }
    this.Completed = function Completed (data){

        console.log(data);

        // ** STORE FILE IN FILE LIST ** //
        FM.AddToList(data.url,data.filePath);

        //Notify the source the file is downloaded
        Presenter.Sources[Downloader.Source].Completed(data);
    }

    this.Progress = function Progress (data){

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

}

let Downloader = new DownloadManager();