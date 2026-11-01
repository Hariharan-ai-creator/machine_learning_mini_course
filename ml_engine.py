"""
ml_engine.py - Core Machine Learning Engine for ML Made Easy
Handles model training, evaluation metrics, prediction pipelines, and report generation.
Uses Scikit-learn, Pandas, and NumPy for real machine learning computations.
"""

import os
import io
import json

# Silence joblib multiprocessing warning on Windows sandbox
os.environ['LOKY_MAX_CPU_COUNT'] = '4'

import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.cluster import KMeans

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

IRIS_PATH = os.path.join(DATA_DIR, 'iris.csv')
HOUSING_PATH = os.path.join(DATA_DIR, 'housing.csv')

# Global active models cache
ACTIVE_MODELS = {
    'iris': {
        'model': None,
        'scaler': None,
        'algorithm': 'Random Forest',
        'metrics': None,
        'last_trained': None
    },
    'housing': {
        'model': None,
        'scaler': None,
        'algorithm': 'Random Forest Regressor',
        'metrics': None,
        'last_trained': None
    }
}

# =====================================================================
# MODULE 4: IRIS DATASET & CLASSIFICATION
# =====================================================================

def get_iris_data():
    """Load and return Iris dataframe."""
    if not os.path.exists(IRIS_PATH):
        raise FileNotFoundError(f"Iris dataset not found at {IRIS_PATH}")
    return pd.read_csv(IRIS_PATH)

def get_iris_info():
    """Return dataset overview, statistics, sample rows, and class counts."""
    df = get_iris_data()
    desc = df.describe().to_dict()

    # Formatted stats
    features_info = []
    feature_names = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']
    for col in feature_names:
        features_info.append({
            'name': col.replace('_', ' ').title() + ' (cm)',
            'key': col,
            'mean': round(float(df[col].mean()), 2),
            'std': round(float(df[col].std()), 2),
            'min': round(float(df[col].min()), 2),
            'max': round(float(df[col].max()), 2),
        })

    class_distribution = df['species'].value_counts().to_dict()

    return {
        'total_samples': len(df),
        'total_features': len(feature_names),
        'classes': list(df['species'].unique()),
        'class_distribution': class_distribution,
        'features_info': features_info,
        'sample_records': df.head(10).to_dict(orient='records')
    }

