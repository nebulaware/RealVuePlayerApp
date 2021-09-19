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
		
		App.Log('PLAYLIST',data);
		
		this.TimeLimit  = data.timelimit;
		this.List		= data.list;
		
		if(this.List.length == 0){
			
			this.Error('No Content','You have no content in your playlist');
			return false;
		}
		
		this.PlaylistCount = this.List.length;
		this.Prefetch();
		
		//this.NextItem();
		
	}
	
	this.Prefetch = function Prefetch(){
		
		
		this.Error('Downloading Content','Downloading playlist, please wait... 0 / ' + this.PlaylistCount) ;
		
					
		//PreloadContent()
			
//		Promise.all(Playlist.List.map(u =>  {
//			fetch(u.source)
//			})).then(responses =>
//			Promise.all(responses.map(res => res.text()))
//		).then(texts => {
//			console.log(texts);
//		});	
		
		console.log('Starting Promise');
		
		Promise.all(Playlist.List.map(url =>
			
			fetch(url.source)
			.then(resp => resp.blob())
			.then(blob => URL.createObjectURL(blob))
			.then(source => {
				url.blob = source;
				console.log('Downloaded ',url);
				Playlist.UpdateLoadCount();
			
			}).catch(e =>{
			
				Display.Log('ds-pl-preload', e.message);
			
			})
		
		)).then(text => {
			console.log('Finished Promise. Starting Videos');
			Playlist.NextItem();
		
		}).catch( e => {
			
			console.log('There was an issue with promises.');
			toast.error('Issue loading some resources');
			
			Playlist.NextItem();
			
		});
		
	
//				console.log('Response:',resp);
//				let blob = resp.blob();
//				url.source = URL.createObjectURL(blob);		
					
					
	}
	
	this.StartList = function StartList(){
		
		
		
		
	}
	
	this.UpdateLoadCount = function UpdateLoadCount(){
		
		Playlist.PreloadCount++;
		
		this.Error('Downloading Content','Downloading playlist, please wait...' + Playlist.PreloadCount + ' / ' + Playlist.PlaylistCount);
		
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

				Image.Init(Item.source);

			}else if(Item.type == 'video'){

				console.log('Item:', Item);

				Video.Init(Item.source,Item.blob);
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
	
}

var Playlist = new PlaylistManager();

Presenter.AddSource(Playlist);




//PRELOADER
function PreloadContent(){
	
	let Playlist = Playlist.List;
	let Count	 = Playlist.length;
	
	var i;
	
	for  ( i = 0; i < Count; i++){
		
		PreloadDownload(Playlist.List[i].source);
		
	
	
}
	
	
}

async function PreloadDownload(url){
	
	console.log('Downloading source ' + url);
	
	let result = await fetch(url);
	let blob = await result.blob();
	
	return URL.createObjectURL(blob);
}

