CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY, roll_no VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL, class_name VARCHAR(2) NOT NULL, section CHAR(1) NOT NULL,
    guardian_name VARCHAR(100) NOT NULL, guardian_phone VARCHAR(16) NOT NULL,
    guardian_relation VARCHAR(10) NOT NULL CHECK (guardian_relation IN ('father','mother','guardian')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS marks (
    id SERIAL PRIMARY KEY, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam VARCHAR(10) NOT NULL, subject VARCHAR(100) NOT NULL, score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, exam, subject)
);
