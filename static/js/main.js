/**
 * main.js - Core Application Controller for ML Made Easy
 * Handles theme toggling, sidebar navigation, module routing, toast alerts, and modal dialogs.
 */

const App = {
  activeModule: 'dashboard',

  init() {
    this.initTheme();
    this.initNavigation();
    this.initMobileSidebar();
    this.initModals();

    // Initialize all sub-modules
    if (window.ProgressModule) window.ProgressModule.init();
    if (window.LessonsModule) window.LessonsModule.init();
    if (window.DemosModule) window.DemosModule.init();
    if (window.IrisModule) window.IrisModule.init();
    if (window.HousingModule) window.HousingModule.init();
    if (window.VisualGuideModule) window.VisualGuideModule.init();
    if (window.QuizModule) window.QuizModule.init();

    console.log("ML Made Easy - Educational Platform initialized successfully.");
  },

  // -------------------------------------------------------------------
  // Light / Dark Theme Management
  // -------------------------------------------------------------------
  initTheme() {
    const savedTheme = localStorage.getItem('ml_theme') || 'light';
    this.setTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
      });
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ml_theme', theme);
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  // -------------------------------------------------------------------
  // Navigation & Module Switching
  // -------------------------------------------------------------------
  initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        this.navigateTo(target);

        // Close mobile sidebar if open
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
        }
      });
    });

    // Quick navigation cards from dashboard
    document.querySelectorAll('[data-quick-nav]').forEach(card => {
      card.addEventListener('click', () => {
        const target = card.getAttribute('data-quick-nav');
        this.navigateTo(target);
      });
    });
  },

  navigateTo(moduleId) {
    // Hide all module sections
    const sections = document.querySelectorAll('.module-section');
    sections.forEach(s => s.classList.remove('active-module'));

    // Deactivate nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));

    // Show selected module
    const targetSection = document.getElementById(`module-${moduleId}`);
    if (targetSection) {
      targetSection.classList.add('active-module');
      this.activeModule = moduleId;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update Header Title
      const titleElem = document.getElementById('current-module-title');
      if (titleElem) {
        const titleText = targetSection.getAttribute('data-title') || 'Dashboard';
        titleElem.textContent = titleText;
      }

      // Activate matching nav item
      const activeNav = document.querySelector(`.nav-item[data-target="${moduleId}"]`);
      if (activeNav) activeNav.classList.add('active');

      // Trigger module-specific refresh hooks
      if (moduleId === 'demos' && window.DemosModule) {
        window.DemosModule.onShow();
      } else if (moduleId === 'iris' && window.IrisModule) {
        window.IrisModule.onShow();
      } else if (moduleId === 'housing' && window.HousingModule) {
        window.HousingModule.onShow();
      } else if (moduleId === 'dashboard' && window.ProgressModule) {
        window.ProgressModule.loadProgress();
      }
    }
  },

  // -------------------------------------------------------------------
  // Mobile Sidebar Toggle
  // -------------------------------------------------------------------
  initMobileSidebar() {
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  },

  // -------------------------------------------------------------------
  // Modal Management
  // -------------------------------------------------------------------
  initModals() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
      });
    });

    // Close on clicking backdrop
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });
  },

  openReportModal(reportTitle, reportContent, downloadUrl) {
    const modal = document.getElementById('report-modal');
    if (!modal) return;

    document.getElementById('report-modal-title').textContent = reportTitle;
    document.getElementById('report-modal-body').textContent = reportContent;

    const downloadBtn = document.getElementById('report-modal-download-btn');
    if (downloadBtn && downloadUrl) {
      downloadBtn.onclick = () => {
        window.location.href = downloadUrl;
      };
    }

    modal.classList.add('open');
  },

  // -------------------------------------------------------------------
  // Toast Alert Notification System
  // -------------------------------------------------------------------
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ';
    toast.innerHTML = `<span><strong>${icon}</strong></span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Global helper for toast
window.showToast = (msg, type) => App.showToast(msg, type);

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

