document.addEventListener('DOMContentLoaded', function () {
  var button = document.querySelector('[data-ar-sensor-button]');
  if (!button) return;

  button.addEventListener('click', async function () {
    button.disabled = true;
    var status = document.getElementById('info') || document.getElementById('status');
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        var permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') throw new Error('Доступ к датчикам не разрешён.');
      }
      button.textContent = 'Датчики включены';
      if (status && status.textContent.indexOf('Не удалось включить датчики:') === 0) {
        status.textContent = button.dataset.previousStatus || '';
      }
    } catch (error) {
      button.disabled = false;
      if (status) {
        button.dataset.previousStatus = status.textContent;
        status.textContent = 'Не удалось включить датчики: ' + error.message;
      }
    }
  });
});
