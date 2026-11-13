const RADIUS_M = 400;
const LIMIT = 25;
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

window.addEventListener('load', () => {
  const status = document.getElementById('status');
  window.addEventListener('error', e => { status.textContent = 'Ошибка: ' + e.message; });
  const camera = document.querySelector('[gps-new-camera]');
  if (!camera || !AFRAME.components['gps-new-camera']) {
    status.textContent = 'Не загрузились компоненты AR.js (gps-new-camera)'; return;
  }
  status.textContent = 'Определяю позицию… (разрешите геолокацию)';
  let started = false;
  camera.addEventListener('gps-camera-update-position', async (e) => {
    if (started) return; started = true;
    const { latitude, longitude } = e.detail.position;
    status.textContent = 'Ищу места рядом…';
    let places, demo = false;
    try {
      places = await loadPlaces(latitude, longitude);
    } catch (err) {
      places = demoPlaces(latitude, longitude); demo = true;
    }
    places.forEach(renderPlace);
    status.textContent = (demo ? 'Сервер карт недоступен, показаны ДЕМО-места. ' : '')
      + 'Мест: ' + places.length + '. Осмотритесь вокруг.';
  });
  setTimeout(() => { if (!started) status.textContent = 'GPS не получен за 20 с: выйдите на улицу / откройте в Safari'; }, 20000);
});

async function fetchWithTimeout(url, options, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...options, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

async function loadPlaces(lat, lon) {
  const query = `[out:json][timeout:15];
    node(around:${RADIUS_M},${lat},${lon})["name"]["amenity"];
    out ${LIMIT};`;
  let lastError;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      }, 12000);
      if (!res.ok) throw new Error(url + ' вернул ' + res.status);
      const json = await res.json();
      return json.elements.map(el => ({ name: el.tags.name, kind: el.tags.amenity, lat: el.lat, lon: el.lon }));
    } catch (err) { lastError = err; }
  }
  throw lastError;
}

function demoPlaces(lat, lon) {
  const names = ['Демо: Кафе', 'Демо: Аптека', 'Демо: Банк', 'Демо: Библиотека', 'Демо: Парковка', 'Демо: Магазин'];
  return names.map((name, i) => {
    const angle = (i / names.length) * 2 * Math.PI;
    const dist = 15 + (i % 3) * 12;
    return {
      name, kind: 'demo',
      lat: lat + (dist * Math.cos(angle)) / 111320,
      lon: lon + (dist * Math.sin(angle)) / (111320 * Math.cos(lat * Math.PI / 180)),
    };
  });
}

function renderPlace(place) {
  const holder = document.createElement('a-entity');
  holder.setAttribute('gps-new-entity-place', { latitude: place.lat, longitude: place.lon });

  const marker = document.createElement('a-sphere');
  marker.setAttribute('radius', '1');
  marker.setAttribute('color', '#e11d48');
  marker.setAttribute('scale', '3 3 3');
  holder.appendChild(marker);

  const label = document.createElement('a-text');
  label.setAttribute('value', place.name + '\n(' + place.kind + ')');
  label.setAttribute('align', 'center');
  label.setAttribute('width', '12');
  label.setAttribute('position', '0 7 0');
  label.setAttribute('scale', '10 10 10');
  label.setAttribute('look-at', '[gps-new-camera]');
  holder.appendChild(label);

  document.querySelector('a-scene').appendChild(holder);
}