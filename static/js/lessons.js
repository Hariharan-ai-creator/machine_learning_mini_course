/**
 * lessons.js - Module 2: Six Interactive ML Lessons
 * Provides clear educational content, real-world analogies, examples, key takeaways,
 * and completion status toggling synchronized with the SQLite database.
 */

const LESSONS_DATA = [
  {
    id: "lesson_1",
    num: "Lesson 1",
    title: "Introduction to Machine Learning",
    summary: "Discover what Machine Learning is and how it radically differs from traditional rule-based programming.",
    content: `
      <h4>1. What is Machine Learning?</h4>
      <p>In traditional computer programming, human software engineers write explicit step-by-step rules and provide input data to compute an answer:</p>
      <div class="callout info" style="margin: 1rem 0;">
        <strong>Traditional Programming:</strong> <code>Rules + Input Data ➔ Output Answer</code><br>
        <strong>Machine Learning:</strong> <code>Input Data + Observed Answers ➔ Learned Mathematical Rules</code>
      </div>
      <p>Instead of manually writing thousands of rigid <code>if/else</code> statements to detect a spam email or recognize a face, we provide a machine learning algorithm with thousands of historical examples. The algorithm mathematically discovers patterns and formulates predictive rules on its own.</p>

      <div class="analogy-box">
        <div class="analogy-header">💡 Real-World Analogy: Learning to Ride a Bicycle</div>
        <p>You cannot teach a child to ride a bicycle by handing them a 500-page physics handbook detailing gravitational torque, balance equations, and angular velocity (Traditional Programming). Instead, the child sits on the bicycle, wobbles, makes adjustments through trial and error, and intuitively learns the neural reflexes required to stay upright (Machine Learning from Data).</p>
      </div>

      <h4>2. The AI Hierarchy: AI vs ML vs Deep Learning</h4>
      <ul>
        <li><strong>Artificial Intelligence (Broadest):</strong> Any technique that enables computers to mimic human intelligence (includes rule engines, expert systems, and heuristics).</li>
        <li><strong>Machine Learning (Subset of AI):</strong> Statistical techniques that give machines the ability to "learn" with data without being explicitly programmed.</li>
        <li><strong>Deep Learning (Subset of ML):</strong> Multi-layered artificial neural networks capable of learning complex representations from massive unstructured data (images, audio, natural language).</li>
      </ul>

      <h4>3. Key Takeaways</h4>
      <ul class="takeaway-list">
        <li>Machine Learning models learn patterns directly from empirical data rather than hand-coded human rules.</li>
        <li>ML is particularly effective when problems are too complex for humans to specify rigid conditional logic (e.g., speech recognition, autonomous navigation).</li>
        <li>Every ML model consists of three pillars: Data Representation, an Objective/Loss Function, and an Optimization Method.</li>
      </ul>
    `
  },
  {
    id: "lesson_2",
    num: "Lesson 2",
    title: "Supervised vs Unsupervised Learning",
    summary: "Understand the fundamental distinction between learning with a teacher (labels) and discovering hidden structures alone.",
    content: `
      <h4>1. Supervised Learning: Learning with a Teacher</h4>
      <p>In Supervised Learning, the training dataset contains both <strong>feature inputs (X)</strong> and the correct <strong>ground-truth target labels (y)</strong>. The algorithm acts like a student studying with an answer key:</p>
      <ul>
        <li>It makes a prediction for a given input.</li>
        <li>It compares its prediction against the known ground-truth answer.</li>
        <li>It calculates the error (loss) and updates its internal weights to reduce future mistakes.</li>
      </ul>
      <p><strong>Primary Tasks:</strong> Classification (predicting discrete categories) and Regression (predicting continuous numerical quantities).</p>

      <h4>2. Unsupervised Learning: Discovering Hidden Patterns</h4>
      <p>In Unsupervised Learning, the dataset consists strictly of feature inputs (X) <strong>without any target labels (y)</strong>. There is no teacher, no right or wrong answers, and no feedback score.</p>
      <p>The algorithm must discover intrinsic patterns, groupings, or geometric clusters purely by analyzing similarities and distances between data points.</p>
      <p><strong>Primary Tasks:</strong> Clustering (e.g., K-Means customer segmentation), Dimensionality Reduction (PCA), and Anomaly Detection.</p>

      <div class="analogy-box">
        <div class="analogy-header">💡 Real-World Analogy: Flashcards vs. Sorting Laundry</div>
        <p><strong>Supervised:</strong> A parent holds up flashcards showing pictures of apples and bananas, telling the toddler "This is an apple" and "This is a banana". The child associates features (roundness, red/yellow color) with verified labels.<br><br>
        <strong>Unsupervised:</strong> You dump an unsorted pile of clean laundry onto the bed. Without any labels or instructions, you naturally separate shirts, socks, and jeans based on visual texture, shape, and fabric similarity.</p>
      </div>

      <h4>3. Comparison Summary</h4>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr><th>Dimension</th><th>Supervised Learning</th><th>Unsupervised Learning</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Training Data</strong></td><td>Labelled (Input $X$ + Ground Truth $y$)</td><td>Unlabelled (Input $X$ only)</td></tr>
            <tr><td><strong>Objective</strong></td><td>Map inputs directly to known target outputs</td><td>Discover latent structures, clusters & associations</td></tr>
            <tr><td><strong>Common Algorithms</strong></td><td>Linear Regression, Logistic Regression, Random Forest, SVM</td><td>K-Means, Hierarchical Clustering, PCA, DBSCAN</td></tr>
            <tr><td><strong>Evaluation</strong></td><td>Direct (Accuracy, F1-Score, MAE, $R^2$)</td><td>Indirect (Inertia, Silhouette Coefficient)</td></tr>
          </tbody>
        </table>
      </div>

      <ul class="takeaway-list">
        <li>Supervised learning requires costly human data labeling but delivers highly specific predictive power.</li>
        <li>Unsupervised learning finds hidden groupings without human intervention, ideal for exploratory data analysis.</li>
      </ul>
    `
  },
  {
    id: "lesson_3",
    num: "Lesson 3",
    title: "Classification vs Regression",
    summary: "Learn how to choose between predicting categorical labels and estimating continuous numeric values.",
    content: `
      <h4>1. The Two Main Supervised Learning Problems</h4>
      <p>Whenever you have labelled data, the nature of the target variable ($y$) determines whether your task is Classification or Regression.</p>

      <h4>2. Classification: Predicting Discrete Categories</h4>
      <p>In classification, the output is a qualitative, categorical class label. The model calculates decision boundaries to separate classes.</p>
      <ul>
        <li><strong>Binary Classification:</strong> Exactly two possible classes (e.g., Spam vs Not Spam; Malignant vs Benign tumor; Customer Churn vs Retain).</li>
        <li><strong>Multi-Class Classification:</strong> Three or more mutually exclusive classes (e.g., Iris Setosa vs Versicolor vs Virginica; Handwritten digits 0 through 9).</li>
      </ul>

      <h4>3. Regression: Predicting Continuous Quantities</h4>
      <p>In regression, the target output is a quantitative, continuous numerical value along a continuum. There are infinitely many possible numbers.</p>
      <ul>
        <li>Predicting house prices based on square footage and location ($250,000 to $850,000+).</li>
        <li>Predicting tomorrow's temperature in Celsius.</li>
        <li>Forecasting stock prices, website traffic, or battery life.</li>
      </ul>

      <div class="analogy-box">
        <div class="analogy-header">💡 Real-World Analogy: Medical Checkup</div>
        <p><strong>Classification:</strong> The doctor reviews a blood test and decides whether the patient has Diabetes or Does NOT have Diabetes (Yes / No category).<br><br>
        <strong>Regression:</strong> The lab technician measures the patient's exact Blood Glucose Level in mg/dL (e.g., 128.4 mg/dL - a continuous numeric value).</p>
      </div>

      <h4>4. Key Takeaways</h4>
      <ul class="takeaway-list">
        <li>Ask yourself: <em>"Is the target a category or a measurement?"</em> If category ➔ Classification. If measurement ➔ Regression.</li>
        <li>Classification uses metrics like Accuracy, Precision, Recall, and Confusion Matrix.</li>
        <li>Regression uses metrics like Mean Absolute Error (MAE), Mean Squared Error (MSE), and $R^2$ Score.</li>
      </ul>
    `
  },
  {
    id: "lesson_4",
    num: "Lesson 4",
    title: "Training, Testing, Overfitting and Underfitting",
    summary: "Master the crucial concept of generalization, the bias-variance tradeoff, and why memorizing training data fails.",
    content: `
      <h4>1. The Train / Test Split</h4>
      <p>A machine learning model must be evaluated on <strong>unseen data</strong> to measure its real-world generalization capability. We typically split our dataset into:</p>
      <ul>
        <li><strong>Training Set (70% - 80%):</strong> Used by the algorithm to optimize its internal parameters and weights.</li>
        <li><strong>Testing Set (20% - 30%):</strong> Kept strictly sequestered until after training to evaluate how well the model performs on fresh observations.</li>
      </ul>

      <h4>2. Overfitting (High Variance)</h4>
      <p>Overfitting occurs when a model is excessively complex (e.g., a deep decision tree with 20 levels or a 15th-degree polynomial). The model doesn't just learn true underlying patterns—it memorizes random noise, anomalies, and idiosyncrasies in the training set.</p>
      <p><strong>Symptoms:</strong> Near 100% training accuracy, but abysmal testing accuracy.</p>

      <h4>3. Underfitting (High Bias)</h4>
      <p>Underfitting occurs when a model is overly simplistic (e.g., fitting a straight line to highly curved non-linear data). The model lacks the capacity to capture the true underlying data relationships.</p>
      <p><strong>Symptoms:</strong> Poor performance on both training and testing datasets.</p>

      <div class="analogy-box">
        <div class="analogy-header">💡 Real-World Analogy: Preparing for a Final Exam</div>
        <p><strong>Underfitting (The Slacker):</strong> A student only glances at chapter titles and skips practice problems. They fail the practice test and fail the final exam.<br><br>
        <strong>Overfitting (The Rote Memorizer):</strong> A student memorizes the exact multiple-choice answers of past exam questions ("Question 3 is C"). They score 100% on past exams, but when the professor slightly alters the numbers on the final exam, they fail miserably.<br><br>
        <strong>Optimal Generalization (The Conceptual Learner):</strong> The student learns the core concepts and principles. They score 90% on homework and successfully solve brand new questions on the final exam.</p>
      </div>

      <h4>4. How to Prevent Overfitting</h4>
      <ul class="takeaway-list">
        <li>Use <strong>Regularization</strong> (e.g., Ridge / Lasso regression, weight decay).</li>
        <li>Prune decision trees (limit <code>max_depth</code>, require minimum samples per leaf).</li>
        <li>Collect more diverse training data.</li>
        <li>Apply <strong>K-Fold Cross-Validation</strong> to ensure consistent performance across multiple data splits.</li>
      </ul>
    `
  },
  {
    id: "lesson_5",
    num: "Lesson 5",
    title: "Model Evaluation Metrics",
    summary: "Go beyond simple accuracy. Understand Precision, Recall, F1-Score, and why accuracy alone is dangerous.",
    content: `
      <h4>1. The Confusion Matrix</h4>
      <p>A Confusion Matrix is a tabular layout summarizing the prediction outcomes of a classification model across actual vs predicted classes:</p>
      <ul>
        <li><strong>True Positive (TP):</strong> Model predicted positive, and reality was positive (e.g., sick patient correctly diagnosed).</li>
        <li><strong>True Negative (TN):</strong> Model predicted negative, and reality was negative (e.g., healthy patient declared healthy).</li>
        <li><strong>False Positive (FP - Type I Error):</strong> Model sounded a false alarm (e.g., healthy patient incorrectly diagnosed as sick).</li>
        <li><strong>False Negative (FN - Type II Error):</strong> Model missed the target (e.g., sick patient incorrectly diagnosed as healthy).</li>
      </ul>

      <h4>2. Essential Classification Metrics</h4>
      <div class="grid-2">
        <div class="card" style="margin-bottom: 0;">
          <h5>Precision</h5>
          <p><code>TP / (TP + FP)</code></p>
          <small>Out of all samples predicted positive, what fraction was actually positive? Crucial when False Positives are costly (e.g., spam filter sending crucial job offers to junk).</small>
        </div>
        <div class="card" style="margin-bottom: 0;">
          <h5>Recall (Sensitivity)</h5>
          <p><code>TP / (TP + FN)</code></p>
          <small>Out of all actual positive cases in reality, how many did the model find? Crucial when False Negatives are catastrophic (e.g., missing malignant cancer).</small>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem;">
        <h5>F1-Score: The Harmonic Mean</h5>
        <p><code>F1 = 2 * (Precision * Recall) / (Precision + Recall)</code></p>
        <small>The F1-Score strikes a mathematical balance between Precision and Recall. Unlike an arithmetic mean, the harmonic mean penalizes models that sacrifice one metric to inflate the other.</small>
      </div>

      <div class="analogy-box">
        <div class="analogy-header">💡 Why Accuracy Alone Fails: The Airport Security Scanner</div>
        <p>Suppose 1 out of every 10,000 passengers at an airport carries a prohibited item. If an airport scanner is completely broken and simply beeps "SAFE" for every single passenger, it will achieve <strong>99.99% accuracy</strong>! However, its Recall is 0%, and it allows 100% of contraband through. Relying purely on accuracy in imbalanced datasets is fatal.</p>
      </div>

      <h4>3. Key Takeaways</h4>
      <ul class="takeaway-list">
        <li>Always inspect the Confusion Matrix before trusting an overall accuracy percentage.</li>
        <li>Choose your optimization metric based on real-world cost: Prioritize Recall when missing positives is dangerous; prioritize Precision when false alarms are costly.</li>
      </ul>
    `
  },
  {
    id: "lesson_6",
    num: "Lesson 6",
    title: "Real-World Applications and Responsible AI",
    summary: "Discover real-world ML use cases and examine ethical considerations including bias, privacy, and algorithmic fairness.",
    content: `
      <h4>1. Real-World Applications of Machine Learning</h4>
      <div class="grid-3" style="margin: 1rem 0;">
        <div class="card" style="margin-bottom: 0;">
          <h5>🏥 Healthcare & Diagnostics</h5>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Early diabetic retinopathy detection, automated tumor segmentation on MRI scans, and personalized drug discovery.</p>
        </div>
        <div class="card" style="margin-bottom: 0;">
          <h5>💳 Finance & Fraud</h5>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Real-time credit card fraud detection analyzing millions of transactions per second to block unauthorized charges.</p>
        </div>
        <div class="card" style="margin-bottom: 0;">
          <h5>🚗 Autonomous Systems</h5>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Computer vision object detection, lane tracking, and collision avoidance algorithms in modern electric vehicles.</p>
        </div>
      </div>

      <h4>2. The Four Pillars of Responsible AI</h4>
      <ul>
        <li><strong>1. Data Bias & Fairness:</strong> Machine learning algorithms mirror whatever historical prejudices and sampling disparities exist in their training data. If historical loan approval data favored certain zip codes or demographics, an algorithm will perpetuate and amplify that discrimination.</li>
        <li><strong>2. Privacy & Data Governance:</strong> Protecting sensitive personal identifiable information (PII). Compliance with regulations like GDPR and HIPAA, and ensuring models do not leak private training records.</li>
        <li><strong>3. Transparency & Explainability:</strong> In high-stakes domains (sentencing, mortgage lending, medical surgery), a "black-box" prediction is legally and morally unacceptable. Stakeholders must understand <em>why</em> a decision was made.</li>
        <li><strong>4. Safety & Robustness:</strong> Ensuring models do not fail catastrophically when presented with adversarial inputs or out-of-distribution real-world shifts.</li>
      </ul>

      <div class="analogy-box">
        <div class="analogy-header">💡 Real-World Case Study: The Biased Hiring Tool</div>
        <p>In 2018, a major tech corporation discovered that its automated résumé-screening AI penalized résumés containing the word "women's" (such as "women's chess club captain"). Because the model was trained on 10 years of predominantly male historical hiring records, it learned to favor male candidate phrasing. The company terminated the tool, highlighting why rigorous algorithmic auditing is mandatory.</p>
      </div>

      <h4>3. Key Takeaways</h4>
      <ul class="takeaway-list">
        <li>Machine Learning models are only as good and ethical as the data used to train them.</li>
        <li>Engineers bear personal responsibility for auditing training data for historical bias and demographic underrepresentation.</li>
      </ul>
    `
  }
];