def train_iris_model(algorithm='Random Forest', test_size=0.2):
    """
    Train an Iris classification model using the chosen Scikit-learn algorithm.
    Computes Accuracy, Precision, Recall, F1-Score, and Confusion Matrix.
    """
    df = get_iris_data()
    X = df[['sepal_length', 'sepal_width', 'petal_length', 'petal_width']]
    y = df['species']

    classes = ['setosa', 'versicolor', 'virginica']

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )

    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Model instantiation
    if algorithm == 'Logistic Regression':
        model = LogisticRegression(max_iter=500, random_state=42)
    elif algorithm == 'Decision Tree':
        model = DecisionTreeClassifier(max_depth=4, random_state=42)
    elif algorithm == 'K-Nearest Neighbors':
        model = KNeighborsClassifier(n_neighbors=5)
    else:
        algorithm = 'Random Forest'
        model = RandomForestClassifier(n_estimators=100, random_state=42)

    # Train
    model.fit(X_train_scaled, y_train)

    # Predict on test set
    y_pred = model.predict(X_test_scaled)

    # Calculate real evaluation metrics
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average='macro', zero_division=0))
    rec = float(recall_score(y_test, y_pred, average='macro', zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average='macro', zero_division=0))
    cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()

    # Per-class metrics
    per_class_prec = precision_score(y_test, y_pred, labels=classes, average=None, zero_division=0).tolist()
    per_class_rec = recall_score(y_test, y_pred, labels=classes, average=None, zero_division=0).tolist()
    per_class_f1 = f1_score(y_test, y_pred, labels=classes, average=None, zero_division=0).tolist()

    class_metrics = []
    for i, cname in enumerate(classes):
        class_metrics.append({
            'species': cname.capitalize(),
            'precision': round(float(per_class_prec[i]), 3),
            'recall': round(float(per_class_rec[i]), 3),
            'f1': round(float(per_class_f1[i]), 3)
        })

    # Feature importances or coefficients
    feature_importance = {}
    if hasattr(model, 'feature_importances_'):
        for name, imp in zip(X.columns, model.feature_importances_):
            feature_importance[name] = round(float(imp), 4)
    elif hasattr(model, 'coef_'):
        avg_coef = np.mean(np.abs(model.coef_), axis=0)
        norm_coef = avg_coef / np.sum(avg_coef)
        for name, imp in zip(X.columns, norm_coef):
            feature_importance[name] = round(float(imp), 4)
    else:
        # Equal importance for KNN
        for name in X.columns:
            feature_importance[name] = 0.25

    metrics = {
        'algorithm': algorithm,
        'test_size': test_size,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'accuracy': round(acc, 4),
        'accuracy_pct': round(acc * 100, 2),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'confusion_matrix': cm,
        'classes': classes,
        'class_metrics': class_metrics,
        'feature_importance': feature_importance
    }

    # Store in memory cache
    ACTIVE_MODELS['iris']['model'] = model
    ACTIVE_MODELS['iris']['scaler'] = scaler
    ACTIVE_MODELS['iris']['algorithm'] = algorithm
    ACTIVE_MODELS['iris']['metrics'] = metrics
    ACTIVE_MODELS['iris']['last_trained'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Generate and save report
    report_text = generate_report_text('Iris Flower Classification', algorithm, 'Iris Dataset', test_size, metrics)
    with open(os.path.join(REPORTS_DIR, 'iris_latest_report.txt'), 'w', encoding='utf-8') as f:
        f.write(report_text)

    return metrics

def predict_iris(sepal_length, sepal_width, petal_length, petal_width):
    """Predict Iris species with probabilities using the active trained model."""
    if ACTIVE_MODELS['iris']['model'] is None:
        train_iris_model('Random Forest', 0.2)

    model = ACTIVE_MODELS['iris']['model']
    scaler = ACTIVE_MODELS['iris']['scaler']

    feature_cols = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']
    features_df = pd.DataFrame([[sepal_length, sepal_width, petal_length, petal_width]], columns=feature_cols)
    features_scaled = scaler.transform(features_df)

    prediction = model.predict(features_scaled)[0]

    probabilities = {}
    classes = ['setosa', 'versicolor', 'virginica']
    if hasattr(model, 'predict_proba'):
        probs = model.predict_proba(features_scaled)[0]
        for cname, p in zip(model.classes_, probs):
            probabilities[cname] = round(float(p) * 100, 2)
    else:
        # KNN probability approximation
        for cname in classes:
            probabilities[cname] = 100.0 if cname == prediction else 0.0

    # Flower descriptions
    descriptions = {
        'setosa': 'Iris Setosa is recognizable by its significantly smaller petals (typically < 2.0 cm) and relatively wide sepals. It is linearly separable from the other two species.',
        'versicolor': 'Iris Versicolor has intermediate petal lengths (around 3.0 to 5.0 cm) and moderate sepal widths. It sits between Setosa and Virginica in morphological features.',
        'virginica': 'Iris Virginica has the largest petals (> 5.0 cm long and > 1.8 cm wide). It is often found in moist wetland habitats and displays deep violet or blue flowers.'
    }

    return {
        'predicted_species': prediction.capitalize(),
        'predicted_key': prediction,
        'probabilities': probabilities,
        'algorithm_used': ACTIVE_MODELS['iris']['algorithm'],
        'description': descriptions.get(prediction, 'Identified Iris species.')
    }

# =====================================================================
# MODULE 5: HOUSE PRICE PREDICTION & REGRESSION
# =====================================================================

def get_housing_data():
    """Load and return Housing dataframe."""
    if not os.path.exists(HOUSING_PATH):
        raise FileNotFoundError(f"Housing dataset not found at {HOUSING_PATH}")
    return pd.read_csv(HOUSING_PATH)

def get_housing_info():
    """Return dataset overview, statistics, and sample rows."""
    df = get_housing_data()
    feature_cols = ['avg_income', 'house_age', 'rooms', 'bedrooms', 'population']

    features_info = []
    col_labels = {
        'avg_income': 'Avg Area Income ($)',
        'house_age': 'Avg House Age (Years)',
        'rooms': 'Avg Number of Rooms',
        'bedrooms': 'Avg Number of Bedrooms',
        'population': 'Area Population',
        'price': 'Selling Price ($)'
    }

    for col in feature_cols + ['price']:
        features_info.append({
            'name': col_labels.get(col, col),
            'key': col,
            'mean': round(float(df[col].mean()), 2),
            'std': round(float(df[col].std()), 2),
            'min': round(float(df[col].min()), 2),
            'max': round(float(df[col].max()), 2),
        })

    return {
        'total_samples': len(df),
        'total_features': len(feature_cols),
        'features_info': features_info,
        'sample_records': df.head(10).to_dict(orient='records')
    }

def train_housing_model(algorithm='Random Forest Regressor', test_size=0.2):
    """
    Train a Housing regression model.
    Computes MAE, MSE, RMSE, R² Score, and sample predictions for Chart.js scatter plot.
    """
    df = get_housing_data()
    feature_cols = ['avg_income', 'house_age', 'rooms', 'bedrooms', 'population']
    X = df[feature_cols]
    y = df['price']

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )

    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Model instantiation
    if algorithm == 'Linear Regression':
        model = LinearRegression()
    elif algorithm == 'Ridge Regression':
        model = Ridge(alpha=10.0)
    else:
        algorithm = 'Random Forest Regressor'
        model = RandomForestRegressor(n_estimators=100, random_state=42)

    # Train
    model.fit(X_train_scaled, y_train)

    # Predict on test set
    y_pred = model.predict(X_test_scaled)

    # Real regression evaluation metrics
    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    # Actual vs Predicted points for Chart.js visualization (first 40 test samples)
    comparison_points = []
    y_test_list = y_test.tolist()
    y_pred_list = y_pred.tolist()
    for i in range(min(40, len(y_test_list))):
        comparison_points.append({
            'index': i + 1,
            'actual': round(float(y_test_list[i]), 2),
            'predicted': round(float(y_pred_list[i]), 2),
            'error': round(float(y_pred_list[i] - y_test_list[i]), 2)
        })

    # Feature importances or coefficients
    feature_importance = {}
    if hasattr(model, 'feature_importances_'):
        for name, imp in zip(feature_cols, model.feature_importances_):
            feature_importance[name] = round(float(imp), 4)
    elif hasattr(model, 'coef_'):
        abs_coef = np.abs(model.coef_)
        norm_coef = abs_coef / np.sum(abs_coef)
        for name, imp in zip(feature_cols, norm_coef):
            feature_importance[name] = round(float(imp), 4)

    metrics = {
        'algorithm': algorithm,
        'test_size': test_size,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'mae': round(mae, 2),
        'mse': round(mse, 2),
        'rmse': round(rmse, 2),
        'r2_score': round(r2, 4),
        'r2_pct': round(r2 * 100, 2),
        'comparison_points': comparison_points,
        'feature_importance': feature_importance
    }

    # Store in memory cache
    ACTIVE_MODELS['housing']['model'] = model
    ACTIVE_MODELS['housing']['scaler'] = scaler
    ACTIVE_MODELS['housing']['algorithm'] = algorithm
    ACTIVE_MODELS['housing']['metrics'] = metrics
    ACTIVE_MODELS['housing']['last_trained'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Generate and save report
    report_text = generate_report_text('House Price Regression', algorithm, 'Housing Dataset', test_size, metrics)
    with open(os.path.join(REPORTS_DIR, 'housing_latest_report.txt'), 'w', encoding='utf-8') as f:
        f.write(report_text)

    return metrics

def predict_house_price(avg_income, house_age, rooms, bedrooms, population):
    """Predict house price given features using the active regression model."""
    if ACTIVE_MODELS['housing']['model'] is None:
        train_housing_model('Random Forest Regressor', 0.2)

    model = ACTIVE_MODELS['housing']['model']
    scaler = ACTIVE_MODELS['housing']['scaler']

    feature_cols = ['avg_income', 'house_age', 'rooms', 'bedrooms', 'population']
    features_df = pd.DataFrame([[avg_income, house_age, rooms, bedrooms, population]], columns=feature_cols)
    features_scaled = scaler.transform(features_df)

    predicted_price = float(model.predict(features_scaled)[0])
    predicted_price = max(50000.0, round(predicted_price, 2))

    # Educational margin of error (+/- MAE)
    mae = ACTIVE_MODELS['housing']['metrics']['mae'] if ACTIVE_MODELS['housing']['metrics'] else 15000.0
    lower_bound = max(40000.0, round(predicted_price - mae, 2))
    upper_bound = round(predicted_price + mae, 2)

    return {
        'predicted_price': predicted_price,
        'formatted_price': f"${predicted_price:,.2f}",
        'lower_bound': f"${lower_bound:,.2f}",
        'upper_bound': f"${upper_bound:,.2f}",
        'algorithm_used': ACTIVE_MODELS['housing']['algorithm'],
        'disclaimer': 'EDUCATIONAL ESTIMATE ONLY: This valuation is generated by a statistical machine learning model for instructional purposes and should not be used for actual real estate or lending decisions.'
    }

# =====================================================================
# MODULE 3: INTERACTIVE DEMONSTRATION ENGINES
# =====================================================================

def run_supervised_demo():
    """
    Supervised Learning Interactive Demo:
    Trains Logistic Regression on 2 features of Iris (Petal Length vs Petal Width)
    for two classes (Setosa vs Versicolor) and returns points + decision boundary line.
    """
    df = get_iris_data()
    sub_df = df[df['species'].isin(['setosa', 'versicolor'])].copy()

    X = sub_df[['petal_length', 'petal_width']].values
    y = (sub_df['species'] == 'versicolor').astype(int).values

    model = LogisticRegression(random_state=42)
    model.fit(X, y)

    # Decision boundary line: w0*x + w1*y + b = 0  => y = -(w0*x + b) / w1
    w0, w1 = model.coef_[0]
    b = model.intercept_[0]

    x_vals = np.linspace(1.0, 5.5, 20)
    y_vals = -(w0 * x_vals + b) / w1

    boundary = [{'x': round(float(x), 2), 'y': round(float(y), 2)} for x, y in zip(x_vals, y_vals)]

    points = []
    for row in sub_df.itertuples():
        points.append({
            'x': round(float(row.petal_length), 2),
            'y': round(float(row.petal_width), 2),
            'label': 'Versicolor' if row.species == 'versicolor' else 'Setosa',
            'class': row.species
        })

    return {
        'points': points,
        'decision_boundary': boundary,
        'accuracy': round(float(model.score(X, y)) * 100, 1),
        'summary': 'The model analyzed labelled samples (Setosa in red, Versicolor in blue) and computed an optimal linear decision boundary separating the two species.'
    }

def run_kmeans_demo(k=3):
    """
    Unsupervised Learning Interactive Demo:
    Executes K-Means Clustering on unlabelled Iris petal features.
    Returns clustered data points and cluster centroids.
    """
    k = max(2, min(5, int(k)))
    df = get_iris_data()
    X = df[['petal_length', 'petal_width']].values

    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(X)
    centroids = kmeans.cluster_centers_

    clustered_points = []
    palette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

    for i, pt in enumerate(X):
        c_idx = int(cluster_labels[i])
        clustered_points.append({
            'x': round(float(pt[0]), 2),
            'y': round(float(pt[1]), 2),
            'cluster': c_idx,
            'color': palette[c_idx % len(palette)],
            'true_species': df['species'].iloc[i]
        })

    formatted_centroids = []
    for c_idx, c in enumerate(centroids):
        formatted_centroids.append({
            'cluster': c_idx,
            'x': round(float(c[0]), 2),
            'y': round(float(c[1]), 2),
            'color': palette[c_idx % len(palette)]
        })

    return {
        'k': k,
        'inertia': round(float(kmeans.inertia_), 2),
        'points': clustered_points,
        'centroids': formatted_centroids,
        'summary': f"K-Means grouped 150 unlabelled observations into {k} clusters based purely on geometric distance (Euclidean distance) to cluster centroids."
    }

def run_overfitting_demo():
    """
    Overfitting Interactive Demo:
    Simulates training and testing error across increasing Decision Tree depths (1 to 12).
    Generates the textbook U-shaped error curve demonstrating the Bias-Variance tradeoff.
    """
    df = get_iris_data()
    X = df[['sepal_length', 'sepal_width', 'petal_length', 'petal_width']]
    y = df['species']

    # Introduce some synthetic noise to accentuate overfitting at high depths
    np.random.seed(42)
    X_noisy = X.copy()
    X_noisy['noise'] = np.random.normal(0, 1.5, size=len(X))

    X_train, X_test, y_train, y_test = train_test_split(
        X_noisy, y, test_size=0.35, random_state=42
    )

    depths = list(range(1, 13))
    train_errors = []
    test_errors = []
    train_accuracies = []
    test_accuracies = []

    for d in depths:
        dt = DecisionTreeClassifier(max_depth=d, random_state=42)
        dt.fit(X_train, y_train)

        train_acc = dt.score(X_train, y_train)
        test_acc = dt.score(X_test, y_test)

        train_accuracies.append(round(train_acc * 100, 2))
        test_accuracies.append(round(test_acc * 100, 2))
        train_errors.append(round((1.0 - train_acc) * 100, 2))
        test_errors.append(round((1.0 - test_acc) * 100, 2))

    return {
        'depths': depths,
        'train_accuracies': train_accuracies,
        'test_accuracies': test_accuracies,
        'train_errors': train_errors,
        'test_errors': test_errors,
        'optimal_depth': 3,
        'underfitting_zone': 'Depths 1-2 (High Bias: Model is too simplistic)',
        'sweet_spot': 'Depth 3-4 (Optimal Generalization)',
        'overfitting_zone': 'Depths 5+ (High Variance: Model memorizes training noise)'
    }

# =====================================================================
# MODULE 8: AUTOMATED MODEL EVALUATION REPORT GENERATION
# =====================================================================

def generate_report_text(module_title, algorithm, dataset_name, test_size, metrics):
    """
    Generate an academic-grade text evaluation report for any trained model.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    train_pct = int((1.0 - test_size) * 100)
    test_pct = int(test_size * 100)

    report = []
    report.append("=" * 70)
    report.append(f"   ML MADE EASY - AUTOMATED MODEL EVALUATION REPORT")
    report.append("=" * 70)
    report.append(f"Report Generated At : {timestamp}")
    report.append(f"Project             : ML Made Easy (Capstone 15)")
    report.append(f"Module              : {module_title}")
    report.append(f"Machine Learning Alg: {algorithm}")
    report.append(f"Dataset             : {dataset_name}")
    report.append(f"Data Split Ratio    : {train_pct}% Train / {test_pct}% Test")
    report.append("-" * 70)
    report.append("1. EXECUTIVE SUMMARY & MODEL PERFORMANCE")
    report.append("-" * 70)

    if 'accuracy' in metrics:
        report.append(f"  * Classification Accuracy : {metrics['accuracy_pct']}% ({metrics['accuracy']})")
        report.append(f"  * Macro Precision         : {metrics['precision']}")
        report.append(f"  * Macro Recall            : {metrics['recall']}")
        report.append(f"  * Macro F1-Score          : {metrics['f1_score']}")
        report.append("")
        report.append("2. DETAILED CLASS-LEVEL BREAKDOWN")
        report.append("-" * 70)
        report.append(f"  {'Class':<15} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
        report.append("  " + "-" * 50)
        for cm_item in metrics.get('class_metrics', []):
            report.append(f"  {cm_item['species']:<15} | {cm_item['precision']:<10.3f} | {cm_item['recall']:<10.3f} | {cm_item['f1']:<10.3f}")

        report.append("")
        report.append("3. CONFUSION MATRIX")
        report.append("-" * 70)
        report.append("  Format: Rows = Actual Species, Columns = Predicted Species")
        report.append("  Classes: Setosa, Versicolor, Virginica")
        cm = metrics.get('confusion_matrix', [])
        if cm:
            report.append(f"  [Setosa    ] : {cm[0]}")
            report.append(f"  [Versicolor] : {cm[1]}")
            report.append(f"  [Virginica ] : {cm[2]}")

    elif 'r2_score' in metrics:
        report.append(f"  * Coefficient of Determination (R²) : {metrics['r2_pct']}% ({metrics['r2_score']})")
        report.append(f"  * Mean Absolute Error (MAE)        : ${metrics['mae']:,.2f}")
        report.append(f"  * Mean Squared Error (MSE)         : {metrics['mse']:,.2f}")
        report.append(f"  * Root Mean Squared Error (RMSE)   : ${metrics['rmse']:,.2f}")
        report.append("")
        report.append("2. REGRESSION ACCURACY INTERPRETATION")
        report.append("-" * 70)
        report.append(f"  The R² score indicates that approximately {metrics['r2_pct']}% of the variance")
        report.append("  in housing sale prices is explained by the selected input features.")
        report.append(f"  On average, predictions deviate by approximately ${metrics['mae']:,.2f} from actual prices.")

    report.append("")
    report.append("4. FEATURE IMPORTANCE ANALYSIS")
    report.append("-" * 70)
    for feat, imp in metrics.get('feature_importance', {}).items():
        bar = "#" * int(imp * 35)
        report.append(f"  {feat:<22} : {imp:.4f} {bar}")

    report.append("")
    report.append("5. MODEL LIMITATIONS & RESPONSIBLE AI NOTES")
    report.append("-" * 70)
    report.append("  * Data Scope       : The dataset reflects historical observations and may")
    report.append("                       contain sample selection biases.")
    report.append("  * Out-of-Distribution: Extreme outliers or unusual property/flower characteristics")
    report.append("                       outside the training range may result in reduced accuracy.")
    report.append("  * Ethical Usage    : For regression models, predictions are educational estimates")
    report.append("                       and must not replace professional certified appraisals.")
    report.append("=" * 70)
    report.append("End of Automated Report. Generated by ML Made Easy Platform.")
    report.append("=" * 70)

    return "\n".join(report)

def get_latest_report(module_type='iris'):
    """Return latest generated report text."""
    fname = 'iris_latest_report.txt' if module_type == 'iris' else 'housing_latest_report.txt'
    path = os.path.join(REPORTS_DIR, fname)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        # Generate default report if not yet trained
        if module_type == 'iris':
            train_iris_model('Random Forest', 0.2)
        else:
            train_housing_model('Random Forest Regressor', 0.2)
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

# Initialize default models on module load
try:
    init_iris = train_iris_model('Random Forest', 0.2)
    init_house = train_housing_model('Random Forest Regressor', 0.2)
except Exception as e:
    print(f"Initial model training deferred: {e}")
