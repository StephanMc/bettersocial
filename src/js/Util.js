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
        chrome.tabs.create({url});
    },


    openOrFocusPage(linkToOpen, isPopupWindow = true) {
        const optionsUrl = linkToOpen;

        chrome.tabs.query({lastFocusedWindow: true}, extensionTabs => {

            for (let i = 0; i < extensionTabs.length; i++) {
                if (normalizeUrl(optionsUrl) === normalizeUrl(extensionTabs[i].url)) {
                    chrome.tabs.update(extensionTabs[i].id, {"highlighted": true, "active": true}, (updatedTab) => {
                        chrome.windows.update(updatedTab.windowId, {focused: true});

                    });
                    if (isPopupWindow) {
                        window.close();
                    }
                    return;
                }
            }

            chrome.tabs.create({url: optionsUrl});
        });
    }
};

function normalizeUrl(url) {
    return url.replace(/^(.+)\/$/, "$1");
}

export default Util;
