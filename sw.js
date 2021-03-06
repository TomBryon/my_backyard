'use strict';

const PREFIX = 'My Backyard';
const HASH = '0a2b8979'; // Computed at build time.
const OFFLINE_CACHE = `${PREFIX}-${HASH}`;

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(OFFLINE_CACHE).then(function(cache) {
			return cache.addAll([
				'./',
				"./index.html",
				"./index.js",
				"./img/icon.png",
				"./style.css",
				"./manifest.json",
				"./jquery-3.4.1.js",
				//Naif-sh added 
				 "weather/weather.html",
               			 "weather/weather.js",
                                 "weather/weather.css"	
			]);
		})
	);
});

self.addEventListener('activate', function(event) {
	// Delete old asset caches.
	event.waitUntil(
		caches.keys().then(function(keys) {
			return Promise.all(
				keys.map(function(key) {
					if (
						key != OFFLINE_CACHE &&
						key.startsWith(`${PREFIX}-`)
					) {
						return caches.delete(key);
					}
				})
			);
		})
	);
});
//Orginal Christian 'fetch'
/*
self.addEventListener('fetch', function(event) {
	if (event.request.mode == 'navigate') {
		console.log('Handling fetch event for', event.request.url);
		console.log(event.request);
		event.respondWith(
			fetch(event.request).catch(function(exception) {
				console.error(
					'Fetch failed; returning offline page instead.',
					exception
				);
				return caches.open(OFFLINE_CACHE).then(function(cache) {
					return cache.match('/');
				});
			})
		);
	} else {
		event.respondWith(
			caches.match(event.request).then(function(response) {
				return response || fetch(event.request);
			})
		);
	}

});
*/
//Naif-sh edited 'fetch'
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (event.request.url.includes('api.openweathermap.org')) {
                return fetch(event.request)
                    .then((response) => {
                        return caches.open(OFFLINE_CACHE).then((cache) => {
                            console.log(event.request.url)
                            if (response.status === 200) {
                                cache.put(event.request, response.clone());
                            }
                            return response;
                        })
                    })
                    .catch(() => {
                        if (response) {
                            return response;
                        }
                    })
            } else {
                return response || fetch(event.request)
            }
        })
    )
});

