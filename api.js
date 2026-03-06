function loaFetch(endpoint) {
  if (!endpoint) {
    throw new Error("loaFetch 호출 시 endpoint가 전달되지 않았습니다.");
  }

  const apiKey = PropertiesService.getScriptProperties().getProperty("LOA_API_KEY");
  if (!apiKey) {
    throw new Error("LOA_API_KEY가 없습니다. Script Properties를 확인하세요.");
  }

  const url = "https://developer-lostark.game.onstove.com" + endpoint;

  const options = {
    method: "get",
    headers: {
      "authorization": "bearer " + apiKey,
      "accept": "application/json"
    },
    muteHttpExceptions: true
  };

  const res = UrlFetchApp.fetch(url, options);
  return JSON.parse(res.getContentText());
}

function loaPostFetch(endpoint, payload) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("LOA_API_KEY");
  if (!apiKey) throw new Error("LOA_API_KEY가 없습니다.");

  const url = "https://developer-lostark.game.onstove.com" + endpoint;
  const options = {
    "method": "post",
    "headers": {
      "authorization": "bearer " + apiKey,
      "accept": "application/json",
      "content-type": "application/json"
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  const res = UrlFetchApp.fetch(url, options);
  const status = res.getResponseCode();
  const content = res.getContentText();

  if (status !== 200) {
    Logger.log(`[API 에러] 상태코드: ${status}, 내용: ${content}`);
    return null;
  }
  return JSON.parse(content);
}

// Test 추가