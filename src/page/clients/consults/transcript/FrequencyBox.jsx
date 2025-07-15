import React, { useRef, useEffect, useState } from "react";
import TranscriptBox from "./TranscriptBox";

function FrequencyBox({ data, onAIGenerate, isPanel }) {
  const hasData = !!(data && typeof data === 'object' && data.counselor && data.client);
  const barContainerRef = useRef(null);
  const [barWidths, setBarWidths] = useState({ counselor: 0, client: 0 });
  const [percents, setPercents] = useState({ counselor: 0, client: 0 });

  useEffect(() => {
    if (!hasData) return;
    // 1. counselor/client 분 추출
    const counselorMin = Number(data.counselor.minutes) || 0;
    const clientMin = Number(data.client.minutes) || 0;
    const total = counselorMin + clientMin;
    if (total === 0) {
      setBarWidths({ counselor: 0, client: 0 });
      setPercents({ counselor: 0, client: 0 });
      return;
    }
    // 2. 퍼센트 계산
    const counselorPct = ((counselorMin / total) * 100);
    const clientPct = 100 - counselorPct;
    setPercents({
      counselor: counselorPct,
      client: clientPct
    });
    // 3. 막대 너비 계산
    const gap = 5;
    const barWidth = barContainerRef.current ? barContainerRef.current.offsetWidth : 0;
    const availableWidth = barWidth - gap;
    const counselorWidth = (counselorMin / total) * availableWidth;
    const clientWidth = availableWidth - counselorWidth;
    setBarWidths({
      counselor: counselorWidth,
      client: clientWidth
    });
  }, [data, hasData]);

  if (isPanel) {
    // con-wrap 내부만 랜더링
    return (
      <div className="bar-wrap small">
        <div className="legend">
          <span className="counselor">발화자1</span>
          <span className="client">발화자2</span>
        </div>
        <div className="bar-labels">
          <div>
            <span>{data?.counselor?.minutes ?? "-"}분</span>
            <div className="value counselor-pct">{percents.counselor.toFixed(2)}%</div>
          </div>
          <div>
            <span>{data?.client?.minutes ?? "-"}분</span>
            <div className="value client-pct">{percents.client.toFixed(2)}%</div>
          </div>
        </div>
        <div className="bar-container" ref={barContainerRef}>
          <div
            className="bar-counselor"
            style={{ width: barWidths.counselor}}
          ></div>
          <div
            className="bar-client"
            style={{ width: barWidths.client}}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <TranscriptBox
      className={`frequency box${!hasData ? ' before-create' : ''}`}
      title="4. 발화빈도"
      toggleable={false}
    >
      {!hasData ? (
        <div className="create-wrap">
          <p>
            [AI 생성하기]를 선택하면<br />
            AI가 생성한 분석 자료를 확인 할 수 있어요!
          </p>
          <button className="type01 h40" type="button" onClick={onAIGenerate}>
            <span>AI 생성하기</span>
          </button>
        </div>
      ) : (
        <div className="con-wrap">
          <div className="bar-wrap">
            <div className="legend">
              <span className="counselor">발화자1</span>
              <span className="client">발화자2</span>
            </div>
            <div className="bar-labels">
              <div>
                <span>{data?.counselor?.minutes ?? "-"}분</span>
                <div className="value counselor-pct">{percents.counselor.toFixed(2)}%</div>
              </div>
              <div>
                <span>{data?.client?.minutes ?? "-"}분</span>
                <div className="value client-pct">{percents.client.toFixed(2)}%</div>
              </div>
            </div>
            <div className="bar-container" ref={barContainerRef}>
              <div
                className="bar-counselor"
                style={{ width: barWidths.counselor}}
              ></div>
              <div
                className="bar-client"
                style={{ width: barWidths.client}}
              ></div>
            </div>
          </div>
        </div>
      )}
    </TranscriptBox>
  );
}

export default FrequencyBox;
