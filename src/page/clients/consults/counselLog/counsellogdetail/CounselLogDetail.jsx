import React, { useState, useEffect } from 'react'
import './notes.scss';
import RadioList from './components/RadioList';
import CheckboxList from './components/CheckboxList';
import SymptomTable from './components/SymptomTable';
import CustomTextareaBlock from './components/CustomTextareaBlock';
import CounselLogStep from './components/CounselLogStep';
import Header from '@/layouts/Header';
import { useRecoilState } from 'recoil';
import { foldState } from '@/recoil';

function CounselLogDetail() {
  const handleStepNavClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const dummyData = {
    currentRisk: '2', // 자살 사고
    pastRisk: '1', // 해당 사항 없음
    riskFactors: ['2', '4'], // 진단 경험, 최근 극심한 스트레스
    // riskFactorEtc: '경제적 문제',
    riskScale: '2', // 주의
    symptoms: {
      depression: 3,
      anxiety: 2,
      panic: 0,
      ocd: 1,
      adhd: 0,
      ptsd: 0,
    },
    mainProblem: '최근 업무 스트레스로 불면과 불안이 심해짐',
    sessionContent: '내담자는 최근 업무에서의 압박감과 대인관계 어려움을 호소함. 상담 과정에서 감정 표현과 스트레스 관리 방법을 논의함.',
    counselorOpinion: '내담자는 스트레스에 취약한 성향이 있으나, 상담을 통해 점진적 개선이 기대됨.',
    observation: '피로해 보이며, 표정이 어둡고 말수가 적음. 면담 중간에 한숨을 자주 쉼.',
    goal: '불면 해소 및 스트레스 대처능력 향상',
    nextPlan: '다음 회기에는 이완훈련 및 대인관계 기술 훈련을 진행할 예정',
    concern: '상담 효과가 일시적일 수 있다는 우려가 있음',
    caseConcept: '내담자의 불안과 불면은 업무 스트레스와 대인관계에서 비롯된 것으로, 성장 과정에서의 완벽주의 경향과 연관됨.',
  }

  const [currentRisk, setCurrentRisk] = useState(dummyData?.currentRisk || '');
  const [pastRisk, setPastRisk] = useState(dummyData?.pastRisk || '');
  const [riskFactors, setRiskFactors] = useState(dummyData?.riskFactors || []);
  const [riskFactorEtc, setRiskFactorEtc] = useState(dummyData?.riskFactorEtc || '');
  const [riskScale, setRiskScale] = useState(dummyData?.riskScale || '');
  const [symptoms, setSymptoms] = useState(dummyData?.symptoms || []);
  const [mainProblem, setMainProblem] = useState(dummyData?.mainProblem || '');
  const [sessionContent, setSessionContent] = useState(dummyData?.sessionContent || '');
  const [counselorOpinion, setCounselorOpinion] = useState(dummyData?.counselorOpinion || '');
  const [observation, setObservation] = useState(dummyData?.observation || '');
  const [goal, setGoal] = useState(dummyData?.goal || '');
  const [nextPlan, setNextPlan] = useState(dummyData?.nextPlan || '');
  const [concern, setConcern] = useState(dummyData?.concern || '');
  const [caseConcept, setCaseConcept] = useState(dummyData?.caseConcept || '');
  const [showTooltip, setShowTooltip] = useState(false);

  const riskOptions = [
    { id: 'currentRisk01', value: '1', label: '해당 사항 없음' },
    { id: 'currentRisk02', value: '2', label: '자살 사고' },
    { id: 'currentRisk03', value: '3', label: '자살계획' },
    { id: 'currentRisk04', value: '4', label: '자살 시도' },
  ];
  const riskFactorOptions = [
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
  const riskScaleOptions = [
    { id: 'riskScale01', value: '1', label: '양호', tag: 'safe', score: 1 },
    { id: 'riskScale02', value: '2', label: '주의', tag: 'caution', score: 2 },
    { id: 'riskScale03', value: '3', label: '위험', tag: 'danger', score: 3 },
    { id: 'riskScale04', value: '4', label: '고위험', tag: 'critical', score: 4 },
  ];
  const symptomList = [
    { name: '우울', field: 'depression' },
    { name: '불안', field: 'anxiety' },
    { name: '공황', field: 'panic' },
    { name: '강박', field: 'ocd' },
    { name: 'ADHD', field: 'adhd' },
    { name: 'PTSD', field: 'ptsd' },
  ];

  const handleRiskChange = e => setCurrentRisk(e.target.value);
  const handlePastRiskChange = e => setPastRisk(e.target.value);
  const handleRiskFactorsChange = e => {
    const { value, checked } = e.target;
    setRiskFactors(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
  };
  const handleRiskFactorEtcChange = e => setRiskFactorEtc(e.target.value);
  const handleRiskScaleChange = e => setRiskScale(e.target.value);
  const handleSymptomChange = (field, score) => setSymptoms(prev => ({ ...prev, [field]: score }));
  const handleMainProblemChange = e => setMainProblem(e.target.value);
  const [scroll, setScroll] = useState(() => typeof window !== "undefined" ? window.scrollY >= 100 : false);
  const [fold, setFold] = useRecoilState(foldState);
  const handleSave = () => {
    console.log('저장');
  };

  // 스크롤 이벤트
  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY >= 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header
        title="3회기 상담일지"
        scroll={scroll}
        fold={fold}
        rightActions={
          <button className="save-btn type07 black" type="button" onClick={handleSave} style={{ display: 'block', transition: 'opacity 0.2s 50ms', opacity: scroll ? 1 : 0 }}>
            저장
          </button>
        }
      />
      <div className="inner">
        <div className="move-up">
          <strong className="page-title">3회기 상담일지</strong>
          <button className="save-btn type07 black" type="button" onClick={handleSave}>저장</button>
        </div>
        <div className="session-info-bar">
          <div className="info">
            <strong>상담내용</strong>
            <p>
              <span>상담일시</span> : <span>2024.09.28(토) 오후 2시</span>
            </p>
          </div>
          <a className="panel-btn" href="">이전 회기 기록</a>
        </div>
        <div className="form-section">
          <div className="step-nav">
            <div className="inner">
              <strong>상담일지 작성 단계</strong>
              <ul>
                <li className={currentRisk ? 'on' : ''}>
                  <a href="#step01" onClick={e => handleStepNavClick(e, 'step01')}>자살, 위기 상황의 긴급도</a>
                </li>
                <li className={Array.isArray(symptoms) ? (symptoms.length > 0 ? 'on' : '') : (Object.values(symptoms).some(v => v) ? 'on' : '')}>
                  <a href="#step02" onClick={e => handleStepNavClick(e, 'step02')}>현재 증상의 심각도</a>
                </li>
                <li className={mainProblem ? 'on' : ''}>
                  <a href="#step03" onClick={e => handleStepNavClick(e, 'step03')}>주호소 문제</a>
                </li>
                <li className={(sessionContent || counselorOpinion) ? 'on' : ''}>
                  <a href="#step04" onClick={e => handleStepNavClick(e, 'step04')}>상담기록</a>
                  <ul>
                    <li className={sessionContent ? 'on' : ''}>
                      <a href="#step04-1" onClick={e => e.preventDefault()}>상담내용</a>
                    </li>
                    <li className={counselorOpinion ? 'on' : ''}>
                      <a href="#step04-2" onClick={e => e.preventDefault()}>상담사 소견</a>
                    </li>
                  </ul>
                </li>
                <li className={observation ? 'on' : ''}>
                  <a href="#step05" onClick={e => handleStepNavClick(e, 'step05')}>객관적 관찰</a>
                </li>
                <li className={goal ? 'on' : ''}>
                  <a href="#step06" onClick={e => handleStepNavClick(e, 'step06')}>상담 목표</a>
                </li>
                <li className={nextPlan ? 'on' : ''}>
                  <a href="#step07" onClick={e => handleStepNavClick(e, 'step07')}>다음 상담 계획</a>
                </li>
                <li className={concern ? 'on' : ''}>
                  <a href="#step08" onClick={e => handleStepNavClick(e, 'step08')}>고민되는점</a>
                </li>
                <li className={caseConcept ? 'on' : ''}>
                  <a href="#step09" onClick={e => handleStepNavClick(e, 'step09')}>사례개념화</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="form-content">
            <CounselLogStep id="step01" title="자살, 위기 상황의 긴급도">
              {/* 1. 현재 위기 상황 */}
              <div className="write-wrap">
                <div className="write-title">
                  <p>1. 현재는 어떤 위기 상황이 있는지 선택해 주세요.</p>
                </div>
                <div className="write-area">
                  <RadioList
                    name="currentRisk"
                    options={riskOptions}
                    value={dummyData.currentRisk}
                    onChange={handleRiskChange}
                  />
                </div>
              </div>
              {/* 2. 과거 위기 상황 */}
              <div className="write-wrap">
                <div className="write-title">
                  <p>2. 과거에는 어떤 위기 상황이 있는지 선택해 주세요.</p>
                </div>
                <div className="write-area">
                  <RadioList
                    name="pastRisk"
                    options={riskOptions}
                    value={dummyData.pastRisk}
                    onChange={handlePastRiskChange}
                  />
                </div>
              </div>
              {/* 3. 위험요인 체크박스 */}
              <div className="write-wrap check">
                <div className="write-title">
                  <p>3. 위험요인을 선택해 주세요. (중복 선택 가능)</p>
                </div>
                <div className="write-area">
                  <CheckboxList
                    name="riskFactor"
                    options={riskFactorOptions}
                    values={riskFactors}
                    onChange={handleRiskFactorsChange}
                    etcInput={riskFactorEtc}
                    etcValue={riskFactorEtc}
                    onEtcChange={handleRiskFactorEtcChange}
                  />
                </div>
              </div>
              {/* 4. 위기 단계 선택 */}
              <div className="write-wrap risk-scale">
                <div className="write-title">
                  <p>4. 내담자의 위기 단계를 선택해 주세요.</p>
                  <a className="panel-btn" href="">평정 가이드 보기</a>
                </div>
                <p>선택하신 내담자의 위기 단계는 위험도 뱃지에 반영됩니다.</p>
                <div className="write-area">
                  <ul>
                    {riskScaleOptions.map(opt => (
                      <li key={opt.id}>
                        <div className="top">
                          <div className="input-wrap radio">
                            <input
                              id={opt.id}
                              type="radio"
                              name="riskScale"
                              value={opt.value}
                              checked={riskScale === opt.value}
                              onChange={handleRiskScaleChange}
                            />
                            <label htmlFor={opt.id}></label>
                          </div>
                          <span className={`face-icon ${opt.tag}`} aria-label="얼굴 아이콘"></span>
                          <span className={`tag ${opt.tag}`}>{opt.label}</span>
                        </div>
                        <div className="bottom">
                          <span>{opt.label} ({opt.score}점)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CounselLogStep>

            <CounselLogStep id="step02" title="현재 증상의 심각도">
              <div className="write-wrap">
                <div className="write-title">
                  <p>1. 내담자의 장애별 증상 심각도를 평정하여 주세요.</p>
                </div>
                <div className="write-area">
                  <SymptomTable
                    symptoms={symptomList}
                    values={symptoms}
                    onChange={handleSymptomChange}
                  />
                </div>
              </div>
            </CounselLogStep>

            <CounselLogStep id="step03" title="주호소 문제">
              <CustomTextareaBlock
                placeholder="주호소 문제를 입력해 주세요."
                value={mainProblem}
                onChange={handleMainProblemChange}
              />
            </CounselLogStep>

            <div id="step04" className="content04">
                <div className="step-title">
                    <strong className="necessary">상담기록</strong>
                </div>
                <div className="step-conts">
                    <div id="step04-1" className="step-title sub">
                        <strong className="necessary">상담내용</strong>
                        <button className="type01 h36" type="button">
                            <span>AI 생성하기</span>
                        </button>
                    </div>
                    <CustomTextareaBlock
                      placeholder="본 회기에서 다룬 주요 주제와 상호작용 흐름을 기술하세요"
                      className="editor-wrap"
                      value={sessionContent}
                    />
                    <div id="step04-2" className="step-title sub">
                      <strong className="necessary">상담사 소견</strong>
                    </div>
                    <CustomTextareaBlock
                      placeholder="상담사가 내담자의 보고한 내용에 대한 해석이나 현재 상태에 대한 임상적 판단과 경과를 기술하세요."
                      className="editor-wrap"
                      value={sessionContent}
                    />
                </div>
            </div>
            <div id="step05" className="content05">
              <div className="step-title">
                <strong className="necessary">객관적 관찰</strong>
              </div>
              <div className="step-conts">
                  <CustomTextareaBlock
                    value={observation}
                    placeholder="내담자의 외모, 관찰 가능한 증상, 검사 결과, 가능한 진단, 행동관찰 등 객관적으로 관찰된 특이사항을 기록하세요."
                    className="editor-wrap"
                  />
              </div>
            </div>
            <div id="step06" className="content06">
              <div className="step-title">
                <strong className="necessary">상담 목표</strong>
              </div>
              <div className="step-conts">
                  <CustomTextareaBlock
                    value={goal}
                    placeholder="내담자와 설정한 단기 또는 장기 상담 목표를 구체적으로 기술해주세요."
                    className="editor-wrap"
                  />
              </div>
            </div>
            <div id="step07" className="content07">
              <div className="step-title">
                <strong className="necessary">차회기 상담 계획</strong>
                <button className="type01 h36" type="button">
                  <span>AI 생성하기</span>
                </button>
              </div>
              <div className="step-conts">
                <CustomTextareaBlock
                  value={nextPlan}
                  placeholder="다음 회기에서 다룰 주제나 전략에 대해 간단히 기술해주세요."
                  className="editor-wrap"
                />
              </div>
            </div>
            <div id="step08" className="content08">
              <div className="step-title">
                <strong>고민되는 점</strong>
              </div>
              <div className="step-conts">
                <CustomTextareaBlock
                  value={concern}
                  placeholder="본 회기 진행에 있어 전문가의 도움을 받고 싶은 부분이나 고민되는 점을 적어보세요."
                  className="editor-wrap"
                />
              </div>
            </div>
            <div id="step09" className="content09">
              <div className="tips">
                <p>사례개념화를 작성하면 내담자의 문제를 더 잘 이해할 수 있어요!</p>
              </div>
              <div className="step-title type01">
                <strong>사례개념화</strong>
                <div className="info">
                  <div className="info-icon" aria-label="툴팁 안내 아이콘" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}></div>
                  <div className={`tooltip${showTooltip ? " show" : ""}`}>
                    사례개념화는 내담자의 고민이나 문제를 더 잘 이해하기 위해서<br/>
                    하나의 그림처럼 정리해보는 과정이에요.
                  </div>
                </div>
              </div>
              <div className="step-conts">
                <CustomTextareaBlock
                  value={caseConcept}
                  placeholder="내담자의 고민이나 문제를 이론적 틀 안에서 이해하고, 그 문제가 비롯된 내담자의 성장 과정과 유지 요인 등을 정리해 보세요."
                  className="editor-wrap"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CounselLogDetail;