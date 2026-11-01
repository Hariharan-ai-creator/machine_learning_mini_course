/**
 * housing_module.js - Module 5: House Price Regression Laboratory
 * Handles dataset inspection, regression algorithm training (Linear Regression, Ridge, Random Forest Regressor),
 * metrics evaluation (MAE, MSE, RMSE, R²), actual vs predicted scatter visualization,
 * and live valuation prediction with educational disclaimers.
 */

const HousingModule = {
  scatterChart: null,
  importanceChart: null,

  init() {
    this.initDatasetInfo();
    this.initTrainer();
    this.initPredictor();
    this.initReportButtons();
  },

  onShow() {
    const statsTable = document.getElementById('housing-stats-tbody');
    if (statsTable && statsTable.children.length === 0) {
      this.initDatasetInfo();
    }
  },

  // -------------------------------------------------------------------
  // 1. DATASET OVERVIEW & STATS
  // -------------------------------------------------------------------
  async initDatasetInfo() {
    try {
      const response = await fetch('/api/housing/info');
      const res = await response.json();
      if (!res.success) return;

      const data = res.data;

      document.getElementById('housing-total-samples').textContent = data.total_samples;
      document.getElementById('housing-total-features').textContent = data.total_features;

      // Render stats table
      const statsTbody = document.getElementById('housing-stats-tbody');
      if (statsTbody) {
        statsTbody.innerHTML = '';
        data.features_info.forEach(f => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${f.name}</strong></td>
            <td>${f.mean.toLocaleString()}</td>
            <td>${f.std.toLocaleString()}</td>
            <td>${f.min.toLocaleString()}</td>
            <td>${f.max.toLocaleString()}</td>
          `;
          statsTbody.appendChild(tr);
        });
      }

      // Render samples table
      const samplesTbody = document.getElementById('housing-samples-tbody');
      if (samplesTbody) {
        samplesTbody.innerHTML = '';
        data.sample_records.forEach((row, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>#${idx + 1}</td>
            <td>$${Math.round(row.avg_income).toLocaleString()}</td>
            <td>${row.house_age} yrs</td>
            <td>${row.rooms}</td>
            <td>${row.bedrooms}</td>
            <td>${Math.round(row.population).toLocaleString()}</td>
            <td><strong style="color: var(--primary-blue);">$${Math.round(row.price).toLocaleString()}</strong></td>
          `;
          samplesTbody.appendChild(tr);
        });
      }

    } catch (e) {
      console.error("Failed to load Housing info:", e);
    }
  },

  // -------------------------------------------------------------------
  // 2. MODEL TRAINING & METRICS
  // -------------------------------------------------------------------
  initTrainer() {
    const splitSlider = document.getElementById('housing-test-split-slider');
    const splitDisplay = document.getElementById('housing-test-split-val');
    if (splitSlider && splitDisplay) {
      splitSlider.addEventListener('input', (e) => {
        splitDisplay.textContent = `${Math.round(e.target.value * 100)}% Test / ${Math.round((1 - e.target.value) * 100)}% Train`;
      });
    }

    const trainBtn = document.getElementById('housing-train-btn');
    if (trainBtn) {
      trainBtn.addEventListener('click', () => this.trainModel());
    }

    // Default initial model
    this.trainModel(true);
  },

  async trainModel(isSilent = false) {
    const algSelect = document.getElementById('housing-algorithm-select');
    const splitSlider = document.getElementById('housing-test-split-slider');
    const algorithm = algSelect ? algSelect.value : 'Random Forest Regressor';
    const test_size = splitSlider ? parseFloat(splitSlider.value) : 0.2;

    const trainBtn = document.getElementById('housing-train-btn');
    if (trainBtn) {
      trainBtn.disabled = true;
      trainBtn.textContent = 'Training Regressor...';
    }

    try {
      const response = await fetch('/api/housing/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, test_size })
      });
      const res = await response.json();

      if (res.success) {
        this.renderMetrics(res.data);
        if (!isSilent) window.showToast(`Trained ${algorithm}! R² Score: ${res.data.r2_pct}%`, 'success');
      } else {
        window.showToast(res.error || 'Training failed.', 'error');
      }
    } catch (e) {
      console.error("Housing train error:", e);
      window.showToast("Failed to communicate with ML backend.", "error");
    } finally {
      if (trainBtn) {
        trainBtn.disabled = false;
        trainBtn.textContent = '🚀 Train Regression Model';
      }
    }
  },

  renderMetrics(metrics) {
    document.getElementById('housing-metric-r2').textContent = `${metrics.r2_pct}%`;
    document.getElementById('housing-metric-mae').textContent = `$${Math.round(metrics.mae).toLocaleString()}`;
    document.getElementById('housing-metric-rmse').textContent = `$${Math.round(metrics.rmse).toLocaleString()}`;
    document.getElementById('housing-metric-mse').textContent = `${Math.round(metrics.mse / 1e6)}M`;

    // Render Scatter Plot: Actual vs Predicted
    this.renderActualVsPredictedChart(metrics.comparison_points);
  },

  renderActualVsPredictedChart(points) {
    const canvas = document.getElementById('housing-actual-pred-chart');
    if (!canvas || !points) return;
    const ctx = canvas.getContext('2d');

    const scatterData = points.map(p => ({ x: p.actual, y: p.predicted }));

    // Find min and max for the 45-degree ideal fit line
    const allVals = points.flatMap(p => [p.actual, p.predicted]);
    const minVal = Math.min(...allVals) * 0.95;
    const maxVal = Math.max(...allVals) * 1.05;

    if (this.scatterChart) {
      this.scatterChart.destroy();
    }

    this.scatterChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Test Samples (Actual vs Predicted)',
            data: scatterData,
            backgroundColor: '#2563eb',
            borderColor: '#1d4ed8',
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Ideal 45° Fit Line (Predicted = Actual)',
            data: [{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }],
            type: 'line',
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `Actual: $${ctx.raw.x?.toLocaleString()} | Predicted: $${ctx.raw.y?.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Actual Sale Price ($)' },
            ticks: { callback: (val) => `$${(val / 1000).toFixed(0)}k` }
          },
          y: {
            title: { display: true, text: 'Model Predicted Price ($)' },
            ticks: { callback: (val) => `$${(val / 1000).toFixed(0)}k` }
          }
        }
      }
    });
  },

  // -------------------------------------------------------------------
  // 3. LIVE HOUSE VALUATION PREDICTOR
  // -------------------------------------------------------------------
  initPredictor() {
    const presets = {
      'budget': { income: 45000, age: 30, rooms: 4.5, bedrooms: 2.0, pop: 22000 },
      'average': { income: 68000, age: 14, rooms: 6.2, bedrooms: 3.0, pop: 35000 },
      'luxury': { income: 98000, age: 5, rooms: 8.5, bedrooms: 4.5, pop: 48000 }
    };

    document.querySelectorAll('[data-housing-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-housing-preset');
        const vals = presets[key];
        if (vals) {
          document.getElementById('housing-input-income').value = vals.income;
          document.getElementById('housing-input-age').value = vals.age;
          document.getElementById('housing-input-rooms').value = vals.rooms;
          document.getElementById('housing-input-bedrooms').value = vals.bedrooms;
          document.getElementById('housing-input-population').value = vals.pop;
          this.predictPrice();
        }
      });
    });

    const predictBtn = document.getElementById('housing-predict-btn');
    if (predictBtn) {
      predictBtn.addEventListener('click', () => this.predictPrice());
    }
  },

  async predictPrice() {
    const income = parseFloat(document.getElementById('housing-input-income').value);
    const age = parseFloat(document.getElementById('housing-input-age').value);
    const rooms = parseFloat(document.getElementById('housing-input-rooms').value);
    const bedrooms = parseFloat(document.getElementById('housing-input-bedrooms').value);
    const pop = parseFloat(document.getElementById('housing-input-population').value);

    try {
      const response = await fetch('/api/housing/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avg_income: income, house_age: age, rooms: rooms, bedrooms: bedrooms, population: pop })
      });
      const res = await response.json();

      if (!res.success) {
        window.showToast(res.error || 'Prediction failed', 'error');
        return;
      }

      const data = res.data;
      const resultArea = document.getElementById('housing-prediction-result');
      if (resultArea) {
        resultArea.style.display = 'block';
        document.getElementById('housing-pred-price-title').textContent = data.formatted_price;
        document.getElementById('housing-pred-range').textContent = `Expected Margin of Error: ${data.lower_bound} to ${data.upper_bound}`;
        document.getElementById('housing-pred-algorithm-note').textContent = `Regression Engine: ${data.algorithm_used}`;
        document.getElementById('housing-pred-disclaimer').textContent = data.disclaimer;
      }
    } catch (e) {
      console.error("Housing predict error:", e);
      window.showToast("Prediction error occurred.", "error");
    }
  },

  // -------------------------------------------------------------------
  // 4. AUTOMATED REPORT HOOKS
  // -------------------------------------------------------------------
  initReportButtons() {
    const viewBtn = document.getElementById('housing-view-report-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/report/view/housing');
          const data = await res.json();
          if (data.success) {
            App.openReportModal(
              "Housing Model Evaluation Report",
              data.report,
              "/api/report/download/housing"
            );
          }
        } catch (e) {
          window.showToast("Could not retrieve report.", "error");
        }
      });
    }

    const downloadBtn = document.getElementById('housing-download-report-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        window.location.href = '/api/report/download/housing';
      });
    }
  }
};

window.HousingModule = HousingModule;

