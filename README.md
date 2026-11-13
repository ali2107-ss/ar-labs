# Лабораторная: Web AR (AR.js)

Структура:

```
part1/                       # туториал Location-Based AR (Medium + repo nicolocarpignoli)
  static-on-html/            # способ 1: места только в HTML
  static-places/             # способ 2: места через JS + кнопка смены модели
  dynamic-places/            # способ 3: места подгружаются по API рядом с пользователем
part2-indoor-nav/            # проект ar-nav: навигация внутри помещения по маркерам
```

## Запуск (обязательно HTTPS, иначе камера и GPS не заработают)

1. Создайте репозиторий на GitHub, например `ar-labs`, и загрузите туда эту папку:
   ```
   git init
   git add .
   git commit -m "AR labs"
   git branch -M main
   git remote add origin https://github.com/<ваш-логин>/ar-labs.git
   git push -u origin main
   ```
2. GitHub → Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. Через 1–2 минуты откройте на телефоне:
   - `https://<логин>.github.io/ar-labs/part1/static-on-html/`
   - `https://<логин>.github.io/ar-labs/part1/static-places/`
   - `https://<логин>.github.io/ar-labs/part1/dynamic-places/`
   - `https://<логин>.github.io/ar-labs/part2-indoor-nav/`
4. Разрешите доступ к камере и геолокации. Тестируйте на улице: внутри GPS неточен.

## Часть 1

* **static-on-html** — единственное, что нужно поменять: `latitude` / `longitude` в `gps-new-entity-place` на координаты рядом с вами (https://www.latlong.net/). Сейчас там Колизей, как в статье.
* **static-places** — массив `PLACES` в `script.js`. Если `lat/lon = null`, объект ставится в ~35 м севернее вас. Кнопка меняет модель (3 штуки из примитивов).
* **dynamic-places** — ищет заведения в радиусе 400 м через OpenStreetMap Overpass API и показывает метку с названием над каждым. Ключи не нужны.

Отличия от статьи (она 2019 года, AR.js v2):
* использован AR.js **v3** + A-Frame 1.3.0 (`gps-new-camera`, `gps-new-entity-place`), как в папке `v3` репозитория;
* Foursquare API v2 больше не работает, заменён на Overpass;
* 3D-модели Pokémon заменены примитивами A-Frame. Чтобы вернуть реальные `.gltf`: положите их в `assets/` и добавьте атрибут `gltf-model="./assets/.../scene.gltf"`.

## Часть 2 — упрощённый ar-nav

Реализовано из списка возможностей оригинала:
* выбор пункта назначения и его смена во время движения;
* маршрут по графу помещения (BFS), перестроение при сканировании маркера не с маршрута;
* текстовая информация об объекте навигации;
* указание действий текстом, голосом (Web Speech API, ru-RU) и 3D-стрелкой;
* аналитика в `localStorage`: сканы маркеров, выбранные цели, число перестроений. Посмотреть: в консоли браузера `arnavStats()`.

Не реализовано (в оригинале это Vue + Vuetify + neo4j + бэкенд): анкета пользователей, серверное хранение аналитики, граф в БД.

### Маркеры
Используются barcode-маркеры 3×3 со значениями 1–5. Сгенерируйте и распечатайте их генератором:
https://au.gmented.com/app/marker/marker.php → тип *Barcode 3x3* → значения 1, 2, 3, 4, 5.
Клейте так, чтобы верх маркера смотрел вдоль коридора «от входа». Изменить граф и названия: `NODES` и `EDGES` в `index.html`.
