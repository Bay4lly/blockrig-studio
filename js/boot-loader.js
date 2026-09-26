/**
 * BlockRig Studio - Boot Loader Manager
 * Sayfa ilk yüklendiğinde React root elemanının render oluşunu izler ve açılış loader'ını gizler.
 */
window.addEventListener('DOMContentLoaded', function() {
  var observer = new MutationObserver(function() {
    var root = document.getElementById('root');
    if (root && root.children.length > 0) {
      var loader = document.getElementById('boot-loader');
      if (loader) loader.style.display = 'none';
      observer.disconnect();
    }
  });
  var root = document.getElementById('root');
  if (root) {
    observer.observe(root, { childList: true, subtree: true });
  }
});
