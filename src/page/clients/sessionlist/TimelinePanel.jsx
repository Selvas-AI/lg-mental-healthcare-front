import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";

function TimelinePanel({ open, onClose, isEmpty }) {
  // 각 토글 영역(상담요약/고민주제/긴급도/심각도/스트레스 징후) 열림 상태
  const [openSection, setOpenSection] = useState([true, true, true, true, true]);
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [maxHeights, setMaxHeights] = useState(["0px", "0px", "0px", "0px", "0px"]);

  const handleToggle = idx => {
    setOpenSection(arr => arr.map((v, i) => (i === idx ? !v : v)));
  };

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
                    <li>
                      <span>3회기</span>
                      <div>자기 통제력에 대한 자신감을 표현하며 회복에 대한 기대를 언급함</div>
                    </li>
                    <li>
                      <span>2회기</span>
                      <div>가족과의 갈등 완화 시도가 시작되었고, 정서적 지지 확보를 위한 중재를 시도함. 항정신성 약물 복용을 시작했으며, 부작용으로 인한 신체 불편감을 토로함</div>
                    </li>
                    <li>
                      <span>1회기</span>
                      <div>내담자는 심한 충동성, 자해 충동, 감정 기복을 호소하였음</div>
                    </li>
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
                    <li>
                      <span>3회기</span>
                      <div>
                        원인을 알 수 없는 불안감 호소<br />
                        간헐적 불면증<br />
                        낮은 자존감으로 인한 대인관계 어려움
                      </div>
                    </li>
                    <li>
                      <span>2회기</span>
                      <div>
                        대인관계 어려움<br />
                        주호소문 불명확
                      </div>
                    </li>
                    <li>
                      <span>1회기</span>
                      <div>내담자는 심한 충동성, 자해 충동, 감정 기복을 호소하였음</div>
                    </li>
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
                      {/* 차트 라이브러리 연동 필요 */}
                      <canvas className="line-chart03" width="288" height="159" data-values="[1,2,4]" data-labels='["1회기","2회기","3회기"]' data-min="0" data-max="4"></canvas>
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
                  <div className="severity-wrap">
                    <div className="severity-hd">
                      <ul>
                        <li>1회기</li>
                        <li>2회기</li>
                        <li>3회기</li>
                      </ul>
                    </div>
                    <div className="stage-wrap">
                      <div className="severity-stage rising">
                        <span>우울</span>
                        <ul>
                          <li><span>1</span></li>
                          <li><span>3</span></li>
                          <li><span>5</span></li>
                        </ul>
                      </div>
                      <div className="severity-stage falling">
                        <span>강박</span>
                        <ul>
                          <li><span>1</span></li>
                          <li><span>3</span></li>
                          <li></li>
                        </ul>
                      </div>
                      <div className="severity-stage steady">
                        <span>PTSD</span>
                        <ul>
                          <li></li>
                          <li><span>3</span></li>
                          <li><span>5</span></li>
                        </ul>
                      </div>
                    </div>
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
                  </div>
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
                      <canvas className="line-chart03" width="288" height="159" data-values="[1,1,1]" data-labels='["1회기","2회기","3회기"]' data-min="1" data-max="4"></canvas>
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
