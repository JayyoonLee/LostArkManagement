# 프로젝트 개요: LostArkManagement

## 1. 프로젝트 소개
본 프로젝트는 **로스트아크(Lost Ark)** 게임의 캐릭터 데이터를 스프레드시트에서 효율적으로 관리하기 위한 **Google Apps Script** 기반의 자동화 도구입니다. 공식 API를 연동하여 캐릭터 정보를 자동으로 동기화하고, 레벨에 따른 주간 콘텐츠 보상을 계산하여 시트에 반영합니다.

## 2. 프로젝트 구조 (Project Structure)
프로젝트는 크게 API 연동, 데이터 처리 로직, 스프레드시트 이벤트 관리로 나뉩니다.

```text
LostArkManagement/
├── api.js                # 로스트아크 공식 API 인증 및 데이터 Fetch
├── character.js          # 원정대/개별 시트 데이터 동기화 및 정렬
├── Code.js               # 시트 편집 이벤트(onEdit) 및 보상 계산 로직
├── appsscript.json       # Apps Script 프로젝트 설정 파일
└── .clasp.json           # clasp 배포 설정 파일
