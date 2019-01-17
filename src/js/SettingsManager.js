import {hot} from "react-hot-loader";

const notificationsManager = () => chrome.extension.getBackgroundPage().requireLoader.notificationsManager();

class SettingsManager {
    currentDeveloperName;

    availableFonts = {
        safeWeb: [
            {title: "Arial", family: 'Arial, Helvetica, sans-serif'},
            {title: "Arial Black", family: '"Arial Black", Gadget, sans-serif'},
            {title: "Comic Sans MS", family: '"Comic Sans MS", cursive, sans-serif'},
            {title: "Impact", family: 'Impact, Charcoal, sans-serif'},
            {title: "Lucida Sans", family: '"Lucida Sans Unicode", "Lucida Grande", sans-serif'},
            {title: "Tahoma", family: 'Tahoma, Geneva, sans-serif'},
            {title: "Trebuchet", family: '"Trebuchet MS", Helvetica, sans-serif'},
            {title: "Verdana", family: 'Verdana, Geneva, sans-serif'},

            {title: "Courier New", family: '"Courier New", Courier, monospace'},
            {title: "Lucida Console", family: '"Lucida Console", Monaco, monospace'},
        ]
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
        //TODO: make content scripts know about that; with chrome.tabs.query (facebookurl).sendMessage(prefChange, with the newPref object, which is current localStorage)
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
