function clearAllCheckboxesFromAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();

  for (let i = 0; i < allSheets.length; i++) {
    const currentSheet = allSheets[i];
    const sheetName = currentSheet.getName();

    // 제외할 시트 필터링
    if (sheetName === "골드별" || sheetName === "원정대" || sheetName === "골드표" || sheetName === "거래소") {
      continue;
    }

    const range = currentSheet.getDataRange();
    const validations = range.getDataValidations();
    const formulas = range.getFormulas(); // 🔹 셀의 수식 정보를 모두 가져옵니다.

    for (let r = 0; r < validations.length; r++) {
      for (let c = 0; c < validations[r].length; c++) {
        const rule = validations[r][c];
        
        // 1. 데이터 확인 규칙이 '체크박스'인지 확인
        if (rule && rule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.CHECKBOX) {
          
          // 2. 🔹 수식이 있는지 확인 (formulas[r][c]가 빈 문자열이면 수식이 없는 것)
          if (formulas[r][c] === "") {
            // 수식이 없는 일반 체크박스만 false로 초기화합니다.
            currentSheet.getRange(r + 1, c + 1).setValue(false);
          } else {
            // 수식(=D4 등)이 걸린 체크박스는 건너뜁니다.
            Logger.log(sheetName + " 시트 " + (r+1) + "행 " + (c+1) + "열: 수식 유지함");
          }
        }
      }
    }
  }
}