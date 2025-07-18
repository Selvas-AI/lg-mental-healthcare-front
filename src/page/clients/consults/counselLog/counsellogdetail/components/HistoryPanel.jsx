import React, { useEffect, useRef, useState } from 'react';
import emptyFace from '@/assets/images/common/empty_face.svg';

function HistoryPanel({ open, onClose }) {
  const tabRefs = useRef([]);
  const indicatorRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  // 탭 이동 시 indicator 위치/크기 갱신
  useEffect(() => {
    const $tab = tabRefs.current[activeTab];
    const $indicator = indicatorRef.current;
    if ($tab && $indicator) {
      $indicator.style.width = $tab.offsetWidth + 'px';
      $indicator.style.left = $tab.offsetLeft + 'px';
    }
  }, [activeTab, open]);

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
          <div className="tab-menu">
            <div className="tab-list-wrap">
              <ul className="tab-list scroll-drag" role="tablist">
                <li 
                  className={`cursor-pointer ${activeTab === 0 ? 'on' : ''}`}
                  role="tab"
                  ref={el => tabRefs.current[0] = el}
                >
                  <a onClick={e => { e.preventDefault(); setActiveTab(0); }}>
                    <span>2회기</span>
                  </a>
                </li>
                <li 
                  className={`cursor-pointer ${activeTab === 1 ? 'on' : ''}`}
                  role="tab"
                  ref={el => tabRefs.current[1] = el}
                >
                  <a onClick={e => { e.preventDefault(); setActiveTab(1); }}>
                    <span>1회기</span>
                  </a>
                </li>
              </ul>
              <div className="tab-indicator" ref={indicatorRef}></div>
            </div>
            <div className="tab-cont">
              {/* empty */}
              <div className={activeTab === 0 ? "tab-panel empty on" : "tab-panel empty"} role="tabpanel">
                <div className="inner">
                  <div className="empty-history">
                    <img src={emptyFace} alt="empty" />
                    <p className="empty-info">2회기 상담 일지를 작성 안 했어요.</p>
                  </div>
                </div>
              </div>
              <div className={activeTab === 1 ? "tab-panel on" : "tab-panel"} role="tabpanel">
                <div className="inner">
                  <div className="step">
                    <div className="list-tit">
                      <strong>자살, 위기 상황의 긴급도</strong>
                    </div>
                    <div className="list-wrap">
                      <ul>
                        <li>
                          <div>현재 위기 상황</div>
                          <div>해당 사항 없음</div>
                        </li>
                        <li>
                          <div>과거 위기 상황</div>
                          <div>자살계획</div>
                        </li>
                        <li className="risk-factor">
                          <div>위험요인</div>
                          <div>
                            <ul>
                              <li>진단경험</li>
                              <li>자해경험</li>
                              <li>최근 극심한 스트레스</li>
                              <li>높은 충동성</li>
                              <li>가족력</li>
                              <li>고립</li>
                              <li>최근 수면 변화</li>
                              <li>기타(관계불화)</li>
                            </ul>
                          </div>
                        </li>
                        <li className="risk-scale">
                          <div>위기단계</div>
                          <div>
                            {/* safe/caution/danger/critical 각 class 추가 시 상태 변화 */}
                            <span className="tag caution">주의</span>
                            <span>2점</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="step">
                    <div className="list-tit">
                      <strong>현재 증상의 심각도</strong>
                    </div>
                    <div className="list-wrap">
                      <ul>
                        {/* level01 ~ level05 class 추가하여 단계 조절 */}
                        <li className="symptom level01">
                          <div>
                            <span>증상 1</span>
                            <span>우울</span>
                          </div>
                          <div>
                            <span>매우 높음(5점)</span>
                            <div className="score-bar">
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                            </div>
                          </div>
                        </li>
                        <li className="symptom level02">
                          <div>
                            <span>증상 2</span>
                            <span>불안</span>
                          </div>
                          <div>
                            <span>약간 높음(4점)</span>
                            <div className="score-bar">
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                            </div>
                          </div>
                        </li>
                        <li className="symptom level03">
                          <div>
                            <span>증상 3</span>
                            <span>공황</span>
                          </div>
                          <div>
                            <span>보통(3점)</span>
                            <div className="score-bar">
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                            </div>
                          </div>
                        </li>
                        <li className="symptom level04">
                          <div>
                            <span>증상 4</span>
                            <span>강박</span>
                          </div>
                          <div>
                            <span>약간 낮음(2점)</span>
                            <div className="score-bar">
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                            </div>
                          </div>
                        </li>
                        <li className="symptom level05">
                          <div>
                            <span>증상 5</span>
                            <span>PTSD</span>
                          </div>
                          <div>
                            <span>낮음(1점)</span>
                            <div className="score-bar">
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                              <div className="bar"></div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="step">
                    <div className="write-tit">
                      <strong>주호소 문제</strong>
                    </div>
                    <div className="write-wrap">
                      우울증으로 인해 교우 관계, 가족 관계에 있어 부정적임
                    </div>
                  </div>
                  <div className="step">
                    <div className="write-tit">
                      <strong>상담내용</strong>
                    </div>
                    <div className="write-wrap">
                      우울증을 1년여간 앓고 있었으며, 때문에 가족과 친구 사이의 불화가 심함. 무기력하고 수면 시간이 길어짐. 학교 생활 하기 힘듦
                    </div>
                  </div>
                  <div className="step">
                    <div className="write-tit">
                      <strong>객관적 관찰</strong>
                    </div>
                    <div className="write-wrap">
                      <div className="bullet-line">내담자는 ‘엄마’에 대해 이야기하는 동안 말을 자주 더듬었다.</div>
                      <div className="bullet-line">교우 관계에 대해 이야기 할 때 눈물을 보였다.</div>
                      <div className="bullet-line">상담 중 주기적으로 손가락을 만지는 행동을 반복하며 불안을 드러냈다.</div>
                    </div>
                  </div>
                  <div className="step">
                    <div className="write-tit">
                      <strong>상담 목표</strong>
                    </div>
                    <div className="write-wrap">
                      <div className="bullet-line">엄마와의 불화 개선, 자책감 덜기</div>
                    </div>
                  </div>
                  <div className="step">
                    <div className="write-tit">
                      <strong>다음 상담 계획</strong>
                    </div>
                    <div className="write-wrap">
                      <div className="bullet-line">다음 회기에서는 내담자의 분노에 대한 자기이해를 위해 역할극을 활용할 계획이다.</div>
                      <div className="bullet-line">내담자의 우울한 감정 바탕으로, 엄마와의 관계 개선을 중심으로 상담을 진행할 예정이다.</div>
                      <div className="bullet-line">내담자의 감정조절을 위해 감정 일기 작성을 권유해 볼 예정이다.</div>
                    </div>
                  </div>
                  <div className="step">
                    <div className="write-tit">
                      <strong>고민되는 점</strong>
                    </div>
                    <div className="write-wrap">
                      <div className="bullet-line">없음</div>
                    </div>
                  </div>
                  <div className="step">
                    <div className="write-tit">
                      <strong>사례개념화</strong>
                    </div>
                    <div className="write-wrap">
                      모르겠음
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;