// stressChart.js
// 역할: 서버에서 받은 stressDetail(startSec, endSec, pass10) 배열을
//       라인 차트에 바로 사용할 수 있는 { data, labels } 형태로 변환하는 유틸 함수.
//       - 전체 구간을 3분(기본 180초) 버킷으로 나누고, 각 버킷에 걸친 세그먼트들의
//         시간가중 평균(pass10)을 계산합니다.
//       - 라벨은 "mm:ss ~ mm:ss" 범위 형식으로 생성합니다.
//       - 데이터가 없는 버킷은 옵션에 따라 이전 값으로 보간(Forward-fill)하여 선이 끊기지 않게 합니다.
// 사용처 예: Transcript.jsx, Recordings.jsx 등에서 서버 응답을 받아 차트용 데이터로 가공할 때.

/**
 * stressDetail을 3분 버킷 평균으로 집계해 차트 데이터로 변환합니다.
 * @param {string|object} raw - 서버 응답(JSON 문자열 또는 객체). { stressDetail: [{startSec, endSec, pass10}, ...] }
 * @param {number} [bucketSizeSeconds=180] - 버킷 크기(초). 기본 180초(3분)
 * @param {object} [options]
 * @param {boolean} [options.forwardFill=true] - 빈 버킷을 이전 평균값으로 채워 선을 이어줄지 여부
 * @param {boolean} [options.labelRange=true] - 라벨을 "mm:ss ~ mm:ss" 범위로 표기할지 여부 (false면 시작 시각만)
 * @returns {{ data: (number|null)[], labels: string[] }}
 */
export function buildStressChartBuckets(raw, bucketSizeSeconds = 180, options = {}) {
  const { forwardFill = true, labelRange = true } = options;

  const obj = parseJsonSafely(raw);
  const details = obj?.stressDetail;
  if (!Array.isArray(details) || details.length === 0) {
    return { data: [], labels: [] };
  }

  // 세그먼트 정규화 및 정렬
  const segments = details
    .map((d) => ({
      start: Math.max(0, Number(d.startSec) || 0),
      end: Math.max(0, Number(d.endSec) || 0),
      val: typeof d.pass10 === 'number' ? d.pass10 : Number(d.pass10) || 0,
    }))
    .filter((s) => s.end > s.start)
    .sort((a, b) => a.start - b.start);

  if (segments.length === 0) return { data: [], labels: [] };

  const bucketSize = Math.max(1, Number(bucketSizeSeconds) || 180);
  const maxEnd = Math.max(...segments.map((s) => s.end));
  const bucketCount = Math.max(1, Math.ceil(maxEnd / bucketSize));

  const toLabel = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  const data = [];
  const labels = [];
  let lastValue = null; // forward-fill을 위한 최근 값 저장

  // 전체 세그먼트 중 pass10 최대값의 "시작 시각"(초)을 peakSec으로 설정
  let peakSec = null;
  if (segments.length > 0) {
    let maxVal = -Infinity;
    let peakStart = 0;
    for (const s of segments) {
      if (s.val > maxVal) {
        maxVal = s.val;
        peakStart = s.start;
      }
    }
    peakSec = Math.max(0, Math.round(peakStart));
  }

  for (let i = 0; i < bucketCount; i++) {
    const bStart = i * bucketSize;
    const bEnd = bStart + bucketSize;

    labels.push(labelRange ? `${toLabel(bStart)} ~ ${toLabel(bEnd)}` : toLabel(bStart));

    // 버킷 내 커버리지 기반 시간가중 평균
    let weightedSum = 0;
    let covered = 0;

    for (const s of segments) {
      if (s.start >= bEnd) break; // 이후는 더 이상 겹치지 않음
      if (s.end <= bStart) continue; // 이전 세그먼트
      const overlap = Math.min(s.end, bEnd) - Math.max(s.start, bStart);
      if (overlap > 0) {
        weightedSum += s.val * overlap;
        covered += overlap;
      }
    }

    if (covered > 0) {
      const avg = weightedSum / covered;
      const rounded = Math.round(avg * 1000) / 1000; // 소수 3자리 반올림
      data.push(rounded);
      lastValue = rounded;
    } else {
      data.push(forwardFill && lastValue != null ? lastValue : null);
    }
  }

  return { data, labels, peakSec };
}

// 내부 유틸: 문자열/객체 모두 안전하게 JSON 파싱
function parseJsonSafely(input) {
  try {
    if (input == null) return null;
    if (typeof input === 'object') return input; // 이미 객체/배열
    if (typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (!trimmed) return null;
    const normalized = trimmed.replace(/,(\s*[}\]])/g, '$1'); // 후행 콤마 제거
    return JSON.parse(normalized);
  } catch (_) {
    return null;
  }
}
