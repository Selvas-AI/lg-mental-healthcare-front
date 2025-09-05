import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

/**
 * 심리검사 - 증상별 변화 라인 차트 (퍼블리싱 변환)
 * @param {number[]} values - 각 회기별 점수 데이터 (null 포함 가능)
 * @param {string[]} labels - 회기명 배열
 * @param {number} min - Y축 최소값
 * @param {number} max - Y축 최대값
 * @param {string} className - 추가 클래스
 */
function SymptomBarChart({ values = [], labels = [], min = 0, max, className = '' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // hex -> rgba 변환 함수
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    if (!canvasRef.current || !values.length || !labels.length) return;
    
    // 기존 차트 인스턴스 제거
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    // null 제외한 최신 인덱스 찾기
    let latestIndex = values.length - 1;
    while (values[latestIndex] == null && latestIndex >= 0) {
      latestIndex--;
    }

    const latest = values[latestIndex];
    const prev = values[latestIndex - 1];

    // 색상 결정 (증가/감소/기본)
    let color = "#7A8A93";
    if (latest != null && prev != null) {
      if (latest > prev) color = "#FF6565";
      else if (latest < prev) color = "#7FB2F6";
    }

    const yMin = min !== null ? parseFloat(min) : 0;
    const yMax = max !== null ? parseFloat(max) : undefined;

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          borderColor: color,
          backgroundColor: 'transparent',
          pointBorderColor: color,
          pointBackgroundColor: '#fff',
          borderWidth: 2,
          pointRadius: 6.5,
          tension: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        clip: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        interaction: {
          mode: null
        },
        hover: {
          mode: null
        },
        layout: {
          padding: {
            top: 30,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: {
                family: "Pretendard",
                size: 16,
                weight: 500
              },
              color: "#69757B",
              padding: 30,
              align: "center",
              clip: false
            },
            offset: true,
          },
          y: {
            beginAtZero: true,
            //! min, max 설정 값 주석 처리 
            // min: yMin,
            // max: yMax,
            ticks: {
              font: {
                family: "Pretendard",
                size: 16,
                weight: 500
              },
              color: "#7A8A93",
              padding: 10,
            },
            grid: {
              color: "#DCE4E7",
              drawBorder: false
            },
            border: { display: false }
          }
        },
        animation: {
          onComplete: () => {
            const chart = Chart.getChart(ctx.canvas);
            const meta = chart.getDatasetMeta(0);
            const point = meta.data[latestIndex];
            if (!point) return;

            const x = point.x;
            const y = point.y;
            const ctx2 = chart.ctx;

            ctx2.save();

            // 바깥 원
            ctx2.beginPath();
            ctx2.arc(x, y, 16.5, 0, 2 * Math.PI);
            ctx2.fillStyle = hexToRgba(color, 0.2);
            ctx2.fill();

            // 중간 원
            ctx2.beginPath();
            ctx2.arc(x, y, 11.5, 0, 2 * Math.PI);
            ctx2.fillStyle = hexToRgba(color, 0.3);
            ctx2.fill();

            // 중심 흰 원 + 테두리
            ctx2.beginPath();
            ctx2.arc(x, y, 6.5, 0, 2 * Math.PI);
            ctx2.fillStyle = '#ffffff';
            ctx2.fill();
            ctx2.lineWidth = 2;
            ctx2.strokeStyle = color;
            ctx2.stroke();

            ctx2.restore();
          }
        }
      }
    });

    // cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [values, labels, min, max]);

  return (
    <>
      <canvas ref={canvasRef} className="line-chart02" width="477" height="452" />
    </>
  );
}

export default SymptomBarChart