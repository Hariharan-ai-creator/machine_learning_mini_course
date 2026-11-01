/**
 * iris_module.js - Module 4: Iris Flower Classification Laboratory
 * Handles dataset inspection, algorithm training (Random Forest, Decision Tree, Logistic Regression, KNN),
 * metrics visualization, 3x3 Confusion Matrix heatmap, feature importances, and live botanical prediction.
 */

const IrisModule = {
  importanceChart: null,
  probabilityChart: null,

  init() {
    this.initDatasetInfo();
    this.initTrainer();
    this.initPredictor();
    this.initReportButtons();
  },

  onShow() {
    // Initial fetch if table empty
    const statsTable = document.getElementById('iris-stats-tbody');
    if (statsTable && statsTable.children.length === 0) {
      this.initDatasetInfo();
    }
  },

  // -------------------------------------------------------------------
  // 1. DATASET OVERVIEW & STATS
  // -------------------------------------------------------------------
  async initDatasetInfo() {
    try {
      const response = await fetch('/api/iris/info');
      const res = await response.json();
      if (!res.success) return;

      const data = res.data;

      // Update summary counts
      document.getElementById('iris-total-samples').textContent = data.total_samples;
      document.getElementById('iris-total-features').textContent = data.total_features;
      document.getElementById('iris-class-counts').textContent = 
        `Setosa (${data.class_distribution.setosa}), Versicolor (${data.class_distribution.versicolor}), Virginica (${data.class_distribution.virginica})`;

      // Render Feature Stats Table
      const statsTbody = document.getElementById('iris-stats-tbody');
      if (statsTbody) {
        statsTbody.innerHTML = '';
        data.features_info.forEach(f => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${f.name}</strong></td>
            <td>${f.mean} cm</td>
            <td>${f.std} cm</td>
            <td>${f.min} cm</td>
            <td>${f.max} cm</td>
          `;
          statsTbody.appendChild(tr);
        });
      }

      // Render Sample Records Table
      const samplesTbody = document.getElementById('iris-samples-tbody');
      if (samplesTbody) {
        samplesTbody.innerHTML = '';
        data.sample_records.forEach((row, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>#${idx + 1}</td>
            <td>${row.sepal_length}</td>
            <td>${row.sepal_width}</td>
            <td>${row.petal_length}</td>
            <td>${row.petal_width}</td>
            <td><span class="badge-pill" style="font-size: 0.75rem;">${row.species}</span></td>
          `;
          samplesTbody.appendChild(tr);
        });
      }

    } catch (e) {
      console.error("Failed to load Iris info:", e);
    }
  },

  // -------------------------------------------------------------------
  // 2. MODEL TRAINING & EVALUATION METRICS
  // -------------------------------------------------------------------
  initTrainer() {
    const splitSlider = document.getElementById('iris-test-split-slider');
    const splitDisplay = document.getElementById('iris-test-split-val');
    if (splitSlider && splitDisplay) {
      splitSlider.addEventListener('input', (e) => {
        splitDisplay.textContent = `${Math.round(e.target.value * 100)}% Test / ${Math.round((1 - e.target.value) * 100)}% Train`;
      });
    }

    const trainBtn = document.getElementById('iris-train-btn');
    if (trainBtn) {
      trainBtn.addEventListener('click', () => this.trainModel());
    }

    // Train default initial model on page ready
    this.trainModel(true);
  },

  async trainModel(isSilent = false) {
    const algSelect = document.getElementById('iris-algorithm-select');
    const splitSlider = document.getElementById('iris-test-split-slider');
    const algorithm = algSelect ? algSelect.value : 'Random Forest';
    const test_size = splitSlider ? parseFloat(splitSlider.value) : 0.2;

    const trainBtn = document.getElementById('iris-train-btn');
    if (trainBtn) {
      trainBtn.disabled = true;
      trainBtn.textContent = 'Training Model...';
    }

    try {
      const response = await fetch('/api/iris/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, test_size })
      });
      const res = await response.json();

      if (res.success) {
        this.renderMetrics(res.data);
        if (!isSilent) window.showToast(`Successfully trained ${algorithm}! Accuracy: ${res.data.accuracy_pct}%`, 'success');
      } else {
        window.showToast(res.error || 'Training failed.', 'error');
      }
    } catch (e) {
      console.error("Iris train error:", e);
      window.showToast("Failed to communicate with ML backend.", "error");
    } finally {
      if (trainBtn) {
        trainBtn.disabled = false;
        trainBtn.textContent = '🚀 Train Classification Model';
      }
    }
  },

  renderMetrics(metrics) {
    // Metric Cards
    document.getElementById('iris-metric-accuracy').textContent = `${metrics.accuracy_pct}%`;
    document.getElementById('iris-metric-precision').textContent = metrics.precision.toFixed(3);
    document.getElementById('iris-metric-recall').textContent = metrics.recall.toFixed(3);
    document.getElementById('iris-metric-f1').textContent = metrics.f1_score.toFixed(3);

    // Confusion Matrix 3x3 Render
    const cm = metrics.confusion_matrix;
    const container = document.getElementById('iris-confusion-matrix-box');
    if (container && cm) {
      container.innerHTML = `
        <div class="confusion-matrix-grid">
          <div class="cm-cell header">Actual \\ Pred</div>
          <div class="cm-cell header">Setosa</div>
          <div class="cm-cell header">Versicolor</div>
          <div class="cm-cell header">Virginica</div>

          <div class="cm-cell header">Setosa</div>
          <div class="cm-cell ${cm[0][0] > 0 ? 'diagonal' : ''}">${cm[0][0]}</div>
          <div class="cm-cell ${cm[0][1] > 0 ? 'off-diagonal' : ''}">${cm[0][1]}</div>
          <div class="cm-cell ${cm[0][2] > 0 ? 'off-diagonal' : ''}">${cm[0][2]}</div>

          <div class="cm-cell header">Versicolor</div>
          <div class="cm-cell ${cm[1][0] > 0 ? 'off-diagonal' : ''}">${cm[1][0]}</div>
          <div class="cm-cell ${cm[1][1] > 0 ? 'diagonal' : ''}">${cm[1][1]}</div>
          <div class="cm-cell ${cm[1][2] > 0 ? 'off-diagonal' : ''}">${cm[1][2]}</div>

          <div class="cm-cell header">Virginica</div>
          <div class="cm-cell ${cm[2][0] > 0 ? 'off-diagonal' : ''}">${cm[2][0]}</div>
          <div class="cm-cell ${cm[2][1] > 0 ? 'off-diagonal' : ''}">${cm[2][1]}</div>
          <div class="cm-cell ${cm[2][2] > 0 ? 'diagonal' : ''}">${cm[2][2]}</div>
        </div>
      `;
    }

    // Feature Importance Chart
    this.renderFeatureImportance(metrics.feature_importance);
  },

  renderFeatureImportance(importances) {
    const canvas = document.getElementById('iris-importance-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = Object.keys(importances).map(k => k.replace('_', ' ').toUpperCase());
    const values = Object.values(importances);

    if (this.importanceChart) {
      this.importanceChart.destroy();
    }

    this.importanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Feature Importance / Relative Weight',
          data: values,
          backgroundColor: '#2563eb',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 0.6 }
        }
      }
    });
  },

  // -------------------------------------------------------------------
  // 3. LIVE FLOWER PREDICTOR
  // -------------------------------------------------------------------
  initPredictor() {
    // Preset buttons
    const presets = {
      'setosa': { sl: 5.1, sw: 3.5, pl: 1.4, pw: 0.2 },
      'versicolor': { sl: 6.0, sw: 2.7, pl: 5.1, pw: 1.6 },
      'virginica': { sl: 6.9, sw: 3.1, pl: 5.4, pw: 2.1 }
    };

    document.querySelectorAll('[data-iris-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-iris-preset');
        const vals = presets[key];
        if (vals) {
          document.getElementById('iris-input-sl').value = vals.sl;
          document.getElementById('iris-input-sw').value = vals.sw;
          document.getElementById('iris-input-pl').value = vals.pl;
          document.getElementById('iris-input-pw').value = vals.pw;
          this.predictSpecies();
        }
      });
    });

    const predictBtn = document.getElementById('iris-predict-btn');
    if (predictBtn) {
      predictBtn.addEventListener('click', () => this.predictSpecies());
    }
  },

  async predictSpecies() {
    const sl = parseFloat(document.getElementById('iris-input-sl').value);
    const sw = parseFloat(document.getElementById('iris-input-sw').value);
    const pl = parseFloat(document.getElementById('iris-input-pl').value);
    const pw = parseFloat(document.getElementById('iris-input-pw').value);

    try {
      const response = await fetch('/api/iris/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sepal_length: sl, sepal_width: sw, petal_length: pl, petal_width: pw })
      });
      const res = await response.json();

      if (!res.success) {
        window.showToast(res.error || 'Prediction failed', 'error');
        return;
      }

      const data = res.data;
      const resultArea = document.getElementById('iris-prediction-result');
      if (resultArea) {
        resultArea.style.display = 'block';
        document.getElementById('iris-pred-species-title').textContent = data.predicted_species;
        document.getElementById('iris-pred-description').textContent = data.description;
        document.getElementById('iris-pred-algorithm-note').textContent = `Predicted by: ${data.algorithm_used}`;

        this.renderProbabilityChart(data.probabilities);
      }
    } catch (e) {
      console.error("Iris predict error:", e);
      window.showToast("Prediction error occurred.", "error");
    }
  },

  renderProbabilityChart(probs) {
    const canvas = document.getElementById('iris-probability-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = ['Setosa', 'Versicolor', 'Virginica'];
    const values = [probs.setosa || 0, probs.versicolor || 0, probs.virginica || 0];

    if (this.probabilityChart) {
      this.probabilityChart.destroy();
    }

    this.probabilityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Prediction Probability (%)',
          data: values,
          backgroundColor: ['#ef4444', '#2563eb', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, max: 100 }
        }
      }
    });
  },

  // -------------------------------------------------------------------
  // 4. AUTOMATED REPORT HOOKS
  // -------------------------------------------------------------------
  initReportButtons() {
    const viewBtn = document.getElementById('iris-view-report-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/report/view/iris');
          const data = await res.json();
          if (data.success) {
            App.openReportModal(
              "Iris Model Evaluation Report",
              data.report,
              "/api/report/download/iris"
            );
          }
        } catch (e) {
          window.showToast("Could not retrieve report.", "error");
        }
      });
    }

    const downloadBtn = document.getElementById('iris-download-report-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        window.location.href = '/api/report/download/iris';
      });
    }
  }
};

window.IrisModule = IrisModule;

