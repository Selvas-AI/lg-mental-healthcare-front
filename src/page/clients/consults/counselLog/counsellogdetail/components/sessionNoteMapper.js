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
    setSymptoms, setCustomSymptoms,
    setMainProblem, setSessionContent, setCounselorOpinion, setObservation,
    setGoal, setNextPlan, setConcern, setCaseConcept,
    setAiGeneratedData,
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

  // 커스텀 증상 복원 (symptom01~04에서 customSymptoms 배열로 변환)
  if (typeof setCustomSymptoms === 'function') {
    const customSymptoms = [];
    
    // symptom01
    if (data.symptom01Active && data.symptom01Name?.trim()) {
      customSymptoms.push({
        id: 'custom-01',
        name: data.symptom01Name.trim(),
        editing: false,
        error: false,
        score: data.symptom01Severity ?? 0
      });
    }
    
    // symptom02
    if (data.symptom02Active && data.symptom02Name?.trim()) {
      customSymptoms.push({
        id: 'custom-02',
        name: data.symptom02Name.trim(),
        editing: false,
        error: false,
        score: data.symptom02Severity ?? 0
      });
    }
    
    // symptom03
    if (data.symptom03Active && data.symptom03Name?.trim()) {
      customSymptoms.push({
        id: 'custom-03',
        name: data.symptom03Name.trim(),
        editing: false,
        error: false,
        score: data.symptom03Severity ?? 0
      });
    }
    
    // symptom04
    if (data.symptom04Active && data.symptom04Name?.trim()) {
      customSymptoms.push({
        id: 'custom-04',
        name: data.symptom04Name.trim(),
        editing: false,
        error: false,
        score: data.symptom04Severity ?? 0
      });
    }
    
    setCustomSymptoms(customSymptoms);
  }

  if (typeof setMainProblem === 'function') setMainProblem(data.chiefComplaintText || '');
  if (typeof setSessionContent === 'function') setSessionContent(data.sessionSummaryText || '');
  if (typeof setCounselorOpinion === 'function') setCounselorOpinion(data.counselorOpinionText || '');
  if (typeof setObservation === 'function') setObservation(data.objectiveObservationText || '');
  if (typeof setGoal === 'function') setGoal(data.counselingGoalText || '');
  if (typeof setNextPlan === 'function') setNextPlan(data.nextSessionPlanText || '');
  if (typeof setConcern === 'function') setConcern(data.clientConcernsText || '');
  if (typeof setCaseConcept === 'function') setCaseConcept(data.caseConceptualizationText || '');

  // AI 생성 데이터 파싱 및 설정
  if (typeof setAiGeneratedData === 'function') {
    const aiData = { nextPlan: null };
    
    // nextSessionPlanAi 파싱
    if (data.nextSessionPlanAi) {
      try {
        const parsedData = JSON.parse(data.nextSessionPlanAi);
        if (parsedData.llm_answer || parsedData.llm_feedback) {
          aiData.nextPlan = parsedData;
        }
      } catch (error) {
        console.error('nextSessionPlanAi 파싱 오류:', error);
      }
    }
    
    setAiGeneratedData(aiData);
  }
};
