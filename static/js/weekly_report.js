(function () {
  const el = document.getElementById('dashboard-data');
  if (!el) return;

  let data;
  try {
    data = JSON.parse(el.textContent);
  } catch (e) {
    return;
  }

  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;

  const ink = '#0F172A';
  const muted = '#64748B';
  const success = '#059669';
  const danger = '#DC2626';
  const fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

  // Keep charts consistent with app typography.
  if (typeof Chart !== 'undefined' && Chart.defaults) {
    Chart.defaults.font.family = fontFamily;
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Entries',
          data: data.entries,
          borderColor: success,
          backgroundColor: 'rgba(5,150,105,0.10)',
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: success,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Exits',
          data: data.exits,
          borderColor: danger,
          backgroundColor: 'rgba(220,38,38,0.08)',
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: danger,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 6, left: 6, right: 10, bottom: 6 } },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: { color: ink, font: { weight: '600', family: fontFamily, size: 12 }, padding: 14, usePointStyle: true, pointStyle: 'circle' },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          ticks: { color: muted, font: { family: fontFamily, weight: '500', size: 11 }, maxRotation: 0, padding: 10 },
          grid: { color: 'rgba(15,23,42,0.05)', drawBorder: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: muted, font: { family: fontFamily, weight: '500', size: 11 }, padding: 10, precision: 0 },
          grid: { color: 'rgba(15,23,42,0.05)', drawBorder: false },
        },
      },
    },
  });
})();
