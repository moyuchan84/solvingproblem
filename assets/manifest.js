/* 에셋 목록 — 진짜 일러스트를 여기에 등록한다.
 *
 * 비어 있는 칸은 코드로 그린 임시 그림이 자동으로 채운다.
 * 규격과 만드는 법은 docs/ART_PIPELINE.md 참고.
 *
 *   배경   assets/bg/<배경id>.webp            1920x1080, 불투명
 *   캐릭터 assets/chars/<인물id>/<표정>.webp   1000x1800, 투명 배경, 발끝이 아래 가운데, 모든 인물 같은 축척
 *   CG     assets/cg/<cgid>.webp              1920x1080, 이야기의 결정적 장면 한 장
 */
window.ASSET_MANIFEST = {
  bg: {
    // room_sick:  'assets/bg/room_sick.webp',
    // street:     'assets/bg/street.webp',
  },
  chars: {
    // me: {
    //   normal:    'assets/chars/me/normal.webp',
    //   worry:     'assets/chars/me/worry.webp',
    //   surprised: 'assets/chars/me/surprised.webp',
    //   smile:     'assets/chars/me/smile.webp',
    // },
  },
  cg: {
    // clinic_walk_home: 'assets/cg/clinic_walk_home.webp',
  }
};
