// 🎯 1. 모든 시트를 순회하며 작업을 지시하는 메인 함수
function processAllTargetSheets() {
  Logger.log("GitHub Actions 배포 테스트 성공! " + new Date()); // 테스트용 로그 추가
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets(); // 파일에 있는 모든 시트를 배열로 가져옵니다.

  // 모든 시트를 하나씩 꺼내어 검사합니다.
  for (let i = 0; i < allSheets.length; i++) {
    const currentSheet = allSheets[i];
    const sheetName = currentSheet.getName();

    // 시트 이름에 따라 알맞은 함수로 분기합니다.
    if (sheetName === "골드별" || sheetName === "원정대" || sheetName === "골드표" ) {
        continue;
    } 
    else if (sheetName === "갱먀") {
        updateSingleCharacter8(currentSheet);
    }
    else {
        updateSingleCharacter(currentSheet);
    }

    // "골드표", "레벨별" 등 if문에 없는 시트들은 아무 작업도 하지 않고 자연스럽게 다음 시트로 넘어갑니다.
  }
}

// github연동 테스트 추가
function writeCharacterList() {
  const sheetName = "원정대";
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("시트 '원정대'를 찾을 수 없습니다.");
  }

  const lastRow = sheet.getLastRow();

  // 출력할 열들: B E H K N Q
  const outputCols = [2, 5, 8, 11, 14, 17];

  // A열 전체 읽기
  const colAValues = sheet.getRange(1, 1, lastRow, 1).getValues();

  // A4부터 5칸 간격
  for (let row = 4; row <= lastRow; row += 5) {
    const baseCharacterName = colAValues[row - 1][0];
    if (!baseCharacterName) continue;

    const endpoint = `/characters/${encodeURIComponent(baseCharacterName)}/siblings`;
    const characters = loaFetch(endpoint);

    // 아이템 레벨 숫자로 변환 + 정렬
    const sorted = characters
      .map(c => ({
        name: c.CharacterName,
        level: Number(c.ItemAvgLevel.replace(",", ""))
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, 6); // 상위 6개

    // 기존 출력 영역 초기화
    outputCols.forEach(col => {
      sheet.getRange(row, col, 2, 1).clearContent();
    });

    // 출력
    sorted.forEach((c, index) => {
      const col = outputCols[index];
      if (!col) return;

      sheet.getRange(row, col).setValue(c.name);
      sheet.getRange(row + 1, col).setValue(c.level);
    });

    // API 안정성
    Utilities.sleep(200);
  }
  updateExpeditionRewards();
}

function updateSingleCharacter(currentSheet) {
  // 1. B6 셀에서 기준 캐릭터 이름 가져오기
  const targetRow = 6; // 작업할 행 번호 (6행)
  const baseCharacterName = currentSheet.getRange("B6").getValue();
  
  // B6 셀이 비어있으면 아무 작업도 하지 않고 종료
  if (!baseCharacterName) return;

  // 2. 로스트아크 API에서 원정대 캐릭터 목록 불러오기
  const endpoint = `/characters/${encodeURIComponent(baseCharacterName)}/siblings`;
  const characters = loaFetch(endpoint);
   
  // 3. 아이템 레벨을 숫자로 변환하고, 높은 순서대로 정렬하여 상위 6개만 자르기
  const sorted = characters
    .map(c => ({
      name: c.CharacterName,
      level: Number(c.ItemAvgLevel.replace(",", ""))
    }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 6); 

// 4. 출력할 열 지정 (B, E, H, K, N, Q)
  const outputCols = [2, 5, 8, 11, 14, 17];

  // 5. 데이터를 쓰기 전에 기존에 있던 글자 지우기 (6행: 이름, 7행: 레벨)
  outputCols.forEach(col => {
    currentSheet.getRange(targetRow, col, 2, 1).clearContent();
  });

  // 6. 시트에 상위 6개 캐릭터의 이름과 레벨 쓰기
  sorted.forEach((c, index) => {
    const col = outputCols[index];
    if (!col) return;

    currentSheet.getRange(targetRow, col).setValue(c.name);         // 6행에 이름
    currentSheet.getRange(targetRow + 1, col).setValue(c.level);    // 7행에 레벨
  });

  // 7. API 호출 제한(Rate Limit) 방지를 위한 짧은 휴식
  Utilities.sleep(200);

  // 💡 참고: 해당 시트에도 보상 계산이 필요하다면 아래 함수를 켜주세요.
  // 단, updateExpeditionRewards 함수가 "원정대" 시트 전용으로 짜여져 있다면 
  // 수정이 필요할 수 있습니다.
  updateSingleCharacterRewards(currentSheet);
}

function updateSingleCharacter8(currentSheet) {
  // 1. B6 셀에서 기준 캐릭터 이름 가져오기
  const targetRow = 6; // 캐릭터 이름이 들어갈 행
  const baseCharacterName = currentSheet.getRange("B6").getValue();
  
  if (!baseCharacterName) return;

  // 2. 로스트아크 API 호출
  const endpoint = `/characters/${encodeURIComponent(baseCharacterName)}/siblings`;
  const characters = loaFetch(endpoint);
   
  // 3. 레벨 정렬 후 상위 8개 추출 (slice 6 -> 8로 변경)
  const sorted = characters
    .map(c => ({
      name: c.CharacterName,
      level: Number(c.ItemAvgLevel.replace(",", ""))
    }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 8); 

  // 4. 출력할 열 지정 (B, E, H, K, N, Q, T, W)
  // T=20, W=23 열을 추가했습니다.
  const outputCols = [2, 5, 8, 11, 14, 17, 20, 23];

  // 5. 기존 데이터 지우기 (6행: 이름, 7행: 레벨)
  outputCols.forEach(col => {
    currentSheet.getRange(targetRow, col, 2, 1).clearContent();
  });

  // 6. 시트에 상위 8개 캐릭터 정보 입력
  sorted.forEach((c, index) => {
    const col = outputCols[index];
    if (!col) return;

    currentSheet.getRange(targetRow, col).setValue(c.name);         // 6행 이름
    currentSheet.getRange(targetRow + 1, col).setValue(c.level);    // 7행 레벨
  });

  // 7. API 제한 방지 및 보상 갱신 호출
  Utilities.sleep(200);
  
  // 보상 갱신 함수인 updateSingleCharacterRewards 내부에도 
  // 8개 열을 처리할 수 있도록 수정이 필요할 수 있습니다.
  updateSingleCharacterRewards8(currentSheet);
}