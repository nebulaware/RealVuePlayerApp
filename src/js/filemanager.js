function FileManager (){
    this.Param = {
    "app" : "file",
    "action" : "",
    "data" : ""
    }	

    this.Files = {remote:[],local:[]};
    this.Stored = [];

    this.Init = function Init(){


        App.Log('Loading Media Files');
		
        //Load Files
		var Files = Storage.get('files');
		
		if(Files){
		   
			//Files Found - Loading
			this.Files = JSON.parse(Files);
            
            //CHECK STRING
            if(this.Files.remote === undefined){
                console.log('Improper file string');
            }
			return true;
			
		 }else{
			 //No Files 			 
			return false; 
			 
		 }	     



    }


    this.CheckForFile = function CheckForFile(remote){

        let FileIndex = FM.Files.remote.indexOf(remote);

        //SEE IF FILE HAS ALREADY BEEN LOADED
        if (FileIndex === -1 ){
            //Not found
            return false;

        }else{

            //Make sure file is still on local
            if(fs.existsSync(FM.Files.local[FileIndex])) {

                return {url:FM.Files.remote[FileIndex], filePath: FM.Files.local[FileIndex]}

            }else{
                
                return false;
            }

        }



    }
    this.AddToList = function AddToList(remote,local){

        App.Log('Adding to list: ' + remote);

        let FileIndex = FM.Files.remote.indexOf(remote);

        //SEE IF FILE HAS ALREADY BEEN LOADED
        if (FileIndex === -1 ){
            //Not found
            FM.Files.remote.push(remote)
            FM.Files.local.push(local);

            this.SaveList();

        }

        //If file is in system, we dont need to add it to the list
        return true;

    }

    this.SaveList = function SaveList(){

        //Save Files
        Storage.set('files',JSON.stringify(FM.Files));


    }

    this.Delete = function Delete (remote){

        let FileIndex = FM.Files.remote.indexOf(remote);

        //See if file in list
        if (FileIndex === -1 ){
            //Not found
            return;
        }


        let filepath = FM.Files.local[FileIndex];

        //See if file is still available locally
       if(fs.existsSync(filepath)) {
            
                // File exists deletings
                fs.unlink(filepath,function(err){
                    if(err){
                        toast.error("An error ocurred updating the file"+ err.message);
                        console.log(err);
                        return;
                    }
                });

        } else {
        
            toast.error("This file doesn't exist, cannot delete");
        }    
          
        FM.Files.remote.splice(FileIndex,1);
        FM.Files.local.splice(FileIndex,1);

        this.SaveList();

    }

    this.Purge = function Purge (){

        //Go through all files and delete them.
        //Uses are content clearing or on device dump
        for (i = 0; i < FM.Files.local.length; i++){

            var filepath = FM.Files.local[i];

            if(fs.existsSync(filepath)) {
                
                // File exists deletings
                fs.unlink(filepath,function(err){
                    if(err){
                        toast.error("An error ocurred updating the file"+ err.message);
                        console.log(err);
                        return;
                    }
                });

            } else {
            
                toast.error("This file doesn't exist, cannot delete");
            }   

        }

        FM.Files.remote = [];
        FM.Files.local  = [];

        this.SaveList();


    }

    this.GetLocal = function GetLocal (url){

        let localindex = FM.Files.remote.indexOf(url)
         
        if(localindex === -1 ){

            //File Missing from index
            toast.error('Cannot locate file');
            return false;

         } else{
             
            return FM.Files.local[localindex];

         }


    }


}

let FM = new FileManager();