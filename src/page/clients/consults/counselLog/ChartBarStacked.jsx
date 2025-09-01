import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";
import goodFace from "@/assets/images/common/good_face.svg";

function ChartBarStacked({
  values = [],
  labels = [],
  className = "",
  width = 1043,
  height = 167
}) {
  const canvasRef = useRef(null);
  const hasAnyBar = Array.isArray(values) && values.some(v => (Number(v) || 0) > 0);
  useEffect(() => {
    if (!hasAnyBar) {
      // 데이터가 모두 0이면 차트를 생성하지 않음
      return;
    }
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
  }, [values, labels, width, height, hasAnyBar]);

  return (
    hasAnyBar ? (
      <canvas
        ref={canvasRef}
        className={`chart-bar-stacked ${className}`}
        width={width}
        height={height}
        style={{ display: "block" }}
      />
    ) : (
      <div
        className={`chart-bar-stacked ${className}`}
        style={{ width, height }}
      >
        <div className="w-full h-full flex flex-col gap-3 items-center justify-center text-[#7A8A93] !mt-[-20px]">
          <img src={goodFace} alt="" />
          <p>모든 증상의 심각도가 0점이에요.</p>
        </div>
      </div>
    )
  );
}

export default ChartBarStacked;
