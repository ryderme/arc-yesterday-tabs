/// <reference types="chrome"/>

console.log('Background script is running');

interface TabCloseInfo {
  url?: string;
  closeTime: number;
}

let closedTabs: TabCloseInfo[] = [];
let tabUrlMap: Map<number, string> = new Map();

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

async function getLastDayTabs(): Promise<chrome.history.HistoryItem[]> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  console.log('搜索历史记录,开始时间:', yesterday.toISOString());
  const history = await chrome.history.search({
    text: '',
    startTime: yesterday.getTime(),
    endTime: now.getTime(),
    maxResults: 1000
  });

  console.log(`找到 ${history.length} 条历史记录`);

  const filteredTabs = history.filter(item => {
    if (item.lastVisitTime === undefined) {
      return false;
    }
    const itemDate = new Date(item.lastVisitTime);
    return itemDate >= todayMidnight;
  });

  console.log(`筛选后剩余 ${filteredTabs.length} 个标签页`);
  return filteredTabs;
}

async function reopenTabs(tabs: chrome.history.HistoryItem[]): Promise<number> {
  console.log(`准备重新打开标签页`);
  const currentTabs = await chrome.tabs.query({});
  const currentUrls = new Set(currentTabs.map(tab => tab.url));

  const tabsToReopen = new Set(
    closedTabs
      .map(tab => tab.url)
      .filter((url): url is string => url !== undefined && !currentUrls.has(url))
  );

  let openedTabsCount = 0;

  for (const tab of tabs) {
    if (tab.url && tabsToReopen.has(tab.url)) {
      try {
        await chrome.tabs.create({ url: tab.url });
        console.log(`成功打开标签页: ${tab.url}`);
        openedTabsCount++;
      } catch (error) {
        console.error(`打开标签页失败 ${tab.url}:`, error);
      }
    } else if (tab.url) {
      console.log(`标签页不需要重新打开或已经打开,跳过: ${tab.url}`);
    }
  }
  console.log(`重新打开了 ${openedTabsCount} 个标签页`);
  return openedTabsCount;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Arc Yesterday\'s Tabs 插件已安装');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  if (request.action === 'reopenYesterdayTabs') {
    console.log('开始获取过去24小时内的标签页');
    getLastDayTabs()
      .then(tabs => {
        console.log(`找到 ${tabs.length} 个符合条件的标签页`);
        return reopenTabs(tabs);
      })
      .then((openedTabsCount) => {
        console.log(`重新打开了 ${openedTabsCount} 个标签页`);
        console.log('关闭的标签页信息:', closedTabs);
        sendResponse({ success: true, openedTabsCount });
      })
      .catch(error => {
        console.error('重新打开标签页时出错:', error);
        sendResponse({ success: false, error: error.message, openedTabsCount: 0 });
      });
    return true; // 异步响应
  }
});