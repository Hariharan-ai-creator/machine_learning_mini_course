"""
app.py - Main Flask Application Server for ML Made Easy
Handles routing, API endpoints for interactive modules, predictions, quiz evaluation, and report downloads.
"""

import os
import io
from flask import Flask, render_template, request, jsonify, send_file, Response
import database
import ml_engine

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ml-made-easy-capstone-secret-key-2026'

# Initialize SQLite database
database.init_db()

# 15 Comprehensive Multiple Choice Questions for Module 7
QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "What is the fundamental difference between Traditional Programming and Machine Learning?",
        "options": [
            "Traditional programming requires electricity; ML runs on paper.",
            "Traditional programming takes Rules + Data to produce Answers; ML takes Data + Answers to learn Rules.",
            "ML never uses code or computers.",
            "Traditional programming is only for games; ML is only for mathematics."
        ],
        "correct_index": 1,
        "explanation": "In traditional software engineering, humans hand-code deterministic logic/rules. In Machine Learning, algorithms infer patterns and mathematical rules directly from historical data and observed outcomes."
    },
    {
        "id": 2,
        "question": "In Supervised Learning, what does 'labelled data' mean?",
        "options": [
            "Data that has physical adhesive labels on the storage drive.",
            "Each input sample is paired with a known, verified target outcome or ground-truth answer.",
            "Data that is encrypted with an SSL certificate.",
            "Data that contains only text strings without numbers."
        ],
        "correct_index": 1,
        "explanation": "Labelled data contains both feature inputs (X) and verified ground-truth targets (y), allowing the algorithm to measure its prediction error and adjust its parameters."
    },
    {
        "id": 3,
        "question": "Which of the following is an example of an Unsupervised Learning task?",
        "options": [
            "Customer Segmentation using K-Means Clustering based on purchasing behavior.",
            "Predicting tomorrow's temperature in degrees Celsius.",
            "Classifying an email as Spam or Ham based on historical spam marks.",
            "Recognizing handwritten digits from labelled MNIST images."
        ],
        "correct_index": 0,
        "explanation": "Customer segmentation finds natural groupings within data without predefined target labels, which is the hallmark of unsupervised learning."
    },
    {
        "id": 4,
        "question": "How does Classification fundamentally differ from Regression?",
        "options": [
            "Classification predicts discrete categorical labels; Regression predicts continuous numerical values.",
            "Classification is fast; Regression is slow.",
            "Classification is unsupervised; Regression is supervised.",
            "Classification is only for flowers; Regression is only for houses."
        ],
        "correct_index": 0,
        "explanation": "Classification answers 'which category or class?' (e.g. Setosa vs Versicolor). Regression answers 'how much or what quantity?' (e.g. $320,000 house price)."
    },
    {
        "id": 5,
        "question": "Why do data scientists split datasets into Training and Testing sets?",
        "options": [
            "To save hard drive storage space.",
            "To train the model on one portion and evaluate its true generalization ability on unseen data.",
            "Because Python libraries cannot process more than 100 rows at once.",
            "To duplicate rows as a data backup measure."
        ],
        "correct_index": 1,
        "explanation": "Evaluating a model on the same data it learned from causes overly optimistic estimates. Testing on unseen data measures real-world generalization."
    },
    {
        "id": 6,
        "question": "What is 'Overfitting' in Machine Learning?",
        "options": [
            "The model memorizes training data (including random noise) and performs poorly on unseen test data.",
            "The computer running the model runs out of system memory (RAM).",
            "The model is too simple to capture even basic patterns in the training data.",
            "Training a model for fewer than 5 seconds."
        ],
        "correct_index": 0,
        "explanation": "Overfitting happens when model complexity is too high, fitting noise and idiosyncrasies of the training set, causing high variance and poor generalization."
    },
    {
        "id": 7,
        "question": "What is 'Underfitting'?",
        "options": [
            "When a model achieves 100% accuracy on every dataset.",
            "When a model is too simplistic to capture the underlying relationships in the data (High Bias).",
            "When a dataset contains too many informative columns.",
            "When using a GPU instead of a standard CPU."
        ],
        "correct_index": 1,
        "explanation": "Underfitting occurs when an algorithm lacks the capacity or parameters to learn the underlying pattern, resulting in high error on both training and test data."
    },
    {
        "id": 8,
        "question": "In a Confusion Matrix, what does a 'False Positive' (Type I error) represent?",
        "options": [
            "An actual Negative sample that was incorrectly predicted as Positive by the model.",
            "An actual Positive sample that was correctly predicted as Positive.",
            "An actual Negative sample that was correctly predicted as Negative.",
            "An error where the model crashes during prediction."
        ],
        "correct_index": 0,
        "explanation": "A False Positive occurs when the model sounds a false alarm, predicting positive when the reality is negative (e.g., flagging an important legitimate email as Spam)."
    },
    {
        "id": 9,
        "question": "What does the 'Precision' evaluation metric measure?",
        "options": [
            "Out of all samples predicted as Positive, what fraction was truly Positive?",
            "Out of all actual Positive cases, how many did the model successfully find?",
            "The speed of model prediction in milliseconds.",
            "The byte size of the model parameters."
        ],
        "correct_index": 0,
        "explanation": "Precision = TP / (TP + FP). It measures the reliability of positive declarations (i.e. 'When the model says it's positive, how often is it right?')."
    },
    {
        "id": 10,
        "question": "What does the 'Recall' (Sensitivity) evaluation metric measure?",
        "options": [
            "Out of all actual positive cases in reality, what fraction was captured by the model?",
            "How quickly the algorithm retrieves values from database tables.",
            "The percentage of negative cases predicted correctly.",
            "The total number of columns in the training dataset."
        ],
        "correct_index": 0,
        "explanation": "Recall = TP / (TP + FN). It measures completeness (i.e. 'Did the model miss any actual positive cases?'), which is crucial in cancer diagnosis or fraud detection."
    },
    {
        "id": 11,
        "question": "Why is Accuracy often misleading on Imbalanced Datasets?",
        "options": [
            "A naive model can simply predict the majority class 100% of the time and score high accuracy while failing completely on the minority class.",
            "Because mathematical division is inaccurate on computers.",
            "Because accuracy only applies to regression problems.",
            "Because Scikit-learn forbids accuracy on imbalanced datasets."
        ],
        "correct_index": 0,
        "explanation": "If 99% of patients are healthy and 1% have a disease, predicting 'Healthy' for everyone yields 99% accuracy but 0% recall on the disease, rendering the model useless."
    },
    {
        "id": 12,
        "question": "What is the F1-Score?",
        "options": [
            "The maximum speed reached during a model training loop.",
            "The harmonic mean of Precision and Recall, providing a balanced single metric.",
            "The sum of Training Accuracy and Testing Loss.",
            "The ratio of dataset rows to columns."
        ],
        "correct_index": 1,
        "explanation": "F1 = 2 * (Precision * Recall) / (Precision + Recall). The harmonic mean penalizes extreme imbalances between precision and recall."
    },
    {
        "id": 13,
        "question": "In Regression analysis, what does the R² (Coefficient of Determination) indicate?",
        "options": [
            "The proportion of variance in the target variable that is predictable from the input features.",
            "The radius of a circle squared.",
            "The total runtime of linear regression in minutes.",
            "The maximum possible house price."
        ],
        "correct_index": 0,
        "explanation": "R² ranges up to 1.0 (or 100%). An R² of 0.80 means 80% of the variance in the outcome is explained by the model's independent variables."
    },
    {
        "id": 14,
        "question": "In K-Means Clustering, what does the hyperparameter 'k' represent?",
        "options": [
            "The number of clusters (centroids) the algorithm should partition data points into.",
            "The number of CPU threads to allocate.",
            "The learning rate of the gradient descent optimizer.",
            "The number of rows in the CSV file."
        ],
        "correct_index": 0,
        "explanation": "'k' is the user-specified number of cluster centers (centroids) around which data points are grouped by minimizing Euclidean distances."
    },
    {
        "id": 15,
        "question": "What is 'Data Leakage' in machine learning pipelines?",
        "options": [
            "When information from outside the training dataset (such as target labels or test set distributions) inadvertently influences model training.",
            "When liquid spills onto a physical server rack.",
            "When open-source code is shared on GitHub.",
            "When a CSV file is opened in Microsoft Excel."
        ],
        "correct_index": 0,
        "explanation": "Data leakage creates artificially inflated, unrealistic performance scores during development that collapse immediately when deployed on genuine new data."
    }
]

