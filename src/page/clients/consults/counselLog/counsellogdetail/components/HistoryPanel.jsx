import React, { useEffect, useRef, useState } from 'react';
import { sessionList, sessionNoteFind, sessionFind } from '@/api/apiCaller';
import emptyFace from '@/assets/images/common/empty_face.svg';

function HistoryPanel({ open, onClose, clientId, currentSessionSeq }) {
  const tabRefs = useRef([]);
  const indicatorRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [previousSessions, setPreviousSessions] = useState([]);
  const [sessionNotes, setSessionNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentSessionGroupSeq, setCurrentSessionGroupSeq] = useState(null);

  // 이전 회기 목록 조회
  useEffect(() => {
    if (open && clientId) {
      loadPreviousSessions();
    }
  }, [open, clientId]);

  // 탭 이동 시 indicator 위치/크기 갱신
  useEffect(() => {
    const $tab = tabRefs.current[activeTab];
    const $indicator = indicatorRef.current;
    if ($tab && $indicator) {
      // li 전체 너비(offsetWidth)로 indicator width 설정
      $indicator.style.width = $tab.offsetWidth + 'px';
      $indicator.style.left = $tab.offsetLeft + 'px';
    }
  }, [activeTab, open]);

  // 이전 회기 목록 조회 함수
  const loadPreviousSessions = async () => {
    if (!clientId || !currentSessionSeq) return;
    
    setLoading(true);
    try {
      // 1. 현재 회기 정보 조회하여 sessionGroupSeq와 sessionOrder 가져오기
      const currentSessionResponse = await sessionFind(clientId, currentSessionSeq);
      
      if (currentSessionResponse.code !== 200 || !currentSessionResponse.data) {
        return;
      }
      
      const currentGroupSeq = currentSessionResponse.data.sessiongroupSeq;
      const currentSessionOrder = currentSessionResponse.data.sessionOrder || 0;
      setCurrentSessionGroupSeq(currentGroupSeq);
      
      // 2. 전체 회기 목록 조회
      const response = await sessionList(clientId);
      
      if (response.code === 200 && Array.isArray(response.data)) {
        // 같은 sessiongroupSeq를 가진 회기들 중 현재 회기보다 이전 회기들만 필터링
        const filteredSessions = response.data
          .filter(session => 
            session.sessiongroupSeq === currentGroupSeq && 
            session.sessionSeq !== parseInt(currentSessionSeq) &&
            (session.sessionOrder || 0) < currentSessionOrder // 현재 sessionOrder보다 작은 회기들만
          )
          .sort((a, b) => (b.sessionOrder || 0) - (a.sessionOrder || 0)); // sessionOrder 기준 내림차순 정렬
        
        setPreviousSessions(filteredSessions);
        
        // 각 회기의 상담일지 데이터 조회 (todoCounselNote가 true인 경우만)
        for (const session of filteredSessions) {
          if (session.todoCounselNote) {
            await loadSessionNote(session.sessionSeq);
          }
        }
      } else {
      }
    } catch (error) {
      console.error('이전 회기 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 회기의 상담일지 조회
  const loadSessionNote = async (sessionSeq) => {
    try {
      const response = await sessionNoteFind(sessionSeq);
      
      if (response.code === 200 && response.data) {
        setSessionNotes(prev => ({
          ...prev,
          [sessionSeq]: response.data
        }));
      } else {
      }
    } catch (error) {
      console.error('상담일지 조회 오류:', error);
    }
  };

  return (
    <div className={"support-panel session-history" + (open ? " on" : "")}>
      <div className="inner">
        <div className="panel-tit">
          <div className="tit-wrap">
            <strong>이전 회기 기록</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
          </div>
        </div>
        <div className="panel-cont">
          {loading ? (
            <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
              이전 회기 기록을 불러오는 중...
            </div>
          ) : previousSessions.length === 0 ? (
            <div className="empty-history" style={{ height: '100%'}}>
              <img src={emptyFace} alt="empty" />
              <p className="empty-info">이전 회기 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="tab-menu">
              <div className="tab-list-wrap">
                <ul className="tab-list scroll-drag" role="tablist">
                  {previousSessions.map((session, index) => (
                    <li 
                      key={session.sessionSeq}
                      className={`cursor-pointer ${activeTab === index ? 'on' : ''}`}
                      role="tab"
                      ref={el => tabRefs.current[index] = el}
                    >
                      <a onClick={e => { e.preventDefault(); setActiveTab(index); }}>
                        <span>{session.sessionOrder || session.sessionNum}회기</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="tab-indicator" ref={indicatorRef} style={{ width: '4.2rem' }}></div>
              </div>
              <div className="tab-cont">
                {previousSessions.map((session, index) => {
                  const sessionNote = sessionNotes[session.sessionSeq];
                  const isActive = activeTab === index;
                  
                  return (
                    <div 
                      key={session.sessionSeq}
                      className={`${isActive ? "tab-panel on" : "tab-panel"} ${!session.todoCounselNote ? 'empty' : ''}`} 
                      role="tabpanel"
                    >
                      {!session.todoCounselNote ? (
                        <div className="inner">
                          <div className="empty-history">
                            <img src={emptyFace} alt="empty" />
                            <p className="empty-info">{session.sessionOrder || session.sessionNum}회기 상담 일지를 작성 안 했어요.</p>
                          </div>
                        </div>
                      ) : !sessionNote ? (
                        <div className="inner">
                          <div className="empty-history">
                            <img src={emptyFace} alt="empty" />
                            <p className="empty-info">상담 일지를 불러오는 중...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="inner">
                          {/* 위기 상황 섹션 */}
                          {(sessionNote.currentRiskLevel || sessionNote.pastRiskLevel || sessionNote.riskDiagnosis || sessionNote.riskSelfHarm || sessionNote.riskExtremeStress) && (
                            <div className="step">
                              <div className="list-tit">
                                <strong>자살, 위기 상황의 긴급도</strong>
                              </div>
                              <div className="list-wrap">
                                <ul>
                                  {sessionNote.currentRiskLevel && (
                                    <li>
                                      <div>현재 위기 상황</div>
                                      <div>{sessionNote.currentRiskLevel === 1 ? '해당 사항 없음' : sessionNote.currentRiskLevel === 2 ? '자살사고' : sessionNote.currentRiskLevel === 3 ? '자살계획' : sessionNote.currentRiskLevel === 4 ? '자살시도' : '기타'}</div>
                                    </li>
                                  )}
                                  {sessionNote.pastRiskLevel && (
                                    <li>
                                      <div>과거 위기 상황</div>
                                      <div>{sessionNote.pastRiskLevel === 1 ? '해당 사항 없음' : sessionNote.pastRiskLevel === 2 ? '자살사고' : sessionNote.pastRiskLevel === 3 ? '자살계획' : sessionNote.pastRiskLevel === 4 ? '자살시도' : '기타'}</div>
                                    </li>
                                  )}
                                  {(sessionNote.riskDiagnosis || sessionNote.riskSelfHarm || sessionNote.riskExtremeStress || sessionNote.riskFamilyHistory || sessionNote.riskGrief || sessionNote.riskSleepChange || sessionNote.riskHighImpulsivity || sessionNote.riskOtherText) && (
                                    <li className="risk-factor">
                                      <div>위험요인</div>
                                      <div>
                                        <ul>
                                          {sessionNote.riskDiagnosis && <li>진단경험</li>}
                                          {sessionNote.riskSelfHarm && <li>자해경험</li>}
                                          {sessionNote.riskExtremeStress && <li>최근 극심한 스트레스</li>}
                                          {sessionNote.riskHighImpulsivity && <li>높은 충동성</li>}
                                          {sessionNote.riskFamilyHistory && <li>가족력</li>}
                                          {sessionNote.riskGrief && <li>고립</li>}
                                          {sessionNote.riskSleepChange && <li>최근 수면 변화</li>}
                                          {sessionNote.riskOtherText && <li>기타({sessionNote.riskOtherText})</li>}
                                        </ul>
                                      </div>
                                    </li>
                                  )}
                                  {sessionNote.crisisStageLevel && (
                                    <li className="risk-scale">
                                      <div>위기단계</div>
                                      <div>
                                        <span className={`tag ${sessionNote.crisisStageLevel === 1 ? 'safe' : sessionNote.crisisStageLevel === 2 ? 'caution' : sessionNote.crisisStageLevel === 3 ? 'danger' : 'critical'}`}>
                                          {sessionNote.crisisStageLevel === 1 ? '양호' : sessionNote.crisisStageLevel === 2 ? '주의' : sessionNote.crisisStageLevel === 3 ? '위험' : '고위험'}
                                        </span>
                                        <span>{sessionNote.crisisStageLevel}점</span>
                                      </div>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* 증상 심각도 섹션 */}
                          {(sessionNote.depression > 0 || sessionNote.anxiety > 0 || sessionNote.panic > 0 || sessionNote.compulsion > 0 || sessionNote.adhd > 0 || sessionNote.ptsd > 0 || 
                            (sessionNote.symptom01Active && sessionNote.symptom01Severity > 0) || (sessionNote.symptom02Active && sessionNote.symptom02Severity > 0) || (sessionNote.symptom03Active && sessionNote.symptom03Severity > 0) || (sessionNote.symptom04Active && sessionNote.symptom04Severity > 0)) && (
                            <div className="step">
                              <div className="list-tit">
                                <strong>현재 증상의 심각도</strong>
                              </div>
                              <div className="list-wrap">
                                <ul>
                                  {(() => {
                                    const items = [];
                                    const toLabel = (v) => (v === 1 ? '낮음' : v === 2 ? '약간 낮음' : v === 3 ? '보통' : v === 4 ? '약간 높음' : '매우 높음');

                                    // 기본 증상
                                    if (sessionNote.depression > 0) items.push({ name: '우울', severity: sessionNote.depression });
                                    if (sessionNote.anxiety > 0) items.push({ name: '불안', severity: sessionNote.anxiety });
                                    if (sessionNote.panic > 0) items.push({ name: '공황', severity: sessionNote.panic });
                                    if (sessionNote.compulsion > 0) items.push({ name: '강박', severity: sessionNote.compulsion });
                                    if (sessionNote.adhd > 0) items.push({ name: 'ADHD', severity: sessionNote.adhd });
                                    if (sessionNote.ptsd > 0) items.push({ name: 'PTSD', severity: sessionNote.ptsd });

                                    // 커스텀 증상
                                    if (sessionNote.symptom01Active && sessionNote.symptom01Name && sessionNote.symptom01Severity > 0) {
                                      items.push({ name: sessionNote.symptom01Name, severity: sessionNote.symptom01Severity });
                                    }
                                    if (sessionNote.symptom02Active && sessionNote.symptom02Name && sessionNote.symptom02Severity > 0) {
                                      items.push({ name: sessionNote.symptom02Name, severity: sessionNote.symptom02Severity });
                                    }
                                    if (sessionNote.symptom03Active && sessionNote.symptom03Name && sessionNote.symptom03Severity > 0) {
                                      items.push({ name: sessionNote.symptom03Name, severity: sessionNote.symptom03Severity });
                                    }
                                    if (sessionNote.symptom04Active && sessionNote.symptom04Name && sessionNote.symptom04Severity > 0) {
                                      items.push({ name: sessionNote.symptom04Name, severity: sessionNote.symptom04Severity });
                                    }

                                    return items.map((it, idx) => (
                                      <li key={`${it.name}-${idx}`} className={`symptom level0${it.severity}`}>
                                        <div>
                                          <span>증상 {idx + 1}</span>
                                          <span>{it.name}</span>
                                        </div>
                                        <div>
                                          <span>{toLabel(it.severity)}({it.severity}점)</span>
                                          <div className="score-bar">
                                            {[1, 2, 3, 4, 5].map(bar => (
                                              <div key={bar} className="bar"></div>
                                            ))}
                                          </div>
                                        </div>
                                      </li>
                                    ));
                                  })()}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* 주호소 문제 */}
                          {sessionNote.chiefComplaintText && sessionNote.chiefComplaintText.trim() !== '0' && (
                            <div className="step">
                              <div className="write-tit">
                                <strong>주호소 문제</strong>
                              </div>
                              <div className="write-wrap">
                                {sessionNote.chiefComplaintText.split('\n').map((line, idx) => {
                                  const raw = line || '';
                                  const t = raw.trim();
                                  if (!t || t === '0') return null;
                                  const isBullet = t.startsWith('::BLT:: ');
                                  const content = isBullet ? t.slice('::BLT:: '.length) : t;
                                  return <div key={idx} className={isBullet ? 'bullet-line' : undefined}>{content}</div>;
                                })}
                              </div>
                            </div>
                          )}

                          {/* 상담내용 */}
                          {sessionNote.sessionSummaryText && sessionNote.sessionSummaryText.trim() !== '0' && (
                            <div className="step">
                              <div className="write-tit">
                                <strong>상담내용</strong>
                              </div>
                              <div className="write-wrap">
                                {sessionNote.sessionSummaryText.split('\n').map((line, idx) => {
                                  const raw = line || '';
                                  const t = raw.trim();
                                  if (!t || t === '0') return null;
                                  const isBullet = t.startsWith('::BLT:: ');
                                  const content = isBullet ? t.slice('::BLT:: '.length) : t;
                                  return <div key={idx} className={isBullet ? 'bullet-line' : undefined}>{content}</div>;
                                })}
                              </div>
                            </div>
                          )}

                          {/* 객관적 관찰 */}
                          {sessionNote.objectiveObservationText && (
                            <div className="step">
                              <div className="write-tit">
                                <strong>객관적 관찰</strong>
                              </div>
                              <div className="write-wrap">
                                {sessionNote.objectiveObservationText.split('\n').map((line, idx) => {
                                  const raw = line || '';
                                  const t = raw.trim();
                                  if (!t || t === '0') return null;
                                  const isBullet = t.startsWith('::BLT:: ');
                                  const content = isBullet ? t.slice('::BLT:: '.length) : t;
                                  return <div key={idx} className={isBullet ? 'bullet-line' : undefined}>{content}</div>;
                                })}
                              </div>
                            </div>
                          )}

                          {/* 상담 목표 */}
                          {sessionNote.counselingGoalText && (
                            <div className="step">
                              <div className="write-tit">
                                <strong>상담 목표</strong>
                              </div>
                              <div className="write-wrap">
                                {sessionNote.counselingGoalText.split('\n').map((line, idx) => {
                                  const raw = line || '';
                                  const t = raw.trim();
                                  if (!t || t === '0') return null;
                                  const isBullet = t.startsWith('::BLT:: ');
                                  const content = isBullet ? t.slice('::BLT:: '.length) : t;
                                  return <div key={idx} className={isBullet ? 'bullet-line' : undefined}>{content}</div>;
                                })}
                              </div>
                            </div>
                          )}

                          {/* 다음 상담 계획 */}
                          {sessionNote.nextSessionPlanText && (
                            <div className="step">
                              <div className="write-tit">
                                <strong>다음 상담 계획</strong>
                              </div>
                              <div className="write-wrap">
                                {sessionNote.nextSessionPlanText.split('\n').map((line, idx) => {
                                  const raw = line || '';
                                  const t = raw.trim();
                                  if (!t || t === '0') return null;
                                  const isBullet = t.startsWith('::BLT:: ');
                                  const content = isBullet ? t.slice('::BLT:: '.length) : t;
                                  return <div key={idx} className={isBullet ? 'bullet-line' : undefined}>{content}</div>;
                                })}
                              </div>
                            </div>
                          )}

                          {/* 고민되는 점 */}
                          {sessionNote.clientConcernsText && (
                            <div className="step">
                              <div className="write-tit">
                                <strong>고민되는 점</strong>
                              </div>
                              <div className="write-wrap">
                                {sessionNote.clientConcernsText.split('\n').map((line, idx) => {
                                  const raw = line || '';
                                  const t = raw.trim();
                                  if (!t || t === '0') return null;
                                  const isBullet = t.startsWith('::BLT:: ');
                                  const content = isBullet ? t.slice('::BLT:: '.length) : t;
                                  return <div key={idx} className={isBullet ? 'bullet-line' : undefined}>{content}</div>;
                                })}
                              </div>
                            </div>
                          )}

                          {/* 사례개념화 */}
                          {sessionNote.caseConceptualizationText && sessionNote.caseConceptualizationText.trim() !== '0' && (
                            <div className="step">
                              <div className="write-tit">
                                <strong>사례개념화</strong>
                              </div>
                              <div className="write-wrap">
                                {sessionNote.caseConceptualizationText.split('\n').map((line, idx) => {
                                  const raw = line || '';
                                  const t = raw.trim();
                                  if (!t || t === '0') return null;
                                  const isBullet = t.startsWith('::BLT:: ');
                                  const content = isBullet ? t.slice('::BLT:: '.length) : t;
                                  return <div key={idx} className={isBullet ? 'bullet-line' : undefined}>{content}</div>;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;