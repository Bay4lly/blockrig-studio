/**
 * BlockRig Studio - Mobil Kamera & Dokunmatik Yön Tuşları Motoru
 * W, A, S, D, Q, E ve yön tuşu simülasyonu ile 3D kamerayı mobil WebView ve dokunmatik cihazlarda yönetir.
 */
(function() {
  // Klavye Olayı Gönderici (WASD / Q / E / Ok Tuşları)
  window.sendCamKey = function(keyName, keyCode, isDown) {
    var evtType = isDown ? 'keydown' : 'keyup';
    var keyEvent = new KeyboardEvent(evtType, {
      key: keyName,
      code: keyCode,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(keyEvent);
    if (isDown && navigator.vibrate) {
      try { navigator.vibrate(8); } catch (e) {}
    }
  };

  // Kontrolleri Aç / Kapat Fonksiyonu
  window.toggleCamControls = function(forceState) {
    var panel = document.getElementById('mobile-camera-controls');
    var trigger = document.getElementById('cam-toggle-trigger');
    if (!panel) return;
    var newState = (typeof forceState === 'boolean') ? forceState : !panel.classList.contains('active');
    if (newState) {
      panel.classList.add('active');
      if (trigger) trigger.classList.add('active');
    } else {
      panel.classList.remove('active');
      if (trigger) trigger.classList.remove('active');
    }
  };

  // Kamera ayar çubukları hareket ettirildiğinde kontrolleri otomatik aç
  document.addEventListener('input', function(e) {
    if (e.target && (e.target.type === 'range' || e.target.type === 'number')) {
      var container = e.target.closest('.camera-inspector-section');
      if (container) {
        window.toggleCamControls(true);
      }
    }
  }, true);

  // 'Özel Kamera' seçilirse kontrolleri aç, 'Otomatik Kadraj' seçilirse kapat
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if (btn && btn.textContent) {
      var txt = btn.textContent;
      if (txt.indexOf('Özel Kamera') !== -1 || txt.indexOf('Custom Camera') !== -1) {
        window.toggleCamControls(true);
      } else if (txt.indexOf('Otomatik Kadraj') !== -1 || txt.indexOf('Auto Frame') !== -1) {
        window.toggleCamControls(false);
      }
    }
  }, true);
})();
