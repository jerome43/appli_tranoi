'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

const FILES_TO_CACHE = [
    'index.html',
    'controler/clavierGG.js',
    'controler/mainController.js',
    'controler/mapG.jss',
    'controler/menuGG.js',
    'controler/navigation.jss',
    'controler/track.jss',
    'css/app.css',
    'css/normalize.css',
    'data/cdl_foyer.csv',
    'data/cdl_gd.csv',
    'data/cdl_lenotre.csv',
    'data/ListeMap.xml',
    'data/listing.csv',
    'data/pb_etage.csv',
    'data/pb_rdc.csv',
    'fonts/FontAwesome.otf',
    'fonts/PatronWEB-Light.ttf',
    'fonts/PatronWEB-Medium.ttf',
    'fonts/PatronWEB-Regular.ttf',
    'image/icons/icon-128.png',
    'image/icons/icon-512.png',
    'image/maps/cdl_foyer.webp',
    'image/maps/cdl_gd.webp',
    'image/maps/cdl_lenotre.webp',
    'image/maps/pb_etage.webp',
    'image/maps/pb_rdc.webp',
    'image/maps/Tranoi_planParisTel.webp',
    'image/thumbnails/Bourse.png',
    'image/thumbnails/carreauThumbnail.png',
    'image/thumbnails/cite.png',
    'image/thumbnails/Louvre.png',
    'image/accueil.png',
    'image/backgroundMixte.png',
    'image/Close.png',
    'image/favicon.ico',
    'image/flecheMenu40.png',
    'image/flecheMenu60.png',
    'image/LOGO-TRANOI-BLANC.png',
    'image/LOGO-TRANOI-NOIR.png',
    'image/puceJewel.png',
    'image/puceMixte.png',
    'image/puceNew.png',
    'image/puceNormal.png',
    'image/puceOnlyAtTranoi.png',
    'library/hammer.js',
    'library/papaparse.min.js',
    'library/phaser.min.js'
];

self.addEventListener('install', (evt) => {
    console.log('[ServiceWorker] Install');
    // CODELAB: Precache static resources here.
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline page');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
    console.log('[ServiceWorker] Activate');
    // CODELAB: Remove previous cached data from disk.
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    console.log('[ServiceWorker] Fetch', evt.request.url);
    // CODELAB: Add fetch event handler here.
    if (evt.request.mode !== 'navigate') {
        // Not a page navigation, bail.
        return;
    }
    evt.respondWith(
        fetch(evt.request)
            .catch(() => {
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match('index.html');
                    });
            })
    );

});

