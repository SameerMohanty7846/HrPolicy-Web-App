
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
-- Updated leave_applications table
CREATE TABLE leave_applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  employee_name VARCHAR(50) NOT NULL,
  leave_type VARCHAR(50), -- Earned, Casual, Sick
  
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  no_of_days INT NOT NULL, -- ✅ Will be passed from frontend
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE TABLE hr_leave_policy (
  id INT PRIMARY KEY AUTO_INCREMENT,
  leave_type VARCHAR(50) NOT NULL UNIQUE,     -- e.g., Earned, Casual, Sick, etc.
  mode ENUM('Paid', 'Free') NOT NULL,         -- 'Paid' = Salary paid, 'Free' = Unpaid leave
  frequency ENUM('Monthly', 'Yearly') NOT NULL, -- How often the leave quota resets
  total_leaves INT NOT NULL,                  -- Total allowed leaves in the given frequency
  max_per_request INT NOT NULL                -- Maximum leaves allowed per application
);

CREATE TABLE employee_leave_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  
  -- Policy information from hr_leave_policy
  policy_id INT NOT NULL,  -- Reference to hr_leave_policy.id
  leave_type VARCHAR(50) NOT NULL,
  mode ENUM('Paid', 'Free') NOT NULL,
  frequency ENUM('Monthly', 'Yearly') NOT NULL,
  total_leaves INT NOT NULL,
  max_per_request INT NOT NULL,
  
  -- Employee-specific leave tracking
  taken_days INT DEFAULT 0,        -- Tracks how many days have been taken
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (policy_id) REFERENCES hr_leave_policy(id) ON DELETE CASCADE,
  UNIQUE (employee_id, policy_id)
);

