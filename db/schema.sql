-- Idempotent: safe to run any number of times (npm run db:migrate).
-- Mirrors the TypeORM entities, for production where `synchronize` is off.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------- students
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
    email VARCHAR(255) NOT NULL UNIQUE,
    class_name VARCHAR(2) NOT NULL,
    section CHAR(1) NOT NULL
);

-- Databases created before classes existed: existing rows get the placeholder 1 / A.
-- Correct them (PUT /api/students/:id) so teachers can see them.
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_name VARCHAR(2) NOT NULL DEFAULT '1';
ALTER TABLE students ADD COLUMN IF NOT EXISTS section CHAR(1) NOT NULL DEFAULT 'A';
ALTER TABLE students ALTER COLUMN class_name DROP DEFAULT;
ALTER TABLE students ALTER COLUMN section DROP DEFAULT;

-- ------------------------------------------------------------ student_marks
CREATE TABLE IF NOT EXISTS student_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL CHECK (length(trim(subject)) > 0),
    marks NUMERIC(5, 2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
    UNIQUE (student_id, subject)
);

-- -------------------------------------------------------------------- users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    -- Set only for student accounts: links the login to the student record. One login per student.
    student_id UUID NULL UNIQUE REFERENCES students(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrading a users table that predates student accounts.
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id UUID NULL REFERENCES students(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_student_id_key ON users (student_id);

-- Roles grew from (user, moderator, admin) to include teacher and student: drop and re-add the CHECK.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'teacher', 'student', 'user', 'moderator'));

-- ----------------------------------------------------------- teacher_classes
CREATE TABLE IF NOT EXISTS teacher_classes (
    teacher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_name VARCHAR(2) NOT NULL,
    section CHAR(1) NOT NULL,
    PRIMARY KEY (teacher_user_id, class_name, section)
);
