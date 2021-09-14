//navigation system of the application
//The app navigates through direction of mouse movement
//Imitating native TV applications navigation
//Control schema
/*
    TV NAVIGATION   DESKTOP NAVIGATION      ACTION
    Mouse ArrowUp       Up Key              Navigate Top
    Mouse ArrowDown     Down Key            Navigate Down
    Mouse ArrowLeft     Left Key            Navigate Left
    Mouse ArrowRight    Right Key           Navigate Right
    Mouse Click         Enter Key           Select Focused Element
    Double Mouse Click  Plus Key            Add media to playlist
    Teletext            Tab                 Switch Context
*/
var oldx = 0;
var oldy = 0;
var modalLayout = null,
    searchLayout = null, 
    homeLayout = null, 
    playerLayout = null, 
    profileLoginLayout = null, 
    moviesLayout = null, 
    seriesLayout = null, 
    libraryLayout = null,
    settingsLayout = null;
//custoem event flags
var mediaUpdateFlag = true;

function initLayout() {
    //initilize media plyer layout
    _initUserLogin();
    _initMediaPlayer();
    //initilize sections
    //_initSearch();
    _initHome();
    _initMovies();
    _initSeries();
    //_initLibrary();
    //_initSettings();
}
//activity layout
function _initUserLogin() {
    //NOTE: USER LOGIN LAYOUT REQUIRES USER PROFILES TO BE RENDERED
    profileActivity();
    //layout navigation
    profileLoginLayout = new List("login-Layout");
    var profile = document.getElementById("user-profiles");
    var profiles = profile.getElementsByTagName("li");
    for (var index = 0; index < profiles.length; index++)
        profileLoginLayout.Append(profiles[index]);
    //set active node to head element
    profileLoginLayout.activeNode = profileLoginLayout.head;
    profileLoginLayout.activeNode.data.dispatchEvent(new Event("focused"));
    //attach request event on activity
    document.getElementById("profile-login").addEventListener("requested",profileActivity);
}
function _initMediaPlayer() {
    MEDIA_PLAYER_ACTIVITY = document.getElementById("media-player");
    MEDIA_PLAYER = MEDIA_PLAYER_ACTIVITY.querySelector("video");
    //load user playlist and setup autoplay and playlist view and navigation
    playlist = new List("playlist");
    //get media controls list
    var menu = document.querySelector("#media-player #playback #navigation");
    var items = menu.getElementsByTagName("button");
    this.playerLayout = new List("media-player");
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",mediaControlFocused);
        items[index].addEventListener("unfocused",mediaControlUnfocused);
        items[index].addEventListener("selected",mediaControlSelected);
        playerLayout.Append(items[index]);
    }
    //set active node to pause
    for (var node = this.playerLayout.head; node != null; node = node.right)
        if (node.data.id == "pause")
            this.playerLayout.activeNode = node;
}
function _initSearch() {
    //initilize menu navigation
    var menu = document.getElementById("menu-list");
    var items = menu.getElementsByTagName("li");
    this.searchLayout = new List("menu");
    //create menu list
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",navFocused);
        items[index].addEventListener("unfocused",navUnfocused);
        items[index].addEventListener("selected",navSelected);
        //intilize section navigations
        this.searchLayout.AppendInverted(items[index]);
    }
    //intilize secondary controls 
    menu = document.getElementById("secondary-controls");
    items = menu.getElementsByTagName("button");
    var controls = new List("secondary-controls");
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",controlFocused);
        items[index].addEventListener("unfocused",controlUnfocused);
        items[index].addEventListener("selected",controlSelected);
        controls.Append(items[index]);
    }
    this.searchLayout.setContextSwitch(controls);
    //attach request event on activity
    document.getElementById("search").addEventListener("requested",searchActivity);
}
function _initHome() {
    //initilize menu navigation
    var menu = document.getElementById("menu-list");
    var items = menu.getElementsByTagName("li");
    homeLayout = new List("Home-Layout");
    //create menu list
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",navFocused);
        items[index].addEventListener("unfocused",navUnfocused);
        items[index].addEventListener("selected",navSelected);
        //intilize section navigations
        homeLayout.AppendInverted(items[index]);
    }
    //intilize secondary controls
    home = document.getElementById("home");
    var secondaryControls = home.querySelector("#secondary-controls");
    items = secondaryControls.getElementsByTagName("button");
    var controls = new List("secondary-controls");
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",controlFocused);
        items[index].addEventListener("unfocused",controlUnfocused);
        items[index].addEventListener("selected",controlSelected);
        controls.Append(items[index]);
    }
    homeLayout.setContextSwitch(controls);
    //attach request event on activity
    document.getElementById("home").addEventListener("requested",homeActivity);
}
function _initMovies(){
    //initilize menu navigation
    var menu = document.getElementById("menu-list");
    var items = menu.getElementsByTagName("li");
    moviesLayout = new List("Movies-Layout");
    //create menu list
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",navFocused);
        items[index].addEventListener("unfocused",navUnfocused);
        items[index].addEventListener("selected",navSelected);
        //intilize section navigations
        moviesLayout.AppendInverted(items[index]);
    }
    //intilize secondary controls
    movies = document.getElementById("movies");
    var secondaryControls = movies.querySelector("#secondary-controls");
    items = secondaryControls.getElementsByTagName("button");
    var controls = new List("secondary-controls");
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",controlFocused);
        items[index].addEventListener("unfocused",controlUnfocused);
        items[index].addEventListener("selected",controlSelected);
        controls.Append(items[index]);
    }
    moviesLayout.setContextSwitch(controls);
    //attach request event on activity
    document.getElementById("movies").addEventListener("requested",moviesActivity);
}
function _initSeries(){
    //initilize menu navigation
    var menu = document.getElementById("menu-list");
    var items = menu.getElementsByTagName("li");
    seriesLayout = new List("Movies-Layout");
    //create menu list
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",navFocused);
        items[index].addEventListener("unfocused",navUnfocused);
        items[index].addEventListener("selected",navSelected);
        //intilize section navigations
        seriesLayout.AppendInverted(items[index]);
    }
    //intilize secondary controls
    series = document.getElementById("series");
    var secondaryControls = series.querySelector("#secondary-controls");
    items = secondaryControls.getElementsByTagName("button");
    var controls = new List("secondary-controls");
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",controlFocused);
        items[index].addEventListener("unfocused",controlUnfocused);
        items[index].addEventListener("selected",controlSelected);
        controls.Append(items[index]);
    }
    seriesLayout.setContextSwitch(controls);
    //attach request event on activity
    document.getElementById("series").addEventListener("requested",seriesActivity);
}
function _initLibrary(){
    //initilize menu navigation
    var menu = document.getElementById("menu-list");
    var items = menu.getElementsByTagName("li");
    libraryLayout = new List("menu");
    //create menu list
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",navFocused);
        items[index].addEventListener("unfocused",navUnfocused);
        items[index].addEventListener("selected",navSelected);
        //intilize section navigations
        libraryLayout.AppendInverted(items[index]);
    }
    //intilize secondary controls 
    menu = document.getElementById("secondary-controls");
    items = menu.getElementsByTagName("button");
    var controls = new List("secondary-controls");
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",controlFocused);
        items[index].addEventListener("unfocused",controlUnfocused);
        items[index].addEventListener("selected",controlSelected);
        controls.Append(items[index]);
    }
    libraryLayout.setContextSwitch(controls);
    //attach request event on activity
    document.getElementById("library").addEventListener("requested",libraryActivity);
}
function _initSettings(){
    //initilize menu navigation
    var menu = document.getElementById("menu-list");
    var items = menu.getElementsByTagName("li");
    this.settingsLayout = new List("menu");
    //create menu list
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",navFocused);
        items[index].addEventListener("unfocused",navUnfocused);
        items[index].addEventListener("selected",navSelected);
        //intilize section navigations
        this.settingsLayout.AppendInverted(items[index]);
    }
    //intilize secondary controls 
    menu = document.getElementById("secondary-controls");
    items = menu.getElementsByTagName("button");
    var controls = new List("secondary-controls");
    for (var index = 0; index < items.length; index++) {
        items[index].addEventListener("focused",controlFocused);
        items[index].addEventListener("unfocused",controlUnfocused);
        items[index].addEventListener("selected",controlSelected);
        controls.Append(items[index]);
    }
    this.settingsLayout.setContextSwitch(controls);
    //attach request event on activity
    document.getElementById("settings").addEventListener("requested",settingsActivity);
}
function appendLayout(list) {
    var lastNode = getActiveLayout().activeNode;
    var items = list.getElementsByTagName("li");
    var currentNodeCount = 1;
    //navigate to beginning of list
    while (items[0] != lastNode.data) {lastNode = lastNode.left;}
    //count number of nodes and navigate to end of list
    while (lastNode.right != null) {
        currentNodeCount++;
        lastNode = lastNode.right;
    }
    //append list
    for (var index = currentNodeCount; index < items.length; index++) {
        let node = new Node(items[index]);
        lastNode.right = node;
        lastNode.right.left = lastNode;
        //update last node
        lastNode = lastNode.right;
    }
}
function addLayout(list) {
    //get media controls list
    var items = list.getElementsByTagName("li");
    var NewList = new List("media-list");
    var currentLayout = getActiveLayout();
    for (var index = 0; index < items.length; index++)
        NewList.Append(items[index]);
    //set layouts active element to first element on
    //dynamic list
    if (currentLayout != null && currentLayout.activeNode == null)
        getActiveLayout().activeNode = items[index];
    if (currentLayout != null && currentLayout.id != "login-Layout")
        getActiveLayout().setContextSwitch(NewList);
}
function switchLayout(newLayout) {
    if (newLayout != "home") {
        var nextLayout = getActiveLayout(newLayout);
        //search for active nav link
        for (var nav = nextLayout.head; nav != null; nav = nav.bottom)
            if (nav.data.id == "btn"+newLayout)
                nextLayout.activeNode = nav;
    }
    activeLayout = newLayout;
}
class Node {
    constructor(data) {
        this.data = data;
        this.right = null;
        this.left = null;
        this.bottom = null; //links to list bottom of current list
        this.top = null; //links to list top of current list
    }
}
class List {
    constructor(id = null) {
        this.id = id;
        this.head = null;
        this.tail = null;
        this.activeNode = null;
    }
    get activeElement() {
        return this.activeNode.data;
    }
}
List.prototype.getActiveElement = function(filter = null) {
    if (filter == null)
        return this.activeNode.data;
    if (this.activeNode.data.classList.contains(filter))
        return this.activeNode.data;
    else {
        //search layout for requested element
        if (this.head.data.classList.contains(filter))
            return this.head.data;
        if (this.head.right.data.classList.contains(filter))
            return this.head.right.data;
        if  (this.head.right.bottom.data.classList.contains(filter))
            return this.head.right.bottom.data;
    }
}
List.prototype.Append = function(data) {
    let node = new Node(data);
    if (this.head == null) {
        this.head = node;
        this.head.left = null; //change to head of menu list
    } else {
        this.tail.right = node;
        this.tail.right.left = this.tail;
    }
    this.tail = node;
    this.tail.right = null;
}
List.prototype.Remove = function(data) {
    //check right half
    for (var node = this.head; node != null; node = node.right) {
        if (node.data.dataset.mediaRef == data) {
            if (node.left != null)
                node.left.right = node.right;
            if (node.right != null)
                node.right.left = node.left;
            //update head
            if (node.right == null  && node.left == null)
                this.head = null;
            else if (node.right != null && node.left == null)
                this.head = node.right;
            node = null;
            return true;
        }
    }
    return false;
}
List.prototype.AppendInverted = function(data) {
    let node = new Node(data);
    if (this.head == null) {
        this.head = node;
        this.head.top = null; //change to head of menu list
    } else {
        this.tail.bottom = node;
        this.tail.bottom.top = this.tail;
    }
    this.tail = node;
    this.tail.bottom = null;
}
List.prototype.setContextFlow = function(parent,child) {
    if (parent.bottom != null) {
        this.setContextFlow(parent.bottom,child);
    } else {
        //set downward context swtich
        for(let node = parent; node != null; node = node.right)
            node.bottom = child.head;
        //set upwards context switch
        for(let node = child.head; node != null; node = node.right)
            node.top = parent;   
        //set menu context switch
        if (this.id != "media-player") {
            child.head.left = this.head;   
        }    
        //set initial active for navigation
        if (this.activeNode == null && parent.top == null)
            this.activeNode = child.head;
    }
}
List.prototype.setContextSwitch = function(list) {
    if (this.head.right != null) {
        this.setContextFlow(this.head.right,list);
    } else {
        //set the right context
        for(let node = this.head; node != null; node = node.bottom)
            node.right = list.head;
        //set left context
        this.head.right.left = this.head;
    }
}
List.prototype.contextSwitch = function(){
    this.removeFocus();
    //set active node to head of he secondary controls or side menu
    //depending on the active node
    this.activeNode = this.activeNode.top == null ? this.head : this.head.right;
    //set focus to active node
    this.setFocus();
}
List.prototype.callToAction = function() {
    var selectedNode = this.activeElement;
    var eventData = this.activeNode.top == null && selectedNode.classList.contains("secondary-option") ? {detail: this.activeNode.bottom.data} : null;
    selectedNode.dispatchEvent(new CustomEvent("selected",eventData));
}
List.prototype.scrollLeft = function() {
    var activeNode = this.activeElement;
    if (activeNode.classList.contains("media-card"))
        activeNode.parentElement.scrollLeft -= activeNode.offsetWidth;
};
List.prototype.scrollRight = function() {
    var activeNode = this.activeElement;
    if (activeNode.classList.contains("media-card")) 
        activeNode.parentElement.scrollLeft += activeNode.offsetWidth;
};
List.prototype.scrollBottom = function() {
    var activeNode = this.activeElement;
    if (activeNode.classList.contains("media-card"))
        activeNode.parentElement.parentElement
            .parentElement.scrollTop += (activeNode.offsetHeight+15);
}
List.prototype.scrollTop = function() {
    var activeNode = this.activeElement;
    if (activeNode.classList.contains("media-card"))
    activeNode.parentElement.parentElement
        .parentElement.scrollTop -= (activeNode.offsetHeight+15);
}
List.prototype.rememberNode = function() {
    //update secondary controls flow
    if (this.activeNode.top != null) {
        if (this.activeNode.top.top != null)
            for (var node = this.head.right; node != null; node = node.right)
                node.bottom = this.activeNode;
    }
    //update upwards flow
    for (var node = this.activeNode.top; node != null; node = node.right)
        node.bottom = this.activeNode;
    //update downwards flow
    if (this.activeNode.bottom != null && this.activeNode.top != null) {
        for (var node = this.activeNode.bottom; node != null; node = node.right)
            node.top = this.activeNode;
        for (var node = this.activeNode.bottom.left; node != null; node = node.left)
            node.top = this.activeNode;
    }
}
List.prototype.setFocus = function() {
    var activeNode = this.activeElement;
    if (!activeNode.classList.contains("nav-item")) {
        //media card at focus
        this.rememberNode(); 
    } 
    activeNode.dispatchEvent(new Event('focused'));
}
List.prototype.removeFocus = function(){
    var activeNode = this.activeElement;
    activeNode.dispatchEvent(new Event('unfocused'));
}
List.prototype.right = function() {
    if (this.activeNode.right != null) {
        this.removeFocus();
        this.activeNode = this.activeNode.right;
        this.scrollRight();
        this.setFocus();
        //echo event for custome handling of end of collection
        if (this.activeNode.right != null) {
            if (this.activeNode.right.right == null) {
                if (this.activeNode.data.parentElement.classList.contains("media-list")) {
                    var collection = this.activeNode.data.parentElement.parentElement;
                    collection.dispatchEvent(new Event("collection-expand"));
                }
            }
        }
    }
}
List.prototype.left = function() {
    if (this.activeNode.left != null) {
        this.removeFocus();
        this.activeNode = this.activeNode.left;
        this.scrollLeft();
        this.setFocus();
    }
}
List.prototype.top = function() {
    if (this.activeNode.top != null) {
        DISPATCH_COLLECIONSWITCH(this.activeNode.data,this.activeNode.top.data);
        this.removeFocus();
        this.scrollTop();
        this.activeNode = this.activeNode.top;
        this.setFocus();
    }
}
List.prototype.bottom = function() {
    if (this.activeNode.bottom != null) {
        this.removeFocus();
        this.scrollBottom();
        DISPATCH_COLLECIONSWITCH(this.activeNode.data,this.activeNode.bottom.data);
        this.activeNode = this.activeNode.bottom;
        this.setFocus();
        //echo event for custome handling of end of collection
        if (this.activeNode.bottom != null) {
            if (this.activeNode.bottom.bottom == null) {
                let grid = this.activeNode.data.parentElement.parentElement;
                grid.dispatchEvent(new Event("collection-expand"));
            }
        }
    }
}
function getActiveLayout(layout = null) {
    if (layout == null)
        layout = activeLayout;
    switch (layout) {
        case "modal":
            return modalLayout;
        case "MEDIA_PLAYER":
            return playerLayout;
        case "profile-login":
            return profileLoginLayout;
        case "search":
            return searchLayout;
        case "home":
            return homeLayout;
        case "movies":
            return moviesLayout;
        case "series":
            return seriesLayout;
        case "library":
            return libraryLayout;
        case "settings":
            return settingsLayout;
    }
}
function setActiveLayout(layout) {
    switch (layout) {
        case "modal":
            modalLayout = layout;
            return modalLayout;
        case "mediaPlayer":
            playerLayout = layout;
            return playerLayout;
        case "profile-login":
            profileLoginLayout = layout;
            return profileLoginLayout;
        case "search":
            searchLayout = layout;
            return searchLayout;
        case "home":
            homeLayout = layout;
            return homeLayout;
        case "movies":
            moviesLayout = layout;
            return moviesLayout;
        case "series":
            seriesLayout = layout;
            return seriesLayout;
        case "library":
            libraryLayout = layout;
            return libraryLayout;
        case "settings":
            settingsLayout = layout;
            return settingsLayout;
    }
}
DISPATCH_COLLECIONSWITCH = function(currentElement, nextElement) {
    let isNavigationScope = nextElement.parentElement.parentElement.parentElement;
    isNavigationScope = isNavigationScope.classList.contains("media-navigation") ?
        true : false;
    //collection reffernces
    var currentCollection = currentElement.parentElement.parentElement;
    var nextCollection = nextElement.parentElement.parentElement;
    if (currentCollection != nextCollection && isNavigationScope) {
        currentCollection.dispatchEvent(new Event("collection-unfocused"));
        nextCollection.dispatchEvent(new Event("collection-focused"));
    }
}
MOUSEMOVE_EVENT = function (event) {
    if (event.pageX > oldx && event.pageY == oldy) {
        getActiveLayout().right();
    }
    else if (event.pageX == oldx && event.pageY > oldy) {
        getActiveLayout().bottom();
    }
    else if (event.pageX == oldx && event.pageY < oldy) {
        getActiveLayout().top();
    }
    else if (event.pageX < oldx && event.pageY == oldy) {
        getActiveLayout().left();
    }
    oldx = event.pageX;
    oldy = event.pageY;       
}
KEYDOWN_EVENT = function(event) {
    if ((event.key == 'ArrowUp') || (event.keyCode == 38))
        getActiveLayout().top();
    else if ((event.key == 'ArrowDown') || (event.keyCode == 40))
        getActiveLayout().bottom();
    else if ((event.key == 'ArrowLeft') || (event.keyCode == 37))
        getActiveLayout().left();
    else if ((event.key == 'ArrowRight') || (event.keyCode == 39))
        getActiveLayout().right();
    else if ((event.key == 'Enter') || (event.keyCode == 13))
        getActiveLayout().callToAction();
    else if ((event.key == 'MediaPlayPause') || (event.keyCode == 179))
        togglePause();
    else if ((event.key == 'MediaTrackPrevious') || (event.keyCode == 177))
        previous();
    else if ((event.key == 'MediaTrackNext') || (event.keyCode == 176)) {
        next();
    } else if ((event.key == 'Teletext') || (event.key == "Shift") || (event.keyCode == 16)) {
        if (activeLayout != "mediaPlayer" && activeLayout != "profileLogin") {
            getActiveLayout().contextSwitch();
        }
    } else if ((event.key == '+') || (event.keyCode == 107))
        appendPlaylist();
    else if ((event.key == 'Subtitle')) 
        notification("Subtitle not yet supported",null,null,false);
}
jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
    return this.each(function(){
      var clicks = 0, self = this;
      jQuery(this).click(function(event){
        clicks++;
        if (clicks == 1) {
          setTimeout(function(){
            if(clicks == 1) {
              single_click_callback.call(self, event);
            } else {
              double_click_callback.call(self, event);
            }
            clicks = 0;
          }, timeout || 300);
        }
      });
    });
}
document.addEventListener('mousemove', MOUSEMOVE_EVENT);
document.addEventListener('keydown',KEYDOWN_EVENT);
$(document).single_double_click(function () { getActiveLayout().callToAction(); }, function () { appendPlaylist(); });