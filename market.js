function updateMyCustomItems() {
  const ui = SpreadsheetApp.getUi();
  ui.showToast('거래소 아이템 가격 업데이트 중...', '잠시만 기다려주세요', -1); // -1은 메시지가 자동으로 사라지지 않음을 의미합니다.

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("거래소");
    if (!sheet) throw new Error("'거래소' 시트가 없습니다.");

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      ui.showToast('업데이트 완료', '업데이트할 아이템이 없습니다.', 5); // 5초 후 메시지가 사라집니다.
      return;
    }

    const itemNames = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const results = [];
    const now = Utilities.formatDate(new Date(), "GMT+9", "yyyy-MM-dd HH:mm:ss");

    itemNames.forEach((name) => {
      const cleanName = name ? name.toString().trim() : "";
      if (!cleanName) {
        results.push(["", "", ""]);
        return;
      }

      // 💡 필수 파라미터를 모두 포함한 Payload
      const payload = {
        "Sort": "CURRENT_MIN_PRICE",
        "CategoryCode": 50000, // 50000은 재련재료 카테고리입니다.
        "CharacterClass": null,
        "ItemTier": null,
        "ItemGrade": null,
        "ItemName": cleanName,
        "PageNo": 1,
        "SortCondition": "ASC"
      };

      try {
        const data = loaPostFetch("/markets/items", payload);

        if (data && data.Items && data.Items.length > 0) {
          // 검색 결과 중 이름이 정확히 일치하는 것 찾기
          const exactItem = data.Items.find(i => i.Name === cleanName) || data.Items[0];

          results.push([
            exactItem.RecentPrice,
            exactItem.CurrentMinPrice,
            now
          ]);
        } else {
          results.push(["결과 없음", "-", now]);
        }
      } catch (e) {
        Logger.log(`아이템 ${cleanName} 처리 중 오류 발생: ${e}`);
        results.push(["에러 발생", "-", now]);
      }

      Utilities.sleep(500); // 분당 100회 제한이므로 0.5초 간격 유지
    });

    if (results.length > 0) {
      sheet.getRange(2, 2, results.length, 3).setValues(results);
    }
    ui.showToast('업데이트 완료', '거래소 아이템 가격 업데이트가 완료되었습니다.', 5); // 5초 후 메시지가 사라집니다.
  } catch (error) {
    ui.alert('오류 발생', '거래소 아이템 가격 업데이트 중 오류가 발생했습니다: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Error during updateMyCustomItems: ' + error.message);
  }
}