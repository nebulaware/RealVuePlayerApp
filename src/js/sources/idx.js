// JavaScript Document

function IDXClass(){
	this.Param = {
		"app" : "idx",
		"action" : "",
		"data" : ""
	}	
	
	this.Properties 	= [];
	this.Settings		= {};
	
	this.OfficeID 		= 0;
	this.Timer			= 10;
	
	//Slide
	this.Slides			= [];
	this.SlideCount 	= 0;
	this.CurrentSlide	= 0;
	this.SlideTimer		= 0;
	this.SlideRunning	= false;
	
	
	this.Fonts = {
		'default'	: {'name':'Default','family':'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif','url':'','loaded':true},
		'lora'		: {'name':'Lora','family':'"Lora", serif','url':'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap','loaded':false},
		'opensans'	: {'name':'Open Sans','family':'"Open Sans", sans-serif','url':'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap','loaded':false},
		'oswald'	: {'name':'Oswald','family':'"Oswald", sans-serif','url':'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap','loaded':false},
		'raleway'	: {'name':'Raleway','family':'"Raleway", sans-serif','url':'https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap','loaded':false},
		'roboto'	: {'name':'Roboto','family':'"Roboto", sans-serif','url':'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;1,500&display=swap','loaded':false},
		'slabo'		: {'name':'Slabo','family':'"Slabo 27px", serif','url':'https://fonts.googleapis.com/css2?family=Slabo+27px&display=swap','loaded':false},

	}	
	
	
	
	this.Init = function Init(Settings) {
	
		
	
		console.log('Starting IDX');
		
		this.AddFrame();
		this.ListingPreloader();
	

		
		this.GetListings('standard');
		
	}
	
	this.Preload = function Preload(data){
		Display.Preload('next'); //Nothing to Preload	
	} 

	this.Listener = function Listener(data,response){	
		
		if(data.action == 'getlistings'){
			
			if(response.status == 'success'){
				
				this.Properties = response.data.properties;
				this.Settings 	= response.data.settings;
				
				this.VersionCheck();
				
				this.OfficeID 	= this.Settings.filter.officeid;
				
				
	

				this.BuildSlides();
				this.BuildView();
				
				

				this.StartSlides();
				
				App.Preloader();
				
			
			}else{
				
				//IDX ERROR
				var Body =  '<div class="standby">';
					Body += '<img src="images/logo.svg">';
					Body += '<h1>IDX Error</h1>';
					Body += '<h3>' + response.data + '</h3>';	
					Body += '<p></p>';	
					Body += '</div>';	




					_("viewer").innerHTML = Body;			
				
				
				
			}
			
			
		}
		
	}
	
	
	
	this.GetListings = function GetListings(type){
		
		//SET 24 HOUR REFRESH
		setTimeout(IDX.RefreshListings, 86400000 );
		
		
		//Get listings from RETS	
		this.Param.action = 'getlistings'
		this.Param.data = {'type':type};
		
		App.Send(this.Param);			
		
	}
	
	this.Reset = function Reset(){
		
		clearInterval(IDX.SlideTimer);
		
		this.Slides			= [];
		this.SlideCount 	= 0;
		this.CurrentSlide	= 0;
		this.SlideTimer		= 0;		
		
		
	}
	
	this.RefreshListings = function RefreshListings (){
		
		App.Log('Rereshing Listings');
		
		IDX.Reset();
		IDX.GetListings();
		
	
	}
	
	this.AddFrame = function AddFrame(){
		
		//ADDS THE IDX FRAME
		_("viewer").innerHTML  = '<div id="idx_frame" class="frame"></div>';
		
	}
	
	this.ListingPreloader = function ListingPreloader (){
		
		var Body = '<div class="idx_status"><div class="loader"><div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>';	
		
		Body += '<div class="slow_pulse"><h3>Downloading Listings from MLS</h3>';
		Body += '<p>Depending on the number of listings, this could take several minutes</p>';
		Body += '</div></div>';
		
		_("idx_frame").innerHTML = Body;
		

		
	}
	
	//=======================================================
	//    		  S L I D E   M A N A G E R
	//=======================================================
	this.BuildSlides = function BuildSlides(){
		
		var Properties 	= this.Properties;
		var PCount		= Properties.length;
		var Inserts		= this.Settings.slides;
		var ICount		= Inserts.length;
		
		var InjectRate	= Math.round(PCount / ICount); 
		
		var p,i,property,insert,insertindex;
		
		for (p = 0; p < PCount; p++){
			
			property = {'type':'property','data':Properties[p]};
			
			this.Slides.splice(p,0,property);	
			
			
		}
		
		
		
		if(ICount > 0){
			
			insertindex = -1;
	
			for(i = 0; i < ICount; i++){
				
				insertindex = insertindex + InjectRate + 1; //ADDING 1 TO COUNT FOR INSERT
				
				insert = {'type':'image','data':Inserts[i]};
					
				this.Slides.splice(insertindex,0,insert);					
				
				
			}

			
			
		}
		
		
		
		//UPDATE COUNTS
		this.SlideCount = this.Slides.length;
		
		
		
	}
	
	
	this.StartSlides = function StartSlides(){
		
		
		this.SlideTimer = setInterval(IDX.QueueNextSlide, (IDX.Timer * 1000));	//Timer is in seconds - convert to ms
		this.LoadData();
 		
	}
	
	
	this.QueueNextSlide = function QueueNextSlide(){
		
		//** TRANSITION **//
		//FADES OUT 
		IDX.FadeData('out');
		setTimeout(IDX.NextSlide,500);
		
	}
	
	this.NextSlide	= function NextSlide(){
		
		//CANNOT USE "THIS" BECAUSE OF THE TIMER CALLBACK
		
		
		var slide	= IDX.CurrentSlide + 1;
		var count	= IDX.SlideCount;
		
		if(slide == count){
			//AT THE LAST SLIDE SO RESTART
			IDX.CurrentSlide = 0;
			
		}else{
			//GO TO NEXT
			IDX.CurrentSlide++; 
		}
		
		IDX.LoadData();
		
		IDX.FadeData('in');
		
	}
	
	this.LoadData = function LoadData (){
		
		var slide 	= this.Slides[this.CurrentSlide];
		var data 	= slide.data;
		
		if(slide.type == 'property'){
		
			_("image_slide").classList.remove('show');


			_("price").innerHTML		= this.FormatNumber(data.price);
			_("address").innerHTML		= data.address + ', '+ ((IDX.Settings.design.address.city == 'newline')? '<br>' : '') + data.city;
			_("listing_mls").innerHTML	= data.mls;
			_("agent").innerHTML		= ((this.OfficeID == '' || this.OfficeID == 0)? 'Listing courtesy of ' + data.agent.name : ''); //ONLY SHOW LISTING AGENT IF NOT PULLING OWN LISTINGS - COMPLIANCE

			if(IDX.Settings.design.description.limit > 0){
				_("description").innerHTML	= IDX.TruncateText(data.description,IDX.Settings.design.description.limit,'...');
			}

			_("listing_image").src		= data.images[0]; //FIRST IMAGE SHOULD BE MAIN

			_("listing_features").className = 'features ' + data.template; //ADD CLASS TO DETERMINE WHAT SHOWS 

			if(data.template == 'res'){

				_("bed").innerHTML			= ((data.bed)? data.bed : 0);
				_("bath").innerHTML			= ((data.bath)? data.bath : 0);
				_("sqft").innerHTML			= ((data.sqft)? this.FormatNumber(data.sqft): 0);
				_("built").innerHTML		= ((data.yearbuilt)? data.yearbuilt : 0);

			}else if(data.template == 'com'){

				_("bath").innerHTML			= ((data.bath)? data.bath : 0);
				_("sqft").innerHTML			= ((data.sqft)? this.FormatNumber(data.sqft): 0);			


			}else if(data.template == 'farm'){

				_("bed").innerHTML			= ((data.bed)? data.bed : 0);
				_("bath").innerHTML			= ((data.bath)? data.bath : 0);
				_("sqft").innerHTML			= ((data.sqft)? this.FormatNumber(data.sqft): 0);			
				_("acres").innerHTML		= ((data.acres)? data.acres : 0);			


			}else if(data.template == 'land'){

				_("acres").innerHTML		= ((data.acres)? data.acres : 0);	



			}


			setTimeout(IDX.PreloadNextImage,2000);
			
			
			
			
			
		}else if( slide.type == 'image'){
			
			
			_("image_slide").src = data.url;
			
			_("image_slide").classList.add('show');
			
			setTimeout(IDX.PreloadNextImage,2000);
			
		}
		
		
	}
	
	this.PreloadNextImage = function PreloadNextImage(){
		//PRELOAD THE NEXT IMAGE TO MAKE FOR SMOOTHER TRANSITIONS
		
		var slide	= IDX.CurrentSlide + 1;
		var count	= IDX.SlideCount;
		var preload;
		
		if(slide == count){
			//AT THE LAST SLIDE SO RESTART
			preload = 0;
			
		}else{
			//GO TO NEXT
			preload = slide; 
		}
		
		var slide	= IDX.Slides[preload];
		
		if(slide.type == 'property'){
		
			var data = slide.data;

			_("preload_listing_image").src	= data.images[0]; //FIRST IMAGE SHOULD BE MAIN
			
		}
		
		
	}
	
	
	this.FadeData	= function FadeData(dir){
	

		if(dir == 'out'){
			_('idx_frame').classList.add('fadeout');

		}else{
			_('idx_frame').classList.remove('fadeout');
		}
		
		
	}
	
	this.FormatNumber = function FormatNumber(x){
		
		if(x == null){
			return 0;
		}
		
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			
	}
	
	//TIMER TO ROTATE THROUGH LISTINGS
	//BUILD VIEW
	this.BuildView = function BuildView(){
		
		
		if(IDX.Settings.version > 2){
			//VERSION 3+ VIEW BUILDER
			
			var Body, BG_IMG, Unused;

			var padding		= IDX.Settings.design.layout.padding / 2;
			var left_width 	= IDX.Settings.design.layout.column;
			var right_width	= (100 - (padding * 2)) - left_width; //100 - padding * 2 to account for left column margin;

			//BACKGROUND IMAGE
			BG_IMG = ((IDX.Settings.design.layout.bgimg)? 'background: url(\'' + IDX.Settings.design.layout.bgimg +'\') no-repeat center;background-size:cover;' : '');


			//BUILD BODY

			Body  = '<div id="idx_frame" class="frame" style="padding:' + padding + '%;background-color:' + IDX.Settings.design.layout.bgcolor + ';' + BG_IMG +'">';
			Body += '<div id="" class="content">';		
			Body += '<div id="left_column" data-col="left" class="left_content" style="width:' + left_width + '%;margin-right:' + padding +'%">';

			//LEFT SIDE
			Body += IDX.GetElements('left');

			Body += '</div>';	
			Body += '<div id="right_column" data-col="right" class="right_content" style="width:' + right_width + '%;">';

			//RIGHT SIDE

			Body += IDX.GetElements('right');


			Body += '</div>';
			Body += '</div>';
			Body += '</div>';		

			Unused = IDX.GetElements('unused');
			
			_("idx_frame").innerHTML = '<img id="image_slide" src="">' + Body + '<div style="display:none;">' + Unused + '</div>';

			_("idx_frame").style.fontFamily = this.LoadFont(IDX.Settings.design.layout.font);			
		
			
			
			
		}else{
		
		//LEGACY BUILDER
		
		var Details,Features,Address,Image,Body,ImageWidth,DetailsWidth,Description;
		
		Details = ''

		Body = '';
		
		//SET BACKGROUND COLOR
		_("idx_frame").style.backgroundColor = IDX.Settings.design.bg.color;
		
		//SET BACKGROUND IMAGE 
		if(IDX.Settings.design.bg.img){
			
			_("idx_frame").style.backgroundImage 	= "url('" + IDX.Settings.design.bg.img + "')";
			_("idx_frame").style.backgroundPosition	= "center";
			_("idx_frame").style.backgroundRepeat	= "no-repeat";
			_("idx_frame").style.backgroundSize		= "cover";
			
		}
		
		
		
		//ADDRESS
		//ADDRESS
		Address = '<h2 id="listing_address" class="animate" style="color:'+ IDX.Settings.design.address.color +';font-size:'+ (IDX.Settings.design.address.size * .5)+'em;';
		//ADDRESS LOCATION AND ALIGNMENT - ONLY ALIGN WITH IMAGE IF UNDER IMAGE
		Address += ((IDX.Settings.design.address.pos == 'belowimg')? 'text-align:' + IDX.Settings.design.img.pos + ';' : '') + '">';
		Address += '<span id="address">1232 4th ST SW Demo City, ST</span></h2>';		
		
		
		
		//CONTAINER SIZES
		ImageWidth = IDX.Settings.design.img.size;
		DetailsWidth = 96 - ImageWidth; //100% - 4% margin
			
		Description = 'One of the most unique lakeshore homes on Clear Lake. Boasting 5 bedrooms, 4 bathrooms, expansive main floor deck (with outdoor gas hookup and retractable sun shade awning), (2)upper level decks. One off huge master bedroom and the other off the large family, exercise, media or whatever you can imagine room. All of these decks were just completed in 2016 and offer expansive clear pane views of the lake. Inside you\'ll find a breathtaking 3 level staircase that only adds to the elegant nature of this beautiful lakeshore home. Also inside you\'ll find 2 full kitchens (main and lower level) that offer exquisite dark cherry cabinetry. Family room on lower level and expansive office / den on the third level also boast beautiful cherry built-ins. From the main or lower level you can walk out to the largest yard offered on North Shore (over 50 ft deep and 60 ft wide) to the new (2019) 120 ft Shore Station aluminum dock. In addition to all these features, this unparalleled lake home offer';
		
		
	    Features = '<div id="listing_features" class="features" style="color:' + IDX.Settings.design.features.color +'">';
		Features +='<div class="feature res farm" id="listing_bed"><span id="bed" class="number animate" style="font-size:' + IDX.Settings.design.features.size +'px;">0</span><span class="title">BED</span></div>';
		Features +='<div class="feature res farm com" id="listing_bath"><span id="bath" class="number animate" style="font-size:' + IDX.Settings.design.features.size +'px;">0</span><span class="title">BATH</span></div>';
		Features +='<div class="feature res farm com" id="listing_sqft"><span id="sqft" class="number animate" style="font-size:' + IDX.Settings.design.features.size +'px;">2600</span><span class="title">SQFT</span></div>';
		Features +='<div class="feature res " id="listing_built"><span id="built" class="number animate" style="font-size:' + IDX.Settings.design.features.size +'px;">2020</span><span class="title">BUILT</span></div>';	
		Features +='<div class="feature land farm" id="listing_acres"><span id="acres" class="number animate" style="font-size:' + IDX.Settings.design.features.size +'px;">2</span><span class="title">ACRES</span></div>';	
		
		Features +='</div>';		
		
		
		Image = '<div class="image_container" style="border:' + IDX.Settings.design.img.border +'px solid ' + IDX.Settings.design.img.color + '">';
		Image +='<img id="listing_image" src="https://cdn.realvue.app/images/house.jpg" class="animate" />';		
		Image +='<img id="preload_listing_image" src="https://cdn.realvue.app/images/house.jpg" />';		
		Image += ((IDX.Settings.design.features.pos == 'overimg')? Features : '') + '</div>';
		Image += ((IDX.Settings.design.features.pos == 'belowimg')? Features : '');
		Image += ((IDX.Settings.design.address.pos == 'belowimg')? Address : '');
		
		
		
		
		Details +='<h1 id="listing_price" class="animate" style="color:'+ IDX.Settings.design.price.color +';font-size:'+ IDX.Settings.design.price.size  +'em;">$<span id="price">1,200,000</span></h1>';
		Details += ((IDX.Settings.design.address.pos == 'details')? Address : '');
		Details +='<h2 id="listing_id" class="animate" style="color:'+ IDX.Settings.design.listing.color +';font-size:'+ (IDX.Settings.design.listing.size * .5) +'em;">Listing # <span id="listing_mls">123456</span><span id="agent"></span></h2>';
		Details += ((IDX.Settings.design.features.pos == 'details')? Features : '');
		
		if(IDX.Settings.design.description.limit > 0){
			
			Details +='<p id="description" class="animate" style="color:'+ IDX.Settings.design.description.color +';font-size:'+ IDX.Settings.design.description.size +'px;"></p>';
		}
		
				
		
		
		//BUILD BODY
		
		
		Body += '<div id="" class="content">';		
		Body += '<div id="" class="left_content" style="width:' + ((IDX.Settings.design.img.pos == 'left')? ImageWidth : DetailsWidth) + '%;">';

		//LEFT SIDE
		Body += ((IDX.Settings.design.img.pos == 'left')? Image : Details);
		
		Body += '</div>';	
		Body += '<div id="" class="right_content" style="width:' + ((IDX.Settings.design.img.pos == 'right')? ImageWidth : DetailsWidth) + '%;">';
		
		//RIGHT SIDE
		Body += ((IDX.Settings.design.img.pos == 'right')? Image : Details );


		
		Body += '</div>';
		Body += '</div>';
				
		
		_("idx_frame").innerHTML = '<img id="image_slide" src="">' + Body;
		
		}
		
	}	
	
	

	
	
	this.LoadFont = function LoadFont(f){
		
		//console.log(f);
		
		var Font = this.Fonts[f];
		
		//MAKE SURE FONT IS LOADED AND RETURN FAMILY
		if(Font.loaded){
			return Font.family;
		}
		
		var File = document.createElement('link');
		
		File.setAttribute("rel", "stylesheet");
		File.setAttribute("type", "text/css");
		File.setAttribute("href", Font.url);
		
		//ADD TO HEADER
		document.getElementsByTagName('head')[0].appendChild(File);
		
		Font.loaded = true;
		
		return Font.family;

		
	}	
	
	//*******************************************************************
	//     	 E L E M E N T   B U I L D E R  -  V E R S I O N  3
	//*******************************************************************	
	
	this.GetElements = function GetElements (column){
		
		
		var ElementList 	= this.Settings.design.layout[column];
		var ElementCount	= ElementList.length;
		var Content			= '';
		var Element			= '';
		
		if(ElementCount > 0){
			
			var i;
			
			for(i = 0; i < ElementCount; i++){
				
				
				Element =  this.BuildElement(ElementList[i]);
				
				Content += Element;

				
			}
			
		}
		
		return Content;
		
	}
	
	

	//********************************************
	//     			E L E M E N T S
	//********************************************
	this.BuildElement = function BuildElement(el){
		
		if(el == 'image'){
			return this.ElementImage();
			
		}else if(el == 'features'){
			return this.ElementFeatures();
			
		}else if(el == 'price'){
			return this.ElementPrice();
			
		}else if(el == 'address'){
			return this.ElementAddress();
			
		}else if(el == 'listing'){
			return this.ElementListing();
			
		}else if(el == 'description'){
			return this.ElementDescription();
			
		}
		
		
	}
	
	
	this.ElementImage = function ElementImage(){
		
		var Content;
		 
		Content =  '<div class="image_container" style="border:' + IDX.Settings.design.image.border +'px solid ' + IDX.Settings.design.image.color + ';border-radius:' + IDX.Settings.design.image.radius + 'px;">';
		Content += '<img id="listing_image" src="https://cdn.realvue.app/images/house.jpg" class="animate" />';	
		Content += '<img id="preload_listing_image" src="https://cdn.realvue.app/images/house.jpg" />';
		Content += '</div>';	
		
		return Content
		
	}
	
	this.ElementFeatures = function ElementFeatures(){
		
		var Content;
		var ColumnSize		= '';
		var Padding			= 'padding: ' + IDX.Settings.design.features.padding + 'px 0px;'
		var FeatureStyle	= 'color:' + ((IDX.Settings.design.features.color != '')? IDX.Settings.design.features.color : IDX.Settings.design.layout.fontcolor) + ';'; 
		 	FeatureStyle	+= 'font-size:' + IDX.Settings.design.features.size + 'px;';
		
		var LabelStyle		= 'color:' + ((IDX.Settings.design.features.lblcolor != '')? IDX.Settings.design.features.lblcolor : IDX.Settings.design.layout.fontcolor) + ';'; 
			LabelStyle		+= 'font-size:' + IDX.Settings.design.features.lblsize + 'px;';
		
		
		if(IDX.Settings.design.features.rows == 2){
			ColumnSize = 'style="min-width:50%;"';
		}else{
			ColumnSize = '';
		}
		
		
	    Content = '<div id="listing_features" class="features" style="' + Padding +'">';
		Content += '<div class="feature res farm" id="listing_bed" ' + ColumnSize + '><span id="bed" class="number animate" style="' + FeatureStyle +'">0</span>';
		Content += '<span class="title" style="' + LabelStyle + '">BED</span></div>';
		
		Content += '<div class="feature res farm com" id="listing_bath" ' + ColumnSize + '><span id="bath" class="number animate" style="' + FeatureStyle +'">0</span>';
		Content += '<span class="title" style="' + LabelStyle + '">BATH</span></div>';
		
		Content += '<div class="feature res farm com" id="listing_sqft" ' + ColumnSize + '><span id="sqft" class="number animate" style="' + FeatureStyle +'">2600</span>';
		Content += '<span class="title" style="' + LabelStyle + '">SQFT</span></div>';
		
		Content += '<div class="feature res" id="listing_built" ' + ColumnSize + '><span id="built" class="number animate" style="' + FeatureStyle +'">2020</span>';
		Content += '<span class="title" style="' + LabelStyle + '">BUILT</span></div>';	
		
		Content += '<div class="feature land farm" id="listing_acres" ' + ColumnSize + '><span id="acres" class="number animate" style="' + FeatureStyle +'">2</span>';
		Content += '<span class="title" style="' + LabelStyle + '">ACRES</span></div>';
		
		Content += '</div>';	
		
		return Content;
		
		
	}	
	
	this.ElementPrice = function ElementPrice(){
		
		var Color	= ((IDX.Settings.design.price.color != '')? IDX.Settings.design.price.color : IDX.Settings.design.layout.fontcolor); 
		var Align	= IDX.Settings.design.price.align;
		var Padding	= 'padding: ' + IDX.Settings.design.price.padding + 'px 0px;'
		var Content = '<h1 id="listing_price" class="animate" style="color:'+ Color +';font-size:'+ IDX.Settings.design.price.size  +'em;text-align:' + Align +';' + Padding +'">$<span id="price">1,200,000</span></h1>';
		
		
		return Content;
		
		
	}
	
	this.ElementAddress = function ElementAddress(){
		
		var Content = '';
		var Align	= IDX.Settings.design.address.align;
		var Padding	= 'padding: ' + IDX.Settings.design.address.padding + 'px 0px;'
		var Color	= ((IDX.Settings.design.address.color != '')? IDX.Settings.design.address.color : IDX.Settings.design.layout.fontcolor); 
		
		//ADDRESS
		Content = '<h2 id="listing_address" class="animate" style="color:'+ Color +';font-size:'+ (IDX.Settings.design.address.size * .5)+'em;text-align:' + Align +';' + Padding +'">';
		Content += '<span id="address">1232 4th ST SW Demo City, ST</span>';
		Content += '</h2>';				
		
		
		return Content;
		
	}	
	
	this.ElementListing = function ElementListing(){
		
		var Color	= ((IDX.Settings.design.listing.color != '')? IDX.Settings.design.listing.color : IDX.Settings.design.layout.fontcolor); 
		var Padding	= 'padding: ' + IDX.Settings.design.listing.padding + 'px 0px;'
		var Content = '<h2 id="listing_id" class="animate" style="color:'+ Color +';font-size:'+ (IDX.Settings.design.listing.size * .5) +'em;' + Padding +'">Listing # <span id="listing_mls">123456</span><span id="agent"></span></h2>';
	
		return Content;
	}
	
	this.ElementDescription = function ElementDescription(){
		
		var Content;
		var Align	= IDX.Settings.design.description.align;
		var Padding	= 'padding: ' + IDX.Settings.design.description.padding + 'px 0px;'
		var Color	= ((IDX.Settings.design.description.color != '')? IDX.Settings.design.description.color : IDX.Settings.design.layout.fontcolor); 
		
		var Description =  'Loading Content';
		
		if(IDX.Settings.design.description.limit > 0){
			
			Content ='<p id="description" class="animate" style="color:'+ Color +';font-size:'+ IDX.Settings.design.description.size +'px;text-align:' + Align + ';' + Padding +'">' 
				
				+ IDX.TruncateText(Description,IDX.Settings.design.description.limit,'...')+'</p>';
			
		}	

		return Content;	
		
	}		
	
	
	

	
	
	this.TruncateText = function TruncateText(str,length,ending){
		
		if (length == null) {
		  length = 100;
		}
		if (ending == null) {
		  ending = '...';
		}
		if (str.length > length) {
		  return str.substring(0, length - ending.length) + ending;
		} else {
		  return str;
		}		
		
	}
	
	this.VersionCheck = function VersionCheck (){
		//MAKE SURE VALUES ARE SET
		if(this.Settings.version == 2){
			
			this.Settings.design.address.pos 	= 'details';
			this.Settings.design.address.city	= 'inline';
			
			this.Timer		= this.Settings.design.timer * 1;
			
			
		}else{
			
			this.Timer		= this.Settings.settings.timer * 1;
			
		}	
		
		
		
	}
	
	
	//CONSOLE FUNCTIONS - FOR VIEWING IDX PULLS
	
	this.ViewListField = function ViewListField (field){
		
		var count = this.Properties.length;
		
		for(i=0; i < count; i++){
			
			console.log(this.Properties[i][field]);
			
		}	
		
	}

	this.CheckStatus = function CheckStatus(){
		//Called by the display to check the status of source (if active)


		
	}	


}

var IDX = new IDXClass();

App.AddComponent(IDX);
Presenter.AddSource(IDX);

//IDX WILL INIT ITSELF
//IDX.Init();