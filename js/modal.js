class Modal {
    constructor(style,controls) {
        this.style = style;
        this.controls = controls;
        this.setSkeleton();
        //style presets
        this._STYLE = JSON.parse("[]");
        this._STYLE.preset = JSON.parse("[]");
        this._STYLE.preset.controls = ["modal-small"];
        //set modal navigation
        modalLayout = new List("Modal Controls");
    }
    //create modal skeleton
    setSkeleton() {
        this._MODAL = document.createElement("div");
        this._MODAL.id = "modal";
        this._CONTAINER = document.createElement("div");
        this._CONTAINER.id = "container";
        this._CONTROLS = document.createElement("div");
        this._CONTROLS.id = "controls";
        this._CONTAINER.appendChild(this._CONTROLS);
        this._MODAL.appendChild(this._CONTAINER);
    }
    setControls() {
        //cycle through each control as specified on instance
        for (var control in this.controls) {
            let properties = this.controls[control];
            //create control element
            let element = document.createElement(properties.type);
            element.id = control;
            //attach event listers
            element.addEventListener("selected",properties.callBack);        
            //set added navigational events to control (if specified)
            if (properties.onFocus !== undefined)
                element.addEventListener("focused",properties.onFocus);
            if (properties.onUnfocused !== undefined)
                element.addEventListener("unfocused",properties.onUnfocused);
            //set control text
            if (properties.icon !== undefined)
                element.innerHTML = properties.icon+" "+properties.text;
            else 
                element.innerText = properties.text;
            //append to modal controls
            this._CONTROLS.appendChild(element);
            //append button to modal navigation
            modalLayout.Append(element);
            //set acive layout (if not already)
            if (modalLayout.activeNode == null)
                modalLayout.activeNode = modalLayout.head;
        }
    }
    setStyle() {
        //identify modal preset
        if (this.style.preset != undefined) {
            //set modal style
            if (this.style.preset == "controls") {
                //setup modal for basic prompt and control
                for (var style in this._STYLE.preset.controls)
                    this._CONTAINER.classList.add(this._STYLE.preset.controls[style]);
            }
            //set modal position
            if (this.style.position != undefined) {
                if (this.style.position == "top")
                    this._CONTAINER.classList.add("modal-top-middle");
                else if (this.style.position == "top-left")
                    this._CONTAINER.classList.add("modal-top-left");
                else if (this.style.position == "top-right")
                    this._CONTAINER.classList.add("modal-top-right");
                else if (this.style.position == "center")
                    this._CONTAINER.classList.add("modal-middle-middle");
                else if (this.style.position == "center-left")
                    this._CONTAINER.classList.add("modal-middle-left");
                else if (this.style.position == "center-right")
                    this._CONTAINER.classList.add("modal-middle-right");
                else if (this.style.position == "bottom")
                    this._CONTAINER.classList.add("modal-bottom-middle");
                else if (this.style.position == "bottom-left")
                    this._CONTAINER.classList.add("modal-bottom-left");
                else if (this.style.position == "bottom-right")
                    this._CONTAINER.classList.add("modal-bottom-right");
            }
            //
        }
    }
    Show(Timer = null) {
        //store active layout referece
        this.activeLayout = activeLayout;
        //identify controls
        this.setControls();
        //identify styling
        this.setStyle();
        //switch to modal layout
        activeLayout = "modal";
        //attach modal to DOM
        document.querySelector("body").appendChild(this._MODAL);
        //set focus on active node on modal
        modalLayout.activeNode.data.dispatchEvent(new Event("focused"));
        //show modal
        this._MODAL.style.opacity = "1";
        //auto close timer
        if (Timer != null) {
            var close = setTimeout(() => {
                this.Close();
                clearTimeout(close);
            }, Timer);
        }
    }
    Close() {
        //restore active layout
        activeLayout = this.activeLayout;
        //close modal
        this._MODAL.style.opacity = "0";
        //attach modal to DOM
        var closeTimer = setTimeout(() => {
            document.querySelector("body").removeChild(this._MODAL);
            clearTimeout(closeTimer);
        }, 500);
    }
}