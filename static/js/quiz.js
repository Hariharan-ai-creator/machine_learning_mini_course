/**
 * quiz.js - Module 7: 15-Question Multiple Choice Quiz System
 * Handles question loading, pagination, answer selection, submission,
 * automatic grading, detailed answer reviews with explanations, and progress synchronization.
 */

const QuizModule = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},  // Map of question_id -> option_index

  init() {
    this.loadQuestions();
    this.initControls();
  },

  async loadQuestions() {
    try {
      const response = await fetch('/api/quiz/questions');
      const res = await response.json();
      if (res.success && res.questions) {
        this.questions = res.questions;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.renderQuestionGrid();
        this.renderCurrentQuestion();
      }
    } catch (e) {
      console.error("Failed to load quiz questions:", e);
      window.showToast("Could not load quiz questions.", "error");
    }
  },

  initControls() {
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const submitBtn = document.getElementById('quiz-submit-btn');
    const retakeBtn = document.getElementById('quiz-retake-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentQuestionIndex > 0) {
          this.currentQuestionIndex--;
          this.renderCurrentQuestion();
          this.updateQuestionGrid();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
          this.renderCurrentQuestion();
          this.updateQuestionGrid();
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitQuiz());
    }

    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        document.getElementById('quiz-results-container').style.display = 'none';
        document.getElementById('quiz-active-container').style.display = 'block';
        this.loadQuestions();
      });
    }
  },

  renderQuestionGrid() {
    const grid = document.getElementById('quiz-indicator-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.questions.forEach((q, idx) => {
      const dot = document.createElement('div');
      dot.className = `quiz-dot ${idx === this.currentQuestionIndex ? 'active' : ''} ${this.userAnswers[q.id] !== undefined ? 'answered' : ''}`;
      dot.textContent = idx + 1;
      dot.id = `quiz-dot-${idx}`;
      dot.addEventListener('click', () => {
        this.currentQuestionIndex = idx;
        this.renderCurrentQuestion();
        this.updateQuestionGrid();
      });
      grid.appendChild(dot);
    });
  },

  updateQuestionGrid() {
    this.questions.forEach((q, idx) => {
      const dot = document.getElementById(`quiz-dot-${idx}`);
      if (dot) {
        dot.className = `quiz-dot ${idx === this.currentQuestionIndex ? 'active' : ''} ${this.userAnswers[q.id] !== undefined ? 'answered' : ''}`;
      }
    });
  },

  renderCurrentQuestion() {
    if (!this.questions.length) return;
    const q = this.questions[this.currentQuestionIndex];

    // Update status text
    const numDisplay = document.getElementById('quiz-question-number');
    if (numDisplay) {
      numDisplay.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
    }

    const titleDisplay = document.getElementById('quiz-question-text');
    if (titleDisplay) {
      titleDisplay.textContent = q.question;
    }

    const optionsContainer = document.getElementById('quiz-options-container');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      q.options.forEach((optText, optIdx) => {
        const isSelected = this.userAnswers[q.id] === optIdx;
        const label = document.createElement('label');
        label.className = `quiz-option-label ${isSelected ? 'selected' : ''}`;
        label.innerHTML = `
          <input type="radio" name="quiz_opt_${q.id}" value="${optIdx}" ${isSelected ? 'checked' : ''} style="accent-color: var(--primary-blue);">
          <span>${optText}</span>
        `;
        label.addEventListener('click', () => {
          this.userAnswers[q.id] = optIdx;
          this.renderCurrentQuestion();
          this.updateQuestionGrid();
        });
        optionsContainer.appendChild(label);
      });
    }

    // Prev / Next button states
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (prevBtn) prevBtn.disabled = (this.currentQuestionIndex === 0);
    if (nextBtn) nextBtn.disabled = (this.currentQuestionIndex === this.questions.length - 1);
  },

  async submitQuiz() {
    const answeredCount = Object.keys(this.userAnswers).length;
    if (answeredCount < this.questions.length) {
      const confirmSubmit = confirm(`You have answered ${answeredCount} of ${this.questions.length} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: this.userAnswers })
      });
      const res = await response.json();

      if (res.success) {
        this.renderResults(res);
        window.showToast(`Quiz completed! Score: ${res.score}/${res.total} (${res.percentage}%)`, 'success');

        // Update dashboard stats
        if (window.ProgressModule) {
          window.ProgressModule.syncProgressUI(res.progress);
        }
      }
    } catch (e) {
      console.error("Quiz submit error:", e);
      window.showToast("Failed to submit quiz.", "error");
    }
  },

  renderResults(res) {
    document.getElementById('quiz-active-container').style.display = 'none';
    const resultsContainer = document.getElementById('quiz-results-container');
    resultsContainer.style.display = 'block';

    document.getElementById('quiz-score-display').textContent = `${res.score} / ${res.total}`;
    document.getElementById('quiz-percentage-display').textContent = `${res.percentage}%`;
    document.getElementById('quiz-grade-display').textContent = res.grade;
    document.getElementById('quiz-feedback-display').textContent = res.feedback;

    // Render Review List
    const reviewList = document.getElementById('quiz-review-list');
    if (reviewList) {
      reviewList.innerHTML = '';
      res.review.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = `review-item ${item.is_correct ? 'correct' : 'incorrect'}`;

        const userAnsText = item.user_choice !== null ? item.options[item.user_choice] : 'Not Answered';
        const correctAnsText = item.options[item.correct_index];

        div.innerHTML = `
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem;">
            <span>Q${idx + 1}: ${item.question}</span>
            <span style="float: right; font-size: 0.8rem;" class="badge-pill">${item.is_correct ? '✔ Correct (+1)' : '✖ Incorrect'}</span>
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 0.4rem;">
            <strong>Your Answer:</strong> <span style="color: ${item.is_correct ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 600;">${userAnsText}</span>
          </div>
          ${!item.is_correct ? `<div style="font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>Correct Answer:</strong> <span style="color: var(--accent-green); font-weight: 600;">${correctAnsText}</span></div>` : ''}
          <div style="font-size: 0.85rem; background-color: var(--bg-card-subtle); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); margin-top: 0.5rem; color: var(--text-secondary);">
            <strong>💡 Explanation:</strong> ${item.explanation}
          </div>
        `;
        reviewList.appendChild(div);
      });
    }

    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }
};

window.QuizModule = QuizModule;

