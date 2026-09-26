/**
 * BlockRig Studio - Global Visual Error Boundary
 * Siyah ekranda kalmayı engeller, olası boot veya çalışma hatalarını doğrudan ekranda gösterir.
 */
window.onerror = function(msg, url, lineNo, columnNo, error) {
  var loader = document.getElementById('boot-loader');
  if (loader) loader.style.display = 'none';

  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#7f1d1d;color:#fef2f2;z-index:99999999;padding:24px;font-family:monospace;font-size:13px;overflow:auto;line-height:1.6;';
  d.innerHTML = '<h2 style="color:#fecaca;margin-top:0;">⚠️ UYGULAMA BAŞLATMA HATASI</h2>' +
    '<p><b>Hata:</b> ' + msg + '</p>' +
    '<p><b>Dosya:</b> ' + url + '</p>' +
    '<p><b>Satır:</b> ' + lineNo + (columnNo ? ':' + columnNo : '') + '</p>' +
    '<pre style="background:#450a0a;padding:12px;border-radius:6px;white-space:pre-wrap;">' + 
    (error ? (error.stack || error.message) : 'Hata yığını yok') + 
    '</pre>';
  document.body.appendChild(d);
  return false;
};
