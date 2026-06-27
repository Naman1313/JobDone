export const PwaService = {
  register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('[PwaService] ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
          console.log('[PwaService] ServiceWorker registration failed: ', err);
        });
      });
    }
  },

  promptInstall() {
    // Basic mock logic. In a real scenario, this listens to 'beforeinstallprompt'
    console.log('[PwaService] Triggering install prompt mock...');
    alert("Install JobDone as a standalone app on your device for the best experience!");
  }
};
