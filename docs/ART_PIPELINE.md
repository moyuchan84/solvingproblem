# 그림 만드는 법: 비주얼 노벨 레이어 구조

일본 노벨 게임이나 유튜브 영상 편집처럼, 화면 하나를 **여러 장의 그림을 겹쳐서** 만듭니다.
배경 한 장에 캐릭터를 따로 올리기 때문에, 그림 몇 장으로 수많은 장면을 만들 수 있습니다.

```
┌─────────────────────────────── 화면 (16:9) ───────────────────────────────┐
│ ⑤ 대사창 / 이름표            (코드가 그림)                                  │
│ ④ 휴대폰 화면, 효과          (코드가 그림: 통화, AI 채팅, 검색)               │
│ ③ 이벤트 CG                  결정적인 순간 한 장 (있을 때만 덮음)            │
│ ② 캐릭터(입간판, 立ち絵)      인물 × 표정. 투명 배경. 왼쪽·가운데·오른쪽      │
│ ① 배경                        장소 × 시간. 배경에 붙은 사람·물건은 "배경 차분" │
└───────────────────────────────────────────────────────────────────────────┘
```

예: 옆집 복도 장면 = `bg/hall` + `chars/me/worry` (왼쪽) + `chars/grandma/normal` (오른쪽).
할머니가 웃으면 `chars/grandma/smile`로 **그림 한 장만** 바뀝니다.

## 1. 규격

| 종류 | 크기 | 배경 | 파일 | 규칙 |
|---|---|---|---|---|
| 배경 | 1920×1080 | 불투명 | `assets/bg/<id>.webp` | 사람이 서 있을 자리는 비워 두기. 중요한 건 위쪽 3분의 2에 (아래는 대사창이 가림) |
| 배경 차분 | 1920×1080 | 불투명 | `assets/bg/<id>_<차분>.webp` | 같은 구도에서 일부만 바뀐 것. 예: `room_sick`(동생이 아파 누움), `room_towel`(물수건 올림) |
| 캐릭터 | 1000×1800 | **투명** | `assets/chars/<인물>/<표정>.webp` | 발끝이 그림 아래 가운데. **모든 인물이 같은 축척**(그래야 키 차이가 그대로 보임) |
| 이벤트 CG | 1920×1080 | 불투명 | `assets/cg/<id>.webp` | 엔딩, 결정적인 순간 같은 한 장면 |

- 캐릭터는 정면이나 살짝 비스듬한 자세 하나로 통일하고, **표정과 손 모양만** 바꿉니다.
- WebP(품질 85 정도)로 저장하면 휴대폰에서도 빨리 뜹니다. 캐릭터 한 장에 200KB 이하가 목표입니다.
- 다 만든 뒤 `assets/manifest.js`에 경로를 적으면 게임에 바로 반영됩니다. 적지 않은 칸은 지금의 임시 그림이 계속 채웁니다.

## 2. 만드는 순서 (유튜브 영상 만들 때와 비슷)

1. **그림체 고정**: 아래 "공통 그림체" 문장을 모든 생성에 똑같이 붙입니다.
2. **캐릭터 시트 먼저**: 인물마다 정면 전신 한 장을 여러 번 뽑아 가장 좋은 것을 **기준 그림**으로 확정합니다.
3. **표정 차분**: 기준 그림을 참고 이미지로 넣고 "같은 인물, 같은 옷, 같은 자세, 표정만 ○○"으로 요청합니다. 이렇게 해야 얼굴이 바뀌지 않습니다.
4. **배경**: 사람 없이 장소만 그립니다. 시점은 사람 눈높이로 통일합니다.
5. **누끼(배경 제거)**: 캐릭터 그림의 배경을 지워 투명 PNG/WebP로 만듭니다.
6. **크기 맞추기**: 1000×1800 캔버스에 발끝이 아래 가운데 오도록 놓습니다. 어른 머리끝이 캔버스 위에서 약 5%, 여덟 살 아이 머리끝이 약 30% 지점이면 됩니다.
7. **합성 확인**: `tools/compose.html`을 열고 그림을 끌어다 놓아 실제 화면에서 어떻게 겹치는지 봅니다.
8. **검수**: 장면마다 얼굴이 같은 사람으로 보이는지, 손가락·글자가 깨지지 않았는지, 아이에게 무섭지 않은지 사람이 확인합니다.
9. `assets/manifest.js`에 등록합니다.

## 3. 공통 그림체 (모든 생성 문장 앞에 붙이기)

