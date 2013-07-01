// Extension main script

var stylesheetUrl = chrome.extension.getURL("hypestyles.css");

// This is all the JS that will be injected in the document body
var main = function() {

	//Random String generator.
	var generator = function()
	{
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 8;
		var randomstring = "";
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.charAt(rnum);
		}
		return randomstring;
	};
	
	//Here is where we can randomly generate the name of the styles to avoid them checking for specific names.
	//Can add more here if they check additional names.
	//ref:http://jonraasch.com/blog/javascript-style-node
	var triArrowString = generator();
	var css = document.createElement('style');
	css.type = 'text/css';
	var styles = '.'+triArrowString+'{ width: 0; height: 0; border-left: 9px solid transparent; border-right: 9px solid transparent;	border-top: 10px solid #494949; }';
	styles += '.arrow:hover .'+triArrowString+'{ border-top: 10px solid #0063DC; }';
	
	//done this way for IE aparantly.
	if (css.styleSheet) css.styleSheet.cssText = styles;
	else css.appendChild(document.createTextNode(styles) );
	
	document.getElementsByTagName("head")[0].appendChild(css);
	
	
	// Adds a download button next to each track
	var buttonScript = function() {
		console.debug("Buttons injected.");
		// Wait for the tracks script to load
		var tracks = window.displayList['tracks'];
		 
		if (tracks === undefined || tracks.length < 1) {
			setTimeout(buttonScript, 1);
		} 
		else {
				// Check if this particular page has been processed
				// through a previous call
			if (jQuery('.dl').length < tracks.length) {
				jQuery('ul.tools').each(function(index, track) {
					var song = tracks[index];
					var artist = song.artist;          
					var id = song.id;
					var key = song.key;
					// Sometimes the title is too long and is ellipsisisisisized in the JSON data
					var title = jQuery("[data-itemid='" + id + "']").children()[1].children[1].title.split(" - ")[0];

					console.log("index: "+index);
					var hasDownloadButton = jQuery(track).data("hasDownloadButton");
					if (typeof(hasDownloadButton) === 'undefined' || !hasDownloadButton){
						jQuery.getJSON("/serve/source/"+ id + "/" + key, function(data) {
						var download_url = data.url;
						if (data.type != "SC")
							jQuery(track).prepend('<li class="dl"><table class="spacer"></table><a target="_top" href="'+download_url+'"' + ' download="' + artist + ' - ' + title + '.mp3"' + '><table class="arrow"><tr><td><div class="rect-arrow"></div></td></tr><tr><td class="'+triArrowString+'"></td></tr></table></a></li>');
						else 
							jQuery(track).prepend('<li class="dl"><table class="spacer"></table><a target="_top" href="http://ec2-107-21-204-73.compute-1.amazonaws.com:9000/id3/fix?url='+download_url+'&artist=' + artist + '&title=' + title + '"'+ '><table class="arrow"><tr><td><div class="rect-arrow"></div></td></tr><tr><td class="'+triArrowString+'"></td></tr></table></a></li>');
						});
						jQuery(track).data("hasDownloadButton", true);
					}
				});//each		
			}
		}
	};//buttonscript
  
	
	// Run it right away
	buttonScript();
  
  jQuery(document).ajaxComplete(function(event,request, settings){
		buttonScript();
  });
  
	/*
  The following code can be used to make the download attribute added in HTML5 work.
  HypeMachine overrides the handle_click functionality and returns false at the end, disabling the browsers default handling (i.e. downloading).
  In order to circumvent this, we can either set the target or added the check for our className. 
  I am keeping this here for future reference!
  
	// override hypem's handle_click function
	jQuery('#header, #player-container, #content-wrapper, #footer').off('click','a',handle_click);
	window.handle_click = function (event) {
		log('handle_click(' + event + ') called');
		if (event.which == 2 || jQuery(this).prop('target') == "_blank" || jQuery(this).prop('target') == "_top") {
			event.stopPropagation();
			return true;
		}
		if (jQuery(this).attr('href')) {
			if (jQuery(this).attr('href').charAt(0) === '#') {
				var offset = jQuery(jQuery(this).attr('href')).offset();
				jQuery('html, body').animate({
					scrollTop: offset.top,
					scrollLeft: offset.left
				});
				if (is_html5_history_compat()) {
					skip_update_page_contents = 1;
					history.replaceState(null, null, document.location.protocol + '//' + document.location.host + document.location.pathname + jQuery(this).attr('href'));
				}
				return false;
			}
			t_elt = event.target || event.srcElement;
			if (event.currentTarget.parentNode.className == "dl") {
				// let the shit download
				return true;
			} else if (t_elt.tagName != 'A') {
				console.log("A");
				while (t_elt.tagName != 'A') {
					t_elt = t_elt.parentNode;
				}
				url = t_elt.href;
			} else {
				url = t_elt.href;
			}
			if (url.match(/random$/)) {
				load_random_track();
			} else if (url.match(/random_search$/)) {
				load_random_search();
			} else {
				load_url(url, null, event);
				load_user_menu();
			}
			return false;
		}
	};
	// re-bind the event
	jQuery('#header, #player-container, #content-wrapper, #footer').on('click','a',window.handle_click);
  */
};

// Lets create the script objects
var injectedScript = document.createElement('script');
injectedScript.type = 'text/javascript';
injectedScript.text = '('+main+')("");';
(document.body || document.head).appendChild(injectedScript);



//Lets create the CSS object. This has to be done this way rather than the manifest.json
//because we want to override some of the CSS properties so they must be injected after.
var injectedCSS = document.createElement('link');
injectedCSS.type = 'text/css';
injectedCSS.rel = 'stylesheet';
injectedCSS.href = stylesheetUrl;
(document.body || document.head).appendChild(injectedCSS);

//var injectRandomCSS = document.createElement('style');
//injectRandomCSS = 'text/css';
//$$('<style type="ext/css">.'+triArrowString+'{ width: 0; height: 0; border-left: 9px solid transparent; border-right: 9px solid transparent;	border-top: 10px solid #494949; }</style>').appendTo("head");