/*
 * Facefont - Copyright 2015
 * 
 * Notification processor
 * @author: Stéphane Kouadio <stephan.kouadio@gmail.com>
 */
const FacefontNotification =
    {
        processGetNotifications: function () {
            const URL = "https://touch.facebook.com/pokes";
            let xhr = null;

            try {
                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if ((xhr.readyState === 4) && (xhr.status === 200)) {
                        postMessage(xhr.responseText);
                    }
                };
                xhr.open("GET", URL, true);
                xhr.send(null);
            } catch (e) {
                postMessage(null);
            }
        }
    };

setInterval(function () {
    FacefontNotification.processGetNotifications();
}, 2300);
