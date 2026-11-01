/**
 * progress.js - Module 11: Progress Tracker & Module 1: Dashboard Synchronizer
 * Handles progress fetching, milestone badge calculations, quiz score history,
 * and one-click progress reset for fresh live demonstrations.
 */

const ProgressModule = {
  init() {
    this.loadProgress();
    this.initResetButton();
  },

  async loadProgress() {
    try {
      const response = await fetch('/api/progress');
      const res = await response.json();
      if (res.success && res.data) {
        this.syncProgressUI(res.data);
      }
    } catch (e) {
      console.error("Progress fetch error:", e);
    }
  },

  syncProgressUI(data) {
    if (!data) return;

    // 1. Header & Badge
    const headerBadge = document.getElementById('header-badge-display');
    if (headerBadge) {
      headerBadge.textContent = `Rank: ${data.badge}`;
    }

    // 2. Dashboard Stat Cards
    const dashCompletedLessons = document.getElementById('dash-completed-lessons');
    if (dashCompletedLessons) {
      dashCompletedLessons.textContent = `${data.completed_lessons} / ${data.total_lessons}`;
    }

    const dashQuizBest = document.getElementById('dash-quiz-best');
    if (dashQuizBest) {
      dashQuizBest.textContent = `${data.quiz_stats.best_score}%`;
    }

    const dashQuizAttempts = document.getElementById('dash-quiz-attempts');
    if (dashQuizAttempts) {
      dashQuizAttempts.textContent = `${data.quiz_stats.total_attempts} attempts`;
    }

    const dashOverallPct = document.getElementById('dash-overall-pct');
    if (dashOverallPct) {
      dashOverallPct.textContent = `${data.overall_percentage}%`;
    }

    const dashProgressBar = document.getElementById('dash-progress-bar-fill');
    if (dashProgressBar) {
      dashProgressBar.style.width = `${data.overall_percentage}%`;
    }

    // 3. Module 11: Detailed Progress Screen
    const trackerTotalLessons = document.getElementById('tracker-lessons-count');
    if (trackerTotalLessons) {
      trackerTotalLessons.textContent = `${data.completed_lessons} of ${data.total_lessons} completed (${data.lesson_percentage}%)`;
    }

    const trackerLessonsBar = document.getElementById('tracker-lessons-bar');
    if (trackerLessonsBar) {
      trackerLessonsBar.style.width = `${data.lesson_percentage}%`;
    }

    const trackerBadgeTitle = document.getElementById('tracker-badge-title');
    if (trackerBadgeTitle) {
      trackerBadgeTitle.textContent = data.badge;
    }

    // Render Lesson Completion Checklist
    const lessonChecklist = document.getElementById('tracker-lessons-list');
    if (lessonChecklist && data.lessons) {
      lessonChecklist.innerHTML = '';
      data.lessons.forEach(l => {
        const item = document.createElement('div');
        item.style.padding = '0.75rem 0';
        item.style.borderBottom = '1px solid var(--border-color)';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        item.innerHTML = `
          <div>
            <strong>${l.title}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${l.completed ? `Completed: ${l.completed_at || 'Yes'}` : 'Not completed yet'}</div>
          </div>
          <div>
            <span class="badge-pill" style="font-size: 0.75rem; background-color: ${l.completed ? 'var(--accent-green-soft)' : 'var(--bg-card-subtle)'}; color: ${l.completed ? 'var(--accent-green)' : 'var(--text-muted)'};">
              ${l.completed ? '✔ Completed' : 'Pending'}
            </span>
          </div>
        `;
        lessonChecklist.appendChild(item);
      });
    }

    // Render Quiz Attempts History
    const quizHistoryTbody = document.getElementById('tracker-quiz-history-tbody');
    if (quizHistoryTbody && data.quiz_stats && data.quiz_stats.history) {
      quizHistoryTbody.innerHTML = '';
      if (data.quiz_stats.history.length === 0) {
        quizHistoryTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No quiz attempts recorded yet. Take the 15-question quiz!</td></tr>`;
      } else {
        data.quiz_stats.history.forEach((h, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>#${idx + 1}</td>
            <td><strong>${h.percentage}%</strong> (${h.score}/${h.total_questions})</td>
            <td><span class="badge-pill" style="font-size: 0.75rem;">${h.grade}</span></td>
            <td>${h.feedback}</td>
            <td>${h.attempted_at}</td>
          `;
          quizHistoryTbody.appendChild(tr);
        });
      }
    }
  },

  initResetButton() {
    const resetBtn = document.getElementById('tracker-reset-progress-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        const confirmed = confirm("Are you sure you want to reset all learning progress, quiz attempts, and training history? This will restore a clean slate for demonstrations.");
        if (!confirmed) return;

        try {
          const response = await fetch('/api/progress/reset', { method: 'POST' });
          const res = await response.json();
          if (res.success) {
            window.showToast("All learning progress has been reset successfully.", "info");
            this.syncProgressUI(res.overall);

            // Re-sync LessonsModule
            if (window.LessonsModule) {
              window.LessonsModule.completedLessons.clear();
              window.LessonsModule.renderTabs();
              window.LessonsModule.renderActiveLesson();
            }
          }
        } catch (e) {
          console.error("Reset progress error:", e);
          window.showToast("Failed to reset progress.", "error");
        }
      });
    }
  }
};

window.ProgressModule = ProgressModule;

