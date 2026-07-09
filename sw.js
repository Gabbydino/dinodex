/* DinoDex — service worker
   Cacheia o "shell" do app pra ele abrir offline depois da
   primeira visita. Sobe a versão do CACHE_NAME sempre que
   publicar mudanças em qualquer arquivo do APP_SHELL — isso
   força a limpeza do cache antigo.

   Estratégia: "rede primeiro, cache como reserva". Assim,
   sempre que houver internet, o usuário recebe a versão mais
   nova publicada no GitHub Pages. O cache só entra em ação
   quando o dispositivo está offline. Isso evita o bug de ficar
   preso numa versão antiga/quebrada guardada no cache. */
const CACHE_NAME = 'dinodex-v4';
const APP_SHELL = [
  './',
  './index.html',
  './dino.html',
  './compare.html',
  './evolucao.html',
  './manifest.json',
  './css/styles.css',
  './js/common.js',
  './js/app.js',
  './js/detail.js',
  './js/compare.js',
  './js/evolucao.js',
  './data/dinos.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
