"""
database.py - SQLite Database Management for ML Made Easy
Handles user progress tracking, quiz scores, and model training history.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.db')

DEFAULT_LESSONS = [
    ("lesson_1", "Introduction to Machine Learning"),
    ("lesson_2", "Supervised vs Unsupervised Learning"),
    ("lesson_3", "Classification vs Regression"),
    ("lesson_4", "Training, Testing, Overfitting and Underfitting"),
    ("lesson_5", "Model Evaluation Metrics"),
    ("lesson_6", "Real-World Applications and Responsible AI")
]

def get_connection():
    """Create and return a database connection with dict-like row access."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables and default records."""
    conn = get_connection()
    cursor = conn.cursor()

    # Table for tracking lesson completion
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            completed_at TEXT
        )
    """)

    # Table for storing quiz attempts and scores
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            percentage REAL NOT NULL,
            grade TEXT NOT NULL,
            feedback TEXT NOT NULL,
            attempted_at TEXT NOT NULL
        )
    """)

    # Table for storing trained model history and metrics
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS model_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dataset_name TEXT NOT NULL,
            algorithm TEXT NOT NULL,
            test_size REAL NOT NULL,
            metrics TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Seed default lessons if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM lessons")
    if cursor.fetchone()['cnt'] == 0:
        for lid, title in DEFAULT_LESSONS:
            cursor.execute(
                "INSERT INTO lessons (id, title, completed) VALUES (?, ?, 0)",
                (lid, title)
            )

    conn.commit()
    conn.close()

def get_all_lessons():
    """Retrieve all lessons with completion status."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lessons ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def toggle_lesson(lesson_id, completed=None):
    """Toggle or set the completion status of a lesson."""
    conn = get_connection()
    cursor = conn.cursor()

    if completed is None:
        cursor.execute("SELECT completed FROM lessons WHERE id = ?", (lesson_id,))
        row = cursor.fetchone()
        new_status = 0 if (row and row['completed'] == 1) else 1
    else:
        new_status = 1 if completed else 0

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if new_status else None
    cursor.execute(
        "UPDATE lessons SET completed = ?, completed_at = ? WHERE id = ?",
        (new_status, now_str, lesson_id)
    )
    conn.commit()
    conn.close()
    return {"lesson_id": lesson_id, "completed": bool(new_status), "completed_at": now_str}

def record_quiz_attempt(score, total, percentage, grade, feedback):
    """Save a quiz attempt to database."""
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO quiz_attempts (score, total_questions, percentage, grade, feedback, attempted_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (score, total, percentage, grade, feedback, now_str))

    attempt_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return attempt_id

def get_quiz_stats():
    """Get summarized and detailed quiz history."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quiz_attempts ORDER BY attempted_at DESC")
    rows = cursor.fetchall()
    conn.close()

    history = [dict(row) for row in rows]
    total_attempts = len(history)
    best_score = max([h['percentage'] for h in history]) if total_attempts > 0 else 0
    latest_score = history[0]['percentage'] if total_attempts > 0 else 0

    return {
        "total_attempts": total_attempts,
        "best_score": round(best_score, 1),
        "latest_score": round(latest_score, 1),
        "history": history[:10]  # Return last 10 attempts
    }

def record_model_run(dataset_name, algorithm, test_size, metrics_dict):
    """Record an ML model training execution."""
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO model_history (dataset_name, algorithm, test_size, metrics, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (dataset_name, algorithm, test_size, json.dumps(metrics_dict), now_str))

    run_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return run_id

def get_model_history():
    """Retrieve history of trained models."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM model_history ORDER BY created_at DESC LIMIT 15")
    rows = cursor.fetchall()
    conn.close()

    history = []
    for r in rows:
        d = dict(r)
        d['metrics'] = json.loads(d['metrics'])
        history.append(d)
    return history

def get_overall_progress():
    """Compute combined learner progress."""
    lessons = get_all_lessons()
    total_lessons = len(lessons)
    completed_lessons = sum(1 for l in lessons if l['completed'] == 1)

    quiz_stats = get_quiz_stats()

    # Progress weighted: Lessons (60%), Quiz completion (40%)
    lesson_pct = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
    quiz_pct = min(100, (quiz_stats['best_score'])) if quiz_stats['total_attempts'] > 0 else 0
    overall_pct = round((lesson_pct * 0.6) + (quiz_pct * 0.4), 1)

    # Calculate rank/badge based on overall progress
    if overall_pct >= 90:
        badge = "ML Master"
    elif overall_pct >= 75:
        badge = "Classification Pro"
    elif overall_pct >= 50:
        badge = "Model Builder"
    elif overall_pct >= 25:
        badge = "Data Explorer"
    else:
        badge = "ML Novice"

    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "lesson_percentage": round(lesson_pct, 1),
        "lessons": lessons,
        "quiz_stats": quiz_stats,
        "overall_percentage": overall_pct,
        "badge": badge
    }

def reset_progress():
    """Reset all learner progress and quiz attempts for a fresh demo."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE lessons SET completed = 0, completed_at = NULL")
    cursor.execute("DELETE FROM quiz_attempts")
    cursor.execute("DELETE FROM model_history")
    conn.commit()
    conn.close()
    return {"message": "All learning progress and history have been successfully reset."}

