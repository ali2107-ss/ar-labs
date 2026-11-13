const PLACES = [
  { name: 'Объект 1', lat: null, lon: null },
];

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
const holders = [];

const say = (text) => {
  const el = document.getElementById('info');
  if (el) el.textContent = text;
};

// любая ошибка скрипта будет видна на экране
window.addEventListener('error', e => say('Ошибка: ' + e.message));

function buildModel(holder) {
  while (holder.firstChild) holder.removeChild(holder.firstChild);
  const m = MODELS[modelIndex];
  holder.setAttribute('scale', m.scale);
  m.build().forEach(([tag, attrs]) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    holder.appendChild(el);
  });
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
  say('Модель: ' + MODELS[modelIndex].label);
}

window.addEventListener('load', () => {
  document.querySelector('[data-action="change-model"]')?.addEventListener('click', setModel);

  document.getElementById('motion')?.addEventListener('click', async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        say('Датчики: ' + await DeviceOrientationEvent.requestPermission());
      } else {
        say('Датчики: разрешение не требуется');
      }
    } catch (e) { say('Датчики: ' + e.message); }
  });

  const place = (c) => {
    PLACES.forEach((p, i) => {
      const lat = p.lat ?? c.latitude + 0.00009 * (i + 1); // ≈ 10 м на север
      const lon = p.lon ?? c.longitude;
      addPlace(p, lat, lon);
    });
    say('GPS ±' + Math.round(c.accuracy || 0) + ' м. Наведите камеру на север. Модель: ' + MODELS[modelIndex].label);
  };

  if (!('geolocation' in navigator)) return say('Геолокация не поддерживается этим браузером');
  say('Определяю позицию… (разрешите доступ к геолокации)');
  navigator.geolocation.getCurrentPosition(
    pos => place(pos.coords),
    err => say('Нет геолокации (' + err.code + '): ' + err.message),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  );
});