-- Attendance Table
CREATE TABLE attendance (
  id INT NOT NULL AUTO_INCREMENT,
  emp_id INT NOT NULL,
  emp_name VARCHAR(250) DEFAULT NULL,
  date DATE DEFAULT NULL,
  check_in TIME DEFAULT NULL,
  check_out TIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  work_day INT,
  PRIMARY KEY (id),
  FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE ATTENDANCE;
CREATE TABLE monthly_salary_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month_year VARCHAR(7),
  fixed_salary DECIMAL(10,2),
  total_free_leaves INT,
  paid_leaves INT,
  daily_salary DECIMAL(10,2),
  salary_deduction DECIMAL(10,2),
  net_salary DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- for retrirving all the details of all employees about their leaves-- 
SELECT 
  e.id AS employee_id,
  e.name AS employee_name,
  els.leave_type,
  els.total_leaves,
  els.taken_days,
  
  -- Total Paid Leaves per Employee
  SUM(CASE WHEN els.mode = 'Paid' THEN els.taken_days ELSE 0 END) 
    OVER (PARTITION BY e.id) AS total_paid_leaves,

  -- Total Unpaid Leaves per Employee
  SUM(CASE WHEN els.mode = 'Free' THEN els.taken_days ELSE 0 END) 
    OVER (PARTITION BY e.id) AS total_unpaid_leaves

FROM 
  employees e
JOIN 
  employee_leave_summary els ON e.id = els.employee_id
ORDER BY 
  e.id, els.leave_type;

-- for retrirving for  a single employe  all the details of  about their leaves-- 
SELECT 
  e.id AS employee_id,
  e.name AS employee_name,
  els.leave_type,
  els.total_leaves,
  els.taken_days,
  
  -- Total Paid Leaves taken by the employee
  (
    SELECT SUM(taken_days)
    FROM employee_leave_summary
    WHERE employee_id = e.id AND mode = 'Paid'
  ) AS total_paid_leaves,

  -- Total Unpaid Leaves taken by the employee
  (
    SELECT SUM(taken_days)
    FROM employee_leave_summary
    WHERE employee_id = e.id AND mode = 'Free'
  ) AS total_unpaid_leaves

FROM 
  employees e
JOIN 
  employee_leave_summary els ON e.id = els.employee_id
WHERE 
  e.id = 2;  -- Pass the specific employee ID here













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
SELECT * FROM attendance;
SELECT * FROM 
monthly_salary_reports;



desc hr_leave_policy;





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
DROP TABLE IF EXISTS hr_leave_policy;
DROP TABLE IF EXISTS leave_applications;












-- Admin User (employee_id = 1) - Mostly present with a few absences
INSERT INTO attendance (emp_id, emp_name, date, check_in, check_out, work_day) VALUES
-- Week 1 (July 1-5)
(1, 'Admin User', '2025-07-01', '08:55:00', '17:10:00', 1),
(1, 'Admin User', '2025-07-02', '09:05:00', '17:25:00', 1),
(1, 'Admin User', '2025-07-03', '09:15:00', '17:35:00', 1),
(1, 'Admin User', '2025-07-04', '08:50:00', '17:00:00', 1),
(1, 'Admin User', '2025-07-05', NULL, NULL, 0), -- Saturday absent

-- Week 2 (July 7-12)
(1, 'Admin User', '2025-07-07', '09:00:00', '17:15:00', 1),
(1, 'Admin User', '2025-07-08', NULL, NULL, 0), -- Absent
(1, 'Admin User', '2025-07-09', '08:45:00', '17:30:00', 1),
(1, 'Admin User', '2025-07-10', '09:10:00', '17:20:00', 1),
(1, 'Admin User', '2025-07-11', '09:20:00', '16:45:00', 1),
(1, 'Admin User', '2025-07-12', NULL, NULL, 0), -- Saturday absent

-- Week 3 (July 14-19)
(1, 'Admin User', '2025-07-14', '08:55:00', '17:25:00', 1),
(1, 'Admin User', '2025-07-15', '09:05:00', '17:15:00', 1),
(1, 'Admin User', '2025-07-16', '09:00:00', '17:00:00', 1),
(1, 'Admin User', '2025-07-17', NULL, NULL, 0), -- Absent
(1, 'Admin User', '2025-07-18', '08:50:00', '17:40:00', 1),
(1, 'Admin User', '2025-07-19', '09:30:00', '15:00:00', 1), -- Saturday half-day

-- Week 4 (July 21-26)
(1, 'Admin User', '2025-07-21', '09:00:00', '17:00:00', 1),
(1, 'Admin User', '2025-07-22', '09:10:00', '17:20:00', 1),
(1, 'Admin User', '2025-07-23', NULL, NULL, 0), -- Absent
(1, 'Admin User', '2025-07-24', '08:45:00', '17:30:00', 1),
(1, 'Admin User', '2025-07-25', '09:15:00', '17:45:00', 1),
(1, 'Admin User', '2025-07-26', NULL, NULL, 0), -- Saturday absent

-- Week 5 (July 28-31)
(1, 'Admin User', '2025-07-28', '09:00:00', '17:00:00', 1),
(1, 'Admin User', '2025-07-29', '08:55:00', '17:25:00', 1),
(1, 'Admin User', '2025-07-30', '09:05:00', '17:15:00', 1),
(1, 'Admin User', '2025-07-31', NULL, NULL, 0); -- Absent

-- Reyansh Patel (employee_id = 2) - HR, mostly present
INSERT INTO attendance (emp_id, emp_name, date, check_in, check_out, work_day) VALUES
-- Week 1 (July 1-5)
(2, 'Reyansh Patel', '2025-07-01', '09:00:00', '17:30:00', 1),
(2, 'Reyansh Patel', '2025-07-02', '09:05:00', '17:25:00', 1),
(2, 'Reyansh Patel', '2025-07-03', '09:10:00', '17:20:00', 1),
(2, 'Reyansh Patel', '2025-07-04', '08:55:00', '17:35:00', 1),
(2, 'Reyansh Patel', '2025-07-05', '09:30:00', '16:00:00', 1), -- Saturday half-day

-- Week 2 (July 7-12)
(2, 'Reyansh Patel', '2025-07-07', '09:00:00', '17:00:00', 1),
(2, 'Reyansh Patel', '2025-07-08', '09:15:00', '17:45:00', 1),
(2, 'Reyansh Patel', '2025-07-09', '08:50:00', '17:10:00', 1),
(2, 'Reyansh Patel', '2025-07-10', NULL, NULL, 0), -- Absent
(2, 'Reyansh Patel', '2025-07-11', '09:05:00', '17:25:00', 1),
(2, 'Reyansh Patel', '2025-07-12', NULL, NULL, 0), -- Saturday absent

-- Week 3 (July 14-19)
(2, 'Reyansh Patel', '2025-07-14', '09:00:00', '17:00:00', 1),
(2, 'Reyansh Patel', '2025-07-15', '09:10:00', '17:20:00', 1),
(2, 'Reyansh Patel', '2025-07-16', '08:45:00', '17:30:00', 1),
(2, 'Reyansh Patel', '2025-07-17', '09:05:00', '17:15:00', 1),
(2, 'Reyansh Patel', '2025-07-18', NULL, NULL, 0), -- Absent
(2, 'Reyansh Patel', '2025-07-19', NULL, NULL, 0), -- Saturday absent

-- Week 4 (July 21-26)
(2, 'Reyansh Patel', '2025-07-21', '09:00:00', '17:00:00', 1),
(2, 'Reyansh Patel', '2025-07-22', '09:15:00', '17:45:00', 1),
(2, 'Reyansh Patel', '2025-07-23', '08:55:00', '17:25:00', 1),
(2, 'Reyansh Patel', '2025-07-24', '09:05:00', '17:15:00', 1),
(2, 'Reyansh Patel', '2025-07-25', '09:10:00', '17:20:00', 1),
(2, 'Reyansh Patel', '2025-07-26', '10:00:00', '15:00:00', 1), -- Saturday half-day

-- Week 5 (July 28-31)
(2, 'Reyansh Patel', '2025-07-28', '09:00:00', '17:00:00', 1),
(2, 'Reyansh Patel', '2025-07-29', NULL, NULL, 0), -- Absent
(2, 'Reyansh Patel', '2025-07-30', '09:05:00', '17:25:00', 1),
(2, 'Reyansh Patel', '2025-07-31', '08:50:00', '17:10:00', 1);

-- Aarav Sharma (employee_id = 3) - Employee, regular attendance
INSERT INTO attendance (emp_id, emp_name, date, check_in, check_out, work_day) VALUES
-- Week 1 (July 1-5)
(3, 'Aarav Sharma', '2025-07-01', '08:45:00', '17:30:00', 1),
(3, 'Aarav Sharma', '2025-07-02', '08:50:00', '17:25:00', 1),
(3, 'Aarav Sharma', '2025-07-03', '08:55:00', '17:20:00', 1),
(3, 'Aarav Sharma', '2025-07-04', '09:00:00', '17:15:00', 1),
(3, 'Aarav Sharma', '2025-07-05', NULL, NULL, 0), -- Saturday absent

-- Week 2 (July 7-12)
(3, 'Aarav Sharma', '2025-07-07', '08:45:00', '17:30:00', 1),
(3, 'Aarav Sharma', '2025-07-08', '08:50:00', '17:25:00', 1),
(3, 'Aarav Sharma', '2025-07-09', '08:55:00', '17:20:00', 1),
(3, 'Aarav Sharma', '2025-07-10', '09:00:00', '17:15:00', 1),
(3, 'Aarav Sharma', '2025-07-11', NULL, NULL, 0), -- Absent
(3, 'Aarav Sharma', '2025-07-12', '09:30:00', '16:00:00', 1), -- Saturday half-day

-- Week 3 (July 14-19)
(3, 'Aarav Sharma', '2025-07-14', '08:45:00', '17:30:00', 1),
(3, 'Aarav Sharma', '2025-07-15', '08:50:00', '17:25:00', 1),
(3, 'Aarav Sharma', '2025-07-16', NULL, NULL, 0), -- Absent
(3, 'Aarav Sharma', '2025-07-17', '08:55:00', '17:20:00', 1),
(3, 'Aarav Sharma', '2025-07-18', '09:00:00', '17:15:00', 1),
(3, 'Aarav Sharma', '2025-07-19', NULL, NULL, 0), -- Saturday absent

-- Week 4 (July 21-26)
(3, 'Aarav Sharma', '2025-07-21', '08:45:00', '17:30:00', 1),
(3, 'Aarav Sharma', '2025-07-22', '08:50:00', '17:25:00', 1),
(3, 'Aarav Sharma', '2025-07-23', '08:55:00', '17:20:00', 1),
(3, 'Aarav Sharma', '2025-07-24', '09:00:00', '17:15:00', 1),
(3, 'Aarav Sharma', '2025-07-25', NULL, NULL, 0), -- Absent
(3, 'Aarav Sharma', '2025-07-26', NULL, NULL, 0), -- Saturday absent

-- Week 5 (July 28-31)
(3, 'Aarav Sharma', '2025-07-28', '08:45:00', '17:30:00', 1),
(3, 'Aarav Sharma', '2025-07-29', '08:50:00', '17:25:00', 1),
(3, 'Aarav Sharma', '2025-07-30', '08:55:00', '17:20:00', 1),
(3, 'Aarav Sharma', '2025-07-31', '09:00:00', '17:15:00', 1);

-- Vivaan Mehta (employee_id = 4) - Employee, some leaves
INSERT INTO attendance (emp_id, emp_name, date, check_in, check_out, work_day) VALUES
-- Week 1 (July 1-5)
(4, 'Vivaan Mehta', '2025-07-01', '09:15:00', '17:45:00', 1),
(4, 'Vivaan Mehta', '2025-07-02', '09:20:00', '17:40:00', 1),
(4, 'Vivaan Mehta', '2025-07-03', NULL, NULL, 0), -- Absent
(4, 'Vivaan Mehta', '2025-07-04', '09:10:00', '17:50:00', 1),
(4, 'Vivaan Mehta', '2025-07-05', NULL, NULL, 0), -- Saturday absent

-- Week 2 (July 7-12)
(4, 'Vivaan Mehta', '2025-07-07', '09:15:00', '17:45:00', 1),
(4, 'Vivaan Mehta', '2025-07-08', '09:20:00', '17:40:00', 1),
(4, 'Vivaan Mehta', '2025-07-09', '09:10:00', '17:50:00', 1),
(4, 'Vivaan Mehta', '2025-07-10', '09:05:00', '17:55:00', 1),
(4, 'Vivaan Mehta', '2025-07-11', NULL, NULL, 0), -- Absent
(4, 'Vivaan Mehta', '2025-07-12', '10:00:00', '15:30:00', 1), -- Saturday half-day

-- Week 3 (July 14-19)
(4, 'Vivaan Mehta', '2025-07-14', '09:15:00', '17:45:00', 1),
(4, 'Vivaan Mehta', '2025-07-15', NULL, NULL, 0), -- Absent
(4, 'Vivaan Mehta', '2025-07-16', '09:20:00', '17:40:00', 1),
(4, 'Vivaan Mehta', '2025-07-17', '09:10:00', '17:50:00', 1),
(4, 'Vivaan Mehta', '2025-07-18', '09:05:00', '17:55:00', 1),
(4, 'Vivaan Mehta', '2025-07-19', NULL, NULL, 0), -- Saturday absent

-- Week 4 (July 21-26)
(4, 'Vivaan Mehta', '2025-07-21', '09:15:00', '17:45:00', 1),
(4, 'Vivaan Mehta', '2025-07-22', '09:20:00', '17:40:00', 1),
(4, 'Vivaan Mehta', '2025-07-23', '09:10:00', '17:50:00', 1),
(4, 'Vivaan Mehta', '2025-07-24', NULL, NULL, 0), -- Absent
(4, 'Vivaan Mehta', '2025-07-25', '09:05:00', '17:55:00', 1),
(4, 'Vivaan Mehta', '2025-07-26', NULL, NULL, 0), -- Saturday absent

-- Week 5 (July 28-31)
(4, 'Vivaan Mehta', '2025-07-28', '09:15:00', '17:45:00', 1),
(4, 'Vivaan Mehta', '2025-07-29', '09:20:00', '17:40:00', 1),
(4, 'Vivaan Mehta', '2025-07-30', '09:10:00', '17:50:00', 1),
(4, 'Vivaan Mehta', '2025-07-31', NULL, NULL, 0); -- Absent

-- -----------------------------
-- =============LEAVE APPLICATIONS======
-- Leave applications for Reyansh Patel (employee_id = 2)
INSERT INTO leave_applications (employee_id, employee_name, leave_type, from_date, to_date, no_of_days, reason, status) VALUES
(2, 'Reyansh Patel', 'CL(Casual Leave)', '2025-07-07', '2025-07-07', 1, 'Personal work', 'Pending'),
(2, 'Reyansh Patel', 'SL(Sick Leave)', '2025-07-10', '2025-07-10', 1, 'Fever', 'Approved'),
(2, 'Reyansh Patel', 'EL(Earned Leave)', '2025-07-11', '2025-07-11', 1, 'Day off', 'Rejected'),
(2, 'Reyansh Patel', 'LWP(Leave Without Pay)', '2025-07-18', '2025-07-18', 1, 'Relative visiting', 'Approved'),
(2, 'Reyansh Patel', 'CL(Casual Leave)', '2025-07-19', '2025-07-19', 1, 'Out of town', 'Approved'),
(2, 'Reyansh Patel', 'SL(Sick Leave)', '2025-07-22', '2025-07-22', 1, 'Not feeling well', 'Pending'),
(2, 'Reyansh Patel', 'EL(Earned Leave)', '2025-07-29', '2025-07-29', 1, 'Personal errands', 'Approved');

-- Leave applications for Aarav Sharma (employee_id = 3)
INSERT INTO leave_applications (employee_id, employee_name, leave_type, from_date, to_date, no_of_days, reason, status) VALUES
(3, 'Aarav Sharma', 'CL(Casual Leave)', '2025-07-05', '2025-07-05', 1, 'Weekend trip', 'Approved'),
(3, 'Aarav Sharma', 'EL(Earned Leave)', '2025-07-08', '2025-07-08', 1, 'Need a break', 'Rejected'),
(3, 'Aarav Sharma', 'LWP(Leave Without Pay)', '2025-07-11', '2025-07-11', 1, 'Not feeling well', 'Approved'),
(3, 'Aarav Sharma', 'CL(Casual Leave)', '2025-07-14', '2025-07-14', 1, 'Personal work', 'Pending'),
(3, 'Aarav Sharma', 'EL(Earned Leave)', '2025-07-16', '2025-07-16', 1, 'Mental health day', 'Approved'),
(3, 'Aarav Sharma', 'CL(Casual Leave)', '2025-07-19', '2025-07-19', 1, 'Family event', 'Approved'),
(3, 'Aarav Sharma', 'LWP(Leave Without Pay)', '2025-07-25', '2025-07-25', 1, 'Personal work', 'Approved'),
(3, 'Aarav Sharma', 'CL(Casual Leave)', '2025-07-26', '2025-07-26', 1, 'Weekend getaway', 'Approved');

-- Leave applications for Vivaan Mehta (employee_id = 4)
INSERT INTO leave_applications (employee_id, employee_name, leave_type, from_date, to_date, no_of_days, reason, status) VALUES
(4, 'Vivaan Mehta', 'LWP(Leave Without Pay)', '2025-07-03', '2025-07-03', 1, 'Fever and cold', 'Approved'),
(4, 'Vivaan Mehta', 'EL(Earned Leave)', '2025-07-04', '2025-07-04', 1, 'Need a day off', 'Pending'),
(4, 'Vivaan Mehta', 'CL(Casual Leave)', '2025-07-05', '2025-07-05', 1, 'Personal commitment', 'Approved'),
(4, 'Vivaan Mehta', 'CL(Casual Leave)', '2025-07-08', '2025-07-08', 1, 'Family visit', 'Rejected'),
(4, 'Vivaan Mehta', 'EL(Earned Leave)', '2025-07-11', '2025-07-11', 1, 'Day off', 'Approved'),
(4, 'Vivaan Mehta', 'SL(Sick Leave)', '2025-07-15', '2025-07-15', 1, 'Medical checkup', 'Approved'),
(4, 'Vivaan Mehta', 'LWP(Leave Without Pay)', '2025-07-19', '2025-07-19', 1, 'Family function', 'Approved'),
(4, 'Vivaan Mehta', 'SL(Sick Leave)', '2025-07-22', '2025-07-22', 1, 'Not feeling well', 'Pending'),
(4, 'Vivaan Mehta', 'EL(Earned Leave)', '2025-07-24', '2025-07-24', 1, 'Personal day', 'Approved'),
(4, 'Vivaan Mehta', 'CL(Casual Leave)', '2025-07-26', '2025-07-26', 1, 'Out of station', 'Approved'),
(4, 'Vivaan Mehta', 'LWP(Leave Without Pay)', '2025-07-31', '2025-07-31', 1, 'Not feeling well', 'Approved');








select * from attendance;
select * from leave_applications;












