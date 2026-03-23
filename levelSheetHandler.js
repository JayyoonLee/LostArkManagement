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
      .replace(" 나이트메어", "")
      .replace(" 1단계", "")
      .replace(" 2단계", "")
      .replace(" 3단계", "");
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