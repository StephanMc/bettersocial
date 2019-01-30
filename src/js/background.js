import '../img/icon-128.png'
import '../img/icon-32.png'
import '../img/icon-48.png'
import '../img/icon-16.png'
//



// import NotificationsManager from "../js/NotificationsManager"
// import SettingsManager from "../js/SettingsManager"
// const SettingsManager = requireSettingsManager()
const requireLoader = {
    settingsManager: () => require("../js/SettingsManager").default,
    notificationsManager: () => require("../js/NotificationsManager").default,
    util: () => require("../js/Util").default,
};

// Defined only in this scope and not in global object scope

const BUILD_VERSION = chrome.app.getDetails().version; // Version in manifest

export const FacefontBg = {

    version: BUILD_VERSION,
    notificationBundle: {
        lastNotifId: null,
        lastRequestId: null,
        lastMsgId: null,
        notifCounter: 0,
        lastTime: ""
    },
    audioResource: null,
    audioTimer: null,
    isFirstTimeNotifCalled: true,
    firstPopupHasRun: false,
    onNotificationClickUrl: "https://www.facebook.com",
    notificationWorker: null,

    getNotificationsManager() {
        return requireLoader.notificationsManager();
    },

    getSettingsManager() {
        return requireLoader.settingsManager()
    },

    // getDefaultAudioURL: function () {
    //     return DEFAULT_MUSIC_URL;
    // },
    /*
     Callback is called once taburl is got
    */
    // getUrlOfTab: function(callback) {
    //     chrome.tabs.query({ active: true }, function(tabs) {
    //         if (callback) {
    //             callback(tabs[0].url);
    //         }
    //     });
    // },

    // getJSDir: function() {
    //     var rootdir = chrome.extension.getURL("");
    //     return rootdir + "content/js/";
    // },

    // checkIsOnFacebook: function(callback) {
    //     this.getUrlOfTab((urlResult) => {
    //         callback(/^https?:\/\/.*\.facebook.com\//.test(urlResult));
    //     });
    // },

    // openInNewTab: function(url) {
    //     var newURL = url;
    //     chrome.tabs.create({ url: newURL });
    // },

    startup: function () {
        // Checks weither it is necessary to inject cs in tabs
        // on first install or upgrade
        this.installMessageListener();

        this.getNotificationsManager().installNotificationClickListener();
        this.getNotificationsManager().initNotificationIcon();
        this.getNotificationsManager().runNotificationProcess();

    },

    installMessageListener: function () {
        const _that = this;
        let notificationsManager = this.getNotificationsManager();
        // Request Listener
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.wish) {
                case "loadAllPreferences": // This case is called each time FB is (re)loaded
                    sendResponse(_that.getSettingsManager().buildAllPrefResponseObject());
                    break;

                case "loadOnePreference":
                    const data = _that.getSettingsManager().getPreference(request.prefName);
                    const response = {
                        prefName: request.prefName,
                        prefValue: data
                    };

                    sendResponse(response);
                    break;
                //FIXME: Check if called from content script
                case "saveAllPreferences":
                    _that.getSettingsManager().saveAllPreferences(request);
                    sendResponse({});
                    break;

                case "saveOnePreference":
                    _that.getSettingsManager().setPreference(request.prefName, request.prefValue);
                    sendResponse({});
                    break;
                default:
                    sendResponse({});
                    break;
            }
        });
    }

};

window.FacefontBg = FacefontBg;
window.requireLoader = requireLoader;


/**
 * Add your Analytics tracking ID here.
 */
var _AnalyticsCode = 'UA-133422200-1';


/**
 * Below is a modified version of the Google Analytics asynchronous tracking
 * code snippet.  It has been modified to pull the HTTPS version of ga.js
 * instead of the default HTTP version.  It is recommended that you use this
 * snippet instead of the standard tracking snippet provided when setting up
 * a Google Analytics account.
 */
var _gaq = _gaq || [];

_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);
window._gaq = _gaq;
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();


FacefontBg.startup();
