import React, { useRef, useEffect } from "react";
import TranscriptBox from "./TranscriptBox";
import Chart from 'chart.js/auto';

function StressBox({ data, labels, onAIGenerate }) {
  const hasData = Array.isArray(data) && data.length > 0 && Array.isArray(labels) && labels.length > 0;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hasData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let chartInstance;
    // Chart.js 라인차트 생성
    const ctx = canvas.getContext('2d');
    const maxIndex = data.indexOf(Math.max(...data));
    const pointRadiusArray = data.map((_, i) => i === maxIndex ? 5 : 0);
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
    gradientFill.addColorStop(0.0517, 'rgba(49, 137, 255, 0.21)');
    gradientFill.addColorStop(1, 'rgba(49, 137, 255, 0.00)');

    const pluginShowMaxTooltip = {
      id: 'showMaxTooltip',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const maxIndex = chart.data.datasets[0].data.indexOf(Math.max(...chart.data.datasets[0].data));
        const point = meta.data[maxIndex];
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
        const text = `최고 ${label}`;
        ctx.font = 'bold 14px Pretendard';
        const paddingX = 8;
        const paddingY = 4;
        const textWidth = ctx.measureText(text).width;
        const boxWidth = textWidth + paddingX * 2;
        const textHeight = 21;
        const boxHeight = textHeight + paddingY * 2;
        const boxX = x - boxWidth / 2;
        const boxY = chart.chartArea.bottom + 10;
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
        ctx.fillText(text, x, boxY + boxHeight / 2);
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
        const paddingLeft = 0;
        const paddingRight = 0;
        ctx.save();
        ctx.font = '500 14px Pretendard';
        ctx.fillStyle = '#69757B';
        ctx.textBaseline = 'top';
        ticks.forEach((tick, i) => {
          const label = tick.label;
          if (!label) return;
          const x = xAxis.getPixelForTick(i);
          const y = xAxis.bottom + paddingTop;
          if (i === 0) {
            ctx.textAlign = 'left';
            ctx.fillText(label, x + paddingLeft, y);
          } else if (i === ticks.length - 1) {
            ctx.textAlign = 'right';
            ctx.fillText(label, x - paddingRight, y);
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
          fill: true,
          backgroundColor: gradientFill,
          borderColor: '#3189FF',
          borderWidth: 2,
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
        responsive: false,
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
                const [min, sec] = dataPoint.label.split(':');
                const time = `${parseInt(min)}분 ${parseInt(sec)}초`;
                tooltipEl.innerHTML = `
                  <div style="display: flex; gap: 6px; align-items: center; justify-content: center;">
                    <span style="color: #3B3C3E; font-weight: 500;">${y}점</span>
                    <span style="width: 1px; height: 10px; background: #DCE4E7;"></span>
                    <span style="color: #7A8A93; font-weight: 500;">${time}</span>
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
          },
          y: {
            beginAtZero: true,
            max: 5,
            min: 1,
            ticks: {
              autoSkip: false,
              stepSize: 1,
              padding: 10,
              font: { size: 16, family: 'Pretendard', weight: '500' },
              color: '#7A8A93'
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
    <TranscriptBox
      className={`stress box${!hasData ? ' before-create' : ''}`}
      title="5. 스트레스 징후"
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
            className="line-chart"
            width="1040"
            height="158"
            style={{ position: 'relative' }}
          />
        </div>
      )}
    </TranscriptBox>
  );
}

export default StressBox;
