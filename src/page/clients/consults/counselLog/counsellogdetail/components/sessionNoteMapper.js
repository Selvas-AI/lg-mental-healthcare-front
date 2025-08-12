// 상담일지 API 데이터를 컴포넌트 상태로 매핑하는 유틸 함수
// mapSessionNoteToState(data, {
//   setCurrentRisk, setPastRisk, setRiskScale,
//   setRiskFactors, setRiskFactorEtc,
//   setSymptoms,
//   setMainProblem, setSessionContent, setCounselorOpinion, setObservation,
//   setGoal, setNextPlan, setConcern, setCaseConcept,
// });

export const mapSessionNoteToState = (data, setters) => {
  if (!data || !setters) return; 
  const {
    setCurrentRisk, setPastRisk, setRiskScale,
    setRiskFactors, setRiskFactorEtc,
    setSymptoms,
    setMainProblem, setSessionContent, setCounselorOpinion, setObservation,
    setGoal, setNextPlan, setConcern, setCaseConcept,
  } = setters;

  if (typeof setCurrentRisk === 'function') setCurrentRisk(data.currentRiskLevel ? String(data.currentRiskLevel) : '');
  if (typeof setPastRisk === 'function') setPastRisk(data.pastRiskLevel ? String(data.pastRiskLevel) : '');
  if (typeof setRiskScale === 'function') setRiskScale(data.crisisStageLevel ? String(data.crisisStageLevel) : '');

  const factors = [];
  if (data.riskNone) factors.push('1');
  if (data.riskDiagnosis) factors.push('2');
  if (data.riskSelfHarm) factors.push('3');
  if (data.riskExtremeStress) factors.push('4');
  if (data.riskFamilyHistory) factors.push('5');
  if (data.riskGrief) factors.push('6');
  if (data.riskSleepChange) factors.push('7');
  if (data.riskHighImpulsivity) factors.push('8');
  if (data.riskOtherText && String(data.riskOtherText).trim()) factors.push('9');
  if (typeof setRiskFactors === 'function') setRiskFactors(factors);
  if (typeof setRiskFactorEtc === 'function') setRiskFactorEtc(data.riskOtherText || '');

  if (typeof setSymptoms === 'function') setSymptoms({
    depression: data.depression ?? null,
    anxiety: data.anxiety ?? null,
    panic: data.panic ?? null,
    ocd: data.compulsion ?? null,
    adhd: data.adhd ?? null,
    ptsd: data.ptsd ?? null,
  });

  if (typeof setMainProblem === 'function') setMainProblem(data.chiefComplaintText || '');
  if (typeof setSessionContent === 'function') setSessionContent(data.sessionSummaryText || '');
  if (typeof setCounselorOpinion === 'function') setCounselorOpinion(data.counselorOpinionText || '');
  if (typeof setObservation === 'function') setObservation(data.objectiveObservationText || '');
  if (typeof setGoal === 'function') setGoal(data.counselingGoalText || '');
  if (typeof setNextPlan === 'function') setNextPlan(data.nextSessionPlanText || '');
  if (typeof setConcern === 'function') setConcern(data.clientConcernsText || '');
  if (typeof setCaseConcept === 'function') setCaseConcept(data.caseConceptualizationText || '');
};
