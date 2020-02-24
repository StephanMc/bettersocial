import '../img/icon-128.png'
import '../img/icon-32.png'
import '../img/icon-48.png'
import '../img/icon-16.png'

const requireLoader = {
    settingsManager: () => require("../js/SettingsManager").default,
    notificationsManager: () => require("../js/NotificationsManager").default,
    util: () => require("../js/Util").default,
};

const BUILD_VERSION = chrome.runtime.getManifest().version;

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

//FIXME: Use XHR instead of injecting a script tag
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
