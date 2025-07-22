import db from "../config/db.js";
import bcrypt from "bcrypt";

export const registerEmployee = (req, res) => {
    const { name, email, phone, salary, dateOfJoining, employeeType, experience, department } = req.body;
    const preJoiningExperience = employeeType === 'Fresher' ? 0 : parseFloat(experience) || 0;

    // Insert into employees
    const insertEmployeeSQL = `
        INSERT INTO employees 
        (name, email, phone, salary, dateOfJoining, employeeType, experience, department)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(insertEmployeeSQL, [name, email, phone, salary, dateOfJoining, employeeType, preJoiningExperience, department], (err, result) => {
        if (err) {
            console.error('Error inserting employee:', err);
            return res.status(500).send('Failed to insert employee');
        }

        const empId = result.insertId;
        const rawPassword = `${name.substring(0, 3).toLowerCase()}123`;
        const userRole = department.toLowerCase() === 'hr' ? 'hr' : 'employee';

        bcrypt.hash(rawPassword, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing password:', hashErr);
                return res.status(500).send('Error creating user password');
            }

            // Insert into users
            const insertUserSQL = `
                INSERT INTO users (employee_id, name, email, password, role, department) 
                VALUES (?, ?, ?, ?, ?, ?)`;

            db.query(insertUserSQL, [empId, name, email, hashedPassword, userRole, department], (errUser) => {
                if (errUser) {
                    console.error('Error inserting user:', errUser);
                    return res.status(500).send('Employee added, but user creation failed');
                }

                // Insert default EmployeePermission WITHOUT department
                const insertPermissionSQL = `
                    INSERT INTO EmployeePermission (employee_id, E_add, E_read, E_edit, E_delete)
                    VALUES (?, false, false, false, false)`;

                db.query(insertPermissionSQL, [empId], (permErr) => {
                    if (permErr) {
                        console.error('Error inserting EmployeePermission:', permErr);
                        // continue without failing the whole request
                    }

                    const joiningDate = new Date(dateOfJoining);
                    const today = new Date();
                    const inCompanyExperience = +((today - joiningDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(2);
                    const totalExperience = +(preJoiningExperience + inCompanyExperience).toFixed(2);

                    if (inCompanyExperience < 0.5) {
                        // Insert into employee_increments with default values
                        const insertIncrementSQL = `
                            INSERT INTO employee_increments 
                            (emp_id, emp_name, experience_before_joining, experience_in_company, total_experience, avg_rating, performance, increment_percent, department) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                        db.query(insertIncrementSQL, [empId, name, preJoiningExperience, inCompanyExperience, totalExperience, 0, 'Not Eligible', 0, department], (err3) => {
                            if (err3) {
                                console.error('Error inserting increment:', err3);
                                return res.status(500).send('Employee added, but increment insertion failed');
                            }
                            res.send('Employee, User, Permissions, Increment added (Not Eligible)');
                        });
                    } else {
                        // Fetch avg rating
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
                                    (emp_id, emp_name, experience_before_joining, experience_in_company, total_experience, avg_rating, performance, increment_percent, department) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                                db.query(insertIncrementSQL, [empId, name, preJoiningExperience, inCompanyExperience, totalExperience, avgRating, performance_label, increment_percent, department], (err4) => {
                                    if (err4) {
                                        console.error('Error inserting increment:', err4);
                                        return res.status(500).send('Employee added, but increment insertion failed');
                                    }
                                    res.send('Employee, User, Permissions, Increment added successfully');
                                });
                            });
                        });
                    }
                });
            });
        });
    });
};
export const registerHR = (req, res) => {
    const { name, email, phone, salary, dateOfJoining, employeeType, experience } = req.body;
    const department = 'HR';  // Forcefully set department as HR
    const preJoiningExperience = employeeType === 'Fresher' ? 0 : parseFloat(experience) || 0;

    const insertEmployeeSQL = `
        INSERT INTO employees 
        (name, email, phone, salary, dateOfJoining, employeeType, experience, department)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(insertEmployeeSQL, [name, email, phone, salary, dateOfJoining, employeeType, preJoiningExperience, department], (err, result) => {
        if (err) {
            console.error('Error inserting HR:', err);
            return res.status(500).send('Failed to insert HR');
        }

        const empId = result.insertId;
        const rawPassword = `${name.substring(0, 3).toLowerCase()}123`;
        const userRole = 'hr';  // Role fixed as HR

        bcrypt.hash(rawPassword, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing HR password:', hashErr);
                return res.status(500).send('Error creating HR user password');
            }

            const insertUserSQL = `
                INSERT INTO users (employee_id, name, email, password, role, department) 
                VALUES (?, ?, ?, ?, ?, ?)`;

            db.query(insertUserSQL, [empId, name, email, hashedPassword, userRole, department], (errUser) => {
                if (errUser) {
                    console.error('Error inserting HR user:', errUser);
                    return res.status(500).send('HR added, but user creation failed');
                }

                const insertPermissionSQL = `
                    INSERT INTO EmployeePermission (employee_id, E_add, E_read, E_edit, E_delete)
                    VALUES (?, false, false, false, false)`;

                db.query(insertPermissionSQL, [empId], (permErr) => {
                    if (permErr) {
                        console.error('Error inserting HR Permission:', permErr);
                        // Proceed further even if permission fails
                    }

                    const joiningDate = new Date(dateOfJoining);
                    const today = new Date();
                    const inCompanyExperience = +((today - joiningDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(2);
                    const totalExperience = +(preJoiningExperience + inCompanyExperience).toFixed(2);

                    if (inCompanyExperience < 0.5) {
                        const insertIncrementSQL = `
                            INSERT INTO employee_increments 
                            (emp_id, emp_name, experience_before_joining, experience_in_company, total_experience, avg_rating, performance, increment_percent, department) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                        db.query(insertIncrementSQL, [empId, name, preJoiningExperience, inCompanyExperience, totalExperience, 0, 'Not Eligible', 0, department], (err3) => {
                            if (err3) {
                                console.error('Error inserting HR increment:', err3);
                                return res.status(500).send('HR added, but increment insertion failed');
                            }
                            res.send('HR, User, Permissions, Increment added (Not Eligible)');
                        });
                    } else {
                        const avgRatingSQL = `SELECT AVG(rating) AS avgRating FROM tasks WHERE employee_id = ?`;

                        db.query(avgRatingSQL, [empId], (err2, ratingResults) => {
                            if (err2) {
                                console.error('Error fetching HR average rating:', err2);
                                return res.status(500).send('HR added, but failed to fetch average rating');
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
                                    console.error('Error fetching performance level for HR:', err3);
                                    return res.status(500).send('Failed to fetch HR performance level');
                                }

                                const { performance_label, increment_percent } = performanceResults[0];

                                const insertIncrementSQL = `
                                    INSERT INTO employee_increments 
                                    (emp_id, emp_name, experience_before_joining, experience_in_company, total_experience, avg_rating, performance, increment_percent, department) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                                db.query(insertIncrementSQL, [empId, name, preJoiningExperience, inCompanyExperience, totalExperience, avgRating, performance_label, increment_percent, department], (err4) => {
                                    if (err4) {
                                        console.error('Error inserting HR increment:', err4);
                                        return res.status(500).send('HR added, but increment insertion failed');
                                    }
                                    res.send('HR, User, Permissions, Increment added successfully');
                                });
                            });
                        });
                    }
                });
            });
        });
    });
};



// --------- Get all Employees excluding the first record
export const getAllEmployees = (req, res) => {
    db.query('SELECT * FROM employees LIMIT 1000 OFFSET 1', (err, result) => {
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

// --------- Assign Task to Employees and start,pause and finish
export const assignTaskToEmployees = (req, res) => {
    const { employee_id, employee_name, role, task_name, assignment_date, time_required } = req.body;

    const sql = `
    INSERT INTO tasks 
    (employee_id, employee_name, department, task_name, assignment_date, time_required, task_status, rating)
    VALUES (?, ?, ?, ?, ?, ?, 'Not Completed', 0)`;

    db.query(sql, [employee_id, employee_name, role, task_name, assignment_date, time_required], (err, result) => {
        if (err) {
            console.error('Failed to assign task:', err);
            return res.status(500).send('Failed to assign task.');
        }
        res.send('Task Assigned Successfully!');
    });
};

// Get all tasks for a specific employee
export const getAllTasksByEmployee = (req, res) => {
    const { employeeId } = req.params;
    const query = 'SELECT * FROM tasks WHERE employee_id = ?';

    db.query(query, [employeeId], (err, results) => {
        if (err) return res.status(500).send('Failed to fetch tasks');
        res.json(results);
    });
};

// Start a task
export const startTask = (req, res) => {
    const { taskId } = req.body;
    const sql = `
        UPDATE tasks 
        SET start_time = NOW(), task_status = 'In Progress', time_accumulated = IFNULL(time_accumulated, 0)
        WHERE id = ? AND task_status != 'Completed'
    `;
    db.query(sql, [taskId], (err) => {
        if (err) return res.status(500).send('Start failed');
        res.send('Task started');
    });
};

// Pause a task
export const pauseTask = (req, res) => {
    const { taskId } = req.body;
    const sql = `SELECT start_time, time_accumulated FROM tasks WHERE id = ? AND task_status = 'In Progress'`;

    db.query(sql, [taskId], (err, results) => {
        if (err || results.length === 0) return res.status(400).send('Task not in progress or does not exist');

        const { start_time, time_accumulated } = results[0];
        const now = new Date();
        const start = new Date(start_time);
        const elapsed = now - start; // ms
        const updatedAccumulated = (time_accumulated || 0) + elapsed;

        const updateSql = `
            UPDATE tasks 
            SET pause_time = NOW(), time_accumulated = ?, task_status = 'Paused'
            WHERE id = ?
        `;
        db.query(updateSql, [updatedAccumulated, taskId], (err2) => {
            if (err2) return res.status(500).send('Pause failed');
            res.send('Task paused');
        });
    });
};

// Resume a task
export const resumeTask = (req, res) => {
    const { taskId } = req.body;
    const sql = `
        UPDATE tasks 
        SET resume_time = NOW(), start_time = NOW(), task_status = 'In Progress'
        WHERE id = ? AND task_status = 'Paused'
    `;
    db.query(sql, [taskId], (err, result) => {
        if (err) return res.status(500).send('Resume failed');
        if (result.affectedRows === 0) return res.status(400).send('Task not paused or does not exist');
        res.send('Task resumed');
    });
};

export const finishTask = (req, res) => {
    const { taskId } = req.body;
    const sql = `SELECT start_time, time_accumulated, time_required, task_status FROM tasks WHERE id = ?`;

    db.query(sql, [taskId], (err, result) => {
        if (err || result.length === 0) return res.status(500).send('Task not found');

        const { start_time, time_accumulated, time_required, task_status } = result[0];

        if (!['In Progress', 'Paused'].includes(task_status)) {
            return res.status(400).send('Task is not in progress or paused, cannot finish');
        }

        let totalTimeMs = time_accumulated || 0;

        if (task_status === 'In Progress' && start_time) {
            const now = new Date();
            const start = new Date(start_time);
            totalTimeMs += now - start;
        }

        const totalTimeHours = parseFloat((totalTimeMs / (1000 * 60 * 60)).toFixed(2));
        const formattedTime = formatDuration(totalTimeMs);

        const diff = time_required - totalTimeHours;
        console.log(`Task ID: ${taskId}`);
        console.log(`Time Required: ${time_required} hrs`);
        console.log(`Time Taken: ${totalTimeHours} hrs`);
        console.log(`Diff: ${diff}`);

        let rating = 1;

        if (totalTimeHours < (time_required / 2)) {
            rating = 4; // Bonus: Faster than 50% time gets 4 stars
        } else if (diff >= 0 && diff <= 0.5) {
            rating = 5;
        } else if (diff > 0.5 && diff <= 1) {
            rating = 4;
        } else if (diff < 0 && Math.abs(diff) <= 0.5) {
            rating = 4;
        } else if (diff < 0 && Math.abs(diff) <= 1) {
            rating = 3;
        } else if (diff < 0 && Math.abs(diff) <= 2) {
            rating = 2;
        } else {
            rating = 1;
        }

        rating = Math.max(1, Math.min(5, Math.floor(rating)));
        console.log(`Calculated Rating: ${rating}`);

        const updateSql = `
            UPDATE tasks 
            SET task_status = 'Completed', end_time = NOW(), time_taken = ?, rating = ?
            WHERE id = ?
        `;

        db.query(updateSql, [formattedTime, rating, taskId], (err2) => {
            if (err2) return res.status(500).send('Finish failed');

            res.json({
                message: 'Task completed',
                timeTaken: formattedTime,
                timeTakenInHours: totalTimeHours,
                timeRequired: time_required,
                timeDifference: diff.toFixed(2),
                rating
            });
        });
    });
};

// Utility: Convert milliseconds to HH:MM:SS
const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
};




//Related To Permission
export const getEmployeeWithPermission = (req, res) => {
    const employeeId = req.params.id;

    const employeeSQL = `SELECT * FROM employees WHERE id = ?`;
    const permissionSQL = `SELECT * FROM EmployeePermission WHERE employee_id = ?`;

    db.query(employeeSQL, [employeeId], (err, employeeResults) => {
        if (err) {
            console.error('Error fetching employee:', err);
            return res.status(500).send('Failed to fetch employee data');
        }

        if (employeeResults.length === 0) {
            return res.status(404).send('Employee not found');
        }

        db.query(permissionSQL, [employeeId], (err2, permissionResults) => {
            if (err2) {
                console.error('Error fetching permissions:', err2);
                return res.status(500).send('Failed to fetch employee permissions');
            }

            res.json({
                employee: employeeResults[0],
                permissions: permissionResults[0] || null
            });
        });
    });
};
export const updateEmployeePermission = (req, res) => {
    const employeeId = req.params.id;
    const { E_add, E_read, E_edit, E_delete } = req.body;

    const updateSQL = `
        UPDATE EmployeePermission
        SET E_add = ?, E_read = ?, E_edit = ?, E_delete = ?
        WHERE employee_id = ?`;

    db.query(updateSQL, [E_add, E_read, E_edit, E_delete, employeeId], (err, result) => {
        if (err) {
            console.error('Error updating permissions:', err);
            return res.status(500).send('Failed to update permissions');
        }

        res.send('Permissions updated successfully');
    });
};


// Controller to fetch granted permissions of an employee
export const getGrantedPermissions = (req, res) => {
    const employeeId = req.params.id;

    const permissionSQL = `SELECT * FROM EmployeePermission WHERE employee_id = ?`;

    db.query(permissionSQL, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching permissions:', err);
            return res.status(500).send('Failed to fetch permissions');
        }

        if (results.length === 0) {
            return res.status(404).send('Permissions not found for this employee');
        }

        const permissions = results[0];
        res.json(permissions);
    });
};

//change password controller
export const changePassword = (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    db.query('SELECT password FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('DB error while fetching user password:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const storedHash = results[0].password;

        bcrypt.compare(oldPassword, storedHash, (compareErr, isMatch) => {
            if (compareErr) {
                console.error('Password compare error:', compareErr);
                return res.status(500).json({ message: 'Internal error.' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Old password is incorrect.' });
            }

            bcrypt.hash(newPassword, 10, (hashErr, hashedNewPassword) => {
                if (hashErr) {
                    console.error('Password hash error:', hashErr);
                    return res.status(500).json({ message: 'Error hashing new password.' });
                }

                db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId], (updateErr) => {
                    if (updateErr) {
                        console.error('DB error while updating password:', updateErr);
                        return res.status(500).json({ message: 'Failed to update password.' });
                    }

                    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
                });
            });
        });
    });
};


