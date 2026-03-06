
function onEdit(e){
  handleLevelEdit(e);
}

function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.showToast('거래소 아이템 가격 업데이트 중...', '잠시만 기다려주세요', -1);
  try {
    updateMyCustomItems();
    ui.showToast('업데이트 완료', '거래소 아이템 가격 업데이트가 완료되었습니다.', 5);
  } catch (error) {
    Logger.log('onOpen 함수 실행 중 오류 발생:');
    Logger.log(error);
    if (error.stack) {
      Logger.log(error.stack);
    }
  }
}
