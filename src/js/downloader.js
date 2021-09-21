function DownloadManager (){
    this.Param = {
    "app" : "download",
    "action" : "",
    "data" : ""
    }	

    this.Source;

    this.Download = function Download (source, url){
        
        //Takes source requesting download and the url of the source
        this.Source = source;

        ipcRenderer.send('download-single', url)
    }
    this.Completed = function Completed (data){

        // ** STORE FILE IN FILE LIST ** //

        // TO DO

        //Notify the source the file is downloaded
        Presenter.Sources[Downloader.Source].Completed(data);
    }

    this.Progress = function Progress (data){

        //Send progress status to source
        Presenter.Sources[Downloader.Source].Progress(data);


    }


}

const Downloader = new DownloadManager();