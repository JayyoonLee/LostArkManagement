
function onEdit(e){
  handleLevelEdit(e);
}

function handleLevelEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== "레벨별") return;
  if (e.range.getColumn() !== 2) return;

  const row = e.range.getRow();
  const 기준레벨 = e.range.getValue();
  if (!기준레벨) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName("골드표");

  const data = sourceSheet
    .getRange(3, 2, sourceSheet.getLastRow() - 2, 6)
    .getValues();
  // [콘텐츠, 레벨, 1관문, 2관문, 3관문, 합계]

  // 1️⃣ 레벨 조건 + 합계 존재
  const candidates = data.filter(r => r[0] && r[1] && r[5] && r[1] <= 기준레벨);

  // 2️⃣ 레이드 이름 기준으로 최대 합계만 유지
  const raidMap = {};

  candidates.forEach(r => {
    const baseName = r[0]
      .replace(" 노말", "")
      .replace(" 하드", "")
      .replace(" 나이트메어", "");

    if (!raidMap[baseName] || raidMap[baseName][5] < r[5]) {
      raidMap[baseName] = r;
    }
  });

  // 3️⃣ 배열화
  const uniqueRaids = Object.values(raidMap);

  // 4️⃣ 합계 기준 정렬
  uniqueRaids.sort((a, b) => b[5] - a[5]);

  // 5️⃣ 상위 3개
  const top3 = uniqueRaids.slice(0, 3);

  // 출력 초기화
  sheet.getRange(row, 3, 3, 6).clearContent();

  if (top3.length > 0) {
    sheet.getRange(row, 3, top3.length, 6).setValues(top3);
  }
}

function updateExpeditionRewards() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const expedition = ss.getSheetByName("원정대");
  const levelSheet = ss.getSheetByName("레벨별");

  const levelData = levelSheet.getDataRange().getValues();

  const START_ROW = 5;
  const ROW_STEP = 5;
  const START_COL = 2; // B
  const COL_STEP = 3;
  const COL_COUNT = 6; // B,E,H,K,N,Q

  const lastRow = expedition.getLastRow();

  // 🔹 레벨 블록 인덱스 미리 수집
  const blocks = [];
  for (let i = 1; i < levelData.length; i++) {
    const lv = levelData[i][1];
    if (typeof lv === "number") {
      blocks.push({ level: lv, row: i });
    }
  }

  for (let row = START_ROW; row <= lastRow; row += ROW_STEP) {
    for (let i = 0; i < COL_COUNT; i++) {
      const col = START_COL + i * COL_STEP;
      const charLevel = expedition.getRange(row, col).getValue();
      if (!charLevel) continue;

      // 🔹 해당 레벨 블록 찾기
      let blockIndex = -1;
      for (let b = 0; b < blocks.length; b++) {
        const cur = blocks[b].level;
        const next = blocks[b + 1]?.level ?? Infinity;
        if (cur <= charLevel && charLevel < next) {
          blockIndex = b;
          break;
        }
      }
      if (blockIndex === -1) continue;

      const start = blocks[blockIndex].row;
      const end =
        blocks[blockIndex + 1]?.row ?? levelData.length;

      // 🔹 유효 컨텐츠 최대 3개 수집
      const results = [];
      for (let r = start; r < end; r++) {
        const content = levelData[r][2];
        const total = levelData[r][7];
        if (content && total) {
          results.push([content, total]);
          if (results.length === 3) break;
        }
      }

      // 🔹 출력
      for (let k = 0; k < 3; k++) {
        expedition
          .getRange(row + 1 + k, col, 1, 2)
          .setValues([results[k] ?? ["", ""]]);
      }
    }
  }
}


function clearAllCheckboxes() {
  const sheetName = "원정대";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("시트 '원정대' 없음");

  const range = sheet.getDataRange();
  const validations = range.getDataValidations();

  for (let r = 0; r < validations.length; r++) {
    for (let c = 0; c < validations[r].length; c++) {
      const rule = validations[r][c];
      if (rule && rule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.CHECKBOX) {
        sheet.getRange(r + 1, c + 1).setValue(false);
      }
    }
  }
}


function updateSingleCharacterRewards(currentSheet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const levelSheet = ss.getSheetByName("레벨별");

  if (!levelSheet) {
    Logger.log("[에러] '레벨별' 시트를 찾을 수 없습니다.");
    return;
  }

  const levelData = levelSheet.getDataRange().getValues();

  // 🔹 레벨 블록 인덱스 미리 수집
  const blocks = [];
  for (let i = 1; i < levelData.length; i++) {
    const lv = levelData[i][1]; 
    if (typeof lv === "number") {
      blocks.push({ level: lv, row: i });
    }
  }

  const levelRow = 7; 
  const outputStartRow = 9; 

  // 🔹 기본은 6명(Q열까지), T열(20)이나 W열(23)에 레벨 값이 있으면 8명까지 확장
  let outputCols = [2, 5, 8, 11, 14, 17]; // B, E, H, K, N, Q
  
  const valT = currentSheet.getRange(levelRow, 20).getValue();
  const valW = currentSheet.getRange(levelRow, 23).getValue();

  if (valT || valW) {
    outputCols.push(20, 23); // 값이 있다면 T, W열 추가
  }

  // 🔹 결정된 열 리스트를 순회하며 보상 갱신
  for (let i = 0; i < outputCols.length; i++) {
    const col = outputCols[i];
    const charLevel = currentSheet.getRange(levelRow, col).getValue();

    if (!charLevel || typeof charLevel !== "number") {
      currentSheet.getRange(outputStartRow, col, 3, 2).clearContent();
      continue;
    }

    let blockIndex = -1;
    for (let b = 0; b < blocks.length; b++) {
      const cur = blocks[b].level;
      const next = blocks[b + 1]?.level ?? Infinity;
      if (cur <= charLevel && charLevel < next) {
        blockIndex = b;
        break;
      }
    }

    const results = [];
    if (blockIndex !== -1) {
      const start = blocks[blockIndex].row;
      const end = blocks[blockIndex + 1]?.row ?? levelData.length;

      for (let r = start; r < end; r++) {
        const content = levelData[r][2]; 
        const total = levelData[r][7];   
        
        if (content && total) {
          results.push([content, total]);
          if (results.length === 3) break;
        }
      }
    }

    currentSheet.getRange(outputStartRow, col, 3, 2).clearContent();

    for (let k = 0; k < 3; k++) {
      const outputData = results[k] ?? ["", ""];
      currentSheet.getRange(outputStartRow + k, col, 1, 2).setValues([outputData]);
    }
  }
}


function clearAllCheckboxesFromAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();

  for (let i = 0; i < allSheets.length; i++) {
    const currentSheet = allSheets[i];
    const sheetName = currentSheet.getName();

    // 제외할 시트 필터링
    if (sheetName === "골드별" || sheetName === "원정대" || sheetName === "골드표") {
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