# =====================================================================
# PAGE ROUTES
# =====================================================================

@app.route('/')
def home():
    """Render the main single-page application dashboard."""
    return render_template('index.html')

# =====================================================================
# API: PROGRESS TRACKER (MODULE 11) & DASHBOARD (MODULE 1)
# =====================================================================

@app.route('/api/progress', methods=['GET'])
def get_progress():
    """Retrieve learner progress, completed lessons, quiz statistics, and current rank."""
    try:
        progress = database.get_overall_progress()
        return jsonify({'success': True, 'data': progress})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/lessons/toggle', methods=['POST'])
def toggle_lesson():
    """Mark a lesson completed or uncompleted."""
    data = request.get_json() or {}
    lesson_id = data.get('lesson_id')
    completed = data.get('completed')

    if not lesson_id:
        return jsonify({'success': False, 'error': 'lesson_id is required'}), 400

    try:
        result = database.toggle_lesson(lesson_id, completed)
        progress = database.get_overall_progress()
        return jsonify({'success': True, 'lesson': result, 'overall': progress})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/progress/reset', methods=['POST'])
def reset_progress():
    """Reset all learner progress, quiz attempts, and model history."""
    try:
        res = database.reset_progress()
        progress = database.get_overall_progress()
        return jsonify({'success': True, 'message': res['message'], 'overall': progress})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# =====================================================================
