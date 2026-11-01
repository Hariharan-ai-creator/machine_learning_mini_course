/**
 * visual_guide.js - Module 6: Visual Machine Learning Guide
 * Interactive confusion matrix calculator with live sliders for TP, FP, TN, FN.
 * Instantly recalculates Precision, Recall, F1-Score, and Accuracy with step-by-step formulas.
 */

const VisualGuideModule = {
  init() {
    this.initInteractiveCalculator();
    this.initPresetScenarios();
  },

  initInteractiveCalculator() {
    const sliders = ['tp', 'tn', 'fp', 'fn'];
    sliders.forEach(key => {
      const slider = document.getElementById(`calc-slider-${key}`);
      const valDisplay = document.getElementById(`calc-val-${key}`);
      if (slider && valDisplay) {
        slider.addEventListener('input', (e) => {
          valDisplay.textContent = e.target.value;
          this.recalculate();
        });
      }
    });

    this.recalculate();
  },

  initPresetScenarios() {
    const presets = {
      'cancer': { tp: 95, fn: 5, fp: 30, tn: 870 },
      'spam': { tp: 85, fp: 2, fn: 20, tn: 893 },
      'imbalanced': { tp: 5, fn: 95, fp: 0, tn: 9900 }
    };

    document.querySelectorAll('[data-cm-scenario]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-cm-scenario');
        const s = presets[key];
        if (s) {
          this.setSlider('tp', s.tp);
          this.setSlider('tn', s.tn);
          this.setSlider('fp', s.fp);
          this.setSlider('fn', s.fn);
          this.recalculate();
        }
      });
    });
  },

  setSlider(key, val) {
    const slider = document.getElementById(`calc-slider-${key}`);
    const display = document.getElementById(`calc-val-${key}`);
    if (slider && display) {
      slider.max = Math.max(parseFloat(slider.max), val * 1.2);
      slider.value = val;
      display.textContent = val;
    }
  },

  recalculate() {
    const tp = parseFloat(document.getElementById('calc-slider-tp')?.value || 80);
    const tn = parseFloat(document.getElementById('calc-slider-tn')?.value || 85);
    const fp = parseFloat(document.getElementById('calc-slider-fp')?.value || 15);
    const fn = parseFloat(document.getElementById('calc-slider-fn')?.value || 10);

    const total = tp + tn + fp + fn;

    // Accuracy
    const accuracy = total > 0 ? (tp + tn) / total : 0;
    const accuracyPct = (accuracy * 100).toFixed(1);

    // Precision
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const precisionPct = (precision * 100).toFixed(1);

    // Recall
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const recallPct = (recall * 100).toFixed(1);

    // F1 Score
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const f1Pct = (f1 * 100).toFixed(1);

    // Update displays
    this.updateMetricCard('accuracy', accuracyPct, `(${tp} + ${tn}) / ${total}`);
    this.updateMetricCard('precision', precisionPct, `${tp} / (${tp} + ${fp})`);
    this.updateMetricCard('recall', recallPct, `${tp} / (${tp} + ${fn})`);
    this.updateMetricCard('f1', f1Pct, `2 * (${precision.toFixed(2)} * ${recall.toFixed(2)}) / (${precision.toFixed(2)} + ${recall.toFixed(2)})`);

    // Contextual alert
    const alertBox = document.getElementById('calc-context-alert');
    if (alertBox) {
      if (fn > 30 && tp < 50) {
        alertBox.innerHTML = `⚠️ <strong>High False Negatives (${fn}):</strong> Dangerous in medical screening! The model missed ${fn} positive patients.`;
        alertBox.className = 'callout warning';
      } else if (fp > 25) {
        alertBox.innerHTML = `⚠️ <strong>High False Positives (${fp}):</strong> Problematic in spam filtering! ${fp} legitimate emails were mistakenly flagged.`;
        alertBox.className = 'callout warning';
      } else if (accuracyPct > 90 && recallPct < 40) {
        alertBox.innerHTML = `🚨 <strong>Accuracy Illusion Detected!</strong> Overall accuracy is ${accuracyPct}%, but Recall is only ${recallPct}%. This model fails on the minority class.`;
        alertBox.className = 'callout warning';
      } else {
        alertBox.innerHTML = `✅ <strong>Balanced Model:</strong> Both Precision (${precisionPct}%) and Recall (${recallPct}%) show healthy alignment.`;
        alertBox.className = 'callout success';
      }
    }
  },

  updateMetricCard(key, pct, formula) {
    const valElem = document.getElementById(`calc-res-${key}`);
    const barElem = document.getElementById(`calc-bar-${key}`);
    const formulaElem = document.getElementById(`calc-formula-${key}`);

    if (valElem) valElem.textContent = `${pct}%`;
    if (barElem) barElem.style.width = `${pct}%`;
    if (formulaElem) formulaElem.textContent = formula;
  }
};

window.VisualGuideModule = VisualGuideModule;

