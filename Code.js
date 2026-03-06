
function onEdit(e){
  handleLevelEdit(e);
}

function onOpen(e) {
  try {
    updateMyCustomItems();
  } catch (error) {
    Logger.log('onOpen 함수 실행 중 오류 발생:');
    Logger.log(error);
    if (error.stack) {
      Logger.log(error.stack);
    }
  }
}
