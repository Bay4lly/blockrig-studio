/**
 * BlockRig Studio - Routing & Offline Fetch Polyfill
 * 1. Başlangıç hash kontrolü
 * 2. Yerel dosya sistemi (file://), Android WebView ve model dosyaları (.bobj, .json, .obj) için XHR fetch polyfill
 */
(function() {
  // 1. Hash Kontrolü: Yalnızca Android WebView ortamında doğrudan stüdyoya (#app) yönlendir
  if (window.AndroidBridge && (!window.location.hash || window.location.hash === '#' || window.location.hash === '')) {
    window.location.hash = '#app';
  }

  // 2. OFFLINE XHR FETCH POLYFILL
  var originalFetch = window.fetch;
  window.fetch = function(url, options) {
    var urlStr = (typeof url === 'string') ? url : (url && url.url ? url.url : '');
    
    var isLocal = window.location.protocol === 'file:' ||
                  urlStr.indexOf('models/') !== -1 ||
                  urlStr.indexOf('assets/') !== -1 ||
                  urlStr.startsWith('./') ||
                  urlStr.startsWith('models/') ||
                  (!urlStr.startsWith('http:') && !urlStr.startsWith('https:') && !urlStr.startsWith('data:'));

    if (isLocal) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open((options && options.method) || 'GET', urlStr, true);
        
        if (urlStr.indexOf('.bobj') !== -1 || urlStr.indexOf('.json') !== -1 || urlStr.indexOf('.obj') !== -1) {
          xhr.responseType = 'text';
        } else {
          xhr.responseType = (options && options.responseType) ? options.responseType : 'blob';
        }

        xhr.onload = function() {
          var isOk = (xhr.status === 200 || xhr.status === 0);
          if (isOk) {
            var resData = xhr.response;
            resolve({
              ok: true,
              status: 200,
              statusText: 'OK',
              text: function() {
                if (typeof resData === 'string') return Promise.resolve(resData);
                return Promise.resolve(xhr.responseText || '');
              },
              json: function() {
                var str = (typeof resData === 'string') ? resData : xhr.responseText;
                return Promise.resolve(JSON.parse(str));
              },
              blob: function() {
                if (resData instanceof Blob) return Promise.resolve(resData);
                return Promise.resolve(new Blob([resData]));
              },
              arrayBuffer: function() {
                if (resData instanceof ArrayBuffer) return Promise.resolve(resData);
                return Promise.resolve(new ArrayBuffer(0));
              }
            });
          } else {
            if (originalFetch) originalFetch(url, options).then(resolve).catch(reject);
            else reject(new Error('Yüklenemedi: ' + urlStr));
          }
        };

        xhr.onerror = function() {
          if (originalFetch) originalFetch(url, options).then(resolve).catch(reject);
          else reject(new Error('Ağ hatası: ' + urlStr));
        };

        try {
          xhr.send((options && options.body) || null);
        } catch (e) {
          if (originalFetch) originalFetch(url, options).then(resolve).catch(reject);
          else reject(e);
        }
      });
    }

    return originalFetch.apply(this, arguments);
  };
})();
