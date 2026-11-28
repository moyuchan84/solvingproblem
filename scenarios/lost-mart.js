/* 에피소드 2 (저학년 대표): 엄마가 안 보여요
 *
 * 여덟 살 도윤이가 토요일 마트에서 엄마를 놓친다.
 * 배우는 것: 그 자리에 멈추기, 주위 살피기, 도움을 청해도 되는 어른 고르기,
 *            모르는 사람 따라가지 않기, 이름·나이·엄마 번호 말하기
 * 형식은 scenarios/fever-night.js와 같다. 그림 지시어는 docs/ART_PIPELINE.md 6장.
 */
(window.EPISODES = window.EPISODES || []).push((function () {
  const has = (S, k) => S.cards.has(k);
  const ME = 'doyun_day';

  const cards = {
    stay:         { t: '그 자리에 멈추기', d: '길을 잃으면 먼저 멈춰서 숨을 크게 쉬어요. 엄마도 나를 찾고 있어요. 이리저리 돌아다니면 엄마와 엇갈릴 수 있어요.', hint: '그 자리에 멈춰서 마음 가라앉히기' },
    look_around:  { t: '주위 살피기', d: '표지판을 보면 내가 어디 있는지 말할 수 있어요. 도움을 청할 어른도 찾을 수 있어요.', hint: '주위를 천천히 둘러보기' },
    mom_clothes:  { t: '엄마 모습 떠올리기', d: '옷 색깔, 머리 모양, 들고 있던 것을 말하면 어른들이 엄마를 더 빨리 찾아요.', hint: '엄마가 오늘 입은 옷 떠올리기' },
    phone_number: { t: '엄마 전화번호 외우기', d: '번호를 외우고 있으면 어른이 바로 전화해 줄 수 있어요. (게임 속 번호예요. 우리 가족 번호를 외워 보세요!)', hint: '엄마 전화번호 떠올리기' },
    safe_adult:   { t: '도움을 청해도 되는 어른', d: '조끼와 이름표를 단 마트 직원, 계산대 직원, 아이와 함께 있는 어른에게 말해요.', hint: '직원이나 아이와 함께 있는 어른에게 말하기' },
    full_name:    { t: '내 이름과 나이 말하기', d: '"김도윤, 여덟 살이에요."처럼 또박또박 말해요. 울어도 괜찮아요. 숨 한번 쉬고 말하면 돼요.', hint: '내 이름과 나이를 또박또박 말하기' },
    no_follow:    { t: '모르는 사람 따라가지 않기', d: '엄마한테 데려다준다고 해도 밖, 주차장, 화장실로 따라가지 않아요. 큰 소리로 "싫어요!" 하고 직원에게 가요.', hint: '모르는 사람의 말을 그대로 믿지 않기' },
    exit_rule:    { t: '혼자 밖으로 나가지 않기', d: '출입문 밖은 차가 다니는 주차장이에요. 엄마는 보통 안에서 나를 찾고 있어요.', hint: '혼자 밖으로 나가지 않기' },
    announce:     { t: '안내 방송', d: '마트 고객센터에서는 방송으로 엄마를 불러 줄 수 있어요.', hint: '고객센터 안내 방송 알기' },
    call182:      { t: '그래도 못 찾으면 112, 182', d: '경찰(112)이나 실종아동찾기센터(182)도 아이와 가족이 다시 만나도록 도와줘요.', hint: '경찰 112, 실종아동찾기센터 182 알기', ages: ['mid', 'teen'] }
  };

  /* 낯선 아저씨를 만났을 때 고르는 길 (질문하기 전과 후에 같은 선택지) */
  const strangerChoices = [
    { kind: 'act', text: '아저씨를 따라간다', go: 'follow', fx: { min: 2, safe: -40, worry: 10 } },
    { kind: 'act', text: '"싫어요! 저는 마트 직원한테 갈 거예요!" 크게 말한다', go: 'refuse', fx: { cards: ['no_follow'], safe: 10, worry: -5 } }
  ];

  const nodes = {
    intro: {
      bg: 'mart_aisle', step: 0,
      cast: [[ME, 'smile', 'left'], ['mom_day', 'smile', 'right']],
      lines: [
        ['narr', '토요일 오후 3시. 도윤이는 엄마랑 큰 마트에 왔어요.'],
        ['mom_day', '엄마는 저쪽에서 우유 고르고 올게. 도윤이는 여기 과자 코너에 있어.'],
        [ME, '응! 나 과자 하나 골라도 돼?'],
        ['mom_day', '하나만이야. 금방 올게.'],
        ['@hide', 'mom_day'],
        ['narr', '과자를 고르다 보니, 옆 장난감 코너에 반짝이는 로봇이 보였어요.'],
        [ME, '우와, 로봇이다!'],
        ['narr', '로봇을 한참 구경하고 돌아왔는데…'],
        ['@shake'],
        [ME + '@surprised', '어? 엄마…? 엄마가 안 보여!'],
        ['@face', ME, 'cry'],
        ['narr', {
          low: '괜찮아요. 천천히 하나씩 해 보면 돼요.',
          mid: '정답은 하나가 아니에요. 살피고, 떠올리고, 도움을 청해 보세요.'
        }]
      ],
      next: 'hub'
    },

    hub: {
      bg: 'mart_aisle',
      step: S => (S.cards.size === 0 ? 0 : S.cards.size < 3 ? 1 : 2),
      cast: S => [[ME, S.worry > 70 ? 'cry' : S.worry > 45 ? 'worry' : 'normal', 'center']],
      lines: S => {
        const L = [];
        if (S.flags.far) L.push(['narr', '아까보다 더 낯선 코너예요.']);
        L.push(S.flags.hubSeen ? [ME, `(엄마를 놓친 지 ${S.min}분이 지났어. 이제 뭘 해 볼까?)`] : [ME, '(어떡하지…?)']);
        S.flags.hubSeen = true;
        return L;
      },
      choices: [
        { id: 'breathe', kind: 'explore', once: true, text: '그 자리에 멈춰서 숨을 크게 쉰다', go: 'breathe', fx: { min: 1, worry: -20, cards: ['stay'] } },
        { id: 'look', kind: 'explore', once: true, text: '주위를 천천히 둘러본다', go: 'look', fx: { min: 1, cards: ['look_around'] } },
        { id: 'number', kind: 'explore', once: true, text: '엄마 전화번호를 떠올려 본다', go: 'number', fx: { min: 1, worry: -5, cards: ['phone_number'] } },
        { id: 'clothes', kind: 'explore', once: true, text: '엄마가 오늘 뭘 입었는지 떠올려 본다', go: 'clothes', fx: { min: 1, cards: ['mom_clothes'] } },
        { id: 'shout', kind: 'explore', once: true, text: '"엄마!" 하고 크게 불러 본다', go: 'shout', fx: { min: 1, worry: 5 } },

        { id: 'clerk', kind: 'act', need: ['look_around'], locked: '주위를 둘러보면 도와 달라고 할 어른이 보여요',
          text: '빨간 조끼를 입은 마트 직원에게 말한다', go: 'clerk', fx: { min: 1, cards: ['safe_adult'], worry: -10 } },
        { id: 'customer', kind: 'act', need: ['look_around'],
          text: '아기를 안은 아주머니께 도와 달라고 한다', go: 'customer', fx: { min: 2, cards: ['safe_adult'], worry: -10, flags: { customer: true } } },
        { id: 'wait', kind: 'act', need: ['stay'], locked: '먼저 마음을 가라앉히면 열려요',
          text: S => (S.flags.far ? '여기서 가만히 기다린다' : '엄마랑 헤어진 과자 코너에서 기다린다'), go: 'wait' },
        { id: 'run', kind: 'act', once: true, text: '엄마를 찾아 여기저기 뛰어다닌다', go: 'run', fx: { min: 4, worry: 10, safe: -5, cards: ['stay'], flags: { far: true } } },
        { id: 'exit', kind: 'act', once: true, text: '출입문 밖으로 나가서 찾아본다', go: 'exit', fx: { min: 2, safe: -30, worry: 15, cards: ['exit_rule'] } }
      ]
    },

    breathe: {
      bg: 'mart_aisle', step: 0, cast: [[ME, 'worry', 'center']],
      lines: [
        ['narr', '후— 하— 숨을 크게 세 번 쉬었어요.'],
        [ME + '@normal', '(엄마도 지금 나를 찾고 있을 거야.)'],
        ['narr', '💡 길을 잃으면 먼저 그 자리에 멈춰요. 이리저리 돌아다니면 엄마와 엇갈릴 수 있어요.']
      ],
      next: 'hub'
    },

    look: {
      bg: 'mart_aisle', step: 0, cast: [[ME, 'normal', 'center']],
      lines: [
        ['narr', '천장에 "과자 · 음료" 표지판이 있어요. 여기는 과자 코너예요.'],
        ['narr', '저쪽에 빨간 조끼를 입고 이름표를 단 마트 직원이 물건을 정리하고 있어요.'],
        ['narr', '옆에는 아기를 안은 아주머니가 장을 보고 있어요.'],
        ['narr', '멀리 "출입구 · 주차장" 표지판도 보여요.'],
        [ME, '(누구한테 도와 달라고 하면 좋을까?)']
      ],
      next: 'hub'
    },

    number: {
      bg: 'mart_aisle', step: 1, cast: [[ME, 'worry', 'center']],
      lines: [
        [ME, '(엄마 번호… 엄마가 노래로 외우게 해 줬지.)'],
        [ME + '@smile', '(공일공, 일이삼사, 오육칠팔! 기억났다!)'],
        ['narr', '💡 엄마나 아빠 전화번호를 외워 두면, 어른이 바로 전화해 줄 수 있어요.']
      ],
      next: 'hub'
    },

    clothes: {
      bg: 'mart_aisle', step: 0, cast: [[ME, 'normal', 'center']],
      lines: [
        [ME, '(엄마는 오늘… 초록색 점퍼를 입었어. 머리는 길고, 빨간 장바구니를 들었어.)'],
        ['narr', '💡 엄마의 옷 색깔과 생김새를 말할 수 있으면, 어른들이 엄마를 더 빨리 찾을 수 있어요.']
      ],
      next: 'hub'
    },

    shout: {
      bg: 'mart_aisle', step: 1, cast: [[ME, 'cry', 'center']],
      lines: [
        [ME, '엄마아!'],
        ['narr', '마트 음악 소리가 커서 엄마에게는 들리지 않았나 봐요. 사람들이 힐끗 쳐다봐요.'],
        [ME + '@worry', '(부르기만 해서는 안 되겠다…)']
      ],
      next: 'hub'
    },

    run: {
      bg: 'mart_aisle', step: 3, cast: [[ME, 'worry', 'center']],
      lines: [
        ['narr', '도윤이는 엄마를 찾아 이 코너, 저 코너로 뛰어다녔어요.'],
        ['narr', '냉동식품 코너, 과일 코너, 처음 보는 코너…'],
        ['@face', ME, 'cry'],
        [ME, '(여기가 어디지? 아까보다 더 모르겠어…)'],
        ['narr', '그 사이 엄마는 과자 코너로 돌아와 도윤이를 찾고 있었어요. 둘이 엇갈렸어요.']
      ],
      next: 'hub'
    },

    exit: {
      bg: 'mart_exit', step: 3, cast: [[ME, 'normal', 'center']],
      lines: [
        ['narr', '엄마가 밖에 있을지도 몰라. 도윤이는 출입문으로 갔어요.'],
        ['narr', '자동문 밖은 차가 많이 다니는 주차장이에요.'],
        ['@shake'],
        ['narr', '빵빵! 뒤로 나오던 차가 경적을 울렸어요.'],
        [ME + '@surprised', '으앗!'],
        [ME + '@cry', '(무서워… 혼자 밖으로 나가면 안 되겠다.)'],
        ['narr', '💡 엄마를 찾으러 혼자 밖이나 주차장으로 나가면 위험해요. 엄마는 보통 안에서 나를 찾고 있어요.']
      ],
      next: 'hub'
    },

    stranger: {
      bg: 'mart_aisle', step: 1,
      cast: [[ME, 'worry', 'left'], ['stranger', 'smile', 'right']],
      enter: S => { S.flags.stranger = true; },
      lines: [
        ['narr', '그때, 모르는 아저씨가 다가왔어요.'],
        ['stranger', '꼬마야, 엄마 잃어버렸니?'],
        [ME, '…네.'],
        ['stranger', '아저씨가 엄마 있는 데 알아. 주차장에 계시던데, 같이 가자.'],
        [ME, '(어? 모르는 아저씨인데…)']
      ],
      choices: [
        ...strangerChoices,
        { kind: 'explore', text: '"아저씨는 마트 직원이에요?" 하고 물어본다', go: 'stranger_ask', fx: { min: 1 } }
      ]
    },

    stranger_ask: {
      bg: 'mart_aisle', step: 1,
      cast: [[ME, 'worry', 'left'], ['stranger', 'normal', 'right']],
      lines: [
        [ME, '아저씨는 마트 직원이에요?'],
        ['stranger', '어? 아니, 그건 아니고… 아무튼 엄마가 기다리셔. 빨리 가자.'],
        [ME, '(조끼도 이름표도 없어. 그리고 자꾸 밖으로 가자고 해…)']
      ],
      choices: strangerChoices
    },

    follow: {
      bg: 'mart_exit', step: 3,
      cast: [[ME, 'worry', 'left'], ['stranger', 'normal', 'right']],
      enter: S => { S.flags.followed = true; },
      lines: [
        ['narr', '아저씨를 따라 출입구 쪽으로 걸어갔어요.'],
        ['@show', 'clerk', 'center', 'normal'],
        ['@shake'],
        ['clerk', '잠깐만요! 이 아이 보호자세요?'],
        ['stranger', '아, 아니… 그냥 도와주려던 거예요.'],
        ['@hide', 'stranger'],
        ['narr', '아저씨는 서둘러 가 버렸어요.'],
        ['@show', 'clerk', 'right', 'smile'],
        ['clerk', '괜찮아. 나는 이 마트 직원이야. 여기 이름표 보이지?'],
        ['clerk@normal', '모르는 사람이 엄마한테 데려다준다고 해도 밖으로 따라가면 안 돼. 이제 같이 엄마 찾자.']
      ],
      next: 'clerk_talk'
    },

    refuse: {
      bg: 'mart_aisle', step: 3,
      cast: [[ME, 'worry', 'left'], ['stranger', 'normal', 'right']],
      lines: [
        [ME, '싫어요! 저는 마트 직원한테 갈 거예요!'],
        ['narr', '도윤이의 큰 목소리에 주변 사람들이 돌아봤어요.'],
        ['stranger', '그, 그래… 알았다.'],
        ['@hide', 'stranger'],
        ['narr', '아저씨는 다른 쪽으로 가 버렸어요.'],
        [ME + '@normal', '(휴… 모르는 사람은 따라가지 않기!)'],
        ['narr', '💡 모르는 사람이 엄마한테 데려다준다고 해도 따라가지 않아요. 큰 소리로 "싫어요!" 하고 직원에게 가요.']
      ],
      next: 'hub'
    },

    clerk: {
      bg: 'mart_aisle', step: 3,
      cast: [[ME, 'worry', 'left'], ['clerk', 'normal', 'right']],
      lines: [
        [ME, '저기요… 엄마를 잃어버렸어요.'],
        ['clerk@smile', '그랬구나. 말해 줘서 고마워. 이제 괜찮아.']
      ],
      next: 'clerk_talk'
    },

    customer: {
      bg: 'mart_aisle', step: 3,
      cast: [[ME, 'worry', 'left'], ['customer', 'normal', 'right']],
      lines: [
        [ME, '아주머니, 엄마를 잃어버렸어요.'],
        ['customer@smile', '어머, 많이 놀랐지? 아줌마가 직원한테 같이 가 줄게.'],
        ['narr', '아주머니가 도윤이 손을 잡고 가까운 직원에게 데려다주었어요.'],
        ['@hide', 'customer'],
        ['@show', 'clerk', 'right', 'smile'],
        ['clerk', '엄마를 놓쳤구나. 이제 괜찮아. 아주머니, 고맙습니다.']
      ],
      next: 'clerk_talk'
    },

    clerk_talk: {
      bg: 'mart_aisle', step: 3,
      cast: [[ME, 'worry', 'left'], ['clerk', 'smile', 'right']],
      lines: [['clerk', '이름이 뭐야? 몇 살이야?']],
      choices: [
        { kind: 'act', text: '"김도윤이에요. 여덟 살이요." 또박또박 말한다', go: 'clerk_q2', fx: { cards: ['full_name'], worry: -10 } },
        { kind: 'act', text: '눈물이 나서 말이 안 나온다', go: 'clerk_cry', fx: { worry: 5 } }
      ]
    },

    clerk_cry: {
      bg: 'mart_aisle', step: 3,
      cast: [[ME, 'cry', 'left'], ['clerk', 'smile', 'right']],
      enter: S => S.apply({ cards: ['full_name'], worry: -10 }),
      lines: [
        [ME, '흐윽… 흑…'],
        ['clerk', '괜찮아, 천천히 해도 돼. 같이 숨 한번 크게 쉬어 볼까?'],
        ['narr', '후— 하—'],
        [ME + '@worry', '…김도윤이에요. 여덟 살이요.'],
        ['clerk', '잘했어. 울어도 괜찮아. 숨 쉬고 말하면 돼.']
      ],
      next: 'clerk_q2'
    },

    clerk_q2: {
      bg: 'mart_aisle', step: 3,
      cast: [[ME, 'normal', 'left'], ['clerk', 'smile', 'right']],
      enter: S => { S.flags.phoneCall = has(S, 'phone_number'); },
      lines: S => {
        const L = [['clerk', '도윤이 엄마 전화번호 알아?']];
        if (has(S, 'phone_number')) {
          L.push([ME + '@smile', '네! 공일공, 일이삼사, 오육칠팔이요!'],
            ['clerk', '와, 번호를 외우고 있구나! 바로 전화해 볼게.'],
            ['narr', '📞 직원이 엄마에게 전화를 걸었어요.']);
        } else {
          L.push([ME + '@worry', '…몰라요.'],
            ['clerk', '괜찮아. 그럼 고객센터에서 안내 방송을 해 줄게.']);
          if (has(S, 'mom_clothes')) {
            L.push(['clerk', '엄마는 어떤 옷을 입었어?'],
              [ME, '초록색 점퍼요! 머리가 길고, 빨간 장바구니를 들었어요.'],
              ['clerk', '아주 잘 기억했네! 방송할 때 꼭 말해 줄게.']);
          }
        }
        return L;
      },
      next: S => (S.flags.phoneCall ? 'reunion' : 'announce')
    },

    announce: {
      bg: 'mart_info', step: 3,
      cast: [[ME, 'worry', 'left'], ['clerk', 'smile', 'right']],
      enter: S => S.apply({ min: has(S, 'mom_clothes') ? 3 : 6, cards: ['announce'] }),
      lines: S => [
        ['narr', '직원과 함께 고객센터로 갔어요.'],
        ['pa', '딩동댕~ 고객 여러분께 안내 말씀 드립니다.'],
        ['pa', has(S, 'mom_clothes')
          ? '여덟 살 김도윤 어린이가 고객센터에서 엄마를 기다리고 있습니다. 초록색 점퍼를 입고 빨간 장바구니를 드신 어머님은 고객센터로 와 주세요.'
          : '여덟 살 김도윤 어린이가 고객센터에서 보호자를 기다리고 있습니다. 보호자께서는 고객센터로 와 주세요.'],
        ['narr', has(S, 'mom_clothes') ? '방송이 끝나자마자 누군가 뛰어왔어요.' : '조금 오래 기다렸어요. 그리고 누군가 뛰어왔어요.']
      ],
      next: 'reunion'
    },

    wait: {
      bg: 'mart_aisle', step: 3,
      cast: [[ME, 'worry', 'center']],
      enter: S => {
        if (S.flags.far) S.apply({ min: 10, worry: 10 });
        else { S.flags.waited = true; S.apply({ min: 5 }); }
      },
      lines: S => S.flags.far
        ? [
            ['narr', '도윤이는 그 자리에 서서 기다렸어요. 그런데 여기는 엄마랑 헤어진 곳이 아니에요.'],
            ['narr', '10분이 지나도 엄마가 오지 않았어요.'],
            ['@show', 'clerk', 'right', 'smile'],
            ['clerk', '혹시 엄마를 찾고 있니? 나는 이 마트 직원이야.'],
            [ME, '…네.']
          ]
        : [
            ['narr', '도윤이는 엄마랑 헤어진 과자 코너 앞에 가만히 서 있었어요.'],
            [ME, '(엄마는 꼭 여기로 올 거야.)'],
            ['narr', '5분쯤 지났을 때…']
          ],
      next: S => (S.flags.far ? 'clerk_talk' : 'reunion')
    },

    reunion: {
      bg: S => (S.flags.waited ? 'mart_aisle' : 'mart_info'), step: 4,
      cast: [[ME, 'cry', 'left'], ['mom_day', 'worry', 'right']],
      enter: S => S.apply({ cards: ['call182'], worry: -40 }),
      lines: S => [
        ['@cg', 'mom_hug'],
        ['mom_day', '도윤아!'],
        [ME, '엄마아!'],
        ['narr', '엄마가 도윤이를 꼭 안아 주었어요.'],
        ['@cg', null],
        ['mom_day', S.flags.phoneCall ? '전화 받고 깜짝 놀라서 뛰어왔어. 엄마 번호를 외우고 있었구나!'
          : S.flags.waited ? '여기 있었구나! 엄마도 과자 코너로 다시 와서 찾고 있었어.'
          : '방송 듣고 바로 뛰어왔어. 엄마도 한참 찾았어.'],
        ...(S.flags.followed ? [['mom_day', '모르는 아저씨를 따라갈 뻔했다고? …직원분 덕분에 정말 다행이다.']] : []),
        ['@face', 'mom_day', 'smile'],
        ['@face', ME, 'smile'],
        ['mom_day', '우리 다음엔 이렇게 약속하자.'],
        ['mom_day', '길을 잃으면 그 자리에 멈추기. 모르는 사람은 따라가지 않기. 직원이나 아이와 함께 있는 어른에게 말하기.'],
        ['mom_day', '그래도 정말 못 찾으면, 어른들이 경찰 112나 182에 전화해서 도와준단다.', ['mid']],
        [ME, '응! 그리고 엄마 번호도 꼭 외울게.']
      ],
      ending: {
        title: S => S.flags.followed ? '위험할 뻔했던 날'
          : S.flags.phoneCall ? '번호를 외운 덕분에'
          : S.flags.waited ? '그 자리에서 기다렸어요'
          : S.flags.customer ? '아주머니의 도움'
          : '직원에게 말했어요',
        summary: S => {
          if (S.flags.followed) return '모르는 아저씨를 따라 밖으로 나갈 뻔했어요. 다행히 직원이 알아차렸어요. 엄마한테 데려다준다는 말을 해도 모르는 사람은 따라가지 않아요.';
          let t = S.flags.phoneCall ? '엄마 전화번호를 말한 덕분에 가장 빨리 엄마를 만났어요.'
            : S.flags.waited ? '헤어진 자리에서 기다렸더니, 나를 찾으러 돌아온 엄마와 만났어요.'
            : S.flags.customer ? '아이와 함께 있는 어른에게 도움을 청했고, 직원과 안내 방송 덕분에 엄마를 만났어요.'
            : '마트 직원에게 도움을 청했고, 안내 방송 덕분에 엄마를 만났어요.';
          if (S.flags.far) t += ' 뛰어다니는 동안에는 엄마와 엇갈렸어요.';
          if (has(S, 'exit_rule')) t += ' 혼자 밖으로 나갔을 때는 차 때문에 위험했어요.';
          return t;
        }
      }
    }
  };

  const powers = [
    { k: 'calm',  n: '마음을 다스리는 힘', d: '멈춰서 숨 쉬고 마음을 가라앉혔어요', ok: S => has(S, 'stay') && !S.flags.far },
    { k: 'look',  n: '살피는 힘',     d: '주위와 엄마 모습을 살폈어요', ok: S => has(S, 'look_around') || has(S, 'mom_clothes') },
    { k: 'find',  n: '알아보는 힘',   d: '엄마를 찾을 방법을 떠올렸어요', ok: S => has(S, 'phone_number') || has(S, 'announce') },
    { k: 'check', n: '확인하는 힘',   d: '모르는 사람 말을 그대로 믿지 않았어요', ok: S => has(S, 'no_follow') && !S.flags.followed },
    { k: 'ask',   n: '도움을 청하는 힘', d: '도와줘도 되는 어른에게 말했어요', ok: S => has(S, 'safe_adult') }
  ];

  const questions = {
    low: ['마트에서 엄마를 놓치면, 제일 먼저 무엇을 할까?', '엄마나 아빠 전화번호를 외우고 있니? 지금 말해 볼까?', '모르는 사람이 "엄마한테 데려다줄게" 하면 뭐라고 말할까?'],
    mid: ['도와 달라고 해도 되는 어른과 조심해야 할 어른은 어떻게 구별할까?', '놀이공원이나 축제처럼 더 넓은 곳이라면 무엇이 달라질까?', '동생을 데리고 나갔다가 동생을 놓쳤다면, 너는 무엇부터 할래?']
  };

  function hint(S) {
    if (!has(S, 'stay')) return '먼저 그 자리에 멈춰서 숨을 크게 쉬어 볼까?';
    if (!has(S, 'look_around')) return '주위를 둘러보면 도와줄 사람이 보일지도 몰라.';
    if (!has(S, 'phone_number')) return '엄마 전화번호를 기억하고 있니?';
    return '이제 누구에게 도와 달라고 할까?';
  }

  return {
    id: 'lost-mart',
    title: '엄마가 안 보여요',
    blurb: '토요일 마트, 로봇 구경을 하고 왔더니 엄마가 없어요.',
    recommend: '초등 1~3학년',
    ages: ['low', 'mid'],
    titleArt: { bg: 'mart_aisle', cast: [[ME, 'worry', 'center']] },
    start: { node: 'intro', safe: 90, worry: 75, clock: 15 * 60 },
    gauges: [
      { key: 'clock', label: '시각' },
      { key: 'safe', label: '안전', type: 'bar', tone: 'good' },
      { key: 'worry', label: '내 마음 (걱정)', type: 'bar', tone: 'worry' }
    ],
    names: { doyun_day: '도윤', mom_day: '엄마', clerk: '마트 직원', customer: '아주머니', stranger: '모르는 아저씨', pa: '📢 안내 방송', narr: '' },
    phoneSpeakers: [],
    cards, nodes, powers, questions, hint,
    endingCount: 5,
    redirect(S, id) {
      if (id === 'hub' && !S.flags.stranger && S.min >= 4) return 'stranger';
      return id;
    }
  };
})());
