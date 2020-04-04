const Util = {
    counter: 1,

    localize(localeKey) {
        return chrome.i18n.getMessage(localeKey);
    },

    getJSDir() {
        return chrome.extension.getURL("/");
    },

    // TODO: make promise
    getUrlOfCurrentTab(callback) {
        chrome.tabs.query({active: true}, function (tabs) {
            if (callback) {
                callback({tabUrl: tabs[0].url, windowId: tabs[0].windowId});
            }
        });
    },

    /**
     * Checks if the user is currently viewing Facebook.
     * It also requires the current window to be opened.
     */
    checkIsOnFacebook(callback) {
        this.getUrlOfCurrentTab(function (result) {
            const isFacebookUrl = /^https?:\/\/.*\.facebook.com\//.test(result.tabUrl);
            chrome.windows.getCurrent(null, window => {
                callback(isFacebookUrl && window.state !== "minimized");
            });
        });
    },

    openInNewTab(url) {
        chrome.tabs.create({url}, tab => {
            chrome.windows.update(tab.windowId, {focused: true});
        });
    },


    openOrFocusPage(linkToOpen, isPopupWindow = true) {
        chrome.tabs.query({lastFocusedWindow: true}, extensionTabs => {

            for (let i = 0; i < extensionTabs.length; i++) {
                if (normalizeUrl(linkToOpen) === normalizeUrl(extensionTabs[i].url)) {
                    chrome.windows.update(extensionTabs[i].windowId, {"focused": true});
                    chrome.tabs.update(extensionTabs[i].id, {"highlighted": true, "active": true});

                    if (isPopupWindow) {
                        window.close();
                    }
                    return;
                }
            }
            this.openInNewTab(linkToOpen);
        });
    }
};

function normalizeUrl(url) {
    return url.replace(/^(.+)\/$/, "$1");
}

export default Util;
