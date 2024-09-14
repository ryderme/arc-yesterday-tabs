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
            console.log('No tabs found to reopen');
          }
        } else {
          console.error('操作失败: ' + response.error);
        }
        // 操作完成后立即关闭弹窗
        window.close();
      }
    );
  });
});