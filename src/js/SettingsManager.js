const notificationsManager = () => chrome.extension.getBackgroundPage().requireLoader.notificationsManager();

class SettingsManager {
    currentDeveloperName;

    availableFonts = {
        safeWeb: [
            {title: "Dark", family: '"Arial Black", Gadget, sans-serif'},
            {title: "Funny", family: '"Comic Sans MS", cursive, sans-serif'},
            {title: "Lucida", family: '"Lucida Sans Unicode", "Lucida Grande", sans-serif'},
            {title: "Coder", family: '"Courier New", Courier, monospace'},
            {title: "Geek", family: '"Lucida Console", Monaco, monospace'},

            {title: "Lato", family: 'Lato, sans-serif'},
            {title: "Nunito", family: 'Nunito, sans-serif'},
            {title: "Alegreya", family: '"Alegreya Sans", sans-serif'},
            {title: "Sweet", family: '"Open Sans", sans-serif'},
        ].sort((fontA, fontB) => {
            if (fontA.title < fontB.title) {
                return -1;
            }
            if (fontA.title > fontB.title) {
                return 1;
            }
            return 0;

        })
    }

    defaultPreferences = {
        textSize: "14",
        fontFamily: "",

        smileyStatus: true,
        firstRun: true,
        useNotif: true,
        enableFacefont: true,
        enableTxtSize: true,
        enableAudio: true
    };

    constructor() {
        this.currentDeveloperName = "Stephane Kouadio";
    }

    getSafeWebFonts() {
        return this.availableFonts.safeWeb;
    }

    setDeveloperName(name) {
        this.currentDeveloperName = name;
    }

    getDeveloperName() {
        return this.currentDeveloperName;
    }

    getPreference(pName) {
        if (localStorage[pName] !== undefined) {
            return this.silenceJSONParse(localStorage[pName]);
        }
        return this.silenceJSONParse((localStorage[pName] = this.defaultPreferences[pName]));
    }

    setPreference(pName, pValue) {
        localStorage[pName] = pValue;

        // Switch cases for preferences
        if (pName === "useNotif" || pName === "enableFacefont") {
            if (!pValue) {
                notificationsManager().stopNotifWorker();
            } else {
                notificationsManager().runNotificationProcess();
            }
        }
        // Make content scripts know about that
        chrome.tabs.query({url: "https://*.facebook.com/*"}, (tabs) => {
            tabs.forEach(tab => {
                const changedPreference = {
                    [pName]: pValue
                };
                chrome.tabs.sendMessage(tab.id, {changedPreference}, (responseCallback) => {
                })
            })
        })
    }

    saveAllPreferences(request) {
        for (let field in request) {
            if (field === "wish") {
                continue;
            }
            this.setPreference(field, request[field]);
        }
    }

    buildAllPrefResponseObject() {
        const obj = {};
        for (let field in this.defaultPreferences) {
            obj[field] = this.getPreference(field);
        }
        return obj;
    }

    silenceJSONParse(value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
}

export default new SettingsManager();
