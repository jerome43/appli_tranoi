/**
 * Created by Jérôme on 26/09/2016.
 */
chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html',
        {
            'innerBounds': {
                'width': 1080,
                'height': 1920
            },
            'state':'fullscreen',
            'resizable': false
        });
});