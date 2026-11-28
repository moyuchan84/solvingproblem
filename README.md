# 그럴 땐 어떻게?

초등 1학년부터 중학생까지, 현실에서 누구에게나 생길 수 있는 어려운 상황을 이야기 게임으로 겪어 보며 **문제 해결 능력**을 키우는 웹 게임입니다. 외워서 맞히는 정답은 없습니다.

- 에피소드 1: **열나는 밤, 지갑엔 3천 원** (추천 초등 4학년 이상, 엔딩 6가지)
- 에피소드 2: **엄마가 안 보여요** (추천 초등 1~3학년, 엔딩 5가지)
- 나이 선택: 초등 1~3학년 / 초등 4~6학년 / 중학생
- 실행: `index.html`을 브라우저로 열면 됩니다. 빌드나 설치가 필요 없습니다.

## 화면 구조: 비주얼 노벨 레이어

배경 → 캐릭터(표정 차분) → 이벤트 CG → 휴대폰 화면 → 대사창을 따로 겹칩니다. 그림 몇 장으로 많은 장면을 만들 수 있고, 진짜 일러스트는 `assets/manifest.js`에 경로만 적으면 바로 들어갑니다. 에피소드 1·2의 그림(캐릭터 33장, 배경 11장, CG 2장)은 Gemini로 만들어 모두 들어가 있고, 새 에피소드에서 아직 없는 그림은 코드로 그린 임시 그림이 채웁니다. 원본과 변환 스크립트는 `art-src/`에 있습니다.

- 그림 규격, 만드는 순서, 이미지 생성 문장: [docs/ART_PIPELINE.md](docs/ART_PIPELINE.md)
- 나이별 이야기 지도: [docs/STORY_MAP.md](docs/STORY_MAP.md)
- 인물·표정·배경별 이미지 생성 문장 (복사 버튼): `tools/prompts.html`
- 새 그림을 끌어다 놓고 합성 확인: `tools/compose.html`

## 구조

```
index.html               게임 화면
css/style.css            디자인 (밝은/어두운 테마)
assets/manifest.js       진짜 일러스트 등록부
js/art.js                임시 그림 (배경, 배경 차분, 캐릭터 표정)
js/engine.js             이야기 엔진: 레이어 무대, 대본 지시어, 게이지, 단서 카드, 엔딩 회고
scenarios/fever-night.js 에피소드 1
scenarios/lost-mart.js   에피소드 2
scenarios/catalog.js     처음 화면의 이야기 지도
tools/prompts.html       이미지 생성 문장 모음 (데이터: tools/prompts-data.js)
tools/compose.html       장면 합성 미리보기
docs/                    설계 문서
```

새 에피소드는 `scenarios/`에 같은 형식의 파일을 만들고 `index.html`에 `<script>` 한 줄을 추가하면 처음 화면에 나타납니다. 게이지 종류(`gauges`)와 가능한 학년(`ages`)은 에피소드마다 정합니다. 대본 형식과 지시어(`@bg`, `@show`, `@face`, `@cg` …)는 `docs/ART_PIPELINE.md` 6장에 있습니다.
