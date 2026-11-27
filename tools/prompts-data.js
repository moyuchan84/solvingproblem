/* 이미지 생성 문장 데이터 (tools/prompts.html에서 사용)
 *
 * 문장은 영어로 쓴다. 이미지 생성 AI는 영어 문장에서 결과가 더 안정적이다.
 * 한 장의 문장 = 공통 그림체 + 종류별 틀 + 인물 설정 + 표정/장면.
 * 표정 차분은 "기준 그림을 참고 이미지로 넣고 표정만 바꾸기" 방식이라 얼굴이 바뀌지 않는다.
 */
window.PROMPTS = {
  style: 'Korean slice-of-life visual novel illustration, soft cel shading, clean thin lineart, warm gentle colors, friendly rounded faces, age-appropriate for children, consistent character design, no text, no watermark, no logo',

  spriteFrame: 'Full body standing character sprite, front view slightly angled, whole body visible from top of head to shoes with a small margin, centered, feet at the bottom center, solid plain white background, no shadow on the ground, tall vertical image 5:9',

  bgFrame: 'Background art only, no people unless described, eye-level camera, wide 16:9 composition, keep important details in the upper two thirds, leave the lower center open for characters to stand',

  editLock: 'Use the attached image as the character reference. Keep exactly the same character: same face shape, same hairstyle and hair color, same outfit and colors, same body proportions, same pose and framing, same art style, same plain white background. Change only the following:',

  bgEditLock: 'Use the attached image as the reference. Keep exactly the same room, camera angle, furniture, colors and art style. Change only the following:',

  characters: [
    {
      id: 'me', name: '하람 (주인공)',
      desc: 'an 11-year-old Korean child, chin-length dark brown bob haircut with soft bangs, big dark brown eyes, mustard-yellow hoodie, navy blue pants, white sneakers, kind and thoughtful look',
      base: { face: 'normal', ko: '보통: 차분하고 살짝 웃는 얼굴', text: 'calm neutral expression with a faint gentle smile, arms relaxed at the sides' },
      faces: [
        { face: 'worry', ko: '걱정: 눈썹이 가운데로 올라가고 후드 끝을 꼭 쥠', text: 'worried expression: inner eyebrows raised and slightly furrowed, small frown, eyes a little glossy, one hand gripping the hem of the hoodie near the chest' },
        { face: 'surprised', ko: '놀람: 눈이 동그래지고 두 손이 가슴 앞으로', text: 'surprised expression: eyes wide open, eyebrows raised high, mouth in a small round "o", both hands slightly raised in front of the chest' },
        { face: 'smile', ko: '웃음: 안심한 듯 환한 미소', text: 'relieved happy expression: bright warm smile, eyes gently curved, shoulders relaxed' }
      ]
    },
    {
      id: 'doyun', name: '도윤 (여덟 살 동생)',
      desc: 'an 8-year-old Korean boy, noticeably shorter and younger than an 11-year-old, messy short black hair, round face, light blue pajamas with small white polka dots, barefoot or soft slippers',
      base: { face: 'normal', ko: '보통: 평범한 얼굴', text: 'neutral calm expression, arms at the sides' },
      faces: [
        { face: 'sick', ko: '아픔: 볼이 빨갛고 눈이 반쯤 감김, 이마에 손', text: 'sick feverish expression: flushed red cheeks, droopy half-closed eyes, slight frown, one hand on his forehead, shoulders slightly hunched. Keep it gentle, not scary' },
        { face: 'smile', ko: '웃음: 힘은 없지만 안심한 미소', text: 'weak but relieved smile, cheeks still slightly pink, eyes softly open' }
      ]
    },
    {
      id: 'mom', name: '엄마',
      desc: 'a Korean woman in her early 40s, long straight black hair, blue-gray factory work jacket over a plain shirt, dark pants, tired but kind eyes',
      base: { face: 'normal', ko: '보통: 피곤하지만 다정한 얼굴', text: 'calm kind expression, slightly tired eyes, arms relaxed' },
      faces: [
        { face: 'worry', ko: '걱정: 한 손을 입가에, 불안한 눈빛', text: 'anxious worried expression, eyebrows drawn together, one hand near her mouth' },
        { face: 'smile', ko: '웃음: 안도하는 따뜻한 미소', text: 'relieved warm smile, eyes soft and a little teary with relief' }
      ]
    },
    {
      id: 'grandma', name: '옆집 할머니',
      desc: 'a Korean grandmother in her 70s, gray hair tied in a neat bun, gentle wrinkles, rose-colored knit cardigan over a light blouse, dark gray long skirt, comfortable house shoes',
      base: { face: 'normal', ko: '보통: 온화한 얼굴', text: 'gentle calm expression, hands loosely clasped in front' },
      faces: [
        { face: 'worry', ko: '걱정: 한 손을 볼에 대고 걱정스러운 눈', text: 'concerned expression, eyebrows tilted, one hand on her cheek' },
        { face: 'smile', ko: '웃음: 눈가 주름이 지는 따뜻한 미소', text: 'warm reassuring smile with crinkled eyes, one hand slightly extended as if to help' }
      ]
    },
    {
      id: 'nurse', name: '간호사 선생님',
      desc: 'a Korean nurse in her 30s, mint green scrubs, hair tied back in a low ponytail, blank name badge with no text, white sneakers',
      base: { face: 'normal', ko: '보통: 차분하게 귀 기울이는 얼굴', text: 'attentive professional expression, holding a clipboard at waist height' },
      faces: [
        { face: 'smile', ko: '웃음: 친절하게 격려하는 미소', text: 'kind encouraging smile, still holding the clipboard' }
      ]
    },
    {
      id: 'doc', name: '의사 선생님',
      desc: 'a Korean pediatric doctor in his 40s, short black hair, round glasses, white coat over navy clothes, stethoscope around the neck',
      base: { face: 'normal', ko: '보통: 차분하게 설명하는 얼굴', text: 'calm attentive expression, one hand slightly raised as if explaining' },
      faces: [
        { face: 'smile', ko: '웃음: 안심시키는 미소', text: 'warm reassuring smile, hands relaxed' }
      ]
    },
    {
      id: 'driver', name: '택시 기사님',
      desc: 'a Korean taxi driver in his 50s, dark navy cap, gray-blue zip jacket, friendly face',
      base: { face: 'normal', ko: '보통', text: 'neutral friendly expression, arms relaxed' },
      faces: [
        { face: 'smile', ko: '웃음: 푸근한 웃음', text: 'big friendly grin' }
      ]
    }
  ],

  backgrounds: [
    { id: 'room_sick', ko: '아이 방, 밤 (동생이 아파서 누워 있음)', ref: '도윤 기준 그림을 참고 이미지로 함께 넣기',
      text: 'A small cozy Korean apartment kids bedroom at night. On the left, a single bed with a light blue blanket; the 8-year-old boy from the reference image lies in it with his head on a white pillow, flushed red cheeks, eyes closed, looking feverish but peaceful. A window on the right side of the back wall shows a crescent moon and stars. A desk with a warm glowing desk lamp in the right corner. A small framed landscape picture on the wall. Calm, quiet, slightly worried mood, deep blue night tones with warm lamp light' },
    { id: 'room_towel', ko: '같은 방, 동생 이마에 물수건', from: 'room_sick',
      edit: 'put a folded white damp towel on the boy\'s forehead and make his face look more relaxed and comfortable, with only light pink cheeks' },
    { id: 'morning_sick', ko: '같은 방, 아침 (동생은 아직 아픔)', from: 'room_sick',
      edit: 'change the time to early morning: soft orange sunrise light through the window, no moon or stars, the desk lamp turned off, warmer and brighter room colors. The boy still looks sick' },
    { id: 'morning_towel', ko: '같은 방, 아침 (물수건, 편안해진 동생)', from: 'room_towel',
      edit: 'change the time to early morning: soft orange sunrise light through the window, no moon or stars, the desk lamp turned off, warmer and brighter room colors. The boy sleeps peacefully with the towel on his forehead' },
    { id: 'hall', ko: '아파트 복도, 밤',
      text: 'A Korean apartment building hallway at night, lit by cool fluorescent ceiling lights. Two front doors side by side, one gray-blue on the left and one wooden brown on the right, each with a blank number plate above. Clean tiled floor, beige walls, quiet atmosphere' },
    { id: 'street', ko: '밤거리',
      text: 'A quiet Korean neighborhood street at night. A warm streetlamp in the center, a zebra crosswalk on the road, apartment buildings with some lit windows in the background, a few stars in a deep blue sky. Safe, calm feeling, not scary' },
    { id: 'clinic', ko: '달빛어린이병원 대기실 (밤에 여는 어린이 병원)',
      text: 'The waiting room of a small Korean pediatric night clinic. Bright mint-colored walls, a reception desk on the right, a row of small colorful chairs for children on the left, a blank sign board near the ceiling for text to be added later, a crescent moon motif on the wall. Clean, friendly, reassuring, bright lighting' },
    { id: 'er', ko: '응급실',
      text: 'A hospital emergency room seen from the waiting area. Beds separated by light blue curtains, a nurse station, a blank red sign board above for text to be added later, busy but orderly atmosphere. No blood, no injuries visible, nothing frightening for children' }
  ],

  cgs: [
    { id: 'clinic_walk_home', ko: '이벤트 CG: 약 봉투를 들고 동생과 밤길을 걷는 뒷모습', ref: '하람, 도윤 기준 그림을 참고 이미지로 함께 넣기',
      text: 'Event illustration, wide 16:9. Seen from behind, the 11-year-old child and the 8-year-old boy from the reference images walk home together on a quiet night street under warm streetlamps. The older child holds a small white pharmacy paper bag in one hand and the younger boy\'s hand in the other. The younger boy wears a padded jacket over his pajamas. Gentle, warm, relieved mood, soft starry sky' }
  ]
};
