export const surveyData = {
  title: "PHQ-9 우울 검사 결과",
  description: "지난 2주간, 얼마나 자주 다음과 같은 문제를 얼마나 자주 겪었는지 해당되는 곳에 응답하여 주십시오.",
  totalQuestions: 9,
  questions: [
    // Default 템플릿 (type: 'default')
    {
      id: 1,
      type: 'default',
      question: "기분이 가라앉거나 우울하거나 희망이 없다고 느꼈다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 2,
      type: 'default',
      question: "평소 하던 일에 대한 흥미가 없어지거나 즐거움을 느끼지 못했다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 3,
      type: 'default',
      question: "잠들기 어렵거나 자주 깬다. 혹은 잠을 너무 많이 잔다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 4,
      type: 'default',
      question: "피곤하다고 느끼거나 기운이 거의 없다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 5,
      type: 'default',
      question: "식욕이 줄었다. 혹은 너무 많이 먹는다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 6,
      type: 'default',
      question: "내 자신이 실패자로 여겨지거나 자신과 가족을 실망시켰다고 느낀다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 7,
      type: 'default',
      question: "신문을 읽거나 TV를 보는 것과 같은 일상적인 일에 집중하기 어렵다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 8,
      type: 'default',
      question: "다른 사람들이 눈치 챌 정도로 평소보다 말과 행동이 느리다. 혹은 너무 안절부절 못해서 가만히 앉아 있을 수 없다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    {
      id: 9,
      type: 'default',
      question: "차라리 죽는 것이 낫겠다고 생각하거나 어떻게든 자해를 하려고 생각한다.",
      options: [
        { value: 0, label: "전혀 없음" },
        { value: 1, label: "며칠동안" },
        { value: 2, label: "일주일 이상" },
        { value: 3, label: "거의 매일" }
      ]
    },
    // Type01 템플릿 (복합 질문)
    {
      id: 10,
      type: 'type01',
      question: "최근 2주 동안에 당신의 불면증의 심한 정도를 아래에 표시하십시오.",
      subQuestions: [
        {
          id: 'A',
          question: "잠들기 어려움",
          options: [
            { value: 0, label: "전혀" },
            { value: 1, label: "약간" },
            { value: 2, label: "보통" },
            { value: 3, label: "심한" },
            { value: 4, label: "매우 심한" }
          ]
        },
        {
          id: 'B',
          question: "수면 유지가 어려움 (자주 깸)",
          options: [
            { value: 0, label: "전혀" },
            { value: 1, label: "약간" },
            { value: 2, label: "보통" },
            { value: 3, label: "심한" },
            { value: 4, label: "매우 심한" }
          ]
        }
      ]
    },
    // Type02 템플릿 (긴 설명 옵션)
    {
      id: 11,
      type: 'type02',
      question: "지난 주 동안 공황발작 또는 제한된 증상 발작을 얼마나 자주 경험하셨습니까?",
      options: [
        { value: 0, label: "공황이나 제한된 증상 삽화 없음" },
        { value: 1, label: "경도. 완전한 공황 발작은 없고, 제한된 증상 발작은 하루에 1회를 넘지 않음" },
        { value: 2, label: "중증도. 주 1-2회의 완전한 공황 발작, 하루에 제한된 증상 발작을 여러 번 경험" },
        { value: 3, label: "심함. 주 3회 이상의 완전한 공황 발작, 그러나 평균 하루에 1회 이상은 아님" },
        { value: 4, label: "극심함. 하루에도 여러 번 완전한 공황 발작이 일어남. 발작이 없는 날보다 있는 날이 더 많음" }
      ]
    }
  ]
}
