import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";
import EmergencyChart from "./EmergencyChart";

function TimelinePanel({ open, onClose, isEmpty, sessionDummyData = [] }) {
  // 각 토글 영역(상담요약/고민주제/긴급도/심각도/스트레스 징후) 열림 상태
  const [openSection, setOpenSection] = useState([true, true, true, true, true]);
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [maxHeights, setMaxHeights] = useState(["0px", "0px", "0px", "0px", "0px"]);

  const handleToggle = idx => {
    setOpenSection(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };

  // 긴급도 차트 데이터 역순으로 정렬
  const reversedData = [...sessionDummyData].reverse();

  useLayoutEffect(() => {
    setMaxHeights(prev => prev.map((_, i) => {
      if (openSection[i] && sectionRefs[i].current) {
        return sectionRefs[i].current.scrollHeight + "px";
      }
      return "0px";
    }));
  }, [openSection]);

  useEffect(() => {
    if (open) setOpenSection([true, true, true, true, true]);
  }, [open]);

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
                    {sessionDummyData.map((row, idx) => (
                      <li key={idx}>
                        <span>{row.session}</span>
                        <div>{row.summary}</div>
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
                    {sessionDummyData.map((row, idx) => (
                      <li key={idx}>
                        <span>{row.session}</span>
                        <div>{row.summaryList && row.summaryList.map((summary, i) => (
                          <React.Fragment key={i}>{summary}{i < row.summaryList.length - 1 && <br />}</React.Fragment>
                        ))}</div>
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
                        values={reversedData.map(row => (row.crisis) ?? null)}
                        labels={reversedData.map(row => row.session)}
                        min={0}
                        max={4}
                        width={304}
                        height={159}
                      />
                    </div>
                    <div className="chart-summary rising">
                      <span>긴급도</span>
                      <p>높아지고 있어요</p>
                    </div>
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
                              <li key={idx}>{row.session}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="stage-wrap">
                          {/* 우울 */}
                          <div className="severity-stage rising">
                            <span>우울</span>
                            <ul>
                              {(() => {
                                let lastIdx = -1;
                                reversedData.forEach((row, idx) => {
                                  const val = row.severity && row.severity["우울"];
                                  const value = Array.isArray(val) ? val[0] : val;
                                  if (value != null) lastIdx = idx;
                                });
                                return reversedData.map((row, idx) => {
                                  const val = row.severity && row.severity["우울"];
                                  const value = Array.isArray(val) ? val[0] : val;
                                  return (
                                    <li key={idx}>
                                      <span
                                        className={idx === lastIdx ? "last-span" : ""}
                                        style={value == null ? { opacity: 0 } : {}}
                                      >{value ?? 0}</span>
                                    </li>
                                  );
                                });
                              })()}
                            </ul>
                          </div>
                          {/* 강박 */}
                          <div className="severity-stage falling">
                            <span>강박</span>
                            <ul>
                              {(() => {
                                let lastIdx = -1;
                                reversedData.forEach((row, idx) => {
                                  const val = row.severity && row.severity["강박"];
                                  const value = Array.isArray(val) ? val[0] : val;
                                  if (value != null) lastIdx = idx;
                                });
                                return reversedData.map((row, idx) => {
                                  const val = row.severity && row.severity["강박"];
                                  const value = Array.isArray(val) ? val[0] : val;
                                  return (
                                    <li key={idx}>
                                      <span
                                        className={idx === lastIdx ? "last-span" : ""}
                                        style={value == null ? { opacity: 0 } : {}}
                                      >{value ?? 0}</span>
                                    </li>
                                  );
                                });
                              })()}
                            </ul>
                          </div>
                          {/* PTSD */}
                          <div className="severity-stage steady">
                            <span>PTSD</span>
                            <ul>
                              {(() => {
                                let lastIdx = -1;
                                reversedData.forEach((row, idx) => {
                                  const val = row.severity && row.severity["PTSD"];
                                  const value = Array.isArray(val) ? val[0] : val;
                                  if (value != null) lastIdx = idx;
                                });
                                return reversedData.map((row, idx) => {
                                  const val = row.severity && row.severity["PTSD"];
                                  const value = Array.isArray(val) ? val[0] : val;
                                  return (
                                    <li key={idx}>
                                      <span
                                        className={idx === lastIdx ? "last-span" : ""}
                                        style={value == null ? { opacity: 0 } : {}}
                                      >{value ?? 0}</span>
                                    </li>
                                  );
                                });
                              })()}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {/* 요약은 임시 고정, 실제 데이터 연동시 동적으로 */}
                      <div className="summary-wrap">
                        <div className="severity-summary rising">
                          <span>우울</span>
                          <p>높아지고 있어요.</p>
                        </div>
                        <div className="severity-summary falling">
                          <span>강박</span>
                          <p>낮아지고 있어요.</p>
                        </div>
                        <div className="severity-summary steady">
                          <span>PTSD</span>
                          <p>변화가 없어요.</p>
                        </div>
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
                className="con-wrap steady"
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
                        values={reversedData.map(row => (row.stress) ?? null)}
                        labels={reversedData.map(row => row.session)}
                        min={1}
                        max={4}
                        width={304}
                        height={159}
                      />
                    </div>
                    <div className="chart-summary steady">
                      <span>위기단계</span>
                      <p>변화가 없어요.</p>
                    </div>
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
