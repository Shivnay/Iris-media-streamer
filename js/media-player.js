var playlist;
var episodes;
var mediaType;
var MEDIA_PLAYER_ACTIVITY;
var MEDIA_PLAYER;
var mediaControlTimer;
var runtime;
var previewRuntime;
var mediaLogCounter = 0;
var MEDIA_PROGRESS_INTERVEL = 60;
//media flags
var mediaNearComplition_Flag = false;
//player control states
var isPlaying = false;
var isMuted = false;
var isFullscreen = false;
function initMediaPlayer() {
    //stop media preview from buffering
    stopMediaPreview();
    if (activeLayout != "MEDIA_PLAYER") { 
        //start media player
        togglePlayer();
        //intilize playlist (if not already initilized)
        initPLaylist();
    }
    if (MEDIA_PLAYER.readyState == 4)
        MEDIA_PLAYER.play();
    else {
        MEDIA_PLAYER.load();
        let prompt = document.getElementById("media-prompt");
        prompt.classList.toggle("loading");
        var loopMediaReadyState = setInterval(() => {
            if (MEDIA_PLAYER.readyState == 4) {
                prompt.classList.toggle("loading");
                //initlize media player playback controls
                initMediaPlayerSeek();
                //set aspect ratio to maxamize device resolution
                optamizeAspectRatio();
                //switch media state to playing
                isPlaying = false;
                //clear compltion flags
                mediaNearComplition_Flag = false;
                togglePause();
                //check previous media compltion
                mediaCompletion();
                //set player theme
                setPlayerTheme();
                //movie ready clear loop
                clearInterval(loopMediaReadyState);
            }
        }, 1000);
    }
}
function togglePlayer() {
    if (MEDIA_PLAYER_ACTIVITY.classList.contains("media-player-hide")) {
        //renender playlist
        renderPlaylist();
        //open media plauer
        MEDIA_PLAYER_ACTIVITY.classList.remove("media-player-hide");
        MEDIA_PLAYER_ACTIVITY.classList.add("media-player-show");
        //disable media details update
        mediaUpdateFlag = false;
        //switch to media player layout
        activeLayout = "MEDIA_PLAYER";
    } else {
        //unload current playing media
        MEDIA_PLAYER.pause();
        isPlaying = false;
        //stop media runtime update
        clearInterval(runtime);
        //switch layout back to active section
        activeLayout = section.getAttribute("id");
        //disable media details update
        mediaUpdateFlag = true;
        //reinitilize media source of default layout in case 
        //a reset was made by playlist selection
        encodeMediaURI(getActiveLayout().activeNode.data.id); 
        //remove playlist from dom to avoid duplication
        derenderPlaylist();
        //close media player
        MEDIA_PLAYER_ACTIVITY.classList.remove("media-player-show");
        MEDIA_PLAYER_ACTIVITY.classList.add("media-player-hide");
    }
}
function getPlayerTheme() {
    //TEMP CODE
    const movieTheme = {
        "control":{
            "focused":"#505DD0",
            "unfocused":"transparent"
        },
        "completionBar":{
            "background":"#505DD0"
        }
    };
    const seriesTheme = {
        "control":{
            "focused":"#c93939",
            "unfocused":"transparent"
        },
        "completionBar":{
            "background":"#c93939"
        }
    };
    //update media player theme accorting to media type
    switch (mediaType) {
        case "movie":
            return movieTheme;
        case "series":
        case "episode":
            return seriesTheme;
    }
}
function setPlayerTheme() {
    const theme = getPlayerTheme();
    //set completion bar color
    let bar = document.getElementById("completionBar");
    bar.style.background = theme.completionBar.background;
}
//Media Player Components
//playback controls
function optamizeAspectRatio(aspectRatio = null) {
    var media = MEDIA_PLAYER_ACTIVITY.querySelector("video");
    //get media resolution
    var mediaWidth = parseInt(media.videoWidth);
    var mediaHeight = parseInt(media.videoHeight);
    if(aspectRatio == null)
        //calculate aspect ratio
        var aspectRatio = parseFloat(mediaWidth/mediaHeight);
    //reset media aspect ratio to original to preserve resolution
    //if media aspect ratio is bellow 1.5 (3:2)
    if (aspectRatio < 1.5)
        media.style.objectFit = "fill";
    else 
        media.style.objectFit = "cover";
}
function initMediaPlayerSeek() {
    let totalRuntime = document.getElementById("totalRuntime");
    let mediaTitle = document.querySelector("#media-player #title");
    //set total runtime of media
    totalRuntime.innerText = getHHMMSS(MEDIA_PLAYER.duration);
    //set media title
    const mediaDetails = getMediaDetails(MEDIA_PLAYER.dataset.mediaId);
    if (mediaDetails.type == "episode") {
        const seriesDetails = getMediaDetails(mediaDetails.seriesID);
        mediaTitle.innerHTML = seriesDetails.title
            +" S"+mediaDetails.season+" &middot; "
            +"E"+mediaDetails.episode
            +" "+mediaDetails.title;
    } else
        mediaTitle.innerText = mediaDetails.title;
    //update media runtime
    updateRuntime();
    //set runtime update loop
    this.runtime = setInterval(updateRuntime, 1000);
    //set active node to pause
    for (var node = this.playerLayout.head; node != null; node = node.right) {
        if (node.data.id == "pause") {
            //remove focus from previous active control
            this.playerLayout.activeNode.data.dispatchEvent(new Event("unfocused"));
            this.playerLayout.activeNode = node;
        }
    }
}
updateRuntime = function() {
    if (isPlaying) {
        var seekbar = document.getElementById("completionBar");
        var completion = parseInt((MEDIA_PLAYER.currentTime/MEDIA_PLAYER.duration)*100);
        seekbar.style.width = completion+"%";
        var currentRunTime = document.getElementById("currentRuntime");
        currentRunTime.innerText = getHHMMSS(MEDIA_PLAYER.currentTime);
        //update media completion every 30 seconds of active playback
        if (mediaLogCounter == MEDIA_PROGRESS_INTERVEL) {
            //change media progress intervel to 30 seconds
            MEDIA_PROGRESS_INTERVEL = 30;
            //store media completion for user
            var media_id = MEDIA_PLAYER.dataset.mediaId;
            var media_completion = parseFloat((MEDIA_PLAYER.currentTime/MEDIA_PLAYER.duration)*100);
            IRIS_API({
                request:"media-log",
                media_id:media_id,
                completion:media_completion
            });
            //reset media log counter
            mediaLogCounter = 0;
        } else 
            mediaLogCounter++;
        //call media playback functions
        if (completion == 100) 
            mediaFinished();
        if (completion >= 91 && !mediaNearComplition_Flag) {
            mediaAboutToFinish();
            //user notified of compltion
            //update flag
            mediaNearComplition_Flag = true;
        }
    } else {
        //update pause button if media short-cut is used
        let pause = document.querySelector("#media-player #pause");
        if (pause.innerText != icon_play)
            pause.innerHTML = icon_play;
    }
}
mediaBuffering = function() {
    var mediaReadyState = setTimeout(() => {
        if (MEDIA_PLAYER.readyState != 4) {
            document.getElementById("media-prompt").classList.toggle("loading");
            var loopMediaReadyState = setInterval(() => {
                if (MEDIA_PLAYER.readyState == 4) {
                    document.getElementById("media-prompt").classList.toggle("loading");                
                    //movie ready clear loop
                    clearInterval(loopMediaReadyState);
                }
            }, 1000);
        }
        clearTimeout(mediaReadyState);
    }, 1000);
}
function setRuntime() {
    var previousMediaCompltion = parseFloat(MEDIA_PLAYER.dataset.mediaPreviousCompletion);
    var completion = MEDIA_PLAYER.duration*(previousMediaCompltion/100);
    MEDIA_PLAYER.currentTime = completion;
    mediaBuffering();
}
function mediaCompletion() {
    var media_completion = MEDIA_PLAYER.dataset.mediaPreviousCompletion;
    if (media_completion !== undefined) {
        completionPercentage = parseInt(media_completion);
        modal = new Modal({
            preset:"controls",
            position:"bottom-left"
        }, {
            "continue" : {
                "text": "Continue",
                "icon":icon_history,
                "onFocus": controlFocused,
                "onUnfocused": controlUnfocused,
                "callBack": setRuntime,
                "type": "button"
            }
        });
        modal.Show(5000);
    }
}
function getHHMMSS(seonds) {
    return (new Date(seonds * 1000).toISOString().substr(11, 8));
}
function mediaControlShow() {
    var controls = document.getElementById("controls");
    controls.classList.remove("controls-hide");
    controls.classList.add("controls-show");
}
function mediaControlHide() {
    var controls = document.getElementById("controls");
    controls.classList.remove("controls-show");
    controls.classList.add("controls-hide");
}
mediaControlFocused = function() {
    const theme = getPlayerTheme();
    //show media controls on control focus
    mediaControlShow();
    //reset timer for hidding controls after 3 seconds of inactivity
    clearTimeout(mediaControlTimer);
    mediaControlTimer = setTimeout(mediaControlHide, 3000);
    this.style.background = theme.control.focused;
}
mediaControlUnfocused = function() {
    const theme = getPlayerTheme();
    this.style.background = theme.control.unfocused;
}
mediaControlSelected = function() {
    let control = this.id;
    switch (control) {
        case "back":
            back();
            break;
        case "previous":
            previous();
            break;
        case "fast-backward":
            fastBackward();
            break;
        case "pause":
            togglePause();
            break;
        case "fast-forward":
            fastForward();
            break;
        case "next":
            next();
        break;
    }
}
function mediaAboutToFinish(){
    //media about to finish notify next media on playlist
    if(getPlaylist().head != null) {
        //identify current media playing
        var media_id = MEDIA_PLAYER.dataset.mediaId;
        var node = queryPlaylist(media_id);
        var media;
        //playing media not in playlist, play first media on playlist
        if (node == null) 
            media = getMediaDetails(getPlaylist().head.data.dataset.mediaRef);
        else {
            //get precedng media if any
            if (node.right != null)
                media = getMediaDetails(node.right.data.dataset.mediaRef);
        }
        //identify precedding media and notify user
        if (media.type == "movie") {
            //set title of preceding media
            let title = media.title;
            //notify user for upcoming media
            notification(title,null,null,true,icon_film,5000);
        } else {
            let series = getMediaDetails(media.seriesID);
            let series_title = series.title;
            let nextEpisode = "Season "+media.season+" &middot; "+"Episode "+media.episode;
            let episode_title = media.title;
            //notify user for upcoming media
            notification(series_title,nextEpisode,episode_title,true,icon_tv,5000);
        }
    }
}
function mediaFinished(){
    //media finished playing
    //reset controls
    clearInterval(this.runtime);
    //stop media
    togglePause();
    //play next media on playlist
    next();
}
//media preview component
function stopMediaPreview() {
    var preview = document.getElementById("preview");
    var previewPlayer = preview.querySelector("video");
    previewPlayer.removeAttribute("src");
}
function updateMediaPreview(media_id) {
    var preview = section.querySelector("#preview");
    const previewPlayer = preview.querySelector("video");
    //set media dack drop
    var mediaDetails = getMediaDetails(media_id);
    previewPlayer.poster = mediaDetails.backdrop;
    // const colorThief = new ColorThief();
    // const img = new Image();
    // img.crossOrigin = 'Anonymous';
    // img.src = mediaDetails.Backdrop;
    // // Make sure image is finished loading
    // img.addEventListener('load', function() {
    //     colorThief.getColor(img);
    //   });
    //details.style.backgroundImage = "url("+mediaDetails.Backdrop+")";
    //previewMedia(media_id);
}
function previewMedia(media_id) {
    var preview = section.querySelector("#preview");
    var previewPlayer = preview.querySelector("video");
    previewPlayer.setAttribute("src",getMediaURI(media_id));
    previewPlayer.addEventListener("loadedmetadata", function() {
        //set start time of previewer
        var starttime = this.duration / 3;
        this.currentTime = starttime;
        //set volume to 0 to smooth out volume before play
        this.volume = 0.0;
        this.play();
        var volume = setInterval(() => {
            if (previewPlayer.readyState == 4) {
                if (previewPlayer.volume >= 0.9)
                    clearInterval(volume);
                else 
                    previewPlayer.volume += 0.1;
            }
        }, 600);
        //smooth fade out volume 
        //play media preview for only 30 seconds
        var endtime = starttime + 30;
        previewRuntime = setInterval(() => {
            var preview = document.getElementById("preview");
            var previewPlayer = preview.querySelector("video");
            if (previewPlayer.currentTime >= endtime) {
                previewPlayer.removeAttribute("src");
                previewPlayer.load();
                clearInterval(previewRuntime);
            }
        }, 1000);
    },false);
}
//media playback controls
function back(){
    togglePlayer();
}
function previous() {
    //check media player state incase secondary control was accessed
    if (MEDIA_PLAYER_ACTIVITY.classList.contains("media-player-show")) {
        if(getPlaylist().head != null) {
            //identify playing media on playlist
            var media = document.querySelector("video");
            var node;
            for (node = getPlaylist().head; node != null; node = node.right) {
                if (node.data.dataset.mediaRef == media.innerHTML) {
                    //play precedng media if any
                    if (node.left != null) {
                        node.left.data.dispatchEvent(new Event("selected"));
                        break;
                    }
                    else
                        notification("end of playlist",null,null,false);
                }
            }
            //playing media not in playlist, play first media on playlist
            if(node == null) 
                getPlaylist().head.data.dispatchEvent(new Event("selected"));
        } else {
            //playlist empty
            notification("you'r playlist is empty",null,null,false);
        }
    }
}
function next(){
    //check media player state incase secondary control was accessed
    if (MEDIA_PLAYER_ACTIVITY.classList.contains("media-player-show")) {
        if(getPlaylist().head != null) {
            //identify playing media on playlist
            let node;
            for (node = getPlaylist().head; node != null; node = node.right) {
                if (node.data.dataset.mediaRef == MEDIA_PLAYER.dataset.mediaId) {
                    //play precedng media if any
                    if (node.right != null) {
                        togglePause();
                        node.right.data.dispatchEvent(new Event("selected"));
                        break;
                    }
                    else
                        notification("end of playlist",null,null,false);
                }
            }
            //playing media not in playlist, play first media on playlist
            if(node == null) 
                getPlaylist().head.data.dispatchEvent(new Event("selected"));
        } else
            //playlist empty
            notification("you'r playlist is empty",null,null,false);
    }
}
function fastForward(){
    MEDIA_PLAYER.currentTime += 30;
}
function fastBackward(){
    MEDIA_PLAYER.currentTime -= 10;
}
function togglePause() {
    //check media player state incase secondary control was accessed
    if (MEDIA_PLAYER_ACTIVITY.classList.contains("media-player-show")) {
        let pause = document.querySelector("#media-player #pause");
        if (isPlaying) {
            MEDIA_PLAYER.pause();
            console.log("paused");
            pause.innerHTML = icon_play;
            isPlaying = false;
        } else {
            var seekbar = document.getElementById("completionBar");
            //rest media progress and prepare for replay
            if (seekbar.style.width == "100%"){
                seekbar.style.width = "0%";
                MEDIA_PLAYER.currentTime = 0;
                initMediaPlayerSeek();
            }
            MEDIA_PLAYER.play();
            console.log("playing");
            pause.innerHTML = icon_pause;
            isPlaying = true;
        }
    }
}
//playlist
function initPLaylist() {    
    //remove playlist from media player layout
    for(var node = this.playerLayout.head; node != null; node = node.right)
        node.bottom = null;
    for(var node = this.playerLayout.head; node != null; node = node.left)
        node.bottom = null;
    if (getPlaylist().head != null) {
        //add playlist to media player layout
        this.playerLayout.setContextFlow(this.playerLayout.head, getPlaylist());
    } 
}
function renderPlaylist() {
    let playlist = document.querySelector("#playlist .media-list");
    let controls = document.getElementById("controls");
    if (getPlaylist().head != null) {
        //playlist isnt empty resize controls
        controls.style.top = "43%";
        for (let node = getPlaylist().head; node != null; node = node.right)
            appendList(node.data, playlist);
    } else
        //playlist is empty resize media player controls
        controls.style.top = "73%";
}
function derenderPlaylist(){
    var playlist = document.querySelector("#playlist .media-list");
    playlist.innerHTML = "";
}
function queryPlaylist(media_id) {
    //get active playlist
    let playlist = getPlaylist();
    //search for media on playlist
    for (var node = playlist.head; node != null; node = node.right)
        if (node.data.dataset.mediaRef == media_id)
            return node;
    return null;
}
function removeFromPlaylist(media) {
    //search for media on playlist
    let queryResult = queryPlaylist(media.dataset.mediaRef);
    //remove from playlist
    if (queryResult !== null) {
        playlist.Remove(media.dataset.mediaRef);
        initPLaylist();
        updateSecondaryControls(media.dataset.mediaRef);
        notification("movie removed from playlist",null,null);
    } else 
        notification("movie not in playlist",null,null,false);
}
function setActiveEpisode(episode) {
    //update media player navigation (if not already)
    let player = this.playerLayout.head;
    let playlist = player.bottom;
    let episode_list = null;
    //navigate to first episode on list
    for(let node = playlist; node != null; node = node.left)
        episode_list = node;
    //set downward context swtich    
    for(let node = episode_list; node != null; node = node.right) {
        if (node.data == episode)
            //set upwards context switch
            for(let control = player; control != null; control = control.right)
                control.bottom = node;
        let episodeContainer = node.data.querySelector(".episode");
        //update previous episode
        if (episodeContainer.classList.contains("active-episode")) {
            episodeContainer.classList.remove("active-episode");
            episodeContainer.style.background = "rgba(0, 0, 0, 0.808)";
        }
    }
    //set background color to active episode
    let episodeCard = episode.querySelector(".episode");
    episodeCard.classList.add("active-episode");
    episodeCard.style.background = "rgba(201, 57, 57, 0.8)";
}

