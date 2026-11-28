/* 에셋 목록 — 진짜 일러스트를 여기에 등록한다.
 *
 * art-src/process.js가 자동으로 만든다 (Gemini로 그린 원본 → WebP).
 * 비어 있는 칸은 코드로 그린 임시 그림(js/art.js)이 자동으로 채운다.
 * 규격과 만드는 법은 docs/ART_PIPELINE.md 참고.
 *
 *   배경   assets/bg/<배경id>.webp            1920x1080, 불투명
 *   캐릭터 assets/chars/<인물id>/<표정>.webp   1000x1800, 투명 배경, 발끝이 아래 가운데, 모든 인물 같은 축척
 *   CG     assets/cg/<cgid>.webp              1920x1080, 이야기의 결정적 장면 한 장
 */
window.ASSET_MANIFEST = {
  "bg": {
    "clinic": "assets/bg/clinic.webp",
    "er": "assets/bg/er.webp",
    "hall": "assets/bg/hall.webp",
    "mart_aisle": "assets/bg/mart_aisle.webp",
    "mart_exit": "assets/bg/mart_exit.webp",
    "mart_info": "assets/bg/mart_info.webp",
    "morning_sick": "assets/bg/morning_sick.webp",
    "morning_towel": "assets/bg/morning_towel.webp",
    "room_sick": "assets/bg/room_sick.webp",
    "room_towel": "assets/bg/room_towel.webp",
    "street": "assets/bg/street.webp"
  },
  "chars": {
    "clerk": {
      "normal": "assets/chars/clerk/normal.webp",
      "smile": "assets/chars/clerk/smile.webp"
    },
    "customer": {
      "normal": "assets/chars/customer/normal.webp",
      "smile": "assets/chars/customer/smile.webp"
    },
    "doc": {
      "normal": "assets/chars/doc/normal.webp",
      "smile": "assets/chars/doc/smile.webp"
    },
    "doyun": {
      "normal": "assets/chars/doyun/normal.webp",
      "sick": "assets/chars/doyun/sick.webp",
      "smile": "assets/chars/doyun/smile.webp"
    },
    "doyun_day": {
      "cry": "assets/chars/doyun_day/cry.webp",
      "normal": "assets/chars/doyun_day/normal.webp",
      "smile": "assets/chars/doyun_day/smile.webp",
      "surprised": "assets/chars/doyun_day/surprised.webp",
      "worry": "assets/chars/doyun_day/worry.webp"
    },
    "driver": {
      "normal": "assets/chars/driver/normal.webp",
      "smile": "assets/chars/driver/smile.webp"
    },
    "grandma": {
      "normal": "assets/chars/grandma/normal.webp",
      "smile": "assets/chars/grandma/smile.webp",
      "worry": "assets/chars/grandma/worry.webp"
    },
    "me": {
      "normal": "assets/chars/me/normal.webp",
      "smile": "assets/chars/me/smile.webp",
      "surprised": "assets/chars/me/surprised.webp",
      "worry": "assets/chars/me/worry.webp"
    },
    "mom": {
      "normal": "assets/chars/mom/normal.webp",
      "smile": "assets/chars/mom/smile.webp",
      "worry": "assets/chars/mom/worry.webp"
    },
    "mom_day": {
      "normal": "assets/chars/mom_day/normal.webp",
      "smile": "assets/chars/mom_day/smile.webp",
      "worry": "assets/chars/mom_day/worry.webp"
    },
    "nurse": {
      "normal": "assets/chars/nurse/normal.webp",
      "smile": "assets/chars/nurse/smile.webp"
    },
    "stranger": {
      "normal": "assets/chars/stranger/normal.webp",
      "smile": "assets/chars/stranger/smile.webp"
    }
  },
  "cg": {
    "clinic_walk_home": "assets/cg/clinic_walk_home.webp",
    "mom_hug": "assets/cg/mom_hug.webp"
  }
};
