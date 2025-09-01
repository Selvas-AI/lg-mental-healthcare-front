import React, { useMemo } from "react";
// D3 circle packing
import { hierarchy, pack } from "d3-hierarchy";
import TranscriptBox from "./TranscriptBox";

// 카테고리별 팔레트에서 키워드 기반 안정적 랜덤 선택
function stringHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getColorByCategory(category, keywordText) {
  const negative = [
    { bg: '#FFC164', text: '#1C1D1E' },
    { bg: '#FF9966', text: '#FFFFFF' },
  ];
  const positive = [
    { bg: '#7ACB93', text: '#FFFFFF' },
    { bg: '#AACEFF', text: '#FFFFFF' },
    { bg: '#BBE2AA', text: '#5A626A' },
    { bg: '#F2F5C3', text: '#5A626A' },
  ];
  const neutral = { bg: '#F0EFE9', text: '#5A626A' };

  const key = String(keywordText || '');
  const idx = stringHash(key);

  if (category === '부정') {
    return negative[idx % negative.length];
  }
  if (category === '긍정') {
    return positive[idx % positive.length];
  }
  return neutral; // 기본: 중립
}

// 최대 키워드 수 제한 (필요 시 조정)
const MAX_NODES = 15;

function normalizeWords(raw) {
  // 입력 호환: 배열 또는 { llm_answer: [...] }
  if (Array.isArray(raw)) {
    return [...raw]
      .map(it => ({ 
        text: it.text ?? it.keyword ?? String(it), 
        value: Number(it.freq ?? it.frequency ?? 1) || 1,
        category: it.category || '중립'
      }))
      .sort((a, b) => b.value - a.value);
  }
  const items = Array.isArray(raw?.llm_answer) ? raw.llm_answer : [];
  return items
    .map(it => ({ 
      text: it.keyword, 
      value: Number(it.frequency) || 1,
      category: it.category || '중립'
    }))
    .sort((a, b) => b.value - a.value);
}

// D3 pack은 정사각형 레이아웃에 최적화이므로, 실제 렌더(직사각형)에서는 가운데 정렬하여 여백 처리
function KeywordBubblePack({ data, onAIGenerate }) {
  const hasData = (
    (Array.isArray(data) && data.length > 0) ||
    (data && Array.isArray(data.llm_answer) && data.llm_answer.length > 0)
  );

  const { width, height } = useMemo(() => ({
    width: 421,
    height: 290,
  }), []);

  const nodes = useMemo(() => {
    if (!hasData) return [];
    // 상위 N개만 사용하여 밀집도를 낮추고 원을 키움
    const words = normalizeWords(data).slice(0, MAX_NODES);
    // 상대적 크기를 조금 더 키우기 위해 약한 지수 가중 적용
    const root = hierarchy({ children: words })
      .sum(d => Math.pow(Math.max(1, d.value), 1));

    // 기본 캔버스에서 패킹 후, 목표 반지름(약 50px)로 동적 스케일
    const padding = 5; // 원들 간 간격을 늘려 겹침 방지
    const packLayout = pack().size([width, height]).padding(padding);

    const packed = packLayout(root);
    const baseLeaves = packed.leaves();

    const cx = width / 2;
    const cy = height / 2;
    const targetR = 50; // 목표 최대 반지름 (≈100px 지름)

    // 현재 레이아웃의 최대 반지름과 중심 기준 최대 여유 계산
    let maxR = 0;
    let maxExtX = 0; // |x-cx| + r
    let maxExtY = 0; // |y-cy| + r
    for (const l of baseLeaves) {
      maxR = Math.max(maxR, l.r);
      maxExtX = Math.max(maxExtX, Math.abs(l.x - cx) + l.r);
      maxExtY = Math.max(maxExtY, Math.abs(l.y - cy) + l.r);
    }

    // 최대 원 반지름을 우선 보장 (경계 기반 축소는 적용하지 않음)
    const sR = targetR / (maxR || 1);
    let s = sR * 0.8;

    // 균등 스케일만 적용하여 D3 패킹의 비충돌 성질을 유지
    const sx = 1.00;
    const sy = 1.00;

    return baseLeaves.map((leaf, idx) => {
      // 중심 기준 등비 스케일
      let x = cx + (leaf.x - cx) * s;
      let y = cy + (leaf.y - cy) * s;
      let r = leaf.r * s;

      // 비등방 스트레치
      x = (x - cx) * sx + cx;
      y = (y - cy) * sy + cy;

      // 경계 보정
      x = Math.max(r, Math.min(width - r, x));
      y = Math.max(r, Math.min(height - r, y));

      return {
        x,
        y,
        r,
        text: leaf.data.text,
        color: getColorByCategory(leaf.data.category, leaf.data.text)
      };
    });
  }, [data, hasData, width, height]);

  if (!hasData) return null;

  return (
    <TranscriptBox
      className={`keyword box${!hasData ? ' before-create' : ''}`}
      title={"3. 키워드 분석"}
      toggleable={false}
      onAIGenerate={onAIGenerate}
    >
      {!hasData ? (
        <div className="create-wrap">
          <p>
            [AI 생성하기]를 선택하면<br />
            AI가 생성한 분석 자료를 확인 할 수 있어요!
          </p>
          <button className="type01 h40" type="button" onClick={() => { onAIGenerate && onAIGenerate(); }}>
            <span>AI 생성하기</span>
          </button>
        </div>
      ) : (
        <div className="con-wrap" style={{ height: 290, padding: 10 }}>
          <svg width={width} height={height} className="word-cloud">
            {nodes.map((n, idx) => (
              <g key={idx} transform={`translate(${n.x},${n.y})`}>
                <circle r={n.r} fill={n.color.bg} />
                <text
                  fill={n.color.text}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontWeight: 'bold',
                    // 원 크기에 비례한 폰트 크기, 최소 가독성 보장 (가독성 상향)
                    fontSize: Math.max(10, n.r * 0.4)
                  }}
                >
                  {n.text}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </TranscriptBox>
  );
}

export default KeywordBubblePack;
