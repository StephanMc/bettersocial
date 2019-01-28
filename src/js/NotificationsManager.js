const settingsManager = () => chrome.extension.getBackgroundPage().requireLoader.settingsManager();
import Util from "./Util";

const DEFAULT_MUSIC_URL = chrome.extension.getURL("/default.mp3");

class NotificationsManager {
    notificationBundle = {
        lastNotifId: null,
        lastRequestId: null,
        lastMsgId: null,
        notifCounter: 0,
        lastTime: ""
    };

    notificationWorker = null;
    isFirstTimeNotifCalled = true;

    audioResource = null;
    audioTimer = null;
    firstPopupHasRun = false;
    onNotificationClickUrl = "https://www.facebook.com";

    BUILD_VERSION = chrome.app.getDetails().version; // Version in manifest
    DEFAULT_MUSIC_URL = chrome.extension.getURL("/default.mp3");

    // getJSDir() {
    //     const rootdir = chrome.extension.getURL("");
    //     return rootdir + "content/js/";
    // }

    getDefaultAudioURL() {
        return this.DEFAULT_MUSIC_URL;
    }

    runNotificationProcess() {
        if (!settingsManager().getPreference("enableFacefont")) {
            return;
        }

        if (this.notificationWorker == null) {
            this.startNotifWorker();
        }
    }

    startNotifWorker() {
        if (!settingsManager().getPreference("useNotif")) {
            return;
        }

        if (this.notificationWorker == null) {
            // This starts the worker!

            // const notificationFile = Util.getJSDir() + "notification.bundle.js";
            const notificationFile = Util.getJSDir() + "notification.js";
            this.notificationWorker = new Worker(notificationFile);

            this.notificationWorker.onmessage = event => {
                const objResponse = {
                    xhrResponseText: event.data
                };
                this.processGetNotificationsCount(objResponse);
            };
        }
    }

    stopNotifWorker() {
        this.updateUINotifCount(0);
        this.notificationWorker.terminate();
        this.notificationWorker = null;

        this.notificationBundle.lastNotifId = "";
        this.notificationBundle.lastMsgId = "";
        this.notificationBundle.lastRequestId = "";
    }

    initNotificationIcon() {
        if (!settingsManager().getPreference("enableFacefont") || !settingsManager().getPreference("useNotif")) {
            this.updateUINotifCount(0); // Show 'Notif disabled' in menu.
        }

        chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
    }

    updateUINotifCount(count) {
        // count = 1
        this.notificationBundle.notifCounter = count;
        if (!localStorage["useNotif"] || count == 0) {
            chrome.browserAction.setBadgeText({text: ""});
        } else {
            chrome.browserAction.setBadgeText({text: "" + count});
        }
    }

    getNotificationCount() {
        return this.notificationBundle.notifCounter || 0;
    }

    getNotificationClickUrl() {
        return this.onNotificationClickUrl;
    }

    installNotificationClickListener() {
        const _that = this;

        chrome.notifications.onClicked.addListener(notifId => {
            Util.openInNewTab(_that.onNotificationClickUrl);
        });

        chrome.notifications.onClosed.addListener((notifId, byUser) => {
            if (this.isFirstTimeNotifCalled) {
                this.isFirstTimeNotifCalled = false;
            }
        });
    }

    doPlay() {
        // Efective play
        if (this.audioResource == null) {
            this.audioResource = new Audio();
            this.audioResource.src = DEFAULT_MUSIC_URL;
        }

        if (this.audioResource.paused) {
            this.audioResource.play();
        }
    }

    playMusic() {
        if (!settingsManager().getPreference("enableAudio")) {
            return;
        }

        this.doPlay();
    }

    processGetNotificationsCount(objResponse) {
        var n = 0,
            notifCounter = 0,
            msgCounter = 0,
            requestCounter = 0;
        try {
            var parser = new DOMParser();
            var mdoc = parser.parseFromString(objResponse.xhrResponseText, "text/html");

            // Notifs
            var alls = mdoc.getElementById("notifications_jewel");
            if (alls && (alls = alls.querySelector('a span[data-sigil="count"]')))
                n = notifCounter = parseInt(alls.firstChild.textContent);

            // Msg
            alls = mdoc.getElementById("messages_jewel");
            if (alls && (alls = alls.querySelector('a span[data-sigil="count"]')))
                n += msgCounter = parseInt(alls.firstChild.textContent);

            // Demandes
            alls = mdoc.getElementById("requests_jewel");
            if (alls && (alls = alls.querySelector('a span[data-sigil="count"]')))
                n += requestCounter = parseInt(alls.firstChild.textContent);

            this.updateUINotifCount(n);
            if (n > 0) {
                this.tryPopupNotifications(notifCounter, msgCounter, requestCounter, mdoc);
            }
        } catch (e) {
            this.updateUINotifCount(0);
        }
    }

