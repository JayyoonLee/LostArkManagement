
function onEdit(e){
  handleLevelEdit(e);
}

function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.showToast('거래소 아이템 가격 업데이트 중...', '잠시만 기다려주세요', -1); // -1은 메시지가 자동으로 사라지지 않음을 의미합니다.

  try {
    updateMyCustomItems();
    ui.showToast('업데이트 완료', '거래소 아이템 가격 업데이트가 완료되었습니다.', 5); // 5초 후 메시지가 사라집니다.
  } catch (error) {
    ui.alert('오류 발생', '거래소 아이템 가격 업데이트 중 오류가 발생했습니다: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Error during updateMyCustomItems: ' + error.message);
  }
}
