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
				"./jquery-3.4.1.js"
				
				//those resources are cached for Reminder
				"/jquery-3.4.1.js",
				"/reminders/reminders.html",
				"/reminders/reminders.js",
				"/css/themes/Try1.css",
				"/css/themes/jquery.mobile.icons.min.css",
				"/jquery.mobile-1.4.5.min.js",
				"/jquery-1.11.1.min.js",
				"/jquery.mobile.structure-1.4.5.min.css",
				"/jquery.mobile-1.4.5.min.map",
				"/css/themes/images/ajax-loader.gif"
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

// i do not if i should change it or keep it?

// self.addEventListener('activate', function(event) {
// 	// Delete old asset caches.
// 	event.waitUntil(
// 		self.clients.claim()
// 	);
// });

// //it is a middleware, when browser fetches resources, it always happens via this function
// self.addEventListener('fetch', function(event) {
// 		event.respondWith(
// 			caches.match(event.request).then(function(response) {
// 				return response || fetch(event.request)
// 					.catch(er => {
// 						console.log(er)
// 					});
// 			})
// 		);
// });

