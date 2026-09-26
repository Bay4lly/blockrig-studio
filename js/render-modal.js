/**
 * BlockRig Studio - Render Önizleme ve Dialog Sistemi
 * Render tamamlandığında sonucu modalda gösterir, AndroidBridge veya Web Tarayıcısı üzerinde kaydeder/paylaşır.
 */
(function() {
  window.currentRenderData = null;

  window.showRenderResult = function(data) {
    window.currentRenderData = data;

    var modal = document.getElementById('render-preview-modal');
    var img = document.getElementById('render-preview-img');
    var resBadge = document.getElementById('render-res-badge');
    var pathEl = document.getElementById('render-saved-path');
    var locationBox = document.querySelector('.render-location-box');
    var pcSuccessBar = document.querySelector('.render-pc-success-bar');
    var shareBtnText = document.querySelector('.btn-share .btn-text');
    var openBtnText = document.querySelector('.btn-open .btn-text');
    var copyIcon = document.getElementById('copy-btn-icon');
    if (copyIcon) copyIcon.textContent = '📋';

    if (!modal || !img) return;

    img.src = data.dataUrl;
    if (resBadge) {
      resBadge.textContent = (data.width || 1920) + ' × ' + (data.height || 1080) + ' • PNG';
    }

    var isAndroid = !!window.AndroidBridge;

    if (isAndroid) {
      // MOBİL / ANDROID ORTAMI
      if (locationBox) locationBox.style.display = 'block';
      if (pcSuccessBar) pcSuccessBar.style.display = 'none';
      if (shareBtnText) shareBtnText.textContent = 'Paylaş';
      if (openBtnText) openBtnText.textContent = 'Galeride Aç';

      var defaultPath = '/storage/emulated/0/BlockRig/Renders/' + data.filename;
      if (pathEl) pathEl.textContent = defaultPath;

      // AndroidBridge üzerinden varsayılan klasöre kaydet
      if (window.AndroidBridge.saveRender) {
        try {
          var resRaw = window.AndroidBridge.saveRender(data.dataUrl, data.filename);
          var res = JSON.parse(resRaw);
          if (res && res.filePath) {
            window.currentRenderData.savedPath = res.filePath;
            if (pathEl) pathEl.textContent = res.filePath;
          }
        } catch(e) {
          console.error('AndroidBridge save error:', e);
        }
      }
    } else {
      // PC / MASAÜSTÜ TARAYICI ORTAMI
      // Klasör yolu kutusunu gizle (tarayıcı indirme konumunu kullanıcıya bıraktığı için yanıltıcı olmasın)
      if (locationBox) locationBox.style.display = 'none';
      if (pcSuccessBar) pcSuccessBar.style.display = 'flex';
      if (shareBtnText) shareBtnText.textContent = (navigator.share ? 'Paylaş' : 'Yeniden İndir');
      if (openBtnText) openBtnText.textContent = 'Görseli Aç';

      // Tarayıcı indirmesini tek bir kez başlat
      try {
        var a = document.createElement('a');
        a.href = data.dataUrl;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch(e) {}
    }

    modal.style.display = 'flex';
    setTimeout(function() {
      modal.classList.add('visible');
    }, 10);
  };

  window.closeRenderModal = function() {
    var modal = document.getElementById('render-preview-modal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(function() {
        modal.style.display = 'none';
      }, 200);
    }
  };

  window.shareCurrentRender = function() {
    if (!window.currentRenderData) return;
    var filename = window.currentRenderData.filename;
    if (window.AndroidBridge && window.AndroidBridge.shareRender) {
      window.AndroidBridge.shareRender(filename);
    } else if (navigator.share) {
      fetch(window.currentRenderData.dataUrl)
        .then(function(res) { return res.blob(); })
        .then(function(blob) {
          var file = new File([blob], filename, { type: 'image/png' });
          navigator.share({
            title: 'BlockRig Studio Render',
            files: [file]
          }).catch(function() {});
        });
    } else {
      var a = document.createElement('a');
      a.href = window.currentRenderData.dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  window.openCurrentRender = function() {
    if (!window.currentRenderData) return;
    var filename = window.currentRenderData.filename;
    if (window.AndroidBridge && window.AndroidBridge.openRender) {
      window.AndroidBridge.openRender(filename);
    } else {
      var newWin = window.open();
      if (newWin) {
        newWin.document.write('<!DOCTYPE html><html><head><title>' + filename + '</title><style>body{margin:0;background:#0a0d12;display:flex;align-items:center;justify-content:center;min-height:100vh;}img{max-width:95vw;max-height:95vh;object-fit:contain;}</style></head><body><img src="' + window.currentRenderData.dataUrl + '"/></body></html>');
      }
    }
  };

  window.copyRenderPath = function() {
    var pathEl = document.getElementById('render-saved-path');
    var copyIcon = document.getElementById('copy-btn-icon');
    var text = pathEl ? pathEl.textContent : '';
    if (window.AndroidBridge && window.AndroidBridge.copyToClipboard) {
      window.AndroidBridge.copyToClipboard(text);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (copyIcon) {
      copyIcon.textContent = '✓';
      setTimeout(function() { copyIcon.textContent = '📋'; }, 2000);
    }
  };

  // ESC tuşuyla render modalını kapat
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('render-preview-modal');
      if (modal && modal.style.display !== 'none') {
        window.closeRenderModal();
        e.stopPropagation();
      }
    }
  });
})();
