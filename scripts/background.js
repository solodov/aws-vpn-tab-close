const tabFocusHistory = new Map();

chrome.tabs.onActivated.addListener((activeInfo) => {
  tabFocusHistory.set(activeInfo.tabId, Date.now());
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabFocusHistory.delete(tabId);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command === "close_tab" && sender.tab) {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]?.id === sender.tab.id) {
          // Find the most recently focused tab (excluding current)
          const sortedTabs = Array.from(tabFocusHistory.entries())
                .filter(([tabId]) => tabId !== sender.tab.id)
                .sort(([, a], [, b]) => b - a);
          if (sortedTabs.length > 0) {
            await chrome.tabs.update(sortedTabs[0][0], { active: true });
          }
        }
        chrome.tabs.remove(sender.tab.id);
      });
    }
  }
);
