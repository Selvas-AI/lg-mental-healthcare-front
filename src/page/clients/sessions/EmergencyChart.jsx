import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const EmergencyChart = ({ values = [], labels = [], min = 0, max = 4, height = 159, width = 304 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (chartRef.current) chartRef.current.destroy();

    // null 제외한 최신 인덱스
    let latestIndex = values.length - 1;
    while (values[latestIndex] == null && latestIndex >= 0) {
      latestIndex--;
    }
    const latest = values[latestIndex];
    const prev = values[latestIndex - 1];

    let color = "#7A8A93";
    if (latest != null && prev != null) {
      if (latest > prev) color = "#FF6565";
      else if (latest < prev) color = "#7FB2F6";
    }

    const plugin = {
      id: 'highlightLatestLabel',
      afterDraw(chart) {
        const { ctx, scales, data } = chart;
        const xScale = scales.x;
        const labels = data.labels;
        if (!xScale || !labels.length) return;
        const latestIndex = labels.length - 1;
        const label = labels[latestIndex];
        const xPos = xScale.getPixelForTick(latestIndex);
        const yPos = xScale.bottom - 20;
        ctx.save();
        ctx.font = '700 14px Pretendard';
        const textWidth = ctx.measureText(label).width;
        const paddingX = 8;
        const boxWidth = textWidth + paddingX * 2;
        const boxHeight = 24;
        const radius = 6;
        const boxX = xPos - boxWidth / 2;
        const boxY = yPos - boxHeight / 2;
        ctx.fillStyle = '#EFF2F3';
        ctx.strokeStyle = '#EFF2F3';
        ctx.lineWidth = 1;
        ctx.beginPath();
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
        ctx.stroke();
        ctx.fillStyle = '#3B3C3E';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, xPos, yPos);
        ctx.restore();
      }
    };

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
          pointRadius: 5.5,
          tension: 0
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        clip: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            displayColors: false,
            callbacks: {
              // y값만 "n점" 형태로 표기
              label: (context) => `${context.parsed.y}점`,
              title: (items) => (items && items.length ? items[0].label : '')
            },
            backgroundColor: '#fff',
            borderColor: '#1C1D1E',
            borderWidth: 1,
            titleColor: '#7A8A93',
            titleFont: { family: 'Pretendard', size: 12, weight: 600 },
            bodyColor: '#3B3C3E',
            bodyFont: { family: 'Pretendard', size: 14, weight: 600 },
            padding: 8
          }
        },
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        },
        layout: {
          padding: {
            top: 20,
            right: 12,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: {
                family: "Pretendard",
                size: 14,
                weight: 700
              },
              color: "#3B3C3E",
              padding: 12,
              align: "center",
              clip: false
            },
            offset: true,
          },
          y: {
            beginAtZero: true,
            min: min,
            max: max,
            ticks: {
              font: {
                family: "Pretendard",
                size: 14,
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
            ctx2.arc(x, y, 5.5, 0, 2 * Math.PI);
            ctx2.fillStyle = '#ffffff';
            ctx2.fill();
            ctx2.lineWidth = 2;
            ctx2.strokeStyle = color;
            ctx2.stroke();
            ctx2.restore();
          }
        }
      },
      plugins: [plugin]
    });
    return () => { chartRef.current && chartRef.current.destroy(); };
  }, [values, labels, min, max]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block", width: width, height: height }}
    />
  );
};

export default EmergencyChart;
