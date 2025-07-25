CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE,
    experience INT,
    active_status BOOLEAN
);
INSERT INTO employees (emp_id, name, department, salary, hire_date, experience, active_status) VALUES
(1, 'Alice',     'HR',        50000.00, '2019-01-15', 5, TRUE),
(2, 'Bob',       'IT',        70000.00, '2020-03-20', 4, TRUE),
(3, 'Charlie',   'Finance',   65000.00, '2018-11-05', 6, FALSE),
(4, 'David',     'Marketing', 55000.00, '2021-06-10', 3, TRUE),
(5, 'Eve',       'IT',        75000.00, '2017-08-01', 7, TRUE),
(6, 'Frank',     'HR',        48000.00, '2022-02-14', 2, FALSE),
(7, 'Grace',     'Finance',   67000.00, '2016-09-25', 8, TRUE),
(8, 'Heidi',     'Marketing', 52000.00, '2023-01-01', 1, TRUE),
(9, 'Ivan',      'IT',        80000.00, '2015-05-30', 9, FALSE),
(10,'Judy',      'Finance',   60000.00, '2020-12-12', 4, TRUE);





SELECT * FROM employees;
SELECT   distinct department FROM employees;

-- operators and where clause
SELECT * FROM employees;
SELECT * FROM employees WHERE experience>5;
SELECT * FROM employees WHERE active_status=0;
SELECT * FROM employees WHERE salary>10000 AND salary<50000;
SELECT * FROM employees WHERE salary BETWEEN 10000 AND 50000;
SELECT * FROM employees WHERE  department IN ('HR','IT');
SELECT * FROM employees WHERE name LIKE 'A%';
SELECT * FROM employees WHERE name IS NULL;
SELECT * FROM employees WHERE name IS NOT NULL;

SET @x=20;
SELECT @x as data ;
SELECT CONCAT('  NAME  ',name) AS DATA  FROM employees;

-- AGGREGATE FUNCTION-- 
SELECT * FROM employees;
SELECT COUNT(*) as TOTAL_EMP FROM employees;
SELECT COUNT(name) as TOTAL_NAME FROM employees;
SELECT MAX(salary) as MAX_SAL FROM employees;
SELECT MIN(salary) as MIN_SAL FROM employees;
SELECT AVG(salary) as AVG_SAL FROM employees;
SELECT SUM(salary) as TOTAL_SALARY FROM employees;






-- ORDER BY CLAUSE
SELECT * FROM employees;
SELECT * FROM employees ORDER BY department;
SELECT * FROM employees ORDER BY experience DESC;
SELECT * FROM employees ORDER BY salary DESC;


-- GROUP BY
SELECT department,MAX(salary) as MAX_SAL FROM employees GROUP BY department ORDER BY MAX_SAL DESC;
SELECT department,AVG(salary) as AVG_SAL FROM employees GROUP BY department;


-- HAVING
SELECT department,COUNT(*) as TOTAL_EMP,MAX(salary) as MAX_SAL FROM employees WHERE TOTAL_EMP=2   GROUP BY department HAVING MAX_SAL <60000;
SELECT department,COUNT(*) as TOTAL_EMP,AVG(salary) as AVG_SAL FROM employees GROUP BY department HAVING AVG_SAL >50000;

show tables;
USE mysqlpractice;

show databases;
create database mern_stack;
use mern_stack;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);
INSERT INTO users (name, email) VALUES
('Alok Kumar', 'alok@example.com'),
('Binod Das', 'binod@example.com'),
('Rakesh Sharma', 'rakesh@example.com'),
('Sameer Mohanty', 'sameer@example.com');

select * from students;
insert into students(name,email)
values
('alok','alok123@gmail.com');
desc students;
select * from users;
show tables;


CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  position VARCHAR(100)
);
insert into employees(name,email,position)
value
('hr','hr@gmail.com','HR');
select * from employees;
show databases;



show databases;




drop database auth_db
CREATE DATABASE auth_db;
USE auth_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
select * from users;

-- related to authentication starts
show databases;
create database user;
drop database user;
use user;
drop table users;
create table users(
id int primary key auto_increment,
name varchar(30) NOT NULL,
email varchar(30) NOT NULL,
password varchar(255) NOT NULL
);
select * from users;







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





