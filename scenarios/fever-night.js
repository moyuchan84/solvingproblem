/* 에피소드 1: 열나는 밤, 지갑엔 3천 원
 *
 * 구조
 *  - nodes: 장면. lines는 [말하는사람, 대사, 보여줄나이[]] 배열(또는 S를 받아 배열을 돌려주는 함수)
 *  - 대사·선택지 글자는 문자열, {low, mid, teen} 객체, 또는 (S) => 문자열
 *  - choices: kind 'explore'(알아보기) | 'act'(해보기)
 *      need/needAny: 필요한 단서 카드, when(S): 추가 조건, locked: 조건이 안 될 때 보여줄 자물쇠 문구
 *      ages: 보여줄 나이, once: 한 번만, fx: 효과, go: 다음 장면
 *  - 나이: low(초 1~3) / mid(초 4~6) / teen(중학생)
 */
(window.EPISODES = window.EPISODES || []).push((function () {
  const has = (S, k) => S.cards.has(k);
  // had: 선택지를 고르기 직전에 이미 알고 있던 단서 (선택 효과로 새로 얻은 카드는 제외)
  const had = (S, k) => (S.had || S.cards).has(k);
  // 배경 차분: 동생이 누운 방. 물수건을 해 주면 차분이 바뀐다
  const roomBg = S => (has(S, 'care') ? 'room_towel' : 'room_sick');
  const morningBg = S => (has(S, 'care') ? 'morning_towel' : 'morning_sick');

  const cards = {
    fever39:      { t: '체온 39.2℃', d: '"많이 뜨거워요"보다 "39.2도예요"가 훨씬 정확해요. 숫자로 확인하면 어른에게 설명하기 쉬워요.', hint: '열이 몇 도인지 숫자로 확인하기' },
    danger_check: { t: '위험 신호 살피기', d: '숨쉬기 힘들어함, 경련(몸이 굳거나 떨림), 깨워도 잘 안 깸, 입술이 파래짐. 하나라도 있으면 바로 119!', hint: '동생에게 위험 신호가 있는지 살피기' },
    mom_noanswer: { t: '바로 연락이 안 될 때도 있어요', d: '부모님이 일하는 중이면 전화를 못 받을 수 있어요. 문자를 남기고, 다른 어른 연락처도 알아 두세요.', hint: '엄마에게 연락해 보기' },
    medicine_label:{ t: '약 설명서 읽기', d: '어른 약에는 "만 12세 미만 복용 금지" 같은 경고가 있어요. 아이 약은 꼭 어른이나 약사에게 확인해요.', hint: '약 상자와 설명서 확인하기' },
    ai_answer:    { t: 'AI 도우미의 답', d: 'AI는 빠르게 알려 주지만, 맞는 말과 틀린 말이 섞여 있을 수 있어요.', hint: 'AI 도우미에게 물어보기' },
    verify:       { t: '한 번 더 확인하기', d: 'AI 답과 약 설명서가 달랐어요. 몸과 안전에 관한 건 공식 정보나 전문가에게 꼭 다시 확인해요.', hint: 'AI의 답을 다른 정보와 비교해 보기' },
    source:       { t: '누가 쓴 글일까?', d: '조회수가 많다고 맞는 정보는 아니에요. 광고인지, 누가 쓴 글인지 살펴봐요. 술(알코올)로 아이 몸을 닦으면 위험해요.', hint: '인터넷 글이 믿을 만한지 따져 보기', ages: ['mid', 'teen'] },
    gov_info:     { t: '공식 정보 찾기', d: '응급의료포털(국립중앙의료원)이나 129 보건복지상담센터처럼 믿을 수 있는 곳에서 정보를 찾을 수 있어요.', hint: '믿을 수 있는 공식 사이트 찾기', ages: ['mid', 'teen'] },
    care:         { t: '미지근한 물수건', d: '찬물이나 얼음물 말고 미지근한 물로 닦아 줘요. 물은 조금씩 자주 마시게 해요.', hint: '열을 내리게 돕는 방법 해 보기' },
    '119_advice': { t: '119는 상담도 해 줘요', d: '119는 구급차만 부르는 곳이 아니에요. 아플 때 어떻게 할지, 지금 어느 병원이 열었는지도 알려 줘요.', hint: '119에 전화해서 물어보기' },
    night_clinic: { t: '밤에 여는 어린이 병원', d: '"달빛어린이병원"은 밤과 휴일에도 어린이를 진료해요. 응급실보다 덜 기다리고 비용도 적어요.', hint: '지금 문 연 병원 알아내기' },
    er_law:       { t: '응급실은 돈이 없어도', d: '법(응급의료법)에 따라 응급실은 돈이 없다는 이유로 진료를 거부할 수 없어요. 나라가 먼저 내주고 나중에 갚는 "응급의료비 대불제도"도 있어요.', hint: '돈이 없을 때 병원에 갈 방법 찾기', ages: ['mid', 'teen'] },
    neighbor:     { t: '가까운 어른', d: '옆집 할머니처럼 가까이 있는 어른에게 도움을 청하는 것도 문제를 푸는 실력이에요.', hint: '가까이 있는 어른에게 도움 청하기' },
    pay_later:    { t: '사정을 솔직하게 말하기', d: '지금 돈이 부족하다고 솔직하게 말하면, 나중에 내는 방법처럼 길이 생기기도 해요.', hint: '어려운 사정을 솔직하게 말해 보기' }
  };

  const nodes = {
    intro: {
      bg: roomBg, step: 0,
      cast: [['me', 'worry', 'right']],
      lines: [
        ['narr', '밤 10시. 엄마는 공장 야간 근무라서 아침 7시에 오세요.'],
        ['narr', '집에는 나, 하람이와 여덟 살 동생 도윤이 둘뿐이에요.'],
        ['doyun', '…나 머리가 너무 뜨거워. 어지러워.'],
        ['@shake'],
        ['me@surprised', '(이마가 불덩이 같아! 어떡하지?)'],
        ['@face', 'me', 'worry'],
        ['narr', '내 지갑에 있는 돈은 3,000원뿐이에요.'],
        ['narr', {
          low: '괜찮아요. 하나씩 해 보면 돼요. 정답은 하나가 아니에요.',
          mid: '정답은 하나가 아니에요. 알아보고, 물어보고, 해 보면서 나만의 길을 찾아보세요.',
          teen: '정해진 정답은 없어요. 무엇을 알아내고, 누구에게 묻고, 무엇을 포기할지 스스로 정해 보세요.'
        }]
      ],
      next: 'hub'
    },

    hub: {
      bg: roomBg,
      step: S => (S.cards.size === 0 ? 0 : S.cards.size < 4 ? 1 : 2),
      cast: S => [['me', S.worry > 55 ? 'worry' : 'normal', 'right']],
      lines: S => {
        const L = [];
        if (S.flags.hubSeen) L.push(['me', `지금은 ${S.clock()}. 이제 뭘 해 볼까?`]);
        else L.push(['me', '먼저 뭘 해 볼까?']);
        if (S.cond < 45) L.push(['narr', '도윤이가 아까보다 더 힘들어 보여요.']);
        S.flags.hubSeen = true;
        return L;
      },
      choices: [
        { id: 'thermo', kind: 'explore', once: true, text: '체온계로 열을 재 본다', go: 'thermo', fx: { min: 5, cards: ['fever39'], worry: -5 } },
        { id: 'observe', kind: 'explore', once: true, text: '도윤이를 자세히 살펴본다', go: 'observe', fx: { min: 5, cards: ['danger_check'], worry: -5 } },
        { id: 'callmom', kind: 'explore', once: true, text: '엄마에게 전화한다', go: 'callmom', hide: S => S.flags.momcall, fx: { min: 5, cards: ['mom_noanswer'], worry: 10 } },
        { id: 'medbox', kind: 'explore', once: true, text: '약 상자를 열어 본다', go: 'medbox', fx: { min: 5, cards: ['medicine_label'] } },
        { id: 'askai', kind: 'explore', once: true, text: '휴대폰 AI 도우미에게 물어본다', go: 'askai', fx: { min: 5, cards: ['ai_answer'] } },
        { id: 'search', kind: 'explore', once: true, ages: ['mid', 'teen'], text: '인터넷에서 직접 찾아본다', go: 'search', fx: { min: 5 } },
        { id: 'neighbor', kind: 'explore', once: true, text: '옆집 할머니께 도움을 청한다', go: 'neighbor', fx: { min: 10, cards: ['neighbor'], worry: -15 } },
        { id: 'call119', kind: 'explore', once: true, text: '119에 전화해서 어떻게 할지 물어본다', go: 'call119',
          fx: S => ({ min: 10 + (has(S, 'fever39') ? 0 : 5) + (has(S, 'danger_check') ? 0 : 5), cards: ['119_advice', 'night_clinic', 'fever39', 'danger_check'], worry: -15 }) },

        { id: 'towel', kind: 'act', once: true, needAny: ['ai_answer', '119_advice', 'gov_info'],
          locked: '열을 내리게 돕는 방법을 알아내면 열려요',
          text: '미지근한 물수건으로 닦아 주고 물을 먹인다', go: 'towel', fx: { min: 15, cards: ['care'], cond: 15, worry: -10 } },
        { id: 'adultmed', kind: 'act', once: true, need: ['ai_answer'], hide: S => has(S, 'verify'),
          text: S => has(S, 'medicine_label') ? 'AI의 답과 약 설명서를 비교해 본다' : 'AI 말대로 어른 해열제를 반 알 먹인다',
          go: 'adultmed', fx: { min: 3, cards: ['medicine_label', 'verify'] } },
        { id: 'goclinic', kind: 'act', need: ['night_clinic'], when: S => S.min < 120,
          locked: S => has(S, 'night_clinic') ? '병원 문 닫는 밤 12시가 지났어요' : '지금 문 연 병원을 알아내면 열려요',
          text: '밤에 여는 어린이 병원에 간다', go: 'goout', fx: { flags: { dest: 'clinic' } } },
        { id: 'goer', kind: 'act', need: ['er_law'], ages: ['mid', 'teen'],
          text: '응급실에 간다', go: 'goout', fx: { flags: { dest: 'er' } } },
        { id: 'wait', kind: 'act', text: '아침에 엄마가 올 때까지 기다린다', go: 'wait' }
      ]
    },

    thermo: {
      bg: roomBg, step: 0,
      cast: [['me', 'surprised', 'right']],
      lines: [
        ['narr', '삑! 체온계에 39.2℃가 떴어요.'],
        ['me@normal', '39.2도… 숫자로 알고 나니까 오히려 조금 침착해졌어.'],
        ['narr', '보통 38℃가 넘으면 열이 난다고 해요. 정확한 숫자는 누군가에게 상황을 설명할 때 큰 힘이 돼요.', ['mid', 'teen']]
      ],
      next: 'hub'
    },

    observe: {
      bg: roomBg, step: 0,
      cast: [['me', 'worry', 'right']],
      lines: [
        ['me', '도윤아, 숨 쉬는 거 힘들어? 내 말 들려?'],
        ['doyun', '응… 들려. 목이 좀 아파.'],
        ['narr', '숨은 고르게 쉬고, 대답도 잘 해요. 몸이 떨리거나 굳지도 않았어요.'],
        ['narr', '💡 숨쉬기 힘들어하거나, 경련을 하거나, 깨워도 잘 안 깨면 그때는 바로 119예요!']
      ],
      next: 'hub'
    },

    callmom: {
      bg: roomBg, step: 1, phone: { app: 'call', title: '엄마' },
      cast: [['me', 'worry', 'left']],
      lines: [
        ['narr', '뚜르르… 뚜르르…'],
        ['narr', '엄마는 전화를 받지 않아요. 공장 안에서는 휴대폰을 사물함에 넣어 둬야 하거든요.'],
        ['me', '(문자라도 남겨 두자.)'],
        ['me', '"엄마, 도윤이가 열이 많이 나. 문자 보면 전화 줘."']
      ],
      next: 'hub'
    },

    momcall: {
      bg: roomBg, step: 1, phone: { app: 'call', title: '엄마' },
      cast: [['me', 'surprised', 'left']],
      enter: S => {
        S.flags.momcall = true;
        if (S.age === 'low') S.flags.momAskedGrandma = true;
        else S.apply({ money: 20000 });
      },
      lines: S => [
        ['narr', '📞 띠리리! 엄마한테서 전화가 왔어요!'],
        ['mom', '하람아! 문자 봤어. 도윤이 많이 아파?'],
        ['me', has(S, 'fever39') ? (has(S, 'danger_check') ? '응, 재 보니까 39.2도야. 숨은 잘 쉬고 대답도 잘 해.' : '응, 재 보니까 39.2도야.') : '응, 엄청 뜨거워. 몇 도인지는 아직 몰라.'],
        ['mom', has(S, 'fever39') ? '정확하게 알려 줘서 고마워. 엄마가 판단하기 훨씬 쉬워.' : '체온계가 거실 서랍에 있어. 재 보면 도움이 될 거야.'],
        ['mom', '엄마가 지금 바로 가기는 어려워. 가는 데 한 시간 반이 걸려.'],
        S.age === 'low'
          ? ['mom', '옆집 1204호 할머니께 엄마가 전화해 둘게. 할머니께 가 보렴.']
          : ['mom', '네 체크카드로 2만 원 보냈어. 꼭 필요한 데 쓰고, 혼자 무리하지는 마.'],
        ['mom', '넌 지금 잘하고 있어. 숨쉬기 힘들어하면 바로 119야. 알았지?'],
        ['me@smile', '응, 엄마. 걱정 마!']
      ],
      next: 'hub'
    },

    medbox: {
      bg: roomBg, step: 1,
      cast: [['me', 'normal', 'center']],
      lines: [
        ['narr', '약 상자 안에는 반창고, 소화제, 그리고 어른용 해열진통제가 있어요.'],
        ['narr', '어린이 해열제 시럽은 다 먹고 빈 병만 남아 있어요.'],
        ['me', '설명서가 있네. 읽어 볼까?'],
        ['narr', '"만 12세 미만 어린이는 복용하지 마십시오."'],
        ['me', '도윤이는 여덟 살이니까… 이건 먹이면 안 되겠다.']
      ],
      next: 'hub'
    },

    askai: {
      bg: roomBg, step: 1, phone: { app: 'ai', title: 'AI 도우미' },
      cast: [['me', 'normal', 'left']],
      lines: S => [
        ['me', has(S, 'fever39') ? '"여덟 살 동생이 열이 39.2도예요. 어떻게 해요?"' : '"동생이 열이 많이 나요. 어떻게 해요?"'],
        ['ai', '열이 날 때는 미지근한 물수건으로 몸을 닦아 주고, 물을 조금씩 자주 마시게 해 주세요.'],
        ['ai', '집에 있는 어른용 해열제를 반 알 먹여도 괜찮아요.'],
        ['ai', '증상이 심하거나 걱정되면 119에 전화해 상담을 받으세요.'],
        ['me', '(오, 바로 알려 주네! 그런데… 전부 맞는 말일까?)']
      ],
      next: 'hub'
    },

    adultmed: {
      bg: roomBg, step: 3,
      cast: [['me', 'normal', 'right']],
      lines: S => (S.flags.sawLabelFirst = had(S, 'medicine_label'), [
        S.flags.sawLabelFirst ? ['me', '잠깐, AI는 어른 약 반 알이면 된다고 했는데…'] : ['me', 'AI가 반 알은 괜찮다고 했으니까…'],
        S.flags.sawLabelFirst ? ['narr', '아까 읽은 설명서를 다시 꺼내 봤어요.'] : ['narr', '약을 꺼내려는데, 상자에 붙은 설명서가 눈에 들어왔어요.'],
        ['narr', '"만 12세 미만 어린이는 복용하지 마십시오."'],
        ['@shake'],
        ['me@surprised', '어?! AI는 괜찮다고 했는데, 설명서에는 먹이지 말라고 써 있어!'],
        ['me@worry', 'AI 말도 틀릴 수 있구나. 약은 설명서랑 약사, 119에 꼭 확인해야겠다.'],
        ['narr', 'AI는 그럴듯하게 말하지만 틀린 내용이 섞일 수 있어요. 몸과 안전에 관한 건 공식 정보로 한 번 더 확인해요.', ['mid', 'teen']]
      ]),
      next: 'hub'
    },

    search: {
      bg: roomBg, step: 1, phone: { app: 'search', title: '검색' },
      cast: [['me', 'normal', 'left']],
      lines: [
        ['me', '"밤 아이 열 39도 병원 돈 없을 때" 검색!'],
        ['narr', '검색 결과가 잔뜩 나왔어요. 어떤 걸 눌러 볼까?']
      ],
      choices: [
        { kind: 'explore', text: '"열 내리는 초간단 비법! 소주로 몸 닦기" (조회수 50만 · 광고)', go: 'blog', fx: { min: 5, cards: ['source'] } },
        { kind: 'explore', text: '"응급의료포털" (국립중앙의료원)', go: 'gov', fx: { min: 10, cards: ['gov_info', 'night_clinic', 'er_law'] } }
      ]
    },

    blog: {
      bg: roomBg, step: 1, phone: { app: 'search', title: '블로그' },
      cast: [['me', 'worry', 'left']],
      lines: [
        ['narr', '"소주를 수건에 묻혀 닦으면 열이 쏙!" 글 아래에는 영양제 광고가 잔뜩 붙어 있어요.'],
        ['me', '어? 댓글에 "알코올은 피부로 흡수돼서 아이한테 위험해요"라고 써 있네.'],
        ['narr', '조회수가 많다고 맞는 정보는 아니에요. 누가 썼는지, 광고는 아닌지 살펴봐요.']
      ],
      choices: [
        { kind: 'explore', text: '믿을 수 있는 공식 사이트를 다시 찾는다', go: 'gov', fx: { min: 10, cards: ['gov_info', 'night_clinic', 'er_law'] } },
        { kind: 'explore', text: '그만 보고 돌아간다', go: 'hub' }
      ]
    },

    gov: {
      bg: roomBg, step: 1, phone: { app: 'search', title: '응급의료포털' },
      cast: [['me', 'surprised', 'left']],
      lines: [
        ['narr', '응급의료포털에서 "지금 문 연 병원"을 찾아봤어요.'],
        ['narr', '걸어서 15분 거리에 "달빛어린이병원"이 밤 12시까지 문을 열어요!'],
        ['narr', '"응급실은 돈이 없다는 이유로 진료를 거부할 수 없습니다(응급의료법)."'],
        ['narr', '"당장 돈이 없으면 나라가 먼저 내주고 나중에 갚는 응급의료비 대불제도가 있습니다."'],
        ['me', '돈이 없어도 방법이 있구나! 그래도 응급실은 정말 위급한 사람이 먼저겠지.']
      ],
      next: 'hub'
    },

    neighbor: {
      bg: 'hall', step: 1,
      cast: [['me', 'worry', 'left'], ['grandma', 'normal', 'right']],
      lines: S => [
        ['narr', '1204호 문을 두드렸어요. 똑똑.'],
        S.flags.momAskedGrandma ? ['grandma', '아이고, 하람이구나. 방금 엄마한테 전화 받았다.'] : ['grandma', '아이고, 이 밤에 웬일이니?'],
        ['me', has(S, 'fever39') ? '할머니, 도윤이가 열이 39.2도예요. 엄마는 일하러 가셨어요.' : '할머니, 도윤이가 열이 펄펄 나요. 엄마는 일하러 가셨어요.'],
        ['grandma@worry', '저런, 많이 놀랐겠구나. 할머니가 같이 있어 줄게. 병원에 가야 하면 같이 가자.'],
        ['@face', 'grandma', 'smile'],
        ['me@smile', '(혼자가 아니라서 다행이다.)']
      ],
      next: 'hub'
    },

    call119: {
      bg: roomBg, step: 1, phone: { app: 'call', title: '119' },
      cast: [['me', 'worry', 'left']],
      lines: S => {
        const L = [
          ['op', '네, 119입니다. 무슨 일이세요?'],
          ['me', '동생이 열이 많이 나요. 지금 집에 어른이 없어요.']
        ];
        if (!had(S, 'fever39')) L.push(['op', '많이 놀랐죠. 체온계 있으면 지금 같이 재 볼까요?'], ['narr', '상담원 선생님 안내에 따라 체온을 쟀어요. 39.2℃!']);
        else L.push(['me', '체온은 39.2도예요.']);
        if (!had(S, 'danger_check')) L.push(['op', '동생이 숨은 잘 쉬나요? 말을 걸면 대답하나요? 몸이 떨리거나 굳지는 않나요?'], ['me', '숨은 잘 쉬고, 대답도 해요. 떨리지는 않아요.']);
        else L.push(['me', '숨은 잘 쉬고, 대답도 잘 해요. 떨리지도 않아요.']);
        if (had(S, 'fever39') && had(S, 'danger_check')) L.push(['op', '아주 정확하게 말해 줬어요. 덕분에 빨리 판단할 수 있어요.']);
        L.push(
          ['op', '지금은 구급차가 꼭 필요한 상황은 아닌 것 같아요. 미지근한 물수건으로 닦아 주고, 물을 조금씩 먹여 주세요.'],
          ['op', '근처에 밤 12시까지 여는 달빛어린이병원이 있어요. 되도록 어른과 함께 가세요.'],
          ['op', '숨쉬기 힘들어하거나 경련을 하면, 그때는 바로 다시 119로 전화하세요.'],
          ['me', '네, 감사합니다!']
        );
        return L;
      },
      next: 'hub'
    },

    towel: {
      bg: roomBg, step: 3,
      cast: [['me', 'normal', 'right']],
      lines: [
        ['narr', '대야에 미지근한 물을 받아 수건을 적셨어요.'],
        ['narr', '이마와 목, 겨드랑이를 살살 닦아 주고, 물도 조금씩 먹였어요.'],
        ['doyun', '…시원해. 고마워.'],
        ['@face', 'me', 'smile'],
        ['narr', '💡 찬물이나 얼음물은 오히려 몸을 덜덜 떨게 할 수 있어서 미지근한 물이 좋아요.']
      ],
      next: 'hub'
    },

    goout: {
      bg: 'hall', step: 3,
      cast: S => [['me', 'normal', 'left']].concat(has(S, 'neighbor') ? [['grandma', 'normal', 'right']] : []),
      lines: S => [
        ['narr', S.flags.dest === 'er' ? '응급실에 가기로 했어요. 응급실은 차로 10분 거리예요. 어떻게 갈까?' : '달빛어린이병원은 걸어서 15분 거리예요. 어떻게 갈까?']
      ],
      choices: [
        { kind: 'act', need: ['neighbor'], locked: '함께 갈 어른을 찾으면 열려요',
          text: '옆집 할머니와 함께 택시를 탄다', go: 'ride', fx: { min: 10, flags: { withGrandma: true } } },
        { kind: 'act', ages: ['mid', 'teen'], when: S => S.money >= 10000,
          locked: S => `택시비가 모자라요 (지금 가진 돈 ${S.won(S.money)})`,
          text: '혼자 택시를 부른다 (약 6,000원)', go: 'ride', fx: { min: 10, money: -6000, flags: { taxiAlone: true } } },
        { kind: 'act', ages: ['mid', 'teen'], hide: S => S.flags.dest === 'er',
          text: '도윤이를 업고 둘이 걸어간다', go: 'walk', fx: { min: 20, cond: -8, worry: 10, flags: { walked: true } } },
        { kind: 'explore', text: '다시 생각해 본다', go: 'hub' }
      ]
    },

    ride: {
      bg: 'street', step: 3,
      cast: S => S.flags.withGrandma ? [['me', 'normal', 'left'], ['grandma', 'smile', 'right']] : [['me', 'normal', 'left'], ['driver', 'smile', 'right']],
      lines: S => S.flags.withGrandma
        ? [['narr', '택시가 밤길을 달려요. 도윤이는 할머니 무릎에 기대 있어요.'], ['grandma', '걱정 마라. 택시비는 할머니가 낼게.']]
        : [['narr', '택시가 밤길을 달려요.'], ['driver', '아이들끼리 병원 가는구나. 조심히 들어가고, 꼭 보호자한테 연락해!']],
      next: S => (S.flags.dest === 'er' ? 'er' : 'clinic')
    },

    walk: {
      bg: 'street', step: 3,
      cast: [['me', 'worry', 'center']],
      lines: [
        ['narr', '차가운 밤바람이 불어요. 도윤이를 업고 걸었어요.'],
        ['doyun', '…추워.'],
        ['me', '(가로등이 밝은 큰길로 가자. 조금만 참아!)'],
        ['narr', '15분 뒤, 병원 불빛이 보였어요.']
      ],
      next: 'clinic'
    },

    clinic: {
      bg: 'clinic', step: 3,
      cast: [['me', 'normal', 'left'], ['nurse', 'smile', 'right']],
      lines: S => {
        const L = [
          ['narr', '달빛어린이병원. 밤인데도 아픈 아이들이 꽤 있어요.'],
          ['nurse', '어떻게 오셨어요?'],
          ['me', has(S, 'fever39') ? '동생이 열이 39.2도예요. 숨은 잘 쉬고, 목이 아프대요.' : '동생이 열이 많이 나요.']
        ];
        if (has(S, 'fever39')) L.push(['nurse', '정확하게 말해 줘서 접수가 빨리 됐어요. 잘했어요.']);
        L.push(['narr', '진료실에서 의사 선생님이 도윤이를 봐 주셨어요.'], ['@hide', 'nurse'], ['@show', 'doc', 'right', 'normal'], ['doc', '목이 많이 부었네요. 목감기예요. 약 먹고 푹 쉬면 나을 거예요.']);
        if (has(S, 'care')) L.push(['doc@smile', '집에서 물수건으로 닦아 줬구나. 아주 잘했어요.'], ['@face', 'me', 'smile']);
        L.push(['@hide', 'doc'], ['@show', 'nurse', 'right', 'smile'], ['nurse', '진료비랑 약값 합해서 9,800원이에요.']);
        return L;
      },
      choices: [
        { kind: 'act', when: S => S.money >= 9800, locked: S => `내 돈으로 내기엔 모자라요 (지금 가진 돈 ${S.won(S.money)})`,
          text: '내 돈으로 낸다 (9,800원)', go: 'end_clinic', fx: { money: -9800 } },
        { kind: 'act', when: S => S.flags.withGrandma, hide: S => !S.flags.withGrandma,
          text: '할머니께 부탁드린다', go: 'end_clinic', fx: { flags: { grandmaPaid: true } } },
        { kind: 'act', text: S => `지금 ${S.won(S.money)}밖에 없다고 솔직하게 말한다`, hide: S => S.money >= 9800, go: 'clinic_honest', fx: { cards: ['pay_later'] } }
      ]
    },

    clinic_honest: {
      bg: 'clinic', step: 3,
      cast: [['me', 'worry', 'left'], ['nurse', 'smile', 'right']],
      lines: S => [
        ['me', `저… 지금 ${S.won(S.money)}밖에 없어요. 엄마는 일하는 중이세요.`],
        ['nurse', '말해 줘서 고마워요. 엄마 전화번호 알려 줄래요? 선생님이 통화해 볼게요.'],
        ['narr', '간호사 선생님이 엄마와 통화했어요. 남은 돈은 내일 엄마가 와서 내기로 했어요.'],
        ['nurse', '어려운 사정을 솔직하게 말하면 방법이 생기기도 해요.']
      ],
      next: 'end_clinic'
    },

    er: {
      bg: 'er', step: 3,
      cast: [['me', 'worry', 'left'], ['nurse', 'normal', 'right']],
      enter: S => S.apply({ min: 150, worry: 5 }),
      lines: [
        ['narr', '응급실은 정신없이 바빠요. 다친 사람, 숨이 찬 할아버지, 우는 아기…'],
        ['nurse', '먼저 상태를 볼게요. 열은 높지만 위급한 상태는 아니네요.'],
        ['nurse', '더 위급한 환자부터 봐야 해서 많이 기다려야 해요.'],
        ['narr', '두 시간 넘게 기다려서 진료를 받았어요.'],
        ['@hide', 'nurse'], ['@show', 'doc', 'right', 'normal'],
        ['doc', '목감기예요. 약 먹고 쉬면 괜찮아요.'],
        ['@hide', 'doc'], ['@show', 'nurse', 'right', 'normal'],
        ['nurse', '응급실 진료비는 52,000원이에요.']
      ],
      choices: [
        { kind: 'act', when: S => S.flags.withGrandma, hide: S => !S.flags.withGrandma,
          text: '할머니께 일부를 부탁드리고, 나머지는 엄마가 내기로 한다', go: 'end_er', fx: { flags: { grandmaPaid: true } } },
        { kind: 'act', text: '돈이 부족하다고 말하고, 방법이 있는지 묻는다', go: 'er_pay', fx: { cards: ['pay_later'] } }
      ]
    },

    er_pay: {
      bg: 'er', step: 3,
      cast: [['me', 'worry', 'left'], ['nurse', 'smile', 'right']],
      lines: S => [
        ['me', '저… 돈이 많이 모자라요. 아까 인터넷에서 나라가 먼저 내주는 제도가 있다고 봤어요.'],
        ['nurse', '잘 알고 있네요. 오늘은 서류를 쓰고, 보호자가 나중에 내면 돼요.'],
        ['nurse', '그런데 다음에 이렇게 위급하지 않을 때는 달빛어린이병원 같은 곳이 덜 기다리고 비용도 적어요.']
      ],
      next: 'end_er'
    },

    wait: {
      bg: morningBg, step: 3,
      cast: [['me', 'normal', 'right']],
      enter: S => {
        const toMorning = 540 - S.min;
        S.apply({ min: Math.max(0, toMorning) });
        if (!has(S, 'care')) S.apply({ cond: -10 });
      },
      lines: S => [
        ['narr', '아침까지 기다리기로 했어요.'],
        has(S, 'care')
          ? ['narr', '물수건을 갈아 주고 물을 먹이며 도윤이 옆을 지켰어요. 숨소리도 계속 확인했어요.']
          : ['narr', '이불을 덮어 주고 옆에 누웠어요. 도윤이는 밤새 끙끙 앓았어요.'],
        ['narr', '아침 7시, 엄마가 헐레벌떡 들어오셨어요.'],
        ['@show', 'mom', 'center', 'worry'],
        [has(S, 'care') ? 'mom@smile' : 'mom@worry', has(S, 'care') ? '밤새 도윤이를 돌봐 줬구나. 정말 고마워.' : '많이 무서웠지? 혼자 버티느라 고생했어.'],
        ['@face', 'me', 'smile'],
        ['narr', '엄마와 함께 아침 일찍 소아과에 갔어요. 목감기래요.']
      ],
      ending: {
        title: S => (has(S, 'care') && has(S, 'danger_check') ? '곁을 지킨 밤' : '길고 무서운 밤'),
        summary: S => has(S, 'care')
          ? '병원에 가지는 않았지만, 위험 신호를 살피고 열을 내리게 도우며 밤을 버텼어요.'
          : '아침까지 버텼어요. 하지만 그동안 도윤이는 꽤 힘들었어요. 그 밤에 할 수 있는 일이 더 있었을까요?'
      }
    },

    end_clinic: {
      bg: 'clinic', step: 4,
      cast: S => [['me', 'smile', 'left'], ['doyun', 'smile', 'center']].concat(S.flags.withGrandma ? [['grandma', 'smile', 'right']] : []),
      lines: S => [
        ['@cg', 'clinic_walk_home'],
        ['narr', '약을 받아 들고 병원을 나섰어요.'],
        ['doyun', '이제 좀 괜찮아. 고마워.'],
        S.flags.walked ? ['narr', '돌아가는 길에 엄마가 택시를 불러 주셨어요.'] : ['narr', '집에 와서 도윤이는 금방 잠들었어요.']
      ],
      ending: {
        title: S => S.flags.withGrandma ? '함께 건넌 밤' : S.flags.walked ? '둘이서 해낸 밤' : '스스로 찾은 길',
        summary: S => {
          let t = '지금 문 연 병원을 알아내고, 도윤이를 진료받게 했어요.';
          if (S.flags.withGrandma) t += ' 가까운 어른에게 도움을 청한 덕분에 덜 무서웠어요.';
          if (S.flags.walked) t += ' 다만 밤길을 아이 둘이 걷는 건 위험할 수 있어요. 함께 갈 어른을 먼저 찾아보는 방법도 있었어요.';
          if (S.flags.taxiAlone) t += ' 엄마가 보내 준 돈을 꼭 필요한 곳에 썼어요.';
          return t;
        }
      }
    },

    end_er: {
      bg: 'er', step: 4,
      cast: [['me', 'normal', 'left'], ['doyun', 'smile', 'center']],
      lines: [
        ['narr', '새벽이 되어서야 집으로 돌아왔어요.'],
        ['doyun', '…졸려. 그래도 이제 안 아파.']
      ],
      ending: {
        title: () => '긴 기다림의 밤',
        summary: () => '돈이 없어도 응급실에 갈 수 있다는 걸 알고 행동했어요. 다만 응급실은 위급한 사람이 먼저라서 오래 기다렸어요. 위급하지 않을 때는 밤에 여는 어린이 병원이 더 빠를 수도 있어요.'
      }
    }
  };

  const powers = [
    { k: 'look',  n: '살피는 힘',     d: '상황을 숫자와 사실로 확인했어요', ok: S => has(S, 'fever39') && has(S, 'danger_check') },
    { k: 'find',  n: '알아보는 힘',   d: '모르던 방법을 찾아냈어요', ok: S => ['night_clinic', 'er_law', '119_advice'].some(k => has(S, k)) },
    { k: 'check', n: '확인하는 힘',   d: 'AI나 인터넷 말을 그대로 믿지 않았어요', ok: S => has(S, 'verify') || has(S, 'source') || has(S, 'medicine_label') },
    { k: 'ask',   n: '도움을 청하는 힘', d: '혼자 끙끙대지 않고 물어봤어요', ok: S => has(S, 'neighbor') || has(S, '119_advice') || has(S, 'pay_later') },
    { k: 'care',  n: '돌보는 힘',     d: '아픈 동생을 직접 도왔어요', ok: S => has(S, 'care') }
  ];

  const questions = {
    low: ['도윤이가 숨쉬기 힘들어했다면 어떻게 해야 했을까?', '우리 집 근처에서 도움을 청할 수 있는 어른은 누구누구일까?'],
    mid: ['옆집에 아무도 없었다면, 또 누구에게 도움을 청할 수 있었을까?', '내 돈이 0원이었다면 무엇이 달라졌을까?'],
    teen: ['AI 도우미가 틀린 말을 했던 장면을 떠올려 봐. AI 답을 믿어도 될 때와 확인해야 할 때는 어떻게 구별할까?', '돈, 시간, 안전 중 이번에 무엇을 가장 먼저 생각했어? 다시 한다면 순서가 바뀔까?']
  };

  function hint(S) {
    if (!has(S, 'fever39')) return '열이 몇 도인지 알아볼까?';
    if (!has(S, 'danger_check')) return '도윤이가 숨은 잘 쉬는지 살펴볼까?';
    if (!has(S, 'neighbor') && !has(S, '119_advice')) return '혼자 하기 어려우면 어른에게 도움을 청해도 돼!';
    if (!has(S, 'care')) return '열을 내리게 돕는 방법을 알아냈다면 해 볼까?';
    return '이제 어떻게 할지 정해 볼까?';
  }

  return {
    id: 'fever-night',
    title: '열나는 밤, 지갑엔 3천 원',
    titleArt: { bg: 'room_sick', cast: [['me', 'worry', 'right']] },
    blurb: '엄마는 야간 근무, 동생은 39도. 내 지갑엔 3천 원뿐이에요.',
    recommend: '초등 4학년 이상',
    start: { node: 'intro', money: 3000, cond: 55, worry: 50, clock: 22 * 60 },
    gauges: [
      { key: 'clock', label: '시각' },
      { key: 'money', label: '가진 돈', type: 'won' },
      { key: 'cond', label: '도윤이 컨디션', type: 'bar', tone: 'good' },
      { key: 'worry', label: '내 마음 (걱정)', type: 'bar', tone: 'worry' }
    ],
    // 물수건으로 돌보기 전에는 시간이 갈수록 도윤이 컨디션이 조금씩 나빠진다
    onTime(S, min) { if (!S.cards.has('care')) S.cond = Math.max(0, S.cond - Math.round(min / 10)); },
    names: { me: '하람', doyun: '도윤', grandma: '옆집 할머니', mom: '엄마', op: '119 상담원', ai: 'AI 도우미', nurse: '간호사 선생님', doc: '의사 선생님', driver: '택시 기사님', narr: '' },
    phoneSpeakers: ['mom', 'op', 'ai'],
    cards, nodes, powers, questions, hint,
    endingCount: 6,
    redirect(S, id) {
      if (id === 'hub' && has(S, 'mom_noanswer') && !S.flags.momcall && S.min >= 25) return 'momcall';
      return id;
    }
  };
})());
