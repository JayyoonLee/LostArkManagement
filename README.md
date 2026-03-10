# LostArkManagement: 로스트아크 연동 Google 스프레드시트 자동화

## 1. 프로젝트 소개

본 프로젝트는 **로스트아크(Lost Ark)** 게임 데이터를 Google 스프레드시트에서 효율적으로 관리하기 위한 **Google Apps Script** 기반의 자동화 도구입니다.

로스트아크 공식 API와 연동하여, 수동으로 입력해야 했던 캐릭터 정보, 주간 골드 획득 현황, 거래소 시세 등을 자동으로 업데이트하여 사용자의 편의성을 극대화하는 것을 목표로 합니다.

## 2. 주요 기능

- **원정대 캐릭터 정보 자동 동기화**: 지정된 캐릭터를 기준으로 원정대 내 모든 캐릭터의 이름과 아이템 레벨을 자동으로 불러와 정렬합니다.
- **주간 콘텐츠 보상 자동 계산**: 캐릭터의 아이템 레벨에 맞춰 '레벨별' 시트에 정리된 데이터를 기반으로, 주간 획득 가능 골드를 자동으로 계산하고 표시합니다.
- **거래소 시세 추적**: '거래소' 시트에 등록된 관심 품목의 현재 최저가, 최근 거래가를 자동으로 조회하고 업데이트 시간을 기록합니다.
- **편의 기능**: 모든 시트의 체크박스를 한 번에 초기화하는 등 반복 작업을 줄여주는 유틸리티 기능을 제공합니다.

## 3. 프로젝트 구조 (Project Structure)

```
LostArkManagement/
├── api.js                # 로스트아크 공식 API 인증 및 데이터 요청/응답 처리
├── character.js          # 원정대/개별 캐릭터 시트의 정보 동기화 및 보상 계산 로직
├── market.js             # 거래소 시트의 아이템 시세 조회 로직
├── levelSheetHandler.js  # '레벨별' 시트 편집 시, 레벨에 맞는 추천 골드 획득처 자동 계산
├── sheetUtils.js         # 모든 시트의 체크박스 초기화 등 유틸리티 기능
├── Code.js               # `onEdit`과 같이 스프레드시트의 특정 이벤트를 감지하고 처리하는 로직
├── appsscript.json       # Apps Script 프로젝트 설정 파일
└── README.md             # 프로젝트 설명서
```

## 4. 파일별 상세 설명

### `api.js`
- 로스트아크 API에 접근하기 위한 핵심 파일입니다.
- `loaFetch(endpoint)`: GET 방식의 API 요청을 처리합니다.
- `loaPostFetch(endpoint, payload)`: POST 방식의 API 요청을 처리합니다. (주로 경매장 검색에 사용)
- API Key는 스크립트 속성(`PropertiesService`)에 저장하여 보안을 유지합니다.

### `character.js`
- 캐릭터 정보를 시트에 쓰고 업데이트하는 대부분의 로직을 담당합니다.
- `processAllTargetSheets()`: 모든 시트를 순회하며 시트 이름에 따라 적절한 업데이트 함수를 호출하는 메인 컨트롤러 역할을 합니다.
- `writeCharacterList()`: '원정대' 시트에 원정대 캐릭터 목록을 아이템 레벨 순으로 정렬하여 출력합니다.
- `updateSingleCharacter()`, `updateSingleCharacter8()`: 개별 캐릭터 시트에서 기준 캐릭터를 중심으로 레벨 상위 6명 또는 8명의 정보를 업데이트합니다.
- `updateExpeditionRewards()`, `updateSingleCharacterRewards()`: '레벨별' 시트의 데이터를 참조하여 캐릭터 레벨에 맞는 주간 콘텐츠 보상(골드)을 계산하여 시트에 기입합니다.
- `clearAllCheckboxes()`: '원정대' 시트의 모든 체크박스를 초기화합니다.

### `market.js`
- `updateMyCustomItems()`: '거래소' 시트에 사용자가 입력한 아이템 목록을 순회하며 API를 통해 각 아이템의 '최근 거래가'와 '현재 최저가'를 가져와 B, C열에 업데이트하고, D열에 조회 시간을 기록합니다.

### `levelSheetHandler.js`
- `handleLevelEdit(e)`: 사용자가 '레벨별' 시트의 B열(기준 레벨)을 수정했을 때 `onEdit` 트리거에 의해 실행됩니다. '골드표'에 있는 데이터를 바탕으로, 해당 레벨에서 골드를 가장 많이 획득할 수 있는 상위 3개 콘텐츠를 찾아 자동으로 기입해줍니다.

### `sheetUtils.js`
- `clearAllCheckboxesFromAllSheets()`: 여러 시트에 분산된 체크박스를 일괄적으로 `false`(해제) 상태로 초기화합니다. 단, 다른 셀을 참조하는 등 수식이 적용된 체크박스는 제외하여 데이터 무결성을 유지합니다.

### `Code.js`
- `onEdit(e)`: Google 스프레드시트에서 사용자가 셀을 수정할 때마다 자동으로 실행되는 기본 트리거 함수입니다. 현재 `levelSheetHandler.js`의 `handleLevelEdit` 함수를 호출하는 역할을 합니다.

## 5. 사용 방법

1.  **API 키 설정**: Google Apps Script 편집기에서 `파일 > 프로젝트 속성 > 스크립트 속성`으로 이동하여 `LOA_API_KEY`라는 이름으로 로스트아크에서 발급받은 API 키를 추가해야 합니다.
2.  **함수 실행**:
    -   Google 스프레드시트에서 `확장 프로그램 > 매크로`를 통해 원하는 함수(예: `processAllTargetSheets`)를 직접 실행할 수 있습니다.
    -   `onEdit`과 같은 단순 트리거는 시트가 수정될 때 자동으로 실행됩니다.
    -   정해진 시간마다 자동으로 실행하려면 Apps Script 편집기의 `트리거` 메뉴에서 시간 기반 트리거를 설정할 수 있습니다. (예: `updateMyCustomItems`를 1시간마다 실행)
