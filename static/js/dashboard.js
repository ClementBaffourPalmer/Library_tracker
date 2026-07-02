(function () {
  const dataElement = document.getElementById("dashboard-data");
  if (!dataElement || typeof Chart === "undefined") {
    return;
  }

  let payload;
  try {
    payload = JSON.parse(dataElement.textContent);
  } catch (error) {
    console.error("Failed to parse dashboard payload:", error);
    return;
  }

  const fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
  const ink = "#0f172a";
  const muted = "#64748b";
  const primary = "#2563eb";
  const success = "#059669";
  const danger = "#dc2626";
  const surface = "rgba(255,255,255,0.88)";

  Chart.defaults.font.family = fontFamily;
  Chart.defaults.color = muted;

  const buildCommonOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          color: ink,
          font: { family: fontFamily, size: 12, weight: "600" },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        padding: 12,
        titleFont: { family: fontFamily, size: 13, weight: "700" },
        bodyFont: { family: fontFamily, size: 12 },
        borderColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(15,23,42,0.05)", drawBorder: false },
        ticks: { color: muted, font: { family: fontFamily, size: 11, weight: "600" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(15,23,42,0.05)", drawBorder: false },
        ticks: { color: muted, font: { family: fontFamily, size: 11, weight: "600" }, precision: 0 },
      },
    },
  });

  const renderLineChart = (canvasId, labels, series, seriesLabel, color, fillColor) => {
    const element = document.getElementById(canvasId);
    if (!element) return;

    new Chart(element, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: seriesLabel,
            data: series,
            borderColor: color,
            backgroundColor: fillColor,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: color,
            pointBorderColor: surface,
            pointBorderWidth: 2,
          },
        ],
      },
      options: buildCommonOptions(),
    });
  };

  const renderBarChart = (canvasId, labels, series, datasets) => {
    const element = document.getElementById(canvasId);
    if (!element) return;

    new Chart(element, {
      type: "bar",
      data: {
        labels,
        datasets,
      },
      options: {
        ...buildCommonOptions(),
        scales: {
          x: {
            grid: { color: "rgba(15,23,42,0.05)", drawBorder: false },
            ticks: { color: muted, font: { family: fontFamily, size: 11, weight: "600" } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(15,23,42,0.05)", drawBorder: false },
            ticks: { color: muted, font: { family: fontFamily, size: 11, weight: "600" }, precision: 0 },
          },
        },
      },
    });
  };

  const renderDoughnutChart = (canvasId, labels, series) => {
    const element = document.getElementById(canvasId);
    if (!element) return;

    new Chart(element, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: series,
            backgroundColor: [primary, success, danger, "#8b5cf6"],
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: ink,
              font: { family: fontFamily, size: 12, weight: "600" },
              usePointStyle: true,
              pointStyle: "circle",
              padding: 18,
            },
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            padding: 12,
            titleFont: { family: fontFamily, size: 13, weight: "700" },
            bodyFont: { family: fontFamily, size: 12 },
            borderColor: "rgba(255,255,255,0.10)",
            borderWidth: 1,
            cornerRadius: 10,
          },
        },
      },
    });
  };

  renderLineChart(
    "occupancyTrendChart",
    payload.weekLabels || [],
    payload.occupancySeries || [],
    "Net occupancy",
    primary,
    "rgba(37, 99, 235, 0.10)"
  );

  renderBarChart("dailyVisitsChart", payload.weekLabels || [], payload.dailyVisitsSeries || [], [
    {
      label: "Daily visits",
      data: payload.dailyVisitsSeries || [],
      backgroundColor: "rgba(37, 99, 235, 0.20)",
      borderColor: primary,
      borderWidth: 1,
      borderRadius: 10,
      maxBarThickness: 24,
    },
  ]);

  renderDoughnutChart("weeklyUsageChart", payload.weeklyUsageLabels || [], payload.weeklyUsageSeries || []);

  renderBarChart("departmentStatsChart", payload.departmentLabels || [], payload.departmentSeries || [], [
    {
      label: "Students",
      data: payload.departmentSeries || [],
      backgroundColor: "rgba(5, 150, 105, 0.20)",
      borderColor: success,
      borderWidth: 1,
      borderRadius: 10,
      maxBarThickness: 24,
    },
  ]);
})();
