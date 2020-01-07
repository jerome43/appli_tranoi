/**
 * Pour stocker en localstorage les statistiques d'utilisation
 */
const track = {

    addMapInteraction: function() {
        if (chrome.storage !== undefined) {
            chrome.storage.local.get(['tranoiTrackingIndex'], function(result) {
                //console.log('addMapInteraction ', result);
                if (result.tranoiTrackingIndex) {
                    //console.log('tranoiTrackingIndex is ', result.tranoiTrackingIndex);
                    const newIndex= result.tranoiTrackingIndex;
                    newIndex.map++;
                    chrome.storage.local.set({tranoiTrackingIndex: newIndex }, function() {
                    });
                }
                else {
                    //console.log('tranoiTrackingIndex first index');
                    chrome.storage.local.set({tranoiTrackingIndex: {map:1, menu:0, navigation:0, partenaire:0, clavier:0}}, function() {
                    });
                }
            });
        }
    },

    addMenuInteraction: function() {
        if (chrome.storage !== undefined) {
            chrome.storage.local.get(['tranoiTrackingIndex'], function(result) {
                //console.log('addMenuInteraction ', result);
                if (result.tranoiTrackingIndex) {
                    //console.log('tranoiTrackingIndex is ', result.tranoiTrackingIndex);
                    const newIndex= result.tranoiTrackingIndex;
                    newIndex.menu++;
                    chrome.storage.local.set({tranoiTrackingIndex: newIndex }, function() {
                    });
                }
                else {
                    //console.log('tranoiTrackingIndex first index');
                    chrome.storage.local.set({tranoiTrackingIndex: {map:0, menu:1, navigation:0, partenaire:0, clavier:0}}, function() {
                    });
                }
            });
        }
    },

    addNavigationInteraction: function() {
        if (chrome.storage !== undefined) {
            chrome.storage.local.get(['tranoiTrackingIndex'], function(result) {
                //console.log('addNavigationInteraction ', result);
                if (result.tranoiTrackingIndex) {
                    //console.log('tranoiTrackingIndex is ', result.tranoiTrackingIndex);
                    const newIndex= result.tranoiTrackingIndex;
                    newIndex.navigation++;
                    chrome.storage.local.set({tranoiTrackingIndex: newIndex }, function() {
                    });
                }
                else {
                    //console.log('tranoiTrackingIndex first index');
                    chrome.storage.local.set({tranoiTrackingIndex: {map:0, menu:0, navigation:1, partenaire:0, clavier:0}}, function() {
                    });
                }
            });
        }
    },

    addPartenaireInteraction: function() {
        if (chrome.storage !== undefined) {
            chrome.storage.local.get(['tranoiTrackingIndex'], function(result) {
                //console.log('addPartenaireInteraction ', result);
                if (result.tranoiTrackingIndex) {
                    //console.log('tranoiTrackingIndex is ', result.tranoiTrackingIndex);
                    const newIndex= result.tranoiTrackingIndex;
                    newIndex.partenaire++;
                    chrome.storage.local.set({tranoiTrackingIndex: newIndex }, function() {
                    });
                }
                else {
                    //console.log('tranoiTrackingIndex first index');
                    chrome.storage.local.set({tranoiTrackingIndex: {map:0, menu:0, navigation:0, partenaire:1, clavier:0}}, function() {
                    });
                }
            });
        }
    },

    addClavierInteraction: function() {
        if (chrome.storage !== undefined) {
            chrome.storage.local.get(['tranoiTrackingIndex'], function(result) {
                //console.log('addClavierInteraction ', result);
                if (result.tranoiTrackingIndex) {
                    //console.log('tranoiTrackingIndex is ', result.tranoiTrackingIndex);
                    const newIndex= result.tranoiTrackingIndex;
                    newIndex.clavier++;
                    chrome.storage.local.set({tranoiTrackingIndex: newIndex }, function() {
                    });
                }
                else {
                    //console.log('tranoiTrackingIndex first index');
                    chrome.storage.local.set({tranoiTrackingIndex: {map:0, menu:0, navigation:0, partenaire:0, clavier:1}}, function() {
                    });
                }
            });
        }
    }
};