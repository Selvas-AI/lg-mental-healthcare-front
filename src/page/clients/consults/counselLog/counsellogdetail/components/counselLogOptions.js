// 상담일지 옵션/상수 모음

// 현재 위기 상황
export const currentRiskOptions = [
  { id: 'currentRisk01', value: '1', label: '해당 사항 없음' },
  { id: 'currentRisk02', value: '2', label: '자살 사고' },
  { id: 'currentRisk03', value: '3', label: '자살계획' },
  { id: 'currentRisk04', value: '4', label: '자살 시도' },
];

// 과거 위기 상황
export const pastRiskOptions = [
  { id: 'pastRisk01', value: '1', label: '해당 사항 없음' },
  { id: 'pastRisk02', value: '2', label: '자살 사고' },
  { id: 'pastRisk03', value: '3', label: '자살계획' },
  { id: 'pastRisk04', value: '4', label: '자살 시도' },
];

// 위험요인 체크박스
export const riskFactorOptions = [
  { id: 'riskFactor01', value: '1', label: '해당 사항 없음' },
  { id: 'riskFactor02', value: '2', label: '진단 경험' },
  { id: 'riskFactor03', value: '3', label: '자해 경험' },
  { id: 'riskFactor04', value: '4', label: '최근 극심한 스트레스' },
  { id: 'riskFactor05', value: '5', label: '가족력' },
  { id: 'riskFactor06', value: '6', label: '고립' },
  { id: 'riskFactor07', value: '7', label: '최근 수면변화' },
  { id: 'riskFactor08', value: '8', label: '높은 충동성' },
  { id: 'riskFactor09', value: '9', label: '기타' },
];

// 위기 단계 라디오
export const riskScaleOptions = [
  { id: 'riskScale01', value: '1', label: '양호', tag: 'safe', score: 1 },
  { id: 'riskScale02', value: '2', label: '주의', tag: 'caution', score: 2 },
  { id: 'riskScale03', value: '3', label: '위험', tag: 'danger', score: 3 },
  { id: 'riskScale04', value: '4', label: '고위험', tag: 'critical', score: 4 },
];

// 증상 리스트
export const symptomList = [
  { name: '우울', field: 'depression' },
  { name: '불안', field: 'anxiety' },
  { name: '공황', field: 'panic' },
  { name: '강박', field: 'ocd' },
  { name: 'ADHD', field: 'adhd' },
  { name: 'PTSD', field: 'ptsd' },
];
