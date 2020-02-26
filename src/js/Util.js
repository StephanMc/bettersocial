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
                callback(tabs[0].url);
            }
        });
    },

    checkIsOnFacebook(callback) {
        this.getUrlOfCurrentTab(function (urlResult) {
            callback(/^https?:\/\/.*\.facebook.com\//.test(urlResult));
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
                    chrome.windows.update(extensionTabs[i].windowId, {"focused": true}, () => {
                        chrome.tabs.update(extensionTabs[i].id, {"highlighted": true, "active": true}, (updatedTab) => {
                        });
                    });

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
