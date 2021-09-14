//server constants
var MEDIA_SERVER_URL = "http://192.168.1.4";
var API_URL = "http://192.168.1.4/api/";
var SERVER;
var MANIFEST;
var USER = null;
var mediaCache = null;
var updateMediaDetailsInterval;
//nav events
var activeLink = document.getElementById("btnhome");
var activeLinkBgClass = "btnhome";
//global refferences
var section;
var asynchronousShare = JSON.parse("{}");
//active navigation layout (default value is start up section)
var activeLayout;
//initilize app
window.onload = function() {
    //load application manifest and setup 
    MANIFEST = getManifest();
    console.log(MANIFEST)
    //intilize server interface
    if (window.XMLHttpRequest)
        SERVER = new XMLHttpRequest();
     else
        SERVER = new ActiveXObject("Microsoft.XMLHTTP");
    //set global refference for mediaplayer
    MEDIA_PLAYER_ACTIVITY = document.getElementById("media-player");
    //set intial section refference
    section = document.getElementById("splash-screen");
    //setup layout navigation and mandatory events
    initLayout();
    //close splash screen
    var splashScreen = setTimeout(function() {
        //open user profile selection
        switchActivity("profile-login");
        clearTimeout(splashScreen);
    }, 3000);
};
//user profile controls
profileFocused = function() {
    this.style.opacity = "1";
    this.classList.add("profile-focused");
}
profileUnfocused = function() {
    this.style.opacity = ".5";
    this.classList.remove("profile-focused");
}
profileSelected = function() {
    //login user
    USER = IRIS_API({
        request:"login",
        user:this.id
    },false,false);
    //get profile configuration and settings
    document.getElementById("btnhome").dispatchEvent(new Event("selected"));
    //welcome user
    // var dely = setTimeout(() => {
    //     notification("Welcome "+this.querySelector(".profile-name").innerText,true,icon_hand_spock);
    //     clearTimeout(dely);
    // }, 2000);
}
//Menu Events
navFocused = function() {
    //menu option at focus
    document.getElementById('menu').classList.add("show-nav");
    this.classList.add("nav-focused");
}
navUnfocused = function() {
    //menu option at focus
    document.getElementById('menu').classList.remove("show-nav");
    this.classList.remove("nav-focused");
}
navSelected = function() {
    //deselect previous link
    activeLink.classList.remove(activeLinkBgClass);
    //update active link
    activeLink = this;
    //get layout refference by removing first 3 characters 
    //of navigation menu
    let layout = this.id.substr(3,(this.id.length-1));
    //update section specific states
    activeLinkBgClass = this.id;
    this.classList.add(this.id);
    //switch navigation to requested layout
    switchLayout(layout);
    //render requested activity/section
    switchActivity(layout);
    //switch app theme to co-inside with current activity
    switchTheme(layout);
}
//Section Events
profileActivity = function() {
    //render login activity (if not already)
    var user_profile_list = document.getElementById("user-profiles");
    if (user_profile_list.childElementCount == 0) {
        var user_profiles = IRIS_API({request: "user-profiles"},false,false);
        user_profiles.forEach(element => {
            //create profile
            var user_profile = document.createElement("li");
            user_profile.classList.add("profile");
            user_profile.setAttribute("id",element.id);
            //create profile cover container
            var profile_cover = document.createElement("div");
            profile_cover.classList.add("profile-cover");
            //create profile avatar container
            var profile_avatar = document.createElement("img");
            profile_avatar.src = element.USER_AVATAR;
            profile_cover.appendChild(profile_avatar);
            user_profile.appendChild(profile_cover);
            //set user name
            var profile_name = document.createElement("h3");
            profile_name.classList.add("profile-name");
            profile_name.innerText = capatalize(element.USER_FIRST_NAME + " " + element.USER_LAST_NAME);
            user_profile.appendChild(profile_name);
            //set user alias
            var profile_alias = document.createElement("h4");
            profile_alias.classList.add("profile-alias");
            profile_alias.innerText = element.USER_ALIAS;
            user_profile.appendChild(profile_alias);
            //attach event listers
            user_profile.addEventListener("focused",profileFocused);
            user_profile.addEventListener("unfocused",profileUnfocused);
            user_profile.addEventListener("selected",profileSelected);
            //append user profile list in DOM
            user_profile_list.appendChild(user_profile);
        });
        addLayout(user_profile_list);
    }
}
searchActivity = function() {
}
homeActivity = function(){
    //load start up section
    var latestMediaList = section.querySelector(".latest-movies");
    var collection = latestMediaList.querySelector(".media-list");
    //attach collection refference for auto-expantion
    asynchronousShare[collection] = collection;
    var query = {
        request:"media",
        critera: "latest",
        filter : {
           limit:10
        }
    };
    //query latest media added to server
    var result = IRIS_API(query, false);
    //generate list of latest media for home page
    if (result.length != latestMediaList.getElementsByTagName("li").length)
        generateMediaList(collection,result);
    //set query for dynamic expantion of list
    asynchronousShare[collection].autoExpandQuery = {
        request:"media",
        critera:"latest",
        filter:{
            limit:5
        }
    };
    latestMediaList.addEventListener("collection-expand", expandMediaList);
}
moviesActivity = function() {
    //get recently added movies
    var collection = this.querySelector(".latest-movies");
    var meidaList = collection.querySelector(".media-list");
    //attach collection refference for auto-expantion
    asynchronousShare[collection] = collection;
    var mediaCollection = IRIS_API({
        request:"media",
        critera: "latest",
        filter : {
           limit:10
        }
    }, false);
    if (mediaCollection.length != meidaList.getElementsByTagName("li").length)
        generateMediaList(meidaList,mediaCollection);
    //set query for dynamic expantion of list
    asynchronousShare[collection].autoExpandQuery = {
        request:"media",
        critera:"latest",
        filter:{
            limit:5
        }
    };
    //set collection to dynamically expand
    collection.addEventListener("collection-expand", expandMediaList);
    //get list of recently unfinished movies
    collection = this.querySelector(".continue-watching");
    meidaList = collection.querySelector(".media-list");
    mediaCollection = IRIS_API({
        request:"media",
        filter : {
            collection:"starwars",
            sort:["year"]
        }
    }, false);
    if (mediaCollection.length != meidaList.getElementsByTagName("li").length)
        generateMediaList(meidaList,mediaCollection);
    //get full list of avalilable movies and render grid
    var mediaGrid = this.querySelector(".media-grid");
    mediaCollection = IRIS_API({
        request:"media",
        critera:"latest",
        filter: {
            limit:24
        }
    }, false);
    if (mediaGrid.childElementCount == 0)
        generateMediaGrid(mediaGrid, mediaCollection);
    //set collection to dynamically expand 
    mediaGrid.addEventListener("collection-expand", gridExpand);
    //attach grid events
    mediaGrid.addEventListener("collection-focused", gridFocused);
    mediaGrid.addEventListener("collection-unfocused", gridUnfocused);
}
seriesActivity = function(){
    //load start up section
    var latestMediaList = section.querySelector(".latest-series");
    var collection = latestMediaList.querySelector(".media-list");
    var query = {
        request:"media",
        critera: "latest",
        filter : {
           limit:10,
           type:"series"
        }
    };
    //query latest media added to server
    var result = IRIS_API(query, false);
    //generate list of latest media for home page
    if (result.length != latestMediaList.getElementsByTagName("li").length)
        generateMediaList(collection,result);
    //latestMediaList.addEventListener("collection-expand", expandMediaList);
}
libraryActivity = function(){
}
settingsActivity = function(){
}
//media list/grid events
listFocused = function() {
    this.style.opacity = "1";
}
listUnfocused = function() {
    this.style.opacity = "0";
}
gridFocused = function() {
    //allow full screen navigation of grid
    var mediaNavigation = section.querySelector(".media-navigation");
    if (!mediaNavigation.classList.contains("navigation-full")) {
        mediaNavigation.classList.add("navigation-full");
        mediaNavigation.style.top = "0%";
        //hide menu
        var menu = document.getElementById("menu");
        menu.classList.add("hide-nav");
        //disable media details update on focus
        mediaUpdateFlag = false;
    }
}
gridUnfocused = function() {
    //minimize full screen grid navigation
    let mediaNavigation = section.querySelector(".media-navigation");
    mediaNavigation.classList.remove("navigation-full");
    mediaNavigation.style.top = "62%";
    //hide menu
    let menu = document.getElementById("menu");
    menu.classList.remove("hide-nav");
    //enable media details update on focus
    mediaUpdateFlag = true;
}
gridExpand = function() {
    //append grid 
    appendGrid = function() {
        if (this.readyState == 4 && this.status == 200 && asynchronousShare.flag){
            //cache server response for future refferrence
            cache_media(SERVER.responseText);
            var mediaCollection = JSON.parse(SERVER.responseText);
            var mediaGrid = section.querySelector(".media-grid");
            //append grid
            generateMediaGrid(mediaGrid, mediaCollection);
        }       
    }
    //get current total number of media
    var mediaCount = section.querySelector(".media-grid").childElementCount * 6;
    IRIS_API({
        request:"media",
        critera:"latest",
        filter:{
            from:mediaCount,
            limit:18
        }
    }, true, true, appendGrid);
}
expandMediaList = function() {
    //identify active meida list
    let mediaList = this.querySelector(".media-list");
    //set media collecion to async share
    asynchronousShare.collection = mediaList;
    //get number of media currently on list
    let mediaCount = mediaList.childElementCount;
    //get auto expantion query set for current collection
    let expantionQuery = asynchronousShare[mediaList].autoExpandQuery;
    //exclude currently rendered media from expantion
    expantionQuery.filter.from = mediaCount;
    //query server for media (async)
    IRIS_API(expantionQuery, true, true, function () {
        //append list
        if (this.readyState == 4 && this.status == 200 && asynchronousShare.flag){
            //cache server response for future refferrence
            cache_media(SERVER.responseText);
            let mediaCollection = JSON.parse(SERVER.responseText);
            //append active list
            generateMediaList(asynchronousShare.collection, mediaCollection, true);
        }       
    });
}
function generateMediaList(list, 
    media_list, 
    layoutFlag = false
    ) {
    //cycle through the list and append to list tag
    media_list.forEach(function(element) {
        //create movie card
        var media_card = document.createElement("li");
        media_card.setAttribute("class", "media-card");
        var img = new Image();
        img.alt = element.imdb_id;
        img.src = element.poster;
        img.onload = function() {
            var node = section.querySelectorAll("li[data-media-ref='"+this.alt+"'] img");
            for (var index = 0; index < node.length; index++) 
                node[index].src = this.src;
        }
        var movie_poster = document.createElement("img");
        movie_poster.setAttribute("alt",element.imdb_id);
        movie_poster.setAttribute("src","/assets/img/default-thumbnail.jpg");
        media_card.appendChild(movie_poster);
        media_card.dataset.mediaRef = element.imdb_id;
        //attach click event lister and handler to media card
        media_card.addEventListener("focused",mediaFocused);
        media_card.addEventListener("unfocused",mediaUnfocused);
        media_card.addEventListener("selected",mediaSelected);
        //append to list
        appendList(media_card, list);
    });
    //add/append list to navigation layout
    if (layoutFlag)
        appendLayout(list);
    else 
        addLayout(list);
    //attach list events to collection
    list.parentElement.addEventListener("collection-focused", listFocused);
    list.parentElement.addEventListener("collection-unfocused", listUnfocused);
}
function generateMediaGrid(grid, media_list) {
    //grid count
    var nodeIndex = 0;
    var rowCount = media_list.length / 6; //each rwo will hold 6 media cards
    var row_limit = 6;
    for (var rows = 0; rows < rowCount; rows++) {
        var list = document.createElement("div");
        list.classList.add("media-list");
        for (nodeIndex; nodeIndex < row_limit; nodeIndex++) {
            if (media_list[nodeIndex] !== undefined) {
                //create movie card
                var media_card = document.createElement("li");
                media_card.setAttribute("class", "media-card");
                var img = new Image();
                img.alt = media_list[nodeIndex].imdb_id;
                img.src = media_list[nodeIndex].poster;
                img.onload = function() {
                    var node = section.querySelectorAll("li[data-media-ref='"+this.alt+"'] img");
                    for (var index = 0; index < node.length; index++)
                        node[index].src = this.src;
                }
                var movie_poster = document.createElement("img");
                movie_poster.setAttribute("alt",media_list[nodeIndex].imdb_id);
                movie_poster.setAttribute("src","/assets/img/default-thumbnail.jpg");
                media_card.appendChild(movie_poster);
                media_card.dataset.mediaRef = media_list[nodeIndex].imdb_id;
                //attach click event lister and handler to media card
                media_card.addEventListener("focused",mediaFocused);
                media_card.addEventListener("unfocused",mediaUnfocused);
                media_card.addEventListener("selected",mediaSelected);
                //append to list
                appendList(media_card, list);
            } else {
                console.log("INDEX: "+nodeIndex);
                console.log(media_list);
            }
        }
        row_limit += 6;
        //append to list
        appendList(list, grid);
        //add list to navigation layout
        addLayout(list);
    }
}
function appendList(media,list) {
    list.appendChild(media);
}
//general components
function capatalize(text) {
    text = text.split(" ");
    for (var i = 0, x = text.length; i < x; i++)
        text[i] = text[i][0].toUpperCase() + text[i].substr(1);
    return text.join(" ");
}
function notification(title,
    subTitle,
    body,
    success = true,
    icon_ref = null, 
    duration = 4000
    ) {
    var notification = document.getElementById("notification");
    var icon = document.querySelector("#notification #icon");
    if (success)
        icon.innerHTML = icon_ref != null ? icon_ref : icon_check;
    else 
        icon.innerHTML = icon_ref != null ? icon_ref : icon_exclamation_triangle;
    //set notification title
    let msg_title = document.querySelector("#notification .notification-title");
    msg_title.innerHTML = title;
    //set notification sub title
    let msg_sub_title = document.querySelector("#notification .notification-sub-title");
    msg_sub_title.innerHTML = "";
    if (subTitle !== null) 
        msg_sub_title.innerHTML = subTitle;
    //set message body
    let msg_body = document.querySelector("#notification .notification-body");
    msg_body.innerHTML = "";
    if (body !== null)
        msg_body.innerHTML = body;    
    //show notification
    notification.classList.remove("notification-hide");
    notification.classList.add("notification-show");
    //hide notification after specified duration
    var hideNotification = setTimeout(() => {
        var notification = document.getElementById("notification");
        notification.classList.remove("notification-show");
        notification.classList.add("notification-hide");
        clearTimeout(hideNotification);
    }, duration);
}
function switchActivity(newActivity) {
    //swtich to requested layout
    activeLayout = newActivity;
    //store previous section refference
    var previousSection = section;
    //update to requested activity/section
    section = document.getElementById(newActivity);
    //load section handler
    section.dispatchEvent(new Event("requested"));
    //set activity/section details if not set
    var layout = getActiveLayout();
    layout = layout.getActiveElement().classList.contains("nav-item") 
        ? layout.getActiveElement("media-card")
        : layout.getActiveElement();
    layout.dispatchEvent(new Event('focused'));
    //close previous section
    previousSection.style.opacity = "0";
    //render section
    section.style.opacity = "1";
}
function switchTheme(layout) {
    //customize media player
    //customize notifications
    let notification = document.getElementById("notification");

    switch (layout) {
        case "profile-login":
            break;
        case "search":
            break;
        case "home":
            notification.style.background = MANIFEST.Activity.home.theme;
            break;
        case "movies":
            notification.style.background = MANIFEST.Activity.movies.theme;
            break;
        case "series":
            notification.style.background = MANIFEST.Activity.series.theme;
            break;
        case "library":
            break;
        case "settings":
            break;
    }
}
function getManifest(){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",'../manifest.json',false);
    Httpreq.send(null);
    return JSON.parse(Httpreq.responseText);
}
DefaultCallBack = function(cacheResponse = true) {
    if (this.readyState == 4 && this.status == 200) {
        if (cacheResponse && SERVER.responseText != "")
            cache_media(SERVER.responseText);
    }
}
function IRIS_API(
        parameters, 
        async = true, 
        cacheResponse = true,
        callback = DefaultCallBack
    ) {
    //set global flag
    asynchronousShare.flag = async;
    //format api call to include application/client info
    request = {
        user : (USER != null ? USER[0] : null),
        request : parameters,
        _device : {
            app : {
                "id":MANIFEST.app_id,
                "version":MANIFEST.version
            },
            info : {
                "browserCodeName" : navigator.appCodeName,
                "browserName" : navigator.appName,
                "cookiesEnabled" : navigator.cookieEnabled,
                "browserLanguage" : navigator.language,
                "platform" : navigator.platform,
                "userAgent" : navigator.userAgent,
                "resolution":window.innerWidth+"x"+window.innerHeight
            }
        }
    };
    //send request to api server
    SERVER.open("POST", API_URL, async);
    // SERVER.timeout = 5000;
    SERVER.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    SERVER.send("request="+JSON.stringify(request));
    //Synchronous Call
    if (!async){
        if (cacheResponse)
            cache_media(SERVER.responseText);
        return JSON.parse(SERVER.responseText);
    }
    //Asynchronous Call
    SERVER.onreadystatechange = callback;
}
function cache_media(media) {
    if (mediaCache != null) {
        //only cache non existing records
        var cache = JSON.parse("["+mediaCache+"]");
        var data = JSON.parse(media);
        var sentinal = false;
        data.forEach(data_record => {
            if (data_record.imdb_id !== undefined) {
                //search for record on cache
                cache.forEach(cache_record => {
                    if (cache_record.imdb_id == data_record.imdb_id)
                        sentinal = true;
                });
                if (!sentinal) //cache data record
                    mediaCache += ","+JSON.stringify(data_record);
            }
            //reset record state
            sentinal = false;
        });
    } else {
        var str = media.slice(1, (media.length-1));
        mediaCache = str;
    }
}
//secondary media control events
function getMediaCompletion(media_id) {
    //update media completion
    let media = getMediaDetails(media_id);
    let mediaCompletion = getMediaHistory(media_id);
    let mediaType = media.type;
    //clear previous media refference
    delete MEDIA_PLAYER.dataset.mediaId;
    //clear previous completion set
    delete MEDIA_PLAYER.dataset.mediaPreviousCompletion;
    //update play button for series
    if (mediaType == "series") {
        let episode = 1;
        let season = 1;
        if (mediaCompletion !== null) {
            //get last episode watched by user
            mediaCompletion = getMediaHistory(media_id)[0];
            //set previous completion of series
            episode = parseInt(mediaCompletion.EPISODE);
            season = parseInt(mediaCompletion.SEASON);
            //set episode id to last episode watched by user
            episode_id = mediaCompletion.MEDIA_ID;
            if (mediaCompletion.COMPLETION > 90) {
                //clear episode completion if > 90%
                mediaCompletion = {};
                const query = {
                    request:"media",
                    filter : {
                        series_id:media_id,
                        season:season,
                        episode:episode+1,
                        type:"episode"
                    }
                };
                //if iser has finished current episode, opt for next episode
                let nextEpisode = IRIS_API(query,false,true);
                nextEpisode = nextEpisode[0];
                if (nextEpisode !== undefined) {
                    mediaCompletion.SEASON = nextEpisode.season;
                    mediaCompletion.EPISODE = nextEpisode.episode;
                    mediaCompletion.MEDIA_ID = nextEpisode.imdb_id;
                } else 
                    //user has finished all episodes
                    mediaCompletion = null;
            }
        }
    }
    //set current media completion 
    if (mediaCompletion !== null) {
        //set media id of continuing media
        MEDIA_PLAYER.dataset.mediaId = mediaCompletion.MEDIA_ID;
        //set continution of current media
        if (mediaCompletion.COMPLETION !== undefined)
            MEDIA_PLAYER.dataset.mediaPreviousCompletion = mediaCompletion.COMPLETION;
        //return current completion of requested media
        return mediaCompletion;
    }
    //user has no previous completion of media
    return null;
}
function updateSecondaryControls(media_id) {
    var playlist_toggle = section.querySelector("#toggle-playlist");
    //update playlist toggle
    if (queryPlaylist(media_id))
        playlist_toggle.innerHTML = icon_folder_minus;
    else
        playlist_toggle.innerHTML = icon_folder_plus;
}
controlFocused = function() {
    this.style.background = "white";
    this.style.color = "black"
}
controlUnfocused = function() {
    this.style.background = "transparent";
    this.style.color = "white"
}
controlSelected = function(event) {
    //get details of media at focus 
    var media = event.detail;
    var control = this.getAttribute("id");
    //toggle playlist
    if (control == "play-media")
        media.dispatchEvent(new Event("selected"));
    else if (control == "toggle-playlist") {
        if (queryPlaylist(media.dataset.mediaRef)) {
            removeFromPlaylist(media);
        }  else {
            appendPlaylist(media);
        }
    } else if (control == "toggle-info") {
        var mediaDetails = section.querySelector(".details");
        if (mediaDetails.style.height != "100%") {
            mediaDetails.style.height = "100%";
            //toggle extra media details
            document.getElementById("menu").classList.add("hide-nav");
            section.querySelector(".details #tags").style.display = "flex";
            section.querySelector(".details .discription").style.height = "12%";
            section.querySelector(".details .awards").classList.remove("toggle-info");
        } else {
            mediaDetails.style.height = "45%";
            document.getElementById("menu").classList.remove("hide-nav");
            section.querySelector(".details #tags").style.display = "none";
            section.querySelector(".details .discription").style.height = "25%";
            section.querySelector(".details .awards").classList.add("toggle-info");
        }
    }
}
//media events
mediaFocused = function() {
    if (this.querySelector("img") != null )
        this.querySelector("img").classList.add("media-focused");
    else 
        this.querySelector(".episode").classList.add("episode-focused");
    var media_details_pane = section.querySelector(".details");
    var imdb_id = this.dataset.mediaRef;
    if (media_details_pane.querySelector(".title").innerHTML == "") {
        media_details_pane.style.opacity = "1";
        if (mediaUpdateFlag)
            updateMediaDetails(imdb_id);
    }
    if (activeLayout == "MEDIA_PLAYER") {
        //show media controls on control focus
        mediaControlShow();
        //reset timer for hidding controls after 3 seconds of inactivity
        clearTimeout(mediaControlTimer);
        mediaControlTimer = setTimeout(mediaControlHide, 3000);
    } else {
        clearInterval(updateMediaDetailsInterval);
        media_details_pane.style.opacity = ".8";
        updateMediaDetailsInterval = setInterval(() => {
            media_details_pane.style.opacity = "1";
            if (mediaUpdateFlag)
                updateMediaDetails(imdb_id);
            clearInterval(updateMediaDetailsInterval);
        }, 700);
    }
}
mediaUnfocused = function() {
    if (this.querySelector("img") != null )
        this.querySelector("img").classList.remove("media-focused");
    else 
        this.querySelector(".episode").classList.remove("episode-focused");
}
mediaSelected = function() {
    //update media url
    let media_id = this.dataset.mediaRef;
    const mediaDetails = getMediaDetails(media_id);
    //set global refference for media type
    mediaType = mediaDetails.type;
    //play media
    switch (mediaType) {
        case "movie":
            //update media completion of current movie
            //incase media selected from media player
            //playlist
            getMediaCompletion(media_id);
            playMovie(media_id);
            break;
        case "series":
            playSeries(media_id);
            break;
        case "episode":
            playEpisode(this);
            break;
    }
}
//navigation events
scrollTop = function() {
}
scrollRight = function() {
}
scrollDown = function() {
}
scrollLeft = function() {
}
//generate list of media for given list
///@list list tag to generate list for
//@media_list list of media (JSON object) to append to list
function getMediaDetails(media_id) {
    //check local cache for movie details
    var mediaList = "["+mediaCache+"]";
    var jsn_obj = JSON.parse(mediaList);
    var result = false;
    jsn_obj.forEach(function(element) {
        if (element.imdb_id == media_id)
            result = element;
    });
    return result;
}
function getMediaHistory(media_id) {
    let media = getMediaDetails(media_id);
    let mediaType = media.type;
    //identify media type
    //TO DO....
    var media_completion = IRIS_API({
        request:"media",
        critera: "completion",
        filter : {
           media_id:media_id,
           type:mediaType
        }
    },false,false);
    //check if media has any previous compltion status
    let media_access_history = media_completion;
    if (media_access_history.length > 0) {
        //cycle through access log and identify
        //most recent access that has a completion 
        //grater then 1 and less then 90 percent
        if (mediaType == "movie") {
            let percentageComplete = media_access_history[0].COMPLETION;
            if (percentageComplete > 1 && percentageComplete < 90)
                return media_access_history[0];
        } else 
            return media_access_history;
    }
    //media has no previous completion or
    //media completion is bellow 1 or greater then 90
    return null;
}
function setParentalRating(rating,tag) {
    if (rating == 'PG' || rating == 'G' || 
            rating == "TV-G" || rating == "TV-Y" || 
            rating == "TV-Y7") {
        tag.style.borderColor = '#50d050';
        tag.style.color = '#50d050';
        tag.innerHTML = icon_grin_beam;
    } else if (rating == 'PG-13' || rating == "TV-14" || 
            rating == "TV-PG") {
        tag.style.borderColor = '#c9c739';
        tag.style.color = '#c9c739';
        tag.innerHTML = icon_smile;
    } else {
        tag.style.borderColor = '#d05050';
        tag.style.color = '#d05050';
        tag.innerHTML = icon_angry;
    }

}
function updateMediaDetails(media_id) {
    var media = getMediaDetails(media_id);
    //identify current media focused
    let isSeries = media.type == "series" ? true : false;
    //media properties
    let title = section.querySelector(".info .title");
    let imdb_rating = section.querySelector(".info .imdb_rating");
    let audience = section.querySelector(".info .audience");
    let runtime = section.querySelector(".info .hours");
    let season_count = section.querySelector(".info .sesion-count");
    let release_date = section.querySelector(".info .release-date");
    let parental_rating = section.querySelector(".info .wk-rating");
    let tags = section.querySelector("#tags");
    let plot = section.querySelector(".info .discription");
    let completion = section.querySelector("#secondary-controls .media-completion");
    let playMedia = section.querySelector("#secondary-controls #play-media");
    //update selected movie details
    title.innerHTML = media.title;
    imdb_rating.innerHTML = media.imdb_rating;
    audience.innerHTML = media.rated;
    if (!isSeries)
        runtime.innerHTML = media.runtime;
    if (isSeries)
        season_count.innerHTML = media.totalSeasons+" Seasons";
    release_date.innerHTML = media.year;
    setParentalRating(media.rated,parental_rating);
    tags.innerHTML = ""; //clear previous tags from list
    media.genre.split(",").forEach(function(element){
        var item = document.createElement("li");
        item.innerText = element;
        tags.appendChild(item);
    });
    plot.innerHTML = media.plot;
    //update media completion
    completion.innerHTML = "";
    let mediaCompletion = getMediaCompletion(media_id);
    if (mediaCompletion !== null) {
        //update users episode compltion of media is series
        if (isSeries)
            playMedia.innerHTML = icon_play+" Episode "+mediaCompletion.EPISODE;
        else 
            playMedia.innerHTML = icon_play+" Play";
        //set completion percentage of current meida
        if (mediaCompletion.COMPLETION !== undefined)
            completion.innerHTML = parseInt(mediaCompletion.COMPLETION)+"% Watched";
    }
    
    //set up secondary controls
    if (!isSeries)
        updateSecondaryControls(media_id);
    //preview focused media
    updateMediaPreview(media_id);
}
//embed media name and extension to file server url
function encodeMediaURI(media_id) {
    var media = getMediaDetails(media_id);
    //get uri
    var uriLink = encodeURI(media.url);
    // uriLink = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
    return uriLink;
}
function getMediaURI(media_id) {
    var media = getMediaDetails(media_id);
    //assign relevent alias for media access on media server
    //generate uri link
    var uriLink = encodeURI(media.url);
    return uriLink;
}
