chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.url.includes('https://m.a-bly.com/goods/')) {
        console.log('[EXTENSION] URL 변경 감지, content_script 동적 주입');

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content_script.js"]
        });
        
        chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ["style.css"]
        });
    }
});