function PlaylistManager (){
		this.Param = {
		"app" : "playlist",
		"action" : "",
		"data" : ""
	}	
	
	this.Data;
	this.URL;
	
	this.SourceTimer 	= 0;
	this.TimeLimit		= 0;
	
	this.List			= [];
	this.CurrentItem	= 0;
	this.PlaylistCount	= 0;
	this.PreloadCount	= 0;
	this.Running		= false;
	
	this.Init = function Init(data){
		
		
		this.Data = data;
		
		App.Log('STARTING PLAYLIST');
		
		this.TimeLimit  = data.timelimit;
		this.List		= data.list;
		
		if(this.List.length == 0){
			
			this.Error('No Content','You have no content in your playlist');
			return false;
		}
		
		this.PlaylistCount = this.List.length;
				
		this.PreloadCount = 0; //RESET
		

		this.Error('Downloading Content','Downloading playlist, please wait... 0 / ' + this.PlaylistCount) ;
		
		this.BuildList();
		
	
		
	}
	
	this.Preload = function Preload(data){

		this.Data = data;
		
		App.Log('Preloading Playlist',data);
		
		this.TimeLimit  = data.timelimit;
		this.List		= data.list;
		
		if(this.List.length == 0){
			
			Display.Preload('next'); //Nothing in list to load
			return false;
		}
		
		this.PlaylistCount = this.List.length;
			
		this.PreloadCount = 0; //RESET

		this.Prefetch(); //Start prefetching playlist items

	}


	this.Prefetch = function Prefetch(){
		
		
		let File = this.List[this.PreloadCount].source;			

		Downloader.Download('playlist',File);
				
					
	}
	
	this.BuildList = function BuildList(){

		

		for (i=0; i < this.PlaylistCount; i++){

			//Modify the playlist with local path
			let remote = this.List[i].source;
			this.List[i].source = FM.GetLocal(remote);
			console.log(this.List[i].source);
		}
			
		
		
		Playlist.NextItem(); //Start Playlist


	}


	this.StartList = function StartList(){
		
		
		
		
	}
	
	
	this.NextItem = function NextItem(){
		
		var Count 	= Playlist.CurrentItem + 1;
		
		var Timeout = Playlist.TimeLimit * 1000; //DEFAULT TIME LIMIT CONVERTED TO MS
		
		var Item 	= Playlist.List[Playlist.CurrentItem];
		


		//console.log(Item);
		
		//ONLY KEEP RUNNING IF WE ARE STILL IN A PLAYLIST
		if(Presenter.PresentationData.data.source == 'playlist'){
		
			Playlist.Running = true;
			
			if(Item.type == 'image'){

				Image.Play(Item.source,Playlist.MonitorPlayer);

			}else if(Item.type == 'video'){

				
				Video.Play(Item.source);
				Timeout = Item.time * 1000;

			}


			//INCREMENT LIST
			if( Count == Playlist.List.length ){

				Playlist.CurrentItem = 0;

			}else{

				Playlist.CurrentItem++;

			}



			setTimeout(Playlist.NextItem, Timeout );
			
			
		}else{
			//TIMED OUT
			Playlist.Running = false;
		}
		
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


	this.Completed = function Completed (data){

		let Count = this.PreloadCount + 1;		

		FM.AddToList(data.url,data.filePath); //Add downloaded file to list

		if(Count == this.PlaylistCount){

			Display.Preload('next');

		}else{

			this.PreloadCount++; //Increase Count and load next list item
			this.Prefetch();

		}


	}

	this.Progress = function Progress (data){

		var Message = 'Downloaded: ' + data.downloaded + ' @ ' + data.speed;
		
		//Do not add to preload count because last video will be finished

		var Body =  '<div class="standby">';
		Body += '<img src="images/logo.svg">';
		Body += '<h1>Downloading</h1>';
		Body += '<h3>Please wait while we download your content</h3>';	
		Body += '<p>' + Playlist.PreloadCount + ' / ' + Playlist.PlaylistCount + '</p>';
		Body += '<p>' + Message + '</p>';	
		Body += '</div>';	
		
		
		_("viewer").innerHTML = Body;			

	}	
	this.MonitorPlayer = function MonitorPlayer(){

		
	}

	this.CheckStatus = function CheckStatus(){
		//Called by the display to check the status of source (if active)


		
	}	

}

var Playlist = new PlaylistManager();

Presenter.AddSource(Playlist);



