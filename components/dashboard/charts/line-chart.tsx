"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface LineChartProps {
  labels: string[];
  data: number[];
  height?: number;
}

export function LineChart({ labels, data, height = 300 }: LineChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [isDark, setIsDark] = useState(true); // Default to dark based on theme

  useEffect(() => {
    // Basic theme detection
    const theme = document.documentElement.getAttribute("data-theme");
    setIsDark(theme !== "light");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const colors = {
    gridColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    textColor: isDark ? "#94a3b8" : "#64748b",
    tooltipBg: isDark ? "rgba(9, 9, 11, 0.9)" : "rgba(255, 255, 255, 0.9)",
    tooltipText: isDark ? "#fff" : "#0f172a",
    primary: "#3b82f6",
    secondary: "#8b5cf6",
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Clicks",
        data,
        borderColor: colors.primary,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.6)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
          return gradient;
        },
        borderWidth: typeof window !== "undefined" && window.innerWidth <= 768 ? 4 : 3,
        pointBackgroundColor: colors.secondary,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: typeof window !== "undefined" && window.innerWidth <= 768 ? 0 : 4,
        pointHoverRadius: 6,
        pointHitRadius: 25,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: typeof window !== "undefined" && window.innerWidth <= 768 ? { left: 0, right: 0, top: 10, bottom: 0 } : 0,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        borderColor: colors.gridColor,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        intersect: false,
        mode: "index" as const,
      },
    },
    scales: {
      y: {
        display: typeof window !== "undefined" ? window.innerWidth > 768 : true,
        beginAtZero: true,
        grid: { color: colors.gridColor, drawBorder: false },
        ticks: { color: colors.textColor },
      },
      x: {
        display: typeof window !== "undefined" ? window.innerWidth > 768 : true,
        grid: { display: false, drawBorder: false },
        ticks: { color: colors.textColor },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  return (
    <div style={{ height, width: "100%", position: "relative" }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
