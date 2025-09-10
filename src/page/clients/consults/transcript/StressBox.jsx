import React, { useRef, useEffect } from "react";
import Chart from 'chart.js/auto';

function StressBox({ data, labels, peakSec, onAIGenerate, isAiAnalysis }) {
  const hasData = Array.isArray(data) && data.length > 0 && Array.isArray(labels) && labels.length > 0;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let chartInstance;
    // Chart.js 라인차트 생성
    const ctx = canvas.getContext('2d');
    // null 데이터가 포함될 수 있으므로 숫자만 분리
    const numericIndices = data
      .map((v, i) => (typeof v === 'number' && Number.isFinite(v) ? i : null))
      .filter(i => i !== null);
    const numericValues = numericIndices.map(i => data[i]);
    // 최대값 인덱스 계산 (숫자 데이터만 고려)
    const maxIndex = numericValues.length
      ? numericIndices[numericValues.indexOf(Math.max(...numericValues))]
      : -1;
    const pointRadiusArray = data.map((v, i) => (i === maxIndex ? 5 : 0));

    // Y축 동적 스케일(정수 단위): 최소값 정수 내림, 최대값 정수 올림
    const rawMax = numericValues.length ? Math.max(...numericValues) : NaN;
    const rawMin = numericValues.length ? Math.min(...numericValues) : NaN;
    let yMax = Number.isFinite(rawMax) ? Math.ceil(rawMax) : 10; // 정수 올림
    let yMin = Number.isFinite(rawMin) ? Math.floor(rawMin) : 0;  // 정수 내림
    // 동일값인 경우 최소 범위 보장(1)
    if (yMax === yMin) yMax = yMin + 1;
    // 눈금 간격: 1 단위
    const step = 1;

    const pluginShowMaxTooltip = {
      id: 'showMaxTooltip',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const ds = chart.data.datasets[0].data;
        // 숫자 요소만 고려하여 최대값 인덱스 계산
        const nIdx = ds.map((v, i) => (typeof v === 'number' && Number.isFinite(v) ? i : null)).filter(i => i !== null);
        if (!nIdx.length) return;
        const nVals = nIdx.map(i => ds[i]);
        const maxIndexLocal = nIdx[nVals.indexOf(Math.max(...nVals))];
        const point = meta.data[maxIndexLocal];
        if (!point) return;
        const { x, y } = point.getProps(['x', 'y'], true);
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#3467AA';
        ctx.lineWidth = 1;
        ctx.moveTo(x, y);
        ctx.lineTo(x, chart.chartArea.bottom + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 19, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(49, 137, 255, 0.30)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 13.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(49, 137, 255, 0.40)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3467AA';
        ctx.stroke();
        const label = chart.data.labels[maxIndex];
        // peakSec이 전달되면 정확한 최고 시각(mm분 ss초)을 사용
        let text;
        if (typeof peakSec === 'number' && Number.isFinite(peakSec)) {
          const sec = Math.max(0, Math.round(peakSec));
          const mm = Math.floor(sec / 60);
          const ss = sec % 60;
          text = `최고 ${mm}:${ss}`;
        } else {
          text = `최고 ${label}`;
        }
        ctx.font = 'bold 14px Pretendard';
        const paddingX = 8;
        const paddingY = 4;
        const textWidth = ctx.measureText(text).width;
        const boxWidth = textWidth + paddingX * 2;
        const textHeight = 21;
        const boxHeight = textHeight + paddingY * 2;
        // 라벨 박스가 좌우로 잘리지 않도록 chartArea 안으로 클램프
        const areaLeft = chart.chartArea.left + 0;
        const areaRight = chart.chartArea.right - 0;
        let boxX = x - boxWidth / 2;
        if (boxX < areaLeft) boxX = areaLeft;
        if (boxX + boxWidth > areaRight) boxX = Math.max(areaLeft, areaRight - boxWidth);
        const boxY = chart.chartArea.bottom - 18;
        ctx.fillStyle = '#3467AA';
        ctx.beginPath();
        const radius = 6;
        ctx.moveTo(boxX + radius, boxY);
        ctx.lineTo(boxX + boxWidth - radius, boxY);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
        ctx.lineTo(boxX + radius, boxY + boxHeight);
        ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
        ctx.lineTo(boxX, boxY + radius);
        ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 텍스트는 박스의 가운데에 그려서 클램프 시에도 중앙 정렬 유지
        ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);
        ctx.restore();
      }
    };
    const pluginHoverLine = {
      id: 'hoverLine',
      beforeDraw(chart) {
        const tooltip = chart.tooltip;
        if (tooltip && tooltip._active && tooltip._active.length) {
          const ctx = chart.ctx;
          const point = tooltip._active[0].element;
          const { x } = point;
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([5, 3]);
          ctx.strokeStyle = '#5A626A';
          ctx.moveTo(x, chart.chartArea.top);
          ctx.lineTo(x, chart.chartArea.bottom);
          ctx.stroke();
          ctx.restore();
        }
      }
    };
    const xLabelAlignPlugin = {
      id: 'xLabelAlignWithVerticalPadding',
      afterDraw(chart) {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;
        const ticks = xAxis.ticks;
        const paddingTop = 15;
        const paddingLeft = 4;
        const paddingRight = 4;
        // 전체 종료시간: 라벨이 'MM:SS ~ MM:SS'라면 마지막 라벨의 끝 시간을 사용
        let endTime = '';
        if (Array.isArray(chart.data.labels) && chart.data.labels.length > 0) {
          const lastLabel = String(chart.data.labels[chart.data.labels.length - 1] || '');
          if (lastLabel.includes('~')) {
            const parts = lastLabel.split('~');
            endTime = (parts[1] || '').trim();
          } else {
            endTime = lastLabel; // 안전망
          }
        }
        ctx.save();
        ctx.font = '500 14px Pretendard';
        ctx.fillStyle = '#69757B';
        ctx.textBaseline = 'top';
        ticks.forEach((tick, i) => {
          if (!ticks.length) return;
          const y = xAxis.bottom + paddingTop;
          if (i === 0) {
            ctx.textAlign = 'left';
            const leftX = chart.chartArea.left;
            ctx.fillText('00:00', leftX + paddingLeft, y);
          } else if (i === ticks.length - 1) {
            ctx.textAlign = 'right';
            const rightX = chart.chartArea.right;
            ctx.fillText(endTime || tick.label || '', rightX - paddingRight, y);
          }
        });
        ctx.restore();
      }
    };
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '스트레스 징후',
          data,
          fill: { target: 'start' },
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null; // 초기 레이아웃 전에는 chartArea가 없음
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(1, 'rgba(49, 137, 255, 0.00)');
            gradient.addColorStop(0, 'rgba(49, 137, 255, 0.50)');
            return gradient;
          },
          borderColor: '#3189FF',
          borderWidth: 1.5,
          tension: 0.3,
          pointRadius: pointRadiusArray,
          pointHoverRadius: 5,
          pointHitRadius: 10,
          pointBackgroundColor: '#FFF',
          pointHoverBackgroundColor: '#FFF',
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: '#5A626A',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: { radius: 0 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            intersect: false,
            external: function(context) {
              const tooltipModel = context.tooltip;
              let tooltipEl = document.getElementById('chartjs-tooltip');
              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.pointerEvents = 'none';
                tooltipEl.style.background = '#fff';
                tooltipEl.style.border = '1px solid #1C1D1E';
                tooltipEl.style.borderRadius = '8px';
                tooltipEl.style.padding = '6px 8px';
                tooltipEl.style.boxShadow = '0px 1px 4px 0px rgba(0, 0, 0, 0.24)';
                tooltipEl.style.fontFamily = 'Pretendard';
                tooltipEl.style.fontSize = '16px';
                tooltipEl.style.zIndex = '10';
                tooltipEl.style.whiteSpace = 'nowrap';
                document.body.appendChild(tooltipEl);
              }

              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              if (tooltipModel.dataPoints && tooltipModel.dataPoints.length) {
                const dataPoint = tooltipModel.dataPoints[0];
                const y = dataPoint.parsed.y;
                // 버킷 범위 라벨을 그대로 사용 (예: '00:00 ~ 03:00')
                const rangeLabel = String(dataPoint.label || '');
                tooltipEl.innerHTML = `
                  <div style="display: flex; gap: 6px; align-items: center; justify-content: center;">
                    <span style="color: #3B3C3E; font-weight: 500;">${(Number.isFinite(y) && y.toFixed) ? y.toFixed(1) : y}점</span>
                    <span style="width: 1px; height: 10px; background: #DCE4E7;"></span>
                    <span style="color: #7A8A93; font-weight: 500;">${rangeLabel}</span>
                  </div>
                `;

                const canvasRect = context.chart.canvas.getBoundingClientRect();
                const tooltipX = canvasRect.left + window.scrollX + tooltipModel.caretX;
                const tooltipY = canvasRect.top + window.scrollY + tooltipModel.caretY;

                tooltipEl.style.opacity = 1;
                tooltipEl.style.left = tooltipX + 'px';
                tooltipEl.style.top = (tooltipY - tooltipEl.offsetHeight - 8) + 'px';
                tooltipEl.style.transform = 'translateX(-50%)';
              }
            }
          },
        },
        hover: {
          mode: 'nearest',
          intersect: false
        },
        layout: {
          padding: {
            bottom: 40
          }
        },
        scales: {
          x: {
            display: false,
            bounds: 'data',
            offset: false, // 끝단 반 칸 여백 제거
          },
          y: {
            max: yMax,
            min: yMin,
            ticks: {
              autoSkip: false,
              stepSize: step,
              padding: 10,
              font: { size: 14, family: 'Pretendard', weight: '500' },
              color: '#7A8A93',
              callback: function(value) {
                const num = Number(value);
                return Number.isFinite(num) ? Math.round(num).toString() : value;
              }
            },
            grid: { color: '#DCE4E7' },
            border: { display: false }
          }
        }
      },
      plugins: [xLabelAlignPlugin, pluginShowMaxTooltip, pluginHoverLine]
    });
    return () => { chartInstance && chartInstance.destroy(); };
  }, [hasData, data, labels]);

  return (
    <>
      {!hasData ? (
        <div className="stress box before-create txt-box">
          <div className="box-tit">
            <strong>5. 스트레스 징후</strong>
          </div>
          <div className="create-wrap" style={{marginTop: '1rem'}}>
            <p>스트레스 징후 데이터가 없습니다.</p>
          </div>
        </div>
      ) : (
        <div className="stress box" style={{maxHeight: '256px'}}>
          {!isAiAnalysis ? <div className="box-tit">
            <strong>5. 스트레스 징후</strong>
          </div> : null}
          {isAiAnalysis ? (
            <div className="con-wrap">
              <canvas
                ref={canvasRef}
                className="line-chart"
                width="1040"
                height="158"
                style={{ position: 'relative', marginTop: '1rem' }}
              />
            </div>
          ) : (
            <div style={{ height: '168px' }}>
              <canvas
                ref={canvasRef}
                className="line-chart"
                style={{ position: 'relative', marginTop: '1rem', width: '100%', height: '100%' }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default StressBox;
