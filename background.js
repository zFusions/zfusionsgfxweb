// Bloquer les requêtes indésirables
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    if (url.pathname.includes('content-scripts') || 
        url.pathname.includes('injection-topics')) {
      return {cancel: true};
    }
    return {cancel: false};
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);
