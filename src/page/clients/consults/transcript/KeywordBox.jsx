// import React, { useRef, useEffect } from "react";
// import TranscriptBox from "./TranscriptBox";

// const colorPairs = [
//   { bg: '#7ACB93', text: '#FFF' },
//   { bg: 'rgba(160, 201, 255, 0.90)', text: '#FFF' },
//   { bg: '#FF9966', text: '#FFF' },
//   { bg: '#FFC164', text: '#1C1D1E' },
//   { bg: 'rgba(179, 223, 160, 0.90)', text: '#4E8138' },
//   { bg: '#F2F5C3', text: '#5A626A' },
//   { bg: '#F0EFE9', text: '#5A626A' },
//   { bg: '#F0EFE9', text: '#5A626A' },
//   { bg: '#BBE2AA', text: '#5A626A' }
// ];

// function drawCloud(canvas, words) {
//   if (!canvas || !canvas.getContext) return;
//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   const W = canvas.width;
//   const H = canvas.height;
//   const cx = W / 2;
//   const cy = H / 2;

//   // 반지름 스케일링: 빈도 기준으로 [minR, maxR]에 매핑
//   const freqs = words.map(w => Math.max(1, Number(w.freq) || 1));
//   const fMin = Math.min(...freqs);
//   const fMax = Math.max(...freqs);
//   const minR = Math.max(16, Math.min(W, H) * 0.10);
//   const maxR = Math.max(34, Math.min(W, H) * 0.36); 
//   const pad = 0; // 원 사이의 간격

//   const lerp = (a, b, t) => a + (b - a) * t;
//   const scaleR = (f) => {
//     if (fMax === fMin) return (minR + maxR) / 2;
//     const t = (f - fMin) / (fMax - fMin);
//     const curved = Math.pow(t, 1); // 큰 값에 가중치, 작은 값은 상대적으로 더 작게
//     return lerp(minR, maxR, curved);
//   };

//   // 빈도 내림차순으로 정렬하여 큰 원부터 배치
//   const items = words
//     .map((w, i) => ({ ...w, freq: Math.max(1, Number(w.freq) || 1), _idx: i }))
//     .sort((a, b) => b.freq - a.freq);

//   const placed = [];

//   // 충돌 검사
//   const collides = (x, y, r) => {
//     for (const p of placed) {
//       const dx = x - p.x;
//       const dy = y - p.y;
//       const dist = Math.hypot(dx, dy);
//       if (dist < (r + p.r + pad)) return true;
//     }
//     return false;
//   };

//   // 경계 안쪽에 들어오는지 체크
//   const inside = (x, y, r) => (
//     x - r >= pad && x + r <= W - pad && y - r >= pad && y + r <= H - pad
//   );

//   // 배치: 가장 큰 단어는 중앙, 나머지는 나선형으로 중앙을 둘러싸며 빈 자리에 배치
//   items.forEach((w, index) => {
//     const r = scaleR(w.freq);
//     let x, y;
//     if (index === 0) {
//       x = cx; y = cy;
//       placed.push({ x, y, r, w });
//       return;
//     }

//     // 나선형 탐색 파라미터
//     let angle = 0;
//     let radius = (placed[0]?.r || minR) + r + pad; // 중앙 원 바깥부터 시작
//     const angleStep = Math.PI / 18; // 10도 단위
//     const radiusStep = Math.max(2, Math.min(W, H) * 0.02);
//     const maxLoops = 4000;

//     let placedOk = false;
//     for (let i = 0; i < maxLoops; i++) {
//       x = cx + Math.cos(angle) * radius;
//       y = cy + Math.sin(angle) * radius;
//       if (inside(x, y, r) && !collides(x, y, r)) {
//         placedOk = true;
//         break;
//       }
//       angle += angleStep;
//       if (angle >= Math.PI * 2) {
//         angle -= Math.PI * 2;
//         radius += radiusStep; // 한 바퀴 돌 때마다 살짝 바깥쪽으로
//       }
//     }
//     if (!placedOk) {
//       // 최후: 경계 안쪽의 임의 위치 시도
//       x = Math.min(W - r - pad, Math.max(r + pad, cx));
//       y = Math.min(H - r - pad, Math.max(r + pad, cy));
//     }
//     placed.push({ x, y, r, w });
//   });

//   // 그리기
//   placed.forEach((p, idx) => {
//     const color = colorPairs[idx % colorPairs.length];
//     ctx.beginPath();
//     ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//     ctx.fillStyle = color.bg;
//     ctx.fill();

//     // 텍스트: 최소 폰트 크기 보장
//     const minFont = Math.max(8, p.r * 0.40); // 큰 원은 더 크게, 작은 원은 최소 10 보장
//     ctx.fillStyle = color.text;
//     ctx.font = `bold ${minFont}px sans-serif`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(p.w.text, p.x, p.y);
//   });
// }

// //? 입력 형태를 [{ text, freq }]로 변환 후 빈도 내림차순 정렬
// function KeywordBox({ data, onAIGenerate, isPanel = false}) {
//   // data는 기존 배열 형태 또는 { llm_answer: [...] } 형태 모두 지원
//   const hasData = (
//     (Array.isArray(data) && data.length > 0) ||
//     (data && Array.isArray(data.llm_answer) && data.llm_answer.length > 0)
//   );
//   const canvasRef = useRef(null);

//   const normalizeWords = (raw) => {
//     // 이미 기존 words 배열 형태(text, freq[, x, y])가 들어오면
//     // 빈도 기준 정렬만 적용하여 반환
//     if (Array.isArray(raw)) {
//       return [...raw]
//         .map(it => ({ text: it.text ?? it.keyword ?? String(it), freq: Number(it.freq ?? it.frequency ?? 1) || 1 }))
//         .sort((a, b) => b.freq - a.freq);
//     }
//     const items = Array.isArray(raw?.llm_answer) ? raw.llm_answer : [];
//     return items
//       .map(it => ({ text: it.keyword, freq: Number(it.frequency) || 1 }))
//       .sort((a, b) => b.freq - a.freq);
//   };

//   useEffect(() => {
//     if (!hasData) return;
//     const words = normalizeWords(data);
//     drawCloud(canvasRef.current, words);
//   }, [hasData, data]);

//   return (
//     <>
//       {isPanel ? (
//         <canvas
//           ref={canvasRef}
//           className="word-cloud"
//           width="284"
//           height="92"
//         />
//       ) : (
//         <TranscriptBox
//           className={`keyword box${!hasData ? ' before-create' : ''}`}
//           title={isPanel ? undefined : "3. 키워드 분석"}
//           toggleable={false}
//           onAIGenerate={onAIGenerate}
//         >
//           {!hasData ? (
//             <div className="create-wrap">
//               <p>
//                 [AI 생성하기]를 선택하면<br />
//                 AI가 생성한 분석 자료를 확인 할 수 있어요!
//               </p>
//               <button className="type01 h40" type="button" onClick={() => { onAIGenerate && onAIGenerate(); }}>
//                 <span>AI 생성하기</span>
//               </button>
//             </div>
//           ) : (
//             <div className="con-wrap">
//               <canvas
//                 ref={canvasRef}
//                 className="word-cloud"
//                 width={421}
//                 height={136}
//               />
//             </div>
//           )}
//         </TranscriptBox>
//       )}
//     </>
//   );
// }

// export default KeywordBox;
