
-- ======================
-- TESTING FOR HR POLICY
-- ========================================
-- HR POLICY DATABASE WITHOUT department IN EmployeePermission
-- ========================================
-- DROP and CREATE DATABASE
DROP DATABASE IF EXISTS hr_policy_db;
CREATE DATABASE hr_policy_db;
USE hr_policy_db;
show tables;
-- ========================================
-- EMPLOYEES TABLE
-- ========================================
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    dateOfJoining DATE NOT NULL,
    employeeType VARCHAR(20) NOT NULL,
    experience FLOAT DEFAULT 0,
    department VARCHAR(50) NOT NULL
);

INSERT INTO employees (name, email, phone, salary, dateOfJoining, employeeType, experience, department)
VALUES 
('Admin User', 'admin@example.com', '0000000000', 0.00, '2000-01-01', 'admin', 0, 'Admin'),
('HR User', 'hr@example.com', '1111111111', 50000.00, '2015-05-10', 'hr', 5, 'HR'),
('Employee User', 'employee@example.com', '2222222222', 30000.00, '2020-08-15', 'employee', 2, 'Employee');

-- ========================================
-- EMPLOYEE INCREMENTS TABLE
-- ========================================
CREATE TABLE employee_increments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT,
    emp_name VARCHAR(255),
    experience_before_joining FLOAT,
    experience_in_company FLOAT,
    total_experience FLOAT,
    avg_rating FLOAT DEFAULT 0,
    performance VARCHAR(50),
    increment_percent FLOAT,
    department VARCHAR(50) NOT NULL,
    FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ========================================
-- TASKS TABLE
-- ========================================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    employee_name VARCHAR(255),
    department VARCHAR(100),
    task_name VARCHAR(255) NOT NULL,
    assignment_date DATE,
    task_status VARCHAR(50) DEFAULT 'Pending',
    time_required DECIMAL(5,2) NOT NULL, -- expected time in hours
    time_taken VARCHAR(50),
    rating INT,
    start_time DATETIME,
    pause_time DATETIME,
    resume_time DATETIME,
    end_time DATETIME,
    time_accumulated BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ========================================
-- PERFORMANCE LEVELS TABLE
-- ========================================
CREATE TABLE performance_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    min_rating INT NOT NULL,
    performance_label VARCHAR(100) NOT NULL,
    increment_percent INT NOT NULL
);

INSERT INTO performance_levels (min_rating, performance_label, increment_percent) VALUES
(5, 'Outstanding Performer', 25),
(4, 'Excellent Performer', 20),
(3, 'Good Performer', 15),
(2, 'Average Performer', 10),
(1, 'Poor Performer', 5);

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NULL,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    department VARCHAR(50) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

INSERT INTO users (employee_id, name, email, password, role, department) VALUES
(1, 'Admin', 'admin@example.com', '$2b$10$6LBoKR1mdtRO.4IVaNPU2.uayCnHsu.1APPzUx051Yu9Nw13CuAWi', 'admin', 'Admin'),
(2, 'HR User', 'hr@example.com', '$2b$10$6LBoKR1mdtRO.4IVaNPU2.uayCnHsu.1APPzUx051Yu9Nw13CuAWi', 'hr', 'HR'),
(3, 'Employee User', 'employee@example.com', '$2b$10$6LBoKR1mdtRO.4IVaNPU2.uayCnHsu.1APPzUx051Yu9Nw13CuAWi', 'employee', 'Employee');

-- ========================================
-- ACCESS INFO TABLE
-- ========================================
CREATE TABLE AccessInfo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    operation_id VARCHAR(50) NOT NULL
);

INSERT INTO AccessInfo (role, operation, operation_id) VALUES
('Employee', 'add', 'E-add'),
('Employee', 'read', 'E-read'),
('Employee', 'edit', 'E-edit'),
('Employee', 'delete', 'E-delete'),

('HR', 'add', 'HR-add'),
('HR', 'read', 'HR-read'),
('HR', 'edit', 'HR-edit'),
('HR', 'delete', 'HR-delete'),

('Admin', 'add', 'A-add'),
('Admin', 'read', 'A-read'),
('Admin', 'edit', 'A-edit'),
('Admin', 'delete', 'A-delete');

-- ========================================
-- EMPLOYEE PERMISSION TABLE (NO DEPARTMENT HERE)
-- ========================================
CREATE TABLE EmployeePermission (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    E_add BOOLEAN DEFAULT FALSE,
    E_read BOOLEAN DEFAULT FALSE,
    E_edit BOOLEAN DEFAULT FALSE,
    E_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- USER OTP RELATED QUERIES
-- ==============================
DROP TABLE IF EXISTS user_otps;

CREATE TABLE user_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(10) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);
-- ==========================
-- Leave related tables
CREATE TABLE leave_applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  employee_name VARCHAR(50) NOT NULL,
  leave_type VARCHAR(50), -- Earned, Casual, Sick
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  no_of_days INT GENERATED ALWAYS AS (DATEDIFF(to_date, from_date) + 1) STORED,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE employee_leave_summary (
  employee_id INT PRIMARY KEY,
  employee_name VARCHAR(50),

  total_earned_leave INT,
  earned_leave_taken INT DEFAULT 0,

  total_casual_leave INT,
  casual_leave_taken INT DEFAULT 0,

  total_sick_leave INT,
  sick_leave_taken INT DEFAULT 0,

  total_lwp_leave INT,               -- 🆕 Optional cap on Leave Without Pay
  lwp_leave_taken INT DEFAULT 0,     -- 🆕 Actual Leave Without Pay taken

  total_leaves_present INT GENERATED ALWAYS AS (
    total_earned_leave + total_casual_leave + total_sick_leave
  ) STORED,

  total_leaves_taken INT GENERATED ALWAYS AS (
    earned_leave_taken + casual_leave_taken + sick_leave_taken
  ) STORED,

  total_leaves_remaining INT GENERATED ALWAYS AS (
    (total_earned_leave + total_casual_leave + total_sick_leave) -
    (earned_leave_taken + casual_leave_taken + sick_leave_taken)
  ) STORED,

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- hr policy for leave-- 
-- Step 1: Create the table
CREATE TABLE hr_leave_policy (
  id INT PRIMARY KEY AUTO_INCREMENT,
  leave_type VARCHAR(50) NOT NULL,
  allowed_days INT NOT NULL
);
-- Step 2: Insert leave policy data
INSERT INTO hr_leave_policy (leave_type, allowed_days)
VALUES
('Earned Leave (EL)', 18),
('Casual Leave (CL)', 8),
('Sick Leave (SL)', 8),
('Leave Without Pay (LWP)', 10);







-- ========================================
-- VALIDATION QUERIES
-- ========================================
SHOW TABLES;

SELECT * FROM employees;
SELECT * FROM employee_increments;
SELECT * FROM tasks;
SELECT * FROM performance_levels;
SELECT * FROM users;
SELECT * FROM AccessInfo;
SELECT * FROM EmployeePermission;
SELECT * FROM user_otps;
SELECT * FROM leave_applications;
SELECT * FROM employee_leave_summary;
SELECT * FROM hr_leave_policy;






-- AVERAGE RATING
SELECT employee_name, FLOOR(AVG(rating)) AS average_rating
FROM tasks
GROUP BY employee_name;

-- ========================================
-- DROP TABLES IF NEEDED
-- ========================================
DROP TABLE IF EXISTS EmployeePermission;
DROP TABLE IF EXISTS AccessInfo;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS performance_levels;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS employee_increments;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS employee_leave_summary;