    tryPopupNotifications(notifCounter, msgCounter, requestCounter, mdoc) {
        var notificationBundle = this.notificationBundle;
        var totalNotif = notifCounter + msgCounter + requestCounter;

        if (this.firstPopupHasRun == false) {
            this.firstPopupHasRun = true;

            Util.checkIsOnFacebook(isOnFacebook => {
                if (!isOnFacebook) {
                    this.doPopupNewNotificationsCount(totalNotif);
                }
            });
            // (FIXME) Removing next line will do this behavior : after notif of "all" (doNewNotif()),
            // will be popup-ed again the latest notification. By adding this below, there will be not
            // second notification

            //FacefontBg.tryFillNotificationData(notifCounter, msgCounter, requestCounter, mdoc);

            // setTimeout(function() {
            //     FacefontBg.isFirstTimeNotifCalled = false;
            // }, 10000);
        } else {
            let stringText = null;
            stringText = this.tryFillNotificationData(notifCounter, msgCounter, requestCounter, mdoc);

            if (stringText != null) {
                Util.checkIsOnFacebook(isOnFacebook => {
                    if (!isOnFacebook) {
                        this.doPopup(
                            Util.localize("NOTIFPOPUP_NOALL_TITLE"),
                            stringText,
                            true,
                            "https://www.facebook.com"
                        );

                    }
                });
            }
        }
    }

    doPopupNewNotificationsCount(totalNotif) {
        const title =
            totalNotif +
            " " +
            Util.localize(totalNotif == 1 ? "NOTIFPOPUP_ALL_TITLE_ONE" : "NOTIFPOPUP_ALL_TITLE_MANY");

        const text =
            Util.localize("NOTIFPOPUP_ALL_YOU_HAVE") +
            " " +
            totalNotif +
            " " +
            Util.localize(totalNotif == 1 ? "NOTIFPOPUP_ALL_NOTIFS_ON_FB_ONE" : "NOTIFPOPUP_ALL_NOTIFS_ON_FB_MANY");
        this.doPopup(title, text, true, "https://www.facebook.com");
    }

    doPopup(title, text, textClickable, urlToClick) {

        this.onNotificationClickUrl = urlToClick;
        const options = {};
        options.type = "basic";
        options.iconUrl = chrome.extension.getURL("/icon-48.png");
        options.message = text;
        options.title = title;

        chrome.notifications.create("", options, notifId => {
        });

        this.playMusic();
    }

    tryFillNotificationData(notifCounter, msgCounter, requestCounter, mdoc) {
        const notificationBundle = this.notificationBundle;
        let alls = null;
        let stringText = "";
        // Notifs
        if (notifCounter > 0) {
            alls = mdoc.querySelector('#notifications_jewel div ol[data-sigil="contents"] li[data-sigil] div');
            if (alls != null) {
                alls = alls.parentNode;
                const fill = alls.querySelector(".blueName") !== null && notificationBundle.lastNotifId !== alls.id;
                if (fill) {
                    notificationBundle.lastNotifId = alls.id;
                    notificationBundle.lastNotifFullText = alls.textContent;
                    const divNode = alls.querySelector(".blueName").parentNode;
                    const text = divNode.textContent;

                    stringText = text + "\n";
                }
            }
        }

        if (msgCounter > 0) {
            // Msg.
            alls = mdoc.querySelector('#messages_jewel div ol[data-sigil="contents"] li div.messages-flyout-item');
            if (alls != null && alls.className.match(/\baclb\b/)) {
                // First msg not read yet
                if (notificationBundle.lastMsgId !== alls.id) {
                    notificationBundle.lastMsgId = alls.id;
                    stringText +=
                        Util.localize("NOTIFPOPUP_NOALL_NEWMSG_OF") +
                        " " +
                        alls.querySelector(".thread-title").firstChild.firstChild.textContent +
                        "\n";
                }
            }
        }

        if (requestCounter > 0) {
            // Msg.
            alls = mdoc.getElementById("friend_requests_section_jewel");
            if (alls != null) {
                // First msg not read yet
                var actor = alls.querySelector(".actor").firstChild.textContent;
                alls = alls.querySelector("div[id^='m_jewel_req_']");

                if (notificationBundle.lastRequestId !== alls.id) {
                    notificationBundle.lastRequestId = alls.id;
                    stringText += actor + " " + Util.localize("NOTIFPOPUP_NOALL_NEWREQUEST") + "\n";
                }
            }
        }

        if (stringText == "") return null;

        return stringText;
    }
}

export default new NotificationsManager();