# API: INTERACTIVE DEMONSTRATIONS (MODULE 3)
# =====================================================================

@app.route('/api/demo/supervised', methods=['GET'])
def demo_supervised():
    """Return supervised classification demonstration points and decision boundary."""
    try:
        result = ml_engine.run_supervised_demo()
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/demo/kmeans', methods=['GET'])
def demo_kmeans():
    """Run K-Means clustering with user-specified k (2 to 5)."""
    k = request.args.get('k', default=3, type=int)
    try:
        result = ml_engine.run_kmeans_demo(k)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/demo/overfitting', methods=['GET'])
def demo_overfitting():
    """Return model depth vs training/test errors demonstrating overfitting."""
    try:
        result = ml_engine.run_overfitting_demo()
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# =====================================================================
# API: IRIS CLASSIFICATION (MODULE 4)
# =====================================================================

@app.route('/api/iris/info', methods=['GET'])
def iris_info():
    """Return Iris dataset overview, stats, and sample records."""
    try:
        info = ml_engine.get_iris_info()
        return jsonify({'success': True, 'data': info})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/iris/train', methods=['POST'])
def iris_train():
    """Train an Iris classification model and record metrics."""
    data = request.get_json() or {}
    algorithm = data.get('algorithm', 'Random Forest')
    test_size = float(data.get('test_size', 0.2))

    # Validate test_size
    test_size = max(0.1, min(0.5, test_size))

    try:
        metrics = ml_engine.train_iris_model(algorithm=algorithm, test_size=test_size)
        database.record_model_run('Iris Flower Dataset', algorithm, test_size, metrics)
        return jsonify({'success': True, 'data': metrics})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/iris/predict', methods=['POST'])
def iris_predict():
    """Predict species from sepal/petal measurements."""
    data = request.get_json() or {}

    try:
        sl = float(data.get('sepal_length', 5.1))
        sw = float(data.get('sepal_width', 3.5))
        pl = float(data.get('petal_length', 1.4))
        pw = float(data.get('petal_width', 0.2))

        # Basic range sanity checks
        if not (3.0 <= sl <= 9.0 and 1.5 <= sw <= 5.5 and 0.5 <= pl <= 8.0 and 0.05 <= pw <= 3.5):
            return jsonify({'success': False, 'error': 'Measurements outside realistic botanical range (Sepal L: 3-9cm, Sepal W: 1.5-5.5cm, Petal L: 0.5-8cm, Petal W: 0.05-3.5cm).'}), 400

        prediction = ml_engine.predict_iris(sl, sw, pl, pw)
        return jsonify({'success': True, 'data': prediction})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# =====================================================================
# API: HOUSE PRICE PREDICTION (MODULE 5)
# =====================================================================

@app.route('/api/housing/info', methods=['GET'])
def housing_info():
    """Return Housing dataset overview, stats, and sample records."""
    try:
        info = ml_engine.get_housing_info()
        return jsonify({'success': True, 'data': info})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/housing/train', methods=['POST'])
def housing_train():
    """Train a Housing regression model and record metrics."""
    data = request.get_json() or {}
    algorithm = data.get('algorithm', 'Random Forest Regressor')
    test_size = float(data.get('test_size', 0.2))

    # Validate test_size
    test_size = max(0.1, min(0.5, test_size))

    try:
        metrics = ml_engine.train_housing_model(algorithm=algorithm, test_size=test_size)
        database.record_model_run('Housing Price Dataset', algorithm, test_size, metrics)
        return jsonify({'success': True, 'data': metrics})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/housing/predict', methods=['POST'])
def housing_predict():
    """Predict house price from physical and neighborhood features."""
    data = request.get_json() or {}

    try:
        avg_income = float(data.get('avg_income', 65000))
        house_age = float(data.get('house_age', 10))
        rooms = float(data.get('rooms', 6))
        bedrooms = float(data.get('bedrooms', 3))
        population = float(data.get('population', 30000))

        # Basic range sanity checks
        if not (15000 <= avg_income <= 200000 and 1 <= house_age <= 100 and 2 <= rooms <= 15 and 1 <= bedrooms <= 10 and 2000 <= population <= 150000):
            return jsonify({'success': False, 'error': 'Input values outside realistic housing bounds.'}), 400

        prediction = ml_engine.predict_house_price(avg_income, house_age, rooms, bedrooms, population)
        return jsonify({'success': True, 'data': prediction})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# =====================================================================
