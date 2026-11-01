/**
 * demos.js - Module 3: Interactive Machine Learning Demonstrations
 * Renders interactive Chart.js visualizations for Supervised Decision Boundaries,
 * Unsupervised K-Means Clustering, and Overfitting / Bias-Variance Tradeoff Curves.
 */

const DemosModule = {
  supervisedChart: null,
  kmeansChart: null,
  overfittingChart: null,

  init() {
    this.initSupervisedDemo();
    this.initKMeansDemo();
    this.initOverfittingDemo();
  },

  onShow() {
    // Re-render / update charts if tab was switched
    if (!this.supervisedChart) this.loadSupervisedData();
    if (!this.kmeansChart) this.loadKMeansData(3);
    if (!this.overfittingChart) this.loadOverfittingData();
  },

  // ===================================================================
  // 1. SUPERVISED LEARNING DEMONSTRATION
  // ===================================================================
  initSupervisedDemo() {
    const refreshBtn = document.getElementById('demo-supervised-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadSupervisedData());
    }
  },

  async loadSupervisedData() {
    try {
      const response = await fetch('/api/demo/supervised');
      const res = await response.json();
      if (!res.success) return;

      const data = res.data;
      const setosaPoints = data.points.filter(p => p.class === 'setosa');
      const versicolorPoints = data.points.filter(p => p.class === 'versicolor');

      const canvas = document.getElementById('supervised-chart-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (this.supervisedChart) {
        this.supervisedChart.destroy();
      }

      this.supervisedChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Iris Setosa (Class 0)',
              data: setosaPoints.map(p => ({ x: p.x, y: p.y })),
              backgroundColor: '#ef4444',
              borderColor: '#b91c1c',
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'Iris Versicolor (Class 1)',
              data: versicolorPoints.map(p => ({ x: p.x, y: p.y })),
              backgroundColor: '#2563eb',
              borderColor: '#1d4ed8',
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'Learned Decision Boundary',
              data: data.decision_boundary,
              type: 'line',
              borderColor: '#10b981',
              borderWidth: 3,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Linear Decision Boundary (Logistic Regression Model Accuracy: ${data.accuracy}%)`
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: (${ctx.raw.x} cm Petal L, ${ctx.raw.y} cm Petal W)`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Petal Length (cm)' },
              min: 0.5,
              max: 6.0
            },
            y: {
              title: { display: true, text: 'Petal Width (cm)' },
              min: 0.0,
              max: 2.5
            }
          }
        }
      });

      const summaryElem = document.getElementById('supervised-summary-text');
      if (summaryElem) summaryElem.textContent = data.summary;

    } catch (e) {
      console.error("Supervised demo error:", e);
    }
  },

  // ===================================================================
  // 2. UNSUPERVISED LEARNING (K-MEANS CLUSTERING)
  // ===================================================================
  initKMeansDemo() {
    const kSelect = document.getElementById('kmeans-k-select');
    if (kSelect) {
      kSelect.addEventListener('change', (e) => {
        this.loadKMeansData(e.target.value);
      });
    }

    const runBtn = document.getElementById('demo-kmeans-run-btn');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        const k = document.getElementById('kmeans-k-select')?.value || 3;
        this.loadKMeansData(k);
      });
    }
  },

  async loadKMeansData(k = 3) {
    try {
      const response = await fetch(`/api/demo/kmeans?k=${k}`);
      const res = await response.json();
      if (!res.success) return;

      const data = res.data;
      const canvas = document.getElementById('kmeans-chart-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      // Group points by cluster index
      const clusterDatasets = [];
      for (let c = 0; c < data.k; c++) {
        const clusterPts = data.points.filter(p => p.cluster === c);
        const color = clusterPts.length > 0 ? clusterPts[0].color : '#2563eb';

        clusterDatasets.push({
          label: `Cluster ${c + 1} (${clusterPts.length} points)`,
          data: clusterPts.map(p => ({ x: p.x, y: p.y })),
          backgroundColor: color,
          pointRadius: 5
        });
      }

      // Add Centroids dataset
      clusterDatasets.push({
        label: `Cluster Centroids (k=${data.k})`,
        data: data.centroids.map(c => ({ x: c.x, y: c.y })),
        backgroundColor: '#0f172a',
        borderColor: '#ffffff',
        borderWidth: 2,
        pointStyle: 'triangle',
        pointRadius: 12,
        pointHoverRadius: 14
      });

      if (this.kmeansChart) {
        this.kmeansChart.destroy();
      }

      this.kmeansChart = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: clusterDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `K-Means Clustering Result (k = ${data.k}, Inertia: ${data.inertia})`
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: (${ctx.raw.x} cm, ${ctx.raw.y} cm)`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Petal Length (cm)' },
              min: 0.5,
              max: 7.5
            },
            y: {
              title: { display: true, text: 'Petal Width (cm)' },
              min: 0.0,
              max: 2.8
            }
          }
        }
      });

      const summaryElem = document.getElementById('kmeans-summary-text');
      if (summaryElem) summaryElem.textContent = data.summary;

    } catch (e) {
      console.error("K-Means demo error:", e);
    }
  },

  // ===================================================================
  // 3. OVERFITTING & BIAS-VARIANCE DEMONSTRATION
  // ===================================================================
  initOverfittingDemo() {
    const refreshBtn = document.getElementById('demo-overfitting-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadOverfittingData());
    }
  },

  async loadOverfittingData() {
    try {
      const response = await fetch('/api/demo/overfitting');
      const res = await response.json();
      if (!res.success) return;

      const data = res.data;
      const canvas = document.getElementById('overfitting-chart-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (this.overfittingChart) {
        this.overfittingChart.destroy();
      }

      this.overfittingChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.depths.map(d => `Depth ${d}`),
          datasets: [
            {
              label: 'Training Error (%)',
              data: data.train_errors,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              borderWidth: 3,
              tension: 0.3,
              fill: false
            },
            {
              label: 'Testing Error (%)',
              data: data.test_errors,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 3,
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Bias-Variance Tradeoff: Model Complexity vs Error Rate'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Classification Error Rate (%)' },
              min: 0,
              max: 35
            },
            x: {
              title: { display: true, text: 'Decision Tree Depth (Model Complexity)' }
            }
          }
        }
      });

      const zoneUnder = document.getElementById('zone-underfitting');
      const zoneSweet = document.getElementById('zone-sweetspot');
      const zoneOver = document.getElementById('zone-overfitting');

      if (zoneUnder) zoneUnder.textContent = data.underfitting_zone;
      if (zoneSweet) zoneSweet.textContent = data.sweet_spot;
      if (zoneOver) zoneOver.textContent = data.overfitting_zone;

    } catch (e) {
      console.error("Overfitting demo error:", e);
    }
  }
};

window.DemosModule = DemosModule;

