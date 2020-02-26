/*
 * Facefont - Copyright 2020
 *
 * Content script
 * @author: Stéphane Kouadio <stephan.kouadio@gmail.com>
 */

const BUILD_VERSION = "10";

const Facefont_statusClass = ".userContent";

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
        if (!this.preferences.enableFacefont) {
            return;
        }

        this.startTextSizeProcessing();
        //TODO: add additionnal steps for startup
    },

    startTextSizeProcessing() {
        if (!this.preferences.enableTxtSize) {
            return;
        }

        this.parseDocument(Facefont_statusClass);
    },

    createStyleElement(css) {

        const STYLE_ID = "facefont__style";
        const LINK_ID = "facefont__link";

        const head = document.head || document.getElementsByTagName('head')[0];

        // Create link item <link href="https://fonts.googleapis.com/css?family=Oxygen" rel="stylesheet">
        if (!document.getElementById(LINK_ID)) {
            const link = document.createElement('link');
            link.id = LINK_ID;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css?family=Lato|Open+Sans|Oxygen|Nunito|Alegreya+Sans|Alegreya';
            head.appendChild(link);
        }

        // Create style item
        const styleElement = document.getElementById(STYLE_ID);
        if (styleElement) {
            styleElement.remove();
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;

        style.setAttribute('type', 'text/css');
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

        const css = `
        ${statusClassName} {
            font-size: ${textSize}px !important;
            ${fontFamily}
        }
        
        `;

        this.createStyleElement(css);
    }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // request is an object!
    const changedPreference = request.changedPreference;
    // Update preference
    for (let pName in changedPreference) {
        Facefont.preferences[pName] = changedPreference[pName];
    }

    // Change CSS Text node //FIXME
    Facefont.parseDocument(Facefont_statusClass);
    sendResponse({}); // snub them.
});


// TODO: use tree walker
Facefont.startup();