# API: QUIZ SYSTEM (MODULE 7)
# =====================================================================

@app.route('/api/quiz/questions', methods=['GET'])
def get_quiz_questions():
    """Return the 15 quiz questions without revealing correct answer keys."""
    client_questions = []
    for q in QUIZ_QUESTIONS:
        client_questions.append({
            'id': q['id'],
            'question': q['question'],
            'options': q['options']
        })
    return jsonify({'success': True, 'questions': client_questions})

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """
    Score submitted quiz answers against master answer keys.
    Computes score, percentage, feedback, stores in database, and returns review.
    """
    data = request.get_json() or {}
    user_answers = data.get('answers', {})  # Map of question_id (str or int) -> selected_option_index

    total = len(QUIZ_QUESTIONS)
    correct_count = 0
    detailed_review = []

    for q in QUIZ_QUESTIONS:
        qid = q['id']
        user_choice = user_answers.get(str(qid))
        if user_choice is None:
            user_choice = user_answers.get(qid)

        is_correct = False
        user_choice_int = None
        if user_choice is not None:
            try:
                user_choice_int = int(user_choice)
                if user_choice_int == q['correct_index']:
                    is_correct = True
                    correct_count += 1
            except ValueError:
                pass

        detailed_review.append({
            'id': qid,
            'question': q['question'],
            'options': q['options'],
            'user_choice': user_choice_int,
            'correct_index': q['correct_index'],
            'is_correct': is_correct,
            'explanation': q['explanation']
        })

    pct = round((correct_count / total) * 100, 1)

    # Determine grade & feedback
    if pct >= 90:
        grade = "A+ (Outstanding)"
        feedback = "Exceptional mastery! You possess a rock-solid grasp of foundational machine learning concepts."
    elif pct >= 80:
        grade = "A (Excellent)"
        feedback = "Great job! You understand core supervised, unsupervised, and evaluation mechanics thoroughly."
    elif pct >= 70:
        grade = "B (Good)"
        feedback = "Solid effort! Review the detailed question explanations below to tighten up any minor confusion."
    elif pct >= 50:
        grade = "C (Satisfactory)"
        feedback = "Decent attempt! Revisit the interactive lessons and visual guides to reinforce key concepts."
    else:
        grade = "Needs Improvement"
        feedback = "Don't worry! Explore the 6 interactive lessons and visual confusion matrix guide, then retry the quiz."

    # Record in SQLite database
    attempt_id = database.record_quiz_attempt(correct_count, total, pct, grade, feedback)

    progress = database.get_overall_progress()

    return jsonify({
        'success': True,
        'attempt_id': attempt_id,
        'score': correct_count,
        'total': total,
        'percentage': pct,
        'grade': grade,
        'feedback': feedback,
        'review': detailed_review,
        'progress': progress
    })

# =====================================================================
# API: AUTOMATED REPORT VIEW & DOWNLOAD (MODULE 8)
# =====================================================================

@app.route('/api/report/view/<module_type>', methods=['GET'])
def view_report(module_type):
    """Return generated model evaluation report as formatted text."""
    try:
        report_text = ml_engine.get_latest_report(module_type)
        return jsonify({'success': True, 'report': report_text})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/report/download/<module_type>', methods=['GET'])
def download_report(module_type):
    """Download the model evaluation report as a clean text file."""
    try:
        report_text = ml_engine.get_latest_report(module_type)
        filename = f"{module_type}_model_evaluation_report.txt"
        return Response(
            report_text,
            mimetype="text/plain",
            headers={"Content-Disposition": f"attachment;filename={filename}"}
        )
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# =====================================================================
# API: CAPSTONE PROJECT REPORT DOWNLOAD (MODULE 12)
# =====================================================================

@app.route('/api/capstone-report/download', methods=['GET'])
def download_capstone_report():
    """Generate and download the full academic Capstone Project Report."""
    report_path = os.path.join(BASE_DIR, 'CAPSTONE_PROJECT_REPORT.md')
    if os.path.exists(report_path):
        with open(report_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return Response(
            content,
            mimetype="text/markdown",
            headers={"Content-Disposition": "attachment;filename=ML_Made_Easy_Capstone_Project_Report.md"}
        )
    return jsonify({'success': False, 'error': 'Capstone report file not found'}), 404

# =====================================================================
# MAIN ENTRY POINT
# =====================================================================

if __name__ == '__main__':
    print("=" * 65)
    print("  ML MADE EASY - CAPSTONE 15 WEB APPLICATION")
    print("  Accessible locally at: http://127.0.0.1:5000")
    print("=" * 65)
    app.run(host='127.0.0.1', port=5000, debug=True)
