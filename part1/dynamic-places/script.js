// Динамическая загрузка мест рядом с пользователем.
// Вместо Foursquare API v2 (закрыт, нужны ключи) используется OpenStreetMap Overpass API:
// ключи не нужны, CORS разрешён.
const RADIUS_M = 400;   // радиус поиска
const LIMIT = 25;       // максимум мест

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
    try {
      const places = await loadPlaces(latitude, longitude);
      places.forEach(renderPlace);
      status.textContent = places.length
        ? 'Найдено мест: ' + places.length + '. Осмотритесь вокруг.'
        : 'Рядом ничего не найдено. Увеличьте RADIUS_M в script.js.';
    } catch (err) { status.textContent = 'Ошибка загрузки: ' + err.message; }
  });
  setTimeout(() => { if (!started) status.textContent = 'GPS не получен за 20 с: выйдите на улицу / откройте в Safari'; }, 20000);
});

async function loadPlaces(lat, lon) {
  const query = `[out:json][timeout:20];
    node(around:${RADIUS_M},${lat},${lon})["name"]["amenity"];
    out ${LIMIT};`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error('Overpass вернул ' + res.status);
  const json = await res.json();
  return json.elements.map(e => ({
    name: e.tags.name,
    kind: e.tags.amenity,
    lat: e.lat,
    lon: e.lon,
  }));
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
