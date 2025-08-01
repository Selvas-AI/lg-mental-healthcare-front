// 회기(세션) 관련 더미 데이터. 모든 회기 관련 컴포넌트에서 import해서 공통으로 사용할 수 있습니다.

const sessionDummyData = [
  // {
  //   session: "5",
  //   status: { text: "상담 완료", className: "completed" },
  //   date: "2025.05.04 (토) 오후 2시",
  //   summary: "5회기 상담을 통해 불안감을 개선하고 대인관계를 확장하는 등의 긍정적인 변화가 나타났음",
  //   todos: ["심리검사 요청", "녹취록 분석", "상담일지 작성", "사례개념화 최종 작성"],
  //   topics: ["불안감", "자존감", "대인관계"],
  //   summaryList: [
  //     "대인관계 어려움", "주호소문 불명확"
  //   ],
  //   crisis: 0,
  //   severity: {
  //     우울: 2,
  //     강박: 2,
  //     PTSD: 4
  //   },
  //   stress: 1
  // },
  // {
  //   session: "4",
  //   status: { text: "일정 없음", className: "no-schedule" },
  //   date: "2025.04.26 (토) 오전 10시",
  //   summary: "자기 통제력에 대한 자신감을 표현하며 회복에 대한 기대를 언급함",
  //   todos: ["심리검사 요청", "녹취록 분석", "상담일지 작성", "사례개념화 최초 작성"],
  //   topics: ["불안감", "자존감", "대인관계"],
  //   summaryList: [
  //     "대인관계 어려움", "주호소문 불명확"
  //   ],
  //   crisis: 4,
  //   severity: {
  //     우울: 1,
  //     강박: 3,
  //     PTSD: 5
  //   },
  //   stress: 1
  // },
  {
    session: "3",
    status: { text: "상담 예정", className: "scheduled" },
    date: "2025.05.03 (토) 오전 10시",
    summary: "가족과의 갈등 완화 시도가 시작되었고, 정서적 지지 확보를 위한 중재를 시도함",
    todos: ["심리검사 요청"],
    topics: ["불면증", "불안감"],
    summaryList: [
      "원인을 알 수 없는 불안감 호소",
      "간헐적 불면증",
      "낮은 자존감으로 인한 대인관계 어려움"
    ],
    crisis: 4,
    severity: {
      우울: 5,
      강박: null,
      PTSD: 5
    },
    stress: 1
  },
  {
    session: "2",
    status: { text: "노쇼", className: "no-show" },
    date: "2025.05.10 (토) 오전 10시",
    summary: "-",
    todos: ["사례개념화 최초 작성", "사례개념화 AI추천"],
    topics: ["약물 부작용", "불편감"],
    summaryList: [
      "대인관계 어려움", "주호소문 불명확"
    ],
    crisis: 2,
    severity: {
      우울: 3,
      강박: 3,
      PTSD: 3
    },
    stress: 1
  },
  {
    session: "1",
    status: { text: "상담 취소", className: "cancelled" },
    date: "2025.05.17 (토) 오전 10시",
    summary: "내담자는 심한 충동성, 자해 충동, 감정 기복을 호소하였음",
    todos: ["심리검사 요청", "녹취록 분석", "상담일지 작성", "사례개념화 최초 작성", "사례개념화 AI추천"],
    topics: ["원인을 알 수 없는 불안감 호소", "감정 기복"],
    summaryList: [
      "내담자는 심한 충동성, 자해 충동, 감정 기복을 호소하였음"
    ],
    crisis: 1,
    severity: {
      우울: 1,
      강박: 1,
      PTSD: null
    },
    stress: 1
  }
];

export default sessionDummyData;
