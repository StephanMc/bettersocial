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

// console.log({SettingsManager})

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

        console.log("startup finished")
    },

    installMessageListener: function () {
        const _that = this;
        let notificationsManager = this.getNotificationsManager();
        console.log("notificationsManagerrrr", notificationsManager)
        console.log("NotifiNotificationsManager", notificationsManager.getDefaultAudioURL())
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

    // installNotificationClickListener: function() {
    //     chrome.notifications.onClicked.addListener(function(notifId) {
    //         FacefontBg.openInNewTab(FacefontBg.onNotificationClickUrl);
    //     });
    //     chrome.notifications.onClosed.addListener(function(notifId, byUser) {
    //         if (FacefontBg.isFirstTimeNotifCalled) {
    //             FacefontBg.isFirstTimeNotifCalled = false;
    //         }
    //     });
    // },
    // stopNotifWorker: function() {
    //     FacefontBg.updateUINotifCount(0);
    //     this.notificationWorker.terminate();
    //     this.notificationWorker = null;

    //     this.notificationBundle.lastNotifId = "";
    //     this.notificationBundle.lastMsgId = "";
    //     this.notificationBundle.lastRequestId = "";
    // }

    // initNotificationIcon: function() {
    //     if (!this.getPreference("enableFacefont") || !this.getPreference("useNotif"))
    //         this.updateUINotifCount(0); // Show 'Notif disabled' in menu.

    //     chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    // },

    // tryParseValue: function(value) {
    //     try {
    //         return JSON.parse(value);
    //     } catch (e) {
    //         return value;
    //     }
    // },

    // getPreference: function(pName) {
    //     if (localStorage[pName] !== undefined) return this.tryParseValue(localStorage[pName]);
    //     return this.tryParseValue((localStorage[pName] = this.defaultPreferences[pName]));
    // },

    // setPreference: function(pName, pValue) {
    //     localStorage[pName] = pValue;

    //     // Switch cases for preferences
    //     if (pName === "useNotif" || pName === "enableFacefont") {
    //         if (pValue == false) this.stopNotifWorker();
    //         else this.runNotificationProcess();
    //     }
    // },

    // saveAllPreferences: function(request) {
    //     for (var field in request) {
    //         if (field === "wish") continue;
    //         this.setPreference(field, request[field]);
    //     }
    // },

    // buildAllPrefResponseObject: function() {
    //     var obj = {};
    //     for (var field in FacefontBg.defaultPreferences) {
    //         obj[field] = this.getPreference(field);
    //     }
    //     return obj;
    // },

    /*
     * Notification Handler
     */
    // runNotificationProcess: function() {
    //     if (!this.getPreference("enableFacefont")) {
    //         return;
    //     }

    //     if (this.notificationWorker == null) {
    //         FacefontBg.startNotifWorker();
    //     }
    // }

    // startNotifWorker: function() {
    //     if (!this.getPreference("useNotif")) return;

    //     if (this.notificationWorker == null) {
    //         // This starts the worker!
    //         this.notificationWorker = new Worker(Util.getJSDir() + "notification.js");

    //         this.notificationWorker.onmessage = function(event) {
    //             var objResponse = {
    //                 xhrResponseText: event.data
    //             };
    //             FacefontBg.processGetNotificationsCount(objResponse);
    //         };
    //     }
    // },

    // updateUINotifCount: function(count) {
    //     this.notificationBundle.notifCounter = count;
    //     if (!localStorage["useNotif"] || count == 0) {
    //         chrome.browserAction.setBadgeText({ text: "" });
    //     } else {
    //         chrome.browserAction.setBadgeText({ text: "" + count });
    //     }
    // },

    // doPlay: function() {
    //     // Lecture effective
    //     if (this.audioResource == null) {
    //         this.audioResource = new Audio();
    //         this.audioResource.src = DEFAULT_MUSIC_URL;
    //     }

    //     if (this.audioResource.paused) {
    //         this.audioResource.play();
    //     }
    // },

    // playMusic: function() {
    //     var _this = FacefontBg;
    //     if (!_this.getPreference("enableAudio")) {
    //         return;
    //     }

    //     _this.doPlay();
    // }

    // processGetNotificationsCount: function(objResponse) {
    //     var n = 0,
    //         notifCounter = 0,
    //         msgCounter = 0,
    //         requestCounter = 0;
    //     try {
    //         var parser = new DOMParser();
    //         var mdoc = parser.parseFromString(objResponse.xhrResponseText, "text/html");

    //         // Notifs
    //         var alls = mdoc.getElementById("notifications_jewel");
    //         if (alls && (alls = alls.querySelector('a span[data-sigil="count"]')))
    //             n = notifCounter = parseInt(alls.firstChild.textContent);

    //         // Msg
    //         alls = mdoc.getElementById("messages_jewel");
    //         if (alls && (alls = alls.querySelector('a span[data-sigil="count"]')))
    //             n += msgCounter = parseInt(alls.firstChild.textContent);

    //         // Demandes
    //         alls = mdoc.getElementById("requests_jewel");
    //         if (alls && (alls = alls.querySelector('a span[data-sigil="count"]')))
    //             n += requestCounter = parseInt(alls.firstChild.textContent);

    //         FacefontBg.updateUINotifCount(n);
    //         if (n > 0) {
    //             this.tryPopupNotifications(notifCounter, msgCounter, requestCounter, mdoc);
    //         }
    //     } catch (e) {
    //         console.log(e);
    //         FacefontBg.updateUINotifCount(0);
    //     }
    // }

    // tryPopupNotifications: function(notifCounter, msgCounter, requestCounter, mdoc) {
    //     var notificationBundle = this.notificationBundle;
    //     var totalNotif = notifCounter + msgCounter + requestCounter;

    //     if (this.firstPopupHasRun == false) {
    //         this.firstPopupHasRun = true;

    //         this.checkIsOnFacebook(function(isOnFacebook) {
    //             if (!isOnFacebook) doPopupNewNotificationsCount(totalNotif);
    //         });
    //         // (FIXME) Removing next line will do this behavior : after notif of "all" (doNewNotif()),
    //         // will be popup-ed again the latest notification. By adding this below, there will be not
    //         // second notification

    //         //FacefontBg.tryFillNotificationData(notifCounter, msgCounter, requestCounter, mdoc);

    //         // setTimeout(function() {
    //         //     FacefontBg.isFirstTimeNotifCalled = false;
    //         // }, 10000);
    //     } else {
    //         var stringText = null;
    //         stringText = FacefontBg.tryFillNotificationData(
    //             notifCounter,
    //             msgCounter,
    //             requestCounter,
    //             mdoc
    //         );

    //         if (stringText != null) {
    //             this.checkIsOnFacebook(function(isOnFacebook) {
    //                 if (!isOnFacebook) {
    //                     doPopup(
    //                         L("NOTIFPOPUP_NOALL_TITLE"),
    //                         stringText,
    //                         true,
    //                         "https://www.facebook.com"
    //                     );
    //                     FacefontBg.playMusic();
    //                 }
    //             });
    //         }
    //     }

    //     function doPopupNewNotificationsCount(totalNotif) {
    //         var title =
    //             totalNotif +
    //             " " +
    //             L(totalNotif == 1 ? "NOTIFPOPUP_ALL_TITLE_ONE" : "NOTIFPOPUP_ALL_TITLE_MANY");

    //         var text =
    //             L("NOTIFPOPUP_ALL_YOU_HAVE") +
    //             " " +
    //             totalNotif +
    //             " " +
    //             L(
    //                 totalNotif == 1
    //                     ? "NOTIFPOPUP_ALL_NOTIFS_ON_FB_ONE"
    //                     : "NOTIFPOPUP_ALL_NOTIFS_ON_FB_MANY"
    //             );
    //         doPopup(title, text, true, "https://www.facebook.com");
    //     }

    //     function doPopup(title, text, textClickable, urlToClick) {
    //         FacefontBg.onNotificationClickUrl = urlToClick;
    //         var options = {};
    //         options.type = "basic";
    //         options.iconUrl = chrome.extension.getURL("/skin/facebook48.png");
    //         options.message = text;
    //         options.title = title;

    //         chrome.notifications.create("", options, function(notifId) {});
    //     }
    // },

    // tryFillNotificationData: function(notifCounter, msgCounter, requestCounter, mdoc) {
    //     var notificationBundle = this.notificationBundle;
    //     var alls = null;
    //     var stringText = "";
    //     // Notifs
    //     if (notifCounter > 0) {
    //         alls = mdoc.querySelector(
    //             '#notifications_jewel div ol[data-sigil="contents"] li[data-sigil] div'
    //         );
    //         if (alls != null) {
    //             alls = alls.parentNode;
    //             var fill =
    //                 alls.querySelector(".blueName") !== null &&
    //                 notificationBundle.lastNotifId !== alls.id;
    //             if (fill) {
    //                 notificationBundle.lastNotifId = alls.id;
    //                 notificationBundle.lastNotifFullText = alls.textContent;
    //                 var divNode = alls.querySelector(".blueName").parentNode;
    //                 var text = divNode.textContent;

    //                 stringText = text + "\n";
    //             }
    //         }
    //     }

    //     if (msgCounter > 0) {
    //         // Msg.
    //         alls = mdoc.querySelector(
    //             '#messages_jewel div ol[data-sigil="contents"] li div.messages-flyout-item'
    //         );
    //         if (alls != null && alls.className.match(/\baclb\b/)) {
    //             // First msg not read yet
    //             if (notificationBundle.lastMsgId !== alls.id) {
    //                 notificationBundle.lastMsgId = alls.id;
    //                 stringText +=
    //                     L("NOTIFPOPUP_NOALL_NEWMSG_OF") +
    //                     " " +
    //                     alls.querySelector(".thread-title").firstChild.firstChild.textContent +
    //                     "\n";
    //             }
    //         }
    //     }

    //     if (requestCounter > 0) {
    //         // Msg.
    //         alls = mdoc.getElementById("friend_requests_section_jewel");
    //         if (alls != null) {
    //             // First msg not read yet
    //             var actor = alls.querySelector(".actor").firstChild.textContent;
    //             alls = alls.querySelector("div[id^='m_jewel_req_']");

    //             if (notificationBundle.lastRequestId !== alls.id) {
    //                 notificationBundle.lastRequestId = alls.id;
    //                 stringText += actor + " " + L("NOTIFPOPUP_NOALL_NEWREQUEST") + "\n";
    //             }
    //         }
    //     }

    //     if (stringText == "") return null;

    //     return stringText;
    // }
};

window.FacefontBg = FacefontBg;
window.requireLoader = requireLoader;

//requireLoader.util().counter++
FacefontBg.startup();
