import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

function StressBoxSmall({ data, labels }) {
  const canvasRef = useRef(null);
  const hasData = Array.isArray(data) && data.length > 0 && Array.isArray(labels) && labels.length > 0;

  useEffect(() => {
    if (!hasData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let chartInstance;
    const ctx = canvas.getContext("2d");
    // gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.0208, "rgba(49, 137, 255, 0.21)");
    gradient.addColorStop(1, "rgba(49, 137, 255, 0.00)");
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            borderColor: "#3189FF",
            borderWidth: 2,
            fill: true,
            backgroundColor: gradient,
            pointRadius: 0,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: false,
        layout: {
          padding: { left: 0, right: 0, top: 0, bottom: 0 },
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            offset: false,
            display: true,
            grid: { display: false },
            ticks: { display: false, padding: 0 },
          },
          y: {
            display: true,
            beginAtZero: true,
            max: 5,
            min: 1,
            ticks: { display: false },
            grid: {
              display: true,
              color: "#E6EDF2",
              drawTicks: false,
              drawBorder: false,
            },
            border: { display: false },
          },
        },
        elements: {
          line: { borderJoinStyle: "round" },
        },
        clip: false,
      },
    });
    return () => {
      chartInstance && chartInstance.destroy();
    };
  }, [hasData, data, labels]);

  if (!hasData) return null;
  return (
    <canvas
      ref={canvasRef}
      className="line-chart-small"
      width={284}
      height={100}
      style={{ display: "block" }}
    />
  );
}

export default StressBoxSmall;
