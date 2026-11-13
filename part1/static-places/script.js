// Места задаются статическим массивом. Если lat/lon = null, объект ставится
// в ~35 м к северу от пользователя — так демо работает в любом месте.
const PLACES = [
  { name: 'Объект 1', lat: null, lon: null },
  // { name: 'Объект 2', lat: 51.1283, lon: 71.4305 },
];

// Три "модели" из примитивов A-Frame (вместо .gltf-файлов, чтобы не нужны были assets).
// Чтобы использовать реальные модели: entity.setAttribute('gltf-model', './assets/x/scene.gltf').
const MODELS = [
  { label: 'Магнемайт', scale: '5 5 5', build: () => [
      ['a-sphere', { radius: 0.6, color: '#9aa5b1' }],
      ['a-sphere', { radius: 0.18, position: '0 0 0.55', color: '#ffffff' }],
      ['a-box', { width: .35, height: .35, depth: .35, position: '-0.85 0 0', color: '#d62828' }],
      ['a-box', { width: .35, height: .35, depth: .35, position: '0.85 0 0', color: '#1d4ed8' }],
  ]},
  { label: 'Пикачу-конус', scale: '5 5 5', build: () => [
      ['a-sphere', { radius: 0.6, color: '#facc15' }],
      ['a-cone', { 'radius-bottom': .15, height: .6, position: '-0.3 0.85 0', color: '#facc15' }],
      ['a-cone', { 'radius-bottom': .15, height: .6, position: '0.3 0.85 0', color: '#facc15' }],
  ]},
  { label: 'Куб-голем', scale: '5 5 5', build: () => [
      ['a-box', { width: 1, height: 1, depth: 1, color: '#78716c' }],
      ['a-sphere', { radius: .12, position: '-0.25 0.15 0.5', color: '#f97316' }],
      ['a-sphere', { radius: .12, position: '0.25 0.15 0.5', color: '#f97316' }],
  ]},
];

let modelIndex = 0;
const holders = []; // сущности-контейнеры для мест

function buildModel(holder) {
  while (holder.firstChild) holder.removeChild(holder.firstChild);
  const m = MODELS[modelIndex];
  holder.setAttribute('scale', m.scale);
  m.build().forEach(([tag, attrs]) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    holder.appendChild(el);
  });
  // подпись, всегда повёрнутая к камере
  const label = document.createElement('a-text');
  label.setAttribute('value', holder.dataset.name);
  label.setAttribute('align', 'center');
  label.setAttribute('position', '0 1.6 0');
  label.setAttribute('scale', '2 2 2');
  label.setAttribute('look-at', '[gps-new-camera]');
  holder.appendChild(label);
}

function addPlace(place, lat, lon) {
  const holder = document.createElement('a-entity');
  holder.dataset.name = place.name;
  holder.setAttribute('gps-new-entity-place', { latitude: lat, longitude: lon });
  document.querySelector('a-scene').appendChild(holder);
  buildModel(holder);
  holders.push(holder);
}

function setModel() {
  modelIndex = (modelIndex + 1) % MODELS.length;
  holders.forEach(buildModel);
  document.getElementById('info').textContent = 'Модель: ' + MODELS[modelIndex].label;
}

window.onload = () => {
  const info = document.getElementById('info');
    document.getElementById('motion').addEventListener('click', async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        info.textContent = 'Датчики: ' + await DeviceOrientationEvent.requestPermission();
      } else {
        info.textContent = 'Датчики: разрешение не требуется';
      }
    } catch (e) { info.textContent = 'Датчики: ' + e.message; }
  });
  document.querySelector('[data-action="change-model"]').addEventListener('click', setModel);

  const needGps = PLACES.some(p => p.lat == null);
  const place = (userPos) => {
    PLACES.forEach((p, i) => {Ы
      const lat = p.lat ?? userPos.latitude + 0.00009 * (i + 1); // ≈ 35 м на север
      const lon = p.lon ?? userPos.longitude;
      addPlace(p, lat, lon);
    });
        info.textContent = 'GPS ±' + Math.round(userPos.accuracy || 0) + ' м. Наведите камеру на север.';
  };

  if (!needGps) return place({});
  navigator.geolocation.getCurrentPosition(
    pos => place(pos.coords),
    err => { info.textContent = 'Нет доступа к геолокации: ' + err.message; },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
  );
};