const LessonsModule = {
  activeLessonId: "lesson_1",
  completedLessons: new Set(),

  init() {
    this.renderTabs();
    this.renderActiveLesson();
    this.syncCompletedStatus();
  },

  renderTabs() {
    const tabsContainer = document.getElementById('lessons-tabs-container');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';
    LESSONS_DATA.forEach((lesson, index) => {
      const btn = document.createElement('button');
      btn.className = `lesson-tab-btn ${lesson.id === this.activeLessonId ? 'active' : ''} ${this.completedLessons.has(lesson.id) ? 'completed-tab' : ''}`;
      btn.id = `tab-btn-${lesson.id}`;
      btn.innerHTML = `<span>${index + 1}.</span> <span>${lesson.title}</span>`;
      btn.addEventListener('click', () => {
        this.activeLessonId = lesson.id;
        this.renderTabs();
        this.renderActiveLesson();
      });
      tabsContainer.appendChild(btn);
    });
  },

  renderActiveLesson() {
    const contentArea = document.getElementById('lesson-detail-container');
    if (!contentArea) return;

    const lesson = LESSONS_DATA.find(l => l.id === this.activeLessonId) || LESSONS_DATA[0];
    const isCompleted = this.completedLessons.has(lesson.id);

    contentArea.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <span class="badge-pill" style="margin-bottom: 0.4rem;">${lesson.num}</span>
            <h2 class="card-title" style="font-size: 1.5rem; margin-top: 0.2rem;">${lesson.title}</h2>
            <p class="card-subtitle">${lesson.summary}</p>
          </div>
          <button id="toggle-complete-btn" class="btn ${isCompleted ? 'btn-success' : 'btn-primary'}">
            ${isCompleted ? '✔ Lesson Completed' : 'Mark as Completed'}
          </button>
        </div>
        <div class="lesson-content-body" style="font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">
          ${lesson.content}
        </div>
        <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
          <button id="prev-lesson-btn" class="btn btn-secondary btn-sm">⬅ Previous Lesson</button>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Lesson ${LESSONS_DATA.findIndex(l => l.id === lesson.id) + 1} of ${LESSONS_DATA.length}</span>
          <button id="next-lesson-btn" class="btn btn-secondary btn-sm">Next Lesson ➡</button>
        </div>
      </div>
    `;

    // Hook buttons
    document.getElementById('toggle-complete-btn').addEventListener('click', () => {
      this.toggleCompletion(lesson.id);
    });

    const currIdx = LESSONS_DATA.findIndex(l => l.id === lesson.id);
    const prevBtn = document.getElementById('prev-lesson-btn');
    const nextBtn = document.getElementById('next-lesson-btn');

    if (currIdx === 0) prevBtn.disabled = true;
    else {
      prevBtn.onclick = () => {
        this.activeLessonId = LESSONS_DATA[currIdx - 1].id;
        this.renderTabs();
        this.renderActiveLesson();
      };
    }

    if (currIdx === LESSONS_DATA.length - 1) nextBtn.disabled = true;
    else {
      nextBtn.onclick = () => {
        this.activeLessonId = LESSONS_DATA[currIdx + 1].id;
        this.renderTabs();
        this.renderActiveLesson();
      };
    }
  },

  async toggleCompletion(lessonId) {
    try {
      const response = await fetch('/api/lessons/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId })
      });
      const data = await response.json();
      if (data.success) {
        if (data.lesson.completed) {
          this.completedLessons.add(lessonId);
          window.showToast("Lesson marked as completed! Great progress.", "success");
        } else {
          this.completedLessons.delete(lessonId);
          window.showToast("Lesson marked as incomplete.", "info");
        }
        this.renderTabs();
        this.renderActiveLesson();

        // Update dashboard stats
        if (window.ProgressModule) {
          window.ProgressModule.syncProgressUI(data.overall);
        }
      }
    } catch (e) {
      console.error("Error toggling lesson:", e);
      window.showToast("Failed to update lesson status.", "error");
    }
  },

  async syncCompletedStatus() {
    try {
      const response = await fetch('/api/progress');
      const data = await response.json();
      if (data.success && data.data && data.data.lessons) {
        this.completedLessons.clear();
        data.data.lessons.forEach(l => {
          if (l.completed) this.completedLessons.add(l.id);
        });
        this.renderTabs();
        this.renderActiveLesson();
      }
    } catch (e) {
      console.error("Could not sync lesson completions:", e);
    }
  }
};

window.LessonsModule = LessonsModule;

