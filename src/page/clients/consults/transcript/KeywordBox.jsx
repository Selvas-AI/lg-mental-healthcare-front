import React, { useRef, useEffect } from "react";
import TranscriptBox from "./TranscriptBox";

const colorPairs = [
  { bg: '#7ACB93', text: '#FFF' },
  { bg: 'rgba(160, 201, 255, 0.90)', text: '#FFF' },
  { bg: '#FF9966', text: '#FFF' },
  { bg: '#FFC164', text: '#1C1D1E' },
  { bg: 'rgba(179, 223, 160, 0.90)', text: '#4E8138' },
  { bg: '#F2F5C3', text: '#5A626A' },
  { bg: '#F0EFE9', text: '#5A626A' },
  { bg: '#F0EFE9', text: '#5A626A' },
  { bg: '#BBE2AA', text: '#5A626A' }
];

function drawCloud(canvas, words) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // baseWidth/baseHeight는 원본 데이터 기준
  const baseWidth = 421;
  const baseHeight = 136;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const rotatedIndex = Math.floor(Math.random() * words.length);

  words.forEach((word, index) => {
    // 좌표/반지름 비율 변환
    const x = (word.x / baseWidth) * canvasWidth;
    const y = (word.y / baseHeight) * canvasHeight;
    const radius = (word.freq * 3 / baseWidth) * canvasWidth;
    const color = colorPairs[index % colorPairs.length];
    // 원
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color.bg;
    ctx.fill();
    // 텍스트
    ctx.fillStyle = color.text;
    ctx.font = `bold ${radius / 2.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (index === rotatedIndex) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((20 * Math.PI) / 180);
      ctx.fillText(word.text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(word.text, x, y);
    }
  });
}

function KeywordBox({ data, onAIGenerate, isPanel = false}) {
  const hasData = Array.isArray(data) && data.length > 0;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasData) return;
    drawCloud(canvasRef.current, data);
  }, [hasData, data]);

  return (
    <>
      {isPanel ? (
        <canvas
          ref={canvasRef}
          className="word-cloud"
          width="284"
          height="92"
        />
      ) : (
        <TranscriptBox
          className={`keyword box${!hasData ? ' before-create' : ''}`}
          title={isPanel ? undefined : "3. 키워드 분석"}
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
              <canvas
                ref={canvasRef}
                className="word-cloud"
                width={421}
                height={136}
              />
            </div>
          )}
        </TranscriptBox>
      )}
    </>
  );
}

export default KeywordBox;
