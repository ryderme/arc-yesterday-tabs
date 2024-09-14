/// <reference types="chrome"/>

console.log('Background script is running');

interface TabCloseInfo {
  url?: string;
  closeTime: number;
}

let closedTabs: TabCloseInfo[] = [];
let tabUrlMap: Map<number, string> = new Map();

async function initializeClosedTabs() {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayMidnight = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);

  const history = await chrome.history.search({
    text: '',
    startTime: yesterdayMidnight.getTime(),
    endTime: now.getTime(),
    maxResults: 1000
  });

  closedTabs = history.map(item => ({
    url: item.url,
    closeTime: item.lastVisitTime || Date.now()
  }));

  console.log(`从历史记录中初始化了 ${closedTabs.length} 个关闭的标签页`);
}

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('onRemoved', tabId, removeInfo);
  
  closedTabs.push({
    url: tabUrlMap.get(tabId),
    closeTime: Date.now()
  });
  
  tabUrlMap.delete(tabId);
  
  console.log(`标签页关闭: ID ${tabId} at ${new Date().toISOString()}`);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    tabUrlMap.set(tabId, changeInfo.url);
    console.log(`标签页更新: ID ${tabId}, URL ${changeInfo.url}`);
  }
});

async function reopenTabs(): Promise<number> {
  console.log(`准备重新打开标签页`);
  console.log('关闭的标签页信息:', closedTabs);
  const currentTabs = await chrome.tabs.query({});
  const currentUrls = new Set(currentTabs.map(tab => tab.url));

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

  const tabsToReopen: TabCloseInfo[] = [];
  
  closedTabs.forEach(tab => {
    const closeDate = new Date(tab.closeTime);
    if (closeDate < todayMidnight) {
      console.log(`标签页不重新打开: ${tab.url} - 关闭时间早于今天凌晨`);
    } else if (closeDate >= todayNoon) {
      console.log(`标签页不重新打开: ${tab.url} - 关闭时间晚于今天中午`);
    } else if (!tab.url) {
      console.log(`标签页不重新打开: URL 为空`);
    } else if (currentUrls.has(tab.url)) {
      console.log(`标签页不重新打开: ${tab.url} - 已经打开`);
    } else {
      tabsToReopen.push(tab);
    }
  });

  let openedTabsCount = 0;

  for (const tab of tabsToReopen) {
    if (tab.url) {
      try {
        await chrome.tabs.create({ url: tab.url });
        console.log(`成功打开标签页: ${tab.url}`);
        openedTabsCount++;
      } catch (error) {
        console.error(`打开标签页失败 ${tab.url}:`, error);
      }
    }
  }
  return openedTabsCount;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Arc Yesterday\'s Tabs 插件已安装');
  initializeClosedTabs();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('浏览器启动，初始化关闭的标签页');
  initializeClosedTabs();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  if (request.action === 'reopenYesterdayTabs') {
    console.log('开始重新打开今天关闭的标签页');
    reopenTabs()
      .then((openedTabsCount) => {
        console.log(`重新打开了 ${openedTabsCount} 个标签页`);
        sendResponse({ success: true, openedTabsCount });
      })
      .catch(error => {
        console.error('重新打开标签页时出错:', error);
        sendResponse({ success: false, error: error.message, openedTabsCount: 0 });
      });
    return true; // 异步响应
  }
});