import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";
import EmergencyChart from "./EmergencyChart";
import { timelineList } from "@/api/apiCaller";

function TimelinePanel({ open, onClose, clientSeq, prefetchedTimeline = [] }) {
  // 각 토글 영역(상담요약/고민주제/긴급도/심각도/스트레스 징후) 열림 상태
  const [openSection, setOpenSection] = useState([true, true, true, true, true]);
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [maxHeights, setMaxHeights] = useState(["0px", "0px", "0px", "0px", "0px"]);
  const [timelineData, setTimelineData] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);

  const handleToggle = idx => {
    setOpenSection(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };

  // 타임라인 데이터 조회: timelineList 결과에서 최신 그룹만 표시
  const fetchTimelineData = async () => {
    try {
      const response = await timelineList(clientSeq);
      if (response.code === 200 && Array.isArray(response.data)) {
        const list = response.data;
        if (list.length === 0) {
          setTimelineData([]);
          setIsEmpty(true);
          return;
        }

        // 최신 그룹: sessiongroupSeq 최댓값
        const latestGroupSeq = Math.max(...list.map(r => r.sessiongroupSeq || 0));
        const filtered = list.filter(r => r.sessiongroupSeq === latestGroupSeq);

        setTimelineData(filtered);
        setIsEmpty(filtered.length === 0);
      } else {
        setTimelineData([]);
        setIsEmpty(true);
      }
    } catch (error) {
      console.error('타임라인 데이터 조회 실패:', error);
      setTimelineData([]);
      setIsEmpty(true);
    }
  };

  // 긴급도 차트 데이터 역순으로 정렬
  const reversedData = [...timelineData].reverse();

  useLayoutEffect(() => {
    setMaxHeights(prev => prev.map((_, i) => {
      if (openSection[i] && sectionRefs[i].current) {
        return sectionRefs[i].current.scrollHeight + "px";
      }
      return "0px";
    }));
  }, [openSection, timelineData]);

  useEffect(() => {
    if (open) {
      setOpenSection([true, true, true, true, true]);
      if (Array.isArray(prefetchedTimeline) && prefetchedTimeline.length > 0) {
        setTimelineData(prefetchedTimeline);
        setIsEmpty(prefetchedTimeline.length === 0);
      } else {
        fetchTimelineData();
      }
    }
  }, [open, clientSeq, prefetchedTimeline]);

  return (
    <div className={"support-panel timeline" + (open ? " on" : "")}>
      <div className="inner">
        <div className="panel-tit">
          <div className="tit-wrap">
            <strong>타임라인</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={onClose} />
          </div>
        </div>
        <div className="panel-cont">
          <div className="toggle-cont">
            {/* 상담요약 */}
            <div className="toggle-wrap">
              <div className="tit-wrap">
                <strong>상담요약</strong>
                <button
                  className={"toggle-btn" + (openSection[0] ? " on" : "")}
                  type="button"
                  aria-label="펼치기/접기"
                  onClick={() => handleToggle(0)}
                />
              </div>
              <div
                className="con-wrap"
                ref={sectionRefs[0]}
                style={{
                  maxHeight: maxHeights[0],
                  overflow: 'hidden',
                  transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {isEmpty ? (
                  <div className="empty">
                    <img src={emptyFace} alt="empty" />
                    <p className="empty-tit">상담 요약 이력이 없습니다.</p>
                    <p className="empty-info">이전 회기 상담 확인 또는<br />이전 상담 녹취록을 확인해 주세요.</p>
                  </div>
                ) : (
                  <ul className="session-list">
                    {timelineData.map((row, idx) => (
                      <li key={idx}>
                        <span>{row.sessionOrder || row.sessionNo}회기</span>
                        <div>{row.counselingSummaryText || '-'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* 고민주제 */}
            <div className="toggle-wrap">
              <div className="tit-wrap">
                <strong>고민주제</strong>
                <button
                  className={"toggle-btn" + (openSection[1] ? " on" : "")}
                  type="button"
                  aria-label="펼치기/접기"
                  onClick={() => handleToggle(1)}
                />
              </div>
              <div
                className="con-wrap"
                ref={sectionRefs[1]}
                style={{
                  maxHeight: maxHeights[1],
                  overflow: 'hidden',
                  transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {isEmpty ? (
                  <div className="empty">
                    <img src={emptyFace} alt="empty" />
                    <p className="empty-tit">고민 주제 이력이 없습니다.</p>
                    <p className="empty-info">이전 회기 상담 확인 또는<br />이전 상담 녹취록을 확인해 주세요.</p>
                  </div>
                ) : (
                  <ul className="session-list">
                    {timelineData.map((row, idx) => (
                      <li key={idx}>
                        <span>{row.sessionOrder || row.sessionNo}회기</span>
                        <div>{row.concernTopicText || '-'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* 긴급도(위기단계) */}
            <div className="toggle-wrap">
              <div className="tit-wrap">
                <strong>긴급도(위기단계)</strong>
                <button
                  className={"toggle-btn" + (openSection[2] ? " on" : "")}
                  type="button"
                  aria-label="펼치기/접기"
                  onClick={() => handleToggle(2)}
                />
              </div>
              <div
                className="con-wrap"
                ref={sectionRefs[2]}
                style={{
                  maxHeight: maxHeights[2],
                  overflow: 'hidden',
                  transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {isEmpty ? (
                  <div className="empty">
                    <img src={emptyFace} alt="empty" />
                    <p className="empty-tit">긴급도 작성 이력이 없습니다.</p>
                    <p className="empty-info">이전 회기 상담 확인 또는<br />이전 상담 녹취록을 확인해 주세요.</p>
                  </div>
                ) : (
                  <>
                    <div className="chart-wrap">
                      <EmergencyChart
                        values={reversedData.map(row => row.crisisStageLevel ?? null)}
                        labels={reversedData.map(row => `${row.sessionOrder || row.sessionNo}회기`)}
                        min={0}
                        max={4}
                        width={304}
                        height={159}
                      />
                    </div>
                    {(() => {
                      // 긴급도 요약: 비교 가능한 값이 2개 미만이면 '변화가 없어요.'
                      const vals = reversedData
                        .map(r => r.crisisStageLevel)
                        .filter(v => v !== null && v !== undefined);
                      let cls = 'steady';
                      let msg = '변화가 없어요.';
                      if (vals.length >= 2) {
                        const prev = vals[vals.length - 2];
                        const last = vals[vals.length - 1];
                        if (last > prev) { cls = 'rising'; msg = '높아지고 있어요.'; }
                        else if (last < prev) { cls = 'falling'; msg = '낮아지고 있어요.'; }
                      }
                      return (
                        <div className={`chart-summary ${cls}`}>
                          <span>긴급도</span>
                          <p>{msg}</p>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
            {/* 심각도 */}
            <div className="toggle-wrap">
              <div className="tit-wrap">
                <strong>심각도</strong>
                <button
                  className={"toggle-btn" + (openSection[3] ? " on" : "")}
                  type="button"
                  aria-label="펼치기/접기"
                  onClick={() => handleToggle(3)}
                />
              </div>
              <div
                className="con-wrap"
                ref={sectionRefs[3]}
                style={{
                  maxHeight: maxHeights[3],
                  overflow: 'hidden',
                  transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {isEmpty ? (
                  <div className="empty">
                    <img src={emptyFace} alt="empty" />
                    <p className="empty-tit">심각도 작성 이력이 없습니다.</p>
                    <p className="empty-info">이전 회기 상담 확인 또는<br />이전 상담 녹취록을 확인해 주세요.</p>
                  </div>
                ) : (
                    <>
                      <div className="severity-wrap">
                        <div className="severity-hd">
                          <ul>
                            {reversedData.map((row, idx) => (
                              <li key={idx}>{row.sessionOrder || row.sessionNo}회기</li>
                            ))}
                          </ul>
                        </div>
                        <div className="stage-wrap">
                          {(() => {
                            // 동적 심각도 카테고리 구성
                            const base = [
                              { key: 'depression', label: '우울' },
                              { key: 'anxiety', label: '불안' },
                              { key: 'panic', label: '공황' },
                              { key: 'compulsion', label: '강박' },
                              { key: 'adhd', label: 'ADHD' },
                              { key: 'ptsd', label: 'PTSD' },
                            ];
                            const dynamic = [];
                            for (let i = 1; i <= 4; i++) {
                              const active = timelineData.some(r => r[`symptom0${i}Active`] === true);
                              const name = timelineData.find(r => r[`symptom0${i}Name`])?.[`symptom0${i}Name`];
                              if (active || name) {
                                dynamic.push({ key: `symptom0${i}Severity`, label: name || `증상0${i}` });
                              }
                            }
                            const categories = [...base, ...dynamic];

                            const renderStage = (key, label) => {
                              const values = reversedData.map(r => {
                                if (key.startsWith('symptom')) return r[key];
                                return r[key];
                              });
                              let lastIdx = -1;
                              values.forEach((v, i) => { if (v != null) lastIdx = i; });
                              // 추세 판단: 비교 가능한 값이 2개 미만이면 steady
                              const valid = values.filter(v => v != null);
                              let cls = 'steady';
                              if (valid.length >= 2) {
                                const prev = valid[valid.length - 2];
                                const last = valid[valid.length - 1];
                                if (last > prev) cls = 'rising';
                                else if (last < prev) cls = 'falling';
                              }
                              return (
                                <div className={`severity-stage ${cls}`} key={key}>
                                  <span
                                    className="severity-label"
                                    title={label}
                                    style={{
                                      display: 'inline-block',
                                      minWidth: '38px',
                                      maxWidth: '180px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      verticalAlign: 'top'
                                    }}
                                  >{label}</span>
                                  <ul>
                                    {values.map((value, idx) => (
                                      <li key={idx}>
                                        <span
                                          className={idx === lastIdx ? 'last-span' : ''}
                                          style={value == null ? { opacity: 0 } : {}}
                                        >{value ?? 0}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            };

                            return categories.map(c => renderStage(c.key, c.label));
                          })()}
                        </div>
                      </div>
                      {/* 요약: 데이터가 1개 이하이면 모두 '변화가 없어요.' */}
                      <div className="summary-wrap">
                        {(() => {
                          // 심각도 섹션과 동일한 카테고리 구성 (기본 + 동적 증상)
                          const base = [
                            { key: 'depression', label: '우울' },
                            { key: 'anxiety', label: '불안' },
                            { key: 'panic', label: '공황' },
                            { key: 'compulsion', label: '강박' },
                            { key: 'adhd', label: 'ADHD' },
                            { key: 'ptsd', label: 'PTSD' },
                          ];
                          const dynamic = [];
                          for (let i = 1; i <= 4; i++) {
                            const active = timelineData.some(r => r[`symptom0${i}Active`] === true);
                            const name = timelineData.find(r => r[`symptom0${i}Name`])?.[`symptom0${i}Name`];
                            if (active || name) {
                              dynamic.push({ key: `symptom0${i}Severity`, label: name || `증상0${i}` });
                            }
                          }
                          const categories = [...base, ...dynamic];

                          const buildTrend = (arr) => {
                            const vals = arr.filter(v => v != null);
                            if (vals.length < 2) return { cls: 'steady', msg: '변화가 없어요.' };
                            const prev = vals[vals.length - 2];
                            const last = vals[vals.length - 1];
                            if (last > prev) return { cls: 'rising', msg: '높아지고 있어요.' };
                            if (last < prev) return { cls: 'falling', msg: '낮아지고 있어요.' };
                            return { cls: 'steady', msg: '변화가 없어요.' };
                          };

                          return categories.map(c => {
                            const trend = buildTrend(reversedData.map(r => r[c.key]));
                            return (
                              <div className={`severity-summary ${trend.cls}`} key={c.key}>
                                <span>{c.label}</span>
                                <p>{trend.msg}</p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </>
                )}
              </div>
            </div>
            {/* 스트레스 징후 */}
            <div className="toggle-wrap">
              <div className="tit-wrap">
                <strong>스트레스 징후</strong>
                <button
                  className={"toggle-btn" + (openSection[4] ? " on" : "")}
                  type="button"
                  aria-label="펼치기/접기"
                  onClick={() => handleToggle(4)}
                />
              </div>
              <div
                className="con-wrap"
                ref={sectionRefs[4]}
                style={{
                  maxHeight: maxHeights[4],
                  overflow: 'hidden',
                  transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {isEmpty ? (
                  <div className="empty">
                    <img src={emptyFace} alt="empty" />
                    <p className="empty-tit">스트레스 징후 분석 이력이 없습니다.</p>
                    <p className="empty-info">이전 회기 상담 확인 또는<br />이전 상담 녹취록을 확인해 주세요.</p>
                  </div>
                ) : (
                  <>
                    <div className="chart-wrap">
                      <EmergencyChart
                        values={reversedData.map(row => {
                          // stressIndicatorsJson이 JSON 문자열인 경우 파싱하여 스트레스 레벨 추출
                          if (row.stressIndicatorsJson) {
                            try {
                              const stressData = JSON.parse(row.stressIndicatorsJson);
                              // 스트레스 데이터에서 평균값이나 대표값 추출 (구조에 따라 조정 필요)
                              return stressData.level || stressData.average || null;
                            } catch (e) {
                              return null;
                            }
                          }
                          return null;
                        })}
                        labels={reversedData.map(row => `${row.sessionOrder || row.sessionNo}회기`)}
                        min={1}
                        max={4}
                        width={288}
                        height={180}
                      />
                    </div>
                    {(() => {
                      // 스트레스 징후 요약: 비교 가능한 값이 2개 미만이면 '변화가 없어요.'
                      const vals = reversedData
                        .map(row => {
                          if (row.stressIndicatorsJson) {
                            try {
                              const stressData = JSON.parse(row.stressIndicatorsJson);
                              return stressData.level ?? stressData.average ?? null;
                            } catch (e) {
                              return null;
                            }
                          }
                          return null;
                        })
                        .filter(v => v !== null && v !== undefined);
                      let cls = 'steady';
                      let msg = '변화가 없어요.';
                      if (vals.length >= 2) {
                        const prev = vals[vals.length - 2];
                        const last = vals[vals.length - 1];
                        if (last > prev) { cls = 'rising'; msg = '높아지고 있어요.'; }
                        else if (last < prev) { cls = 'falling'; msg = '낮아지고 있어요.'; }
                      }
                      return (
                        <div className={`chart-summary ${cls}`}>
                          <span>위기 단계</span>
                          <p>{msg}</p>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelinePanel;