appendPlaylist = function(media = null) {
    if (media == null)
        media = getActiveLayout().activeNode.data;
    if (media.dataset.mediaRef !== undefined) {
        //search for media on playlist
        let queryResult = queryPlaylist(media.dataset.mediaRef);
        //check if media is not currently on list
        if (queryResult !== null) 
            notification("movie already in playlist",null,null,false);
        else {
            //create media node
            var mediainfo = getMediaDetails(media.dataset.mediaRef);
            //create movie card
            var media_card = document.createElement("li");
            media_card.classList.add("media-card");
            var movie_poster = document.createElement("img");
            movie_poster.src = mediainfo.poster;
            media_card.appendChild(movie_poster);
            media_card.dataset.mediaRef = mediainfo.imdb_id;
            //attach click event lister and handler to media card
            media_card.addEventListener("focused",mediaFocused);
            media_card.addEventListener("unfocused",mediaUnfocused);
            media_card.addEventListener("selected",mediaSelected);
            //append list to playlist
            playlist.Append(media_card);
            //reinitilize playlist
            initPLaylist();
            //update secondary reffernce controls
            updateSecondaryControls(media.dataset.mediaRef);
            notification("movie added to playlist",null,null,true);
        }
    } 
}
appendEpisode = function(episode) {
    //create movie card
    var media_card = document.createElement("li");
    media_card.classList.add("media-card");
    let episodeContainer = document.createElement("div");
    episodeContainer.classList.add("episode");
    //episode numer
    let episode_season = document.createElement("p");
    episode_season.classList.add("season-episode");
    episode_season.innerHTML = "Episode "+episode.episode+" &middot; ";
    //episode duration
    let episode_duration = document.createElement("span");
    episode_duration.classList.add("episode-runtime");
    episode_duration.innerHTML = episode.runtime;
    episode_season.appendChild(episode_duration);
    episodeContainer.appendChild(episode_season);
    //episode title
    let episode_title = document.createElement("p");
    episode_title.classList.add("episode-title");
    episode_title.innerHTML = episode.title;
    episodeContainer.appendChild(episode_title);
    //episode plot
    let episode_plot = document.createElement("p");
    episode_plot.classList.add("episode-plot");
    episode_plot.innerHTML = episode.plot;
    episodeContainer.appendChild(episode_plot);
    //append episode to media card container
    media_card.appendChild(episodeContainer);
    //add media id to media card
    media_card.dataset.mediaRef = episode.imdb_id;
    //attach click event lister and handler to media card
    media_card.addEventListener("focused",mediaFocused);
    media_card.addEventListener("unfocused",mediaUnfocused);
    media_card.addEventListener("selected",mediaSelected);
    //append list to playlist
    this.episodes.Append(media_card);
}
function playEpisode(episode) {
    const media_id = episode.dataset.mediaRef;
    //identify media
    setActiveEpisode(episode);
    let media = encodeMediaURI(media_id);
    //set media id of continuing media
    MEDIA_PLAYER.dataset.mediaId = media_id;
    MEDIA_PLAYER = MEDIA_PLAYER_ACTIVITY.querySelector("video");
    MEDIA_PLAYER.setAttribute("src",media);
    MEDIA_PLAYER.setAttribute("type","video/mp4");  
    //intilize media player
    initMediaPlayer();
}
function playSeries(media_id) {
    //get users current season (start with season 1 by default)
    const query = {
        "request":"media",
        "filter":{
            series_id:media_id,
            type:"episode",
            sort:["season","episode"]
        }
    };
    const episode_list = IRIS_API(query,false,true,appendEpisode);
    //empty out current playlist
    this.episodes = new List("episode");
    //append episodes to playlist
    episode_list.forEach(episode => {appendEpisode(episode)});
    //update active media refference based on user completion
    if (MEDIA_PLAYER.dataset.mediaId === undefined)
        //set starting episode to first episode of first season
        MEDIA_PLAYER.dataset.mediaId = episode_list[0].imdb_id;
    //set current season and episode
    let episodeDetails = getMediaDetails(MEDIA_PLAYER.dataset.mediaId);
    let currentEpisode = episodeDetails.episode;
    let currentSeason = episodeDetails.season;
    //set episode to play
    let media = getMediaDetails(MEDIA_PLAYER.dataset.mediaId).url;
    MEDIA_PLAYER = MEDIA_PLAYER_ACTIVITY.querySelector("video");
    MEDIA_PLAYER.setAttribute("src",media);
    MEDIA_PLAYER.setAttribute("type","video/mp4");  
    //intilize media player
    initMediaPlayer();
    //scroll episode list to active episode
    let playlist = document.querySelector("#playlist .media-list");
    let episodeList = playlist.getElementsByTagName("li");
    let seasonCount = 0;
    let episode_position = 0;
    let episodeCounter = 0;
    episode_list.forEach(episode => {
        const Season = parseInt(episode.season);
        const Episode = parseInt(episode.episode);
        //add season header
        if (Season != seasonCount) {
            let h4 = document.createElement("h4");
            h4.innerText = "Season "+Season;
            playlist.insertBefore(h4,episodeList[episodeCounter]);
            //update season count
            seasonCount = Season;
        }
        if (Season <= currentSeason) {
            if (Episode < currentEpisode)
                //increment episode position
                episode_position += 300;
            else
                if (Season == currentSeason && Episode == currentEpisode)
                    setActiveEpisode(episodeList[episodeCounter]);
        }
        //increment episode index
        episodeCounter++;
    });
    //update episode list to center current episode on view port
    playlist.scrollLeft = episode_position;
}
function playMovie(media_id) {
    //identify media
    let media = encodeMediaURI(media_id);
    //set media id of continuing media
    MEDIA_PLAYER.dataset.mediaId = media_id;
    MEDIA_PLAYER = MEDIA_PLAYER_ACTIVITY.querySelector("video");
    MEDIA_PLAYER.setAttribute("src",media);
    MEDIA_PLAYER.setAttribute("type","video/mp4");  
    //intilize media player
    initMediaPlayer();
}

function getPlaylist() {
    switch (mediaType) {
        case "series":
        case "episode":
            return this.episodes;
        default:
            return this.playlist;
    }
}
//find purpose
function mute(media) {
    if (!isMuted) {
        $(media).prop("muted",true);
        this.isMuted = true;
    } else {
        $(media).prop("muted",false);
        this.isMuted = false;
    }
}
function fullscreen(media) {
    if (!isMuted) {
        if (media.requestFullscreen) {
            media.requestFullscreen();
          } else if (media.mozRequestFullScreen) {
            media.mozRequestFullScreen();
          } else if (media.webkitRequestFullscreen) {
            media.webkitRequestFullscreen();
          }
        isFullscreen = true;
    } else {
        isFullscreen = false;
    }
}