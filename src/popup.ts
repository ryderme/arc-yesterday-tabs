document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup script loaded');
  const reopenButton = document.getElementById('reopen-button');

  reopenButton?.addEventListener('click', () => {
    console.log('重新打开按钮被点击');
    chrome.runtime.sendMessage(
      { action: 'reopenYesterdayTabs' },
      response => {
        console.log('收到后台脚本响应:', response);
        if (response.success) {
          if (response.openedTabsCount > 0) {
            console.log(`成功重新打开了 ${response.openedTabsCount} 个标签页`);
          } else {
            alert('No tabs found to reopen');
          }
        } else {
          alert('操作失败: ' + response.error);
        }
      }
    );
  });
});