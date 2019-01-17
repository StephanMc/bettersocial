/*
 * Facefont - Copyright 2018
 *
 * Content script
 * @author: Stéphane Kouadio <stephan.kouadio@gmail.com>
 */

const BUILD_VERSION = "9.0";

const Facefont_statusClass = ".userContent";
const Facefont_statusClassOthers = "messageBody";
const Facefont_streamClass = "uiStreamMessage";

const Facefont_oldStatusClass = "uiStreamMessage";
const Facefont_newStatusClass = "messageBody";


export const Facefont = {
    preferences: {
        // Preferences
        enableFacefont: true,
        firstRun: true,
        textSize: "14",
        //useNotif      : true,
        oldTextSize: "", // Contains the old textsize before update to new
        enableTxtSize: true,
    },


    // Core
    prefs: null,
    notificationWorker: null,

    // Meta data
    version: BUILD_VERSION,

    // Timers
    textSizeTimer: null,
    //notifTimer    : null,

    getCssDir() {
        return chrome.extension.getURL("");
    },

    /*-----------------------------------------------------------*/
    startup() {
        // Load preferences. Ask to background
        this.requestAllPreferencesLoad();

        /*
        All next initialisations are done once Facefont preferences are loaded.
        @See requestAllPreferencesLoad

        this.initImgDir();

        this.runFacefont();
        */
    },

    requestAllPreferencesLoad() {
        chrome.runtime.sendMessage({wish: "loadAllPreferences"}, (response) => {
            // Load preferences
            this.loadPreferences(response);
            this.runFacefont();
        });
    },

    loadPreferences(response) {
        for (let field in response) {
            Facefont.preferences[field] = response[field];
        }
    },

    // Instanciate timers at startup.
    runFacefont() {
        if (!this.preferences.enableFacefont) return;

        if (this.textSizeTimer == null) {
            this.startTextSizeProcessing();
        }
        //TODO: add additionnal steps for startup
    },

    startTextSizeProcessing() {
        if (!this.preferences.enableTxtSize) return;

        if (this.textSizeTimer == null) {
            this.textSizeTimer = window.setTimeout(() => {
                this.parseDocument(Facefont_statusClass);
                // this.parseDocument(Facefont_streamClass);
                // this.parseDocument("aboveUnitContent"); // Shared Links in Timeline
                // this.parseDocument("messageBody");
            }, 800);
        }
    },

    // installSmileysTextArea : function()
    // {
    //     Facefont_TextArea.installSmileysTextArea() ;
    // },

    createStyleElement(css) {

        const STYLE_ID = "facefont__style";
        let styleElement = document.getElementById(STYLE_ID);
        if (styleElement) {
            //TODO: should remove the node
            styleElement.remove();
        }

        const head = document.head || document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.id = STYLE_ID

        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);

    },

    parseDocument(statusClassName) {

        // TODO: add link item with textsize for performance
        const textSize = this.preferences.textSize;
        let fontFamily = this.preferences.fontFamily || "";

        // Set by user
        if (fontFamily) {
            fontFamily = "font-family: " + fontFamily + " !important;"
        }
        // Do not parse if Facefont has already size 14
        if (textSize == "14" && this.preferences.oldTextSize == "") return;

        const content = window; // for compatibility ! fixme: no more needed
        if (!content || !content.document) return;
        else if (!content.document.location.href.match(/^https?:\/\/.*facebook.com\/.*/))
            return;


        const css = `
        ${statusClassName} {
            font-size: ${textSize}px !important;
            ${fontFamily}
        }
        
        `

        this.createStyleElement(css);

        /*
        var statuts = null;

        statuts = content.document.getElementsByClassName(statusClassName);
        if (!statuts) return;

        // var mb = statusClassName == "messageBody";

        this.nbStatuts = statuts.length;
        var currentStatus = null;
        for (var i = 0; i < this.nbStatuts; i++) {
            currentStatus = statuts[i];
            // if (mb && currentStatus.firstChild.nodeName == "DIV") continue; // Ignore non-text-element nodes

            if (currentStatus.facefont_parsed === textSize) continue;
            else {
                currentStatus.style.fontSize = textSize + "px";
                currentStatus.facefont_parsed = textSize;
                console.log("-- " + statusClassName)
            }
        }
        */
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // request is an object
    const changedPreference = request.changedPreference
    // Update preference
    for (let pName in changedPreference) {
        Facefont.preferences[pName] = changedPreference[pName]
    }

    // Change CSS Text node //FIXME
    Facefont.parseDocument(Facefont_statusClass);
    sendResponse({}); // snub them.
});


// TODO: use tree walker
Facefont.startup();
