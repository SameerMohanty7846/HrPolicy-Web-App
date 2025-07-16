import db from "../config/db.js";
import bcrypt from "bcrypt";

// Registering employee with increment check
export const registerEmployee = (req, res) => {
    const { name, email, phone, salary, dateOfJoining, employeeType, experience } = req.body;
    const preJoiningExperience = employeeType === 'Fresher' ? 0 : parseFloat(experience) || 0;

    const insertEmployeeSQL = `
        INSERT INTO employees 
        (name, email, phone, salary, dateOfJoining, employeeType, experience)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(insertEmployeeSQL, [name, email, phone, salary, dateOfJoining, employeeType, preJoiningExperience], (err, result) => {
        if (err) {
            console.error('Error inserting employee:', err);
            return res.status(500).send('Failed to insert employee');
        }

        const empId = result.insertId;
        const rawPassword = `${name.substring(0, 3).toLowerCase()}123`;
        const userRole = 'employee';

        bcrypt.hash(rawPassword, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing password:', hashErr);
                return res.status(500).send('Error creating user password');
            }

            // ✅ Insert employee_id into users table
            const insertUserSQL = `
                INSERT INTO users (employee_id, name, email, password, role) 
                VALUES (?, ?, ?, ?, ?)`;

            db.query(insertUserSQL, [empId, name, email, hashedPassword, userRole], (errUser) => {
                if (errUser) {
                    console.error('Error inserting user:', errUser);
                    return res.status(500).send('Employee added, but user creation failed');
                }

                const joiningDate = new Date(dateOfJoining);
                const today = new Date();
                const inCompanyExperience = +((today - joiningDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(2);
                const totalExperience = +(preJoiningExperience + inCompanyExperience).toFixed(2);

                if (inCompanyExperience < 0.5) {
                    const insertIncrementSQL = `
                        INSERT INTO employee_increments 
                        (emp_id, emp_name, experience_before_joining, experience_in_company, total_experience, avg_rating, performance, increment_percent) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                    db.query(insertIncrementSQL, [empId, name, preJoiningExperience, inCompanyExperience, totalExperience, 0, 'Not Eligible', 0], (err3) => {
                        if (err3) {
                            console.error('Error inserting increment:', err3);
                            return res.status(500).send('Employee added, but increment insertion failed');
                        }
                        res.send('Employee, User account with hashed password, and Increment details added successfully (Not Eligible for Increment)');
                    });
                } else {
                    const avgRatingSQL = `SELECT AVG(rating) AS avgRating FROM tasks WHERE employee_id = ?`;

                    db.query(avgRatingSQL, [empId], (err2, ratingResults) => {
                        if (err2) {
                            console.error('Error fetching average rating:', err2);
                            return res.status(500).send('Employee added, but failed to fetch average rating');
                        }

                        const avgRating = parseFloat(ratingResults[0].avgRating) || 0;
                        const flooredRating = Math.max(1, Math.floor(avgRating));

                        const performanceSQL = `
                            SELECT performance_label, increment_percent
                            FROM performance_levels
                            WHERE min_rating = ?
                            LIMIT 1`;

                        db.query(performanceSQL, [flooredRating], (err3, performanceResults) => {
                            if (err3 || performanceResults.length === 0) {
                                console.error('Error fetching performance level:', err3);
                                return res.status(500).send('Failed to fetch performance level');
                            }

                            const { performance_label, increment_percent } = performanceResults[0];

                            const insertIncrementSQL = `
                                INSERT INTO employee_increments 
                                (emp_id, emp_name, experience_before_joining, experience_in_company, total_experience, avg_rating, performance, increment_percent) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                            db.query(insertIncrementSQL, [empId, name, preJoiningExperience, inCompanyExperience, totalExperience, avgRating, performance_label, increment_percent], (err4) => {
                                if (err4) {
                                    console.error('Error inserting increment:', err4);
                                    return res.status(500).send('Employee added, but increment insertion failed');
                                }
                                res.send('Employee, User account with hashed password, and Increment details added successfully');
                            });
                        });
                    });
                }
            });
        });
    });
};

// --------- Get all Employees
export const getAllEmployees = (req, res) => {
    db.query('SELECT * FROM employees', (err, result) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).send("Failed to fetch employees");
        }
        res.json(result);
    });
};

// --------- Delete Employee
export const deleteEmployee = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting employee:', err);
            return res.status(500).send('Failed to delete employee');
        }
        if (result.affectedRows === 0) return res.status(404).send('Employee not found');
        res.send('Employee deleted successfully');
    });
};

// --------- Get Salary Report
export const getSalaryReport = (req, res) => {
    const query = `
    SELECT 
      e.name AS name,
      e.salary AS initialSalary,
      i.increment_percent AS incrementPercentage,
      ROUND(e.salary + (e.salary * i.increment_percent / 100), 2) AS newSalary
    FROM employees e
    JOIN employee_increments i ON e.id = i.emp_id`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching salary report:', err);
            return res.status(500).send('Failed to fetch salary report');
        }
        res.json(results);
    });
};

// --------- Get All Employee Increments
export const getEmployeeIncrements = (req, res) => {
    db.query('SELECT * FROM employee_increments', (err, results) => {
        if (err) {
            console.error('Error fetching increments:', err);
            return res.status(500).send('Failed to fetch employee increments');
        }
        res.json(results);
    });
};

// --------- Assign Task to Employees
export const assignTaskToEmployees = (req, res) => {
    const { employee_id, employee_name, task_name, assignment_date, time_required } = req.body;

    const sql = `
    INSERT INTO tasks 
    (employee_id, employee_name, task_name, assignment_date, time_required, task_status, rating)
    VALUES (?, ?, ?, ?, ?, 'Not Completed', 0)`;

    db.query(sql, [employee_id, employee_name, task_name, assignment_date, time_required], (err, result) => {
        if (err) {
            console.error('Failed to assign task:', err);
            return res.status(500).send('Failed to assign task.');
        }
        res.send('Task Assigned Successfully!');
    });
};
