import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope & {
  skipWaiting: () => Promise<void>;
  clients: {
    claim: () => Promise<void>;
  };
};

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('index.html'),
    {
      denylist: [/\/sw\.js$/, /\/manifest\.webmanifest$/, /\/workbox-.*\.js$/],
    },
  ),
);

self.skipWaiting();
self.clients.claim();