```
Korean slice-of-life visual novel illustration, soft cel shading, clean thin lineart,
warm gentle colors, friendly rounded faces, age-appropriate for children,
consistent character design, no text, no watermark
```

캐릭터용으로 덧붙임:
```
full body standing sprite, front view slightly angled, neutral standing pose,
plain white background, whole body visible from head to shoes, centered
```

배경용으로 덧붙임:
```
background art only, no people, eye-level camera, 16:9,
leave the lower center open for characters
```

## 4. 에피소드 1 캐릭터

| id | 인물 | 설정 (생성 문장에 넣을 내용) | 필요한 표정 |
|---|---|---|---|
| `me` | 하람 (주인공) | 11-year-old Korean child, shoulder-length dark brown bob hair, yellow hoodie, navy pants, sneakers | normal, worry, surprised, smile |
| `doyun` | 도윤 (동생) | 8-year-old Korean boy, messy short black hair, light blue pajamas with small white dots | sick(볼이 빨갛고 힘없는 눈), normal, smile |
| `mom` | 엄마 | Korean woman in her early 40s, long straight black hair, blue-gray work jacket, tired but kind eyes | normal, worry, smile |
| `grandma` | 옆집 할머니 | Korean grandmother in her 70s, gray hair in a bun, rose-colored knit cardigan, gentle wrinkles | normal, worry, smile |
| `nurse` | 간호사 선생님 | Korean nurse in her 30s, mint scrubs, hair tied back, name badge without text | normal, smile |
| `doc` | 의사 선생님 | Korean pediatric doctor in his 40s, round glasses, white coat over navy clothes | normal, smile |
| `driver` | 택시 기사님 | Korean taxi driver in his 50s, dark cap, gray-blue jacket | normal, smile |

표정 요청 예시 (기준 그림을 참고 이미지로 함께 넣기):
```
Same character as the reference image, same outfit, same pose, same proportions.
Change only the facial expression to: worried, eyebrows raised in the middle, lips slightly pressed.
```

## 5. 에피소드 1 배경

| id | 장소 | 설명 |
|---|---|---|
| `room_sick` | 아이 방, 밤 | 작은 아파트 방. 왼쪽 침대에 도윤이가 이불 덮고 누움(볼 빨감). 창밖 달, 책상 스탠드 불빛 |
| `room_towel` | 〃 | 같은 구도, 도윤이 이마에 하얀 물수건, 조금 편해진 얼굴 |
| `morning_sick` / `morning_towel` | 아이 방, 아침 | 같은 구도, 창으로 아침 햇살 |
| `hall` | 아파트 복도, 밤 | 1203호와 1204호 현관문, 형광등 |
| `street` | 밤거리 | 가로등, 횡단보도, 불 켜진 아파트 창문 |
| `clinic` | 달빛어린이병원 대기실 | 밝은 민트색 벽, 접수대, 아이용 의자. 간판 글자는 나중에 코드로 얹을 수 있게 비워 두기 |
| `er` | 응급실 | 커튼으로 나뉜 침대, 바쁜 분위기. 피나 상처는 그리지 않기 |

이벤트 CG (있으면 좋음): `clinic_walk_home` 약 봉투를 들고 동생과 함께 밤길을 걷는 뒷모습.

## 6. 대본에서 그림 쓰기

장면(`node`)에 기본 배경과 인물을 적고, 대사 중간에 지시어로 바꿉니다.

```js
bg: 'hall',
cast: [['me', 'worry', 'left'], ['grandma', 'normal', 'right']],
lines: [
  ['grandma@worry', '저런, 많이 놀랐겠구나.'],   // 말하면서 표정 바꾸기
  ['@face', 'grandma', 'smile'],                // 대사 없이 표정만
  ['@show', 'doc', 'center', 'normal'],         // 인물 등장
  ['@hide', 'doc'],                             // 퇴장
  ['@bg', 'street'],                            // 배경 바꾸기
  ['@cg', 'clinic_walk_home'],                  // 이벤트 CG (그림이 없으면 건너뜀)
  ['@shake'],                                   // 화면 흔들기
]
```

## 7. 주의할 점

- 실존 인물, 유명 캐릭터, 특정 작품의 그림체를 흉내 내지 않습니다.
- 병원·경찰·119 같은 실제 기관의 로고는 넣지 않습니다. 간판 글자는 코드로 얹습니다.
- 이미지 생성 서비스마다 상업적 이용 조건이 다르니, 출시 전에 이용약관을 확인합니다.
- 아이가 나오는 그림은 옷차림·자세를 특히 신경 써서 검수합니다.
