"""
MedScope AI — SQLite Database Layer
Tables: patients, users, documents, appointments
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "medscope.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create all tables if they don't exist."""
    conn = get_conn()
    c = conn.cursor()

    c.executescript("""
        CREATE TABLE IF NOT EXISTS patients (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            dob         TEXT,
            age         TEXT,
            gender      TEXT,
            phone       TEXT,
            blood_group TEXT,
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id  TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        );

        CREATE TABLE IF NOT EXISTS documents (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id  TEXT NOT NULL,
            filename    TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            result_json TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id  TEXT NOT NULL,
            doctor      TEXT NOT NULL,
            specialty   TEXT,
            date        TEXT NOT NULL,
            time        TEXT NOT NULL,
            reason      TEXT,
            status      TEXT DEFAULT 'Confirmed',
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        );
    """)

    # Seed demo patients
    demo_patients = [
        ("MS-1001", "Arun Kumar",  "12 Mar 2000", "26", "Male",   "+91 98765 00001", "O+"),
        ("MS-1002", "Priya S",     "05 Jun 1995", "31", "Female", "+91 98765 00002", "A+"),
        ("MS-1003", "Sindhu A",    "22 Jan 1990", "36", "Female", "+91 98765 00003", "B+"),
        ("MS-1004", "Ramesh V",    "11 Aug 1985", "41", "Male",   "+91 98765 00004", "AB+"),
        ("MS-1005", "Kavitha R",   "30 Dec 1998", "27", "Female", "+91 98765 00005", "O-"),
    ]
    for p in demo_patients:
        c.execute("""
            INSERT OR IGNORE INTO patients (id,name,dob,age,gender,phone,blood_group)
            VALUES (?,?,?,?,?,?,?)
        """, p)

    # Seed demo appointments
    demo_appts = [
        ("MS-1001","Dr. Kumar", "General Medicine","25 Sep 2026","10:30 AM","Diabetes follow-up","Confirmed"),
        ("MS-1001","Dr. Priya", "Cardiology",      "30 Sep 2026","11:00 AM","Kidney function review","Confirmed"),
        ("MS-1002","Dr. Ramesh","Orthopedics",      "28 Sep 2026","09:00 AM","Holter monitor review","Pending"),
    ]
    for a in demo_appts:
        c.execute("""
            INSERT OR IGNORE INTO appointments
              (patient_id,doctor,specialty,date,time,reason,status)
            VALUES (?,?,?,?,?,?,?)
        """, a)

    conn.commit()
    conn.close()
    print("[DB] Initialised medscope.db")


# ── Patients ──────────────────────────────────────────────────────
def get_all_patients():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM patients").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_patient(patient_id):
    conn = get_conn()
    row  = conn.execute("SELECT * FROM patients WHERE id=?", (patient_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Documents ─────────────────────────────────────────────────────
def save_document(patient_id, filename, result: dict):
    conn = get_conn()
    uploaded_at = datetime.now().strftime("%d %b %Y %H:%M")
    conn.execute("""
        INSERT INTO documents (patient_id, filename, uploaded_at, result_json)
        VALUES (?, ?, ?, ?)
    """, (patient_id, filename, uploaded_at, json.dumps(result)))
    conn.commit()
    conn.close()
    return uploaded_at


def get_documents(patient_id):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM documents WHERE patient_id=? ORDER BY id ASC",
        (patient_id,)
    ).fetchall()
    conn.close()
    docs = []
    for r in rows:
        d = dict(r)
        d["result"] = json.loads(d["result_json"] or "{}")
        del d["result_json"]
        docs.append(d)
    return docs


# ── Appointments ──────────────────────────────────────────────────
def save_appointment(patient_id, doctor, specialty, date, time, reason):
    conn = get_conn()
    cur  = conn.execute("""
        INSERT INTO appointments (patient_id,doctor,specialty,date,time,reason,status)
        VALUES (?,?,?,?,?,?,'Confirmed')
    """, (patient_id, doctor, specialty, date, time, reason))
    appt_id = cur.lastrowid
    conn.commit()
    conn.close()
    return appt_id


def get_appointments(patient_id):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM appointments WHERE patient_id=? ORDER BY id DESC",
        (patient_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_appointment(appt_id):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM appointments WHERE id=?", (appt_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def cancel_appointment(appt_id):
    conn = get_conn()
    conn.execute("UPDATE appointments SET status='Cancelled' WHERE id=?", (appt_id,))
    conn.commit()
    conn.close()


# ── Users (auth) ──────────────────────────────────────────────────
def create_user(patient_id, email, hashed_password):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO users (patient_id,email,password) VALUES (?,?,?)",
            (patient_id, email, hashed_password)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False   # email already exists
    finally:
        conn.close()


def get_user_by_email(email):
    conn = get_conn()
    row  = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    return dict(row) if row else None
