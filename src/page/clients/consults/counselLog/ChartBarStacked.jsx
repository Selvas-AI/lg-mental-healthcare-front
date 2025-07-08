import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

function ChartBarStacked({
  values = [3, 5, 3, 1, 1, 4, 3, 2, 5, 3],
  labels = [
    "우울", "불안", "공황", "강박", "ADHD", "PTSD", "수면장애", "기억장애", "무기력", "최대텍스트"
  ],
  className = "",
  width = 1043,
  height = 167
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const grayColors = ["#EFF2F3", "#DCE4E7", "#CBD5DA"];
    const redColors = ["#FFDFDF", "#FFBEBE", "#FF9E9E", "#FF7D7D", "#FF5D5D"];
    const datasets = [];
    for (let level = 1; level <= 5; level++) {
      datasets.push({
        label: `Level ${level}`,
        data: values.map(val => val >= level ? 1 : 0),
        backgroundColor: values.map(val => {
          if (val <= 3) {
            return val >= level ? grayColors[level - 1] : "transparent";
          } else {
            return val >= level ? redColors[level - 1] : "transparent";
          }
        }),
        borderRadius: 4,
        barThickness: 24,
        grouped: false,
        stack: "stacked"
      });
    }
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: false,
        hover: { mode: null },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: {
                size: 14,
                family: "Pretendard",
                weight: "700"
              },
              color: "#69757B",
              autoSkip: false
            }
          },
          y: {
            beginAtZero: true,
            max: 5,
            min: 0,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                const yLabels = ["낮음", "약간 낮음", "보통", "약간 높음", "매우 높음"];
                return value >= 1 ? yLabels[value - 1] : "";
              },
              padding: 10,
              font: {
                size: 14,
                family: "Pretendard",
                weight: "500"
              },
              color: "#7A8A93",
            },
            grid: {
              color: "#DCE4E7",
              drawTicks: false,
            },
            border: { display: false },
            stacked: true
          },
        }
      }
    });
    return () => chart.destroy();
  }, [values, labels, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={`chart-bar-stacked ${className}`}
      width={width}
      height={height}
      style={{ display: "block" }}
    />
  );
}

export default ChartBarStacked;
