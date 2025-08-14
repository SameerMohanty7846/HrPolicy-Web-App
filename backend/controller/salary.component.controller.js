import db from '../config/db.js';

// 1. Create Salary Component
export const createSalaryComponent = (req, res) => {
  const { name, type, based_on, days_calculated } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If days_calculated is not provided, default to 1 (Yes)
  const daysCalculatedValue = days_calculated !== undefined ? days_calculated : 1;

  db.query(
    `INSERT INTO salary_component_policy_master (name, type, based_on, days_calculated)
     VALUES (?, ?, ?, ?)`,
    [name, type, based_on || null, daysCalculatedValue],
    (error, result) => {
      if (error) {
        console.error('Error inserting salary component:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(201).json({ message: 'Component inserted', id: result.insertId });
    }
  );
};


// 2. Get All Components
export const getAllSalaryComponents = (req, res) => {
  db.query(`SELECT * FROM salary_component_policy_master`, (error, rows) => {
    if (error) {
      console.error('Error fetching components:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(rows);
  });
};



// 2. Get All Components excluding first
export const getAllSalaryComponentsExcludingFirst = (req, res) => {
  db.query(`SELECT * FROM salary_component_policy_master
ORDER BY id
LIMIT 18446744073709551615 OFFSET 1`, (error, rows) => {
    if (error) {
      console.error('Error fetching components:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(rows);
  });
};

// 3. Get Component by ID
export const getComponentById = (req, res) => {
  const { id } = req.params;

  db.query(`SELECT * FROM salary_component_policy_master WHERE id = ?`, [id], (error, rows) => {
    if (error) {
      console.error('Error fetching component by ID:', error);
      return res.status(500).json({ error: error.message });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.status(200).json(rows[0]);
  });
};

// 4. Get Component by Name
export const getComponentByName = (req, res) => {
  const { name } = req.params;

  db.query(`SELECT * FROM salary_component_policy_master WHERE name = ?`, [name], (error, rows) => {
    if (error) {
      console.error('Error fetching component by name:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(rows);
  });
};

// 5. Get Components by Type
export const getComponentsByType = (req, res) => {
  const { type } = req.params;

  db.query(`SELECT * FROM salary_component_policy_master WHERE type = ?`, [type], (error, rows) => {
    if (error) {
      console.error('Error fetching components by type:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(rows);
  });
};

// 6. Get Components by Value Type
export const getComponentsByValueType = (req, res) => {
  const { value_type } = req.params;

  db.query(
    `SELECT * FROM salary_component_policy_master WHERE value_type = ?`,
    [value_type],
    (error, rows) => {
      if (error) {
        console.error('Error fetching components by value type:', error);
        return res.status(500).json({ error: error.message });
      }
      res.status(200).json(rows);
    }
  );
};


export const getFreeLeavesByEmployeeAndMonth = (req, res) => {
  const { employee_id, monthYear } = req.params; // format: MM-YYYY
  const [month, year] = monthYear.split('-').map(num => parseInt(num, 10));

  // Calculate total days in month
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  const query = `
    SELECT 
      (SELECT COUNT(*) 
       FROM attendance 
       WHERE emp_id = ? 
         AND MONTH(date) = ? 
         AND YEAR(date) = ?) AS total_working_days,

      (SELECT COUNT(*) 
       FROM attendance 
       WHERE emp_id = ? 
         AND MONTH(date) = ? 
         AND YEAR(date) = ? 
         AND work_day = 1) AS present_days,

      (SELECT IFNULL(SUM(no_of_days), 0) 
       FROM leave_applications 
       WHERE employee_id = ? 
         AND MONTH(from_date) = ? 
         AND YEAR(from_date) = ? 
         AND status = 'Approved'
         AND leave_mode = 'Paid') AS total_paid_leaves,

      (SELECT IFNULL(SUM(no_of_days), 0) 
       FROM leave_applications 
       WHERE employee_id = ? 
         AND MONTH(from_date) = ? 
         AND YEAR(from_date) = ? 
         AND status = 'Approved'
         AND leave_mode = 'Free') AS total_free_leaves
  `;

  db.query(
    query,
    [
      employee_id, month, year, // total_working_days
      employee_id, month, year, // present_days
      employee_id, month, year, // total_paid_leaves
      employee_id, month, year  // total_free_leaves
    ],
    (error, results) => {
      if (error) {
        console.error("Error fetching attendance info:", error);
        return res.status(500).json({ error: error.message });
      }

      const row = results[0] || {};

      // Convert all numeric fields to actual numbers
      const totalWorkingDays = Number(row.total_working_days) || 0;
      const presentDays = Number(row.present_days) || 0;
      const totalPaidLeaves = Number(row.total_paid_leaves) || 0;
      const totalFreeLeaves = Number(row.total_free_leaves) || 0;

      const absentDays = totalWorkingDays - presentDays;
      const totalLeaves = totalPaidLeaves + totalFreeLeaves;

      res.status(200).json({
        employee_id,
        monthYear,
        total_days_in_month: totalDaysInMonth,
        total_working_days: totalWorkingDays,
        present_days: presentDays,
        absent_days: absentDays,
        total_paid_leaves: totalPaidLeaves,
        total_free_leaves: totalFreeLeaves,
        total_leaves: totalLeaves
      });
    }
  );
};



// /api/leaves/free/2/08-2025


//save payroll
// Insert Payroll Record


// export const createPayroll = async (req, res) => {
//     try {
//         const {
//             employee_id,
//             month,
//             year,
//             basic_salary,
//             total_days_in_month = null,
//             total_working_days = null,
//             total_leaves = null,
//             total_free_leaves = null,
//             total_paid_leaves = null,
//             leave_deductions = 0,
//             total_earnings = 0,
//             total_deductions = 0,
//             gross_salary = 0,
//             net_salary
//         } = req.body;

//         // Required fields check
//         if (!employee_id || !month || !year || !basic_salary || net_salary === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required fields"
//             });
//         }

//         // Month validation
//         if (month < 1 || month > 12) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Month must be between 1 and 12"
//             });
//         }

//         const connection = db.promise();
//         await connection.query("START TRANSACTION");

//         // Duplicate check
//         const [existing] = await connection.query(
//             `SELECT id FROM monthly_salary_reports WHERE employee_id = ? AND month = ? AND year = ?`,
//             [employee_id, month, year]
//         );
//         if (existing.length > 0) {
//             await connection.query("ROLLBACK");
//             return res.status(409).json({
//                 success: false,
//                 message: "Payroll already exists for this employee/month/year",
//                 existing_id: existing[0].id
//             });
//         }

//         // Insert into monthly_salary_reports
//         const insertSql = `
//             INSERT INTO monthly_salary_reports (
//                 employee_id, month, year, basic_salary,
//                 total_days_in_month, total_working_days, total_leaves,
//                 total_free_leaves, total_paid_leaves, leave_deductions,
//                 total_earnings, total_deductions, gross_salary, net_salary
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         const [result] = await connection.query(insertSql, [
//             employee_id,
//             month,
//             year,
//             basic_salary,
//             total_days_in_month,
//             total_working_days,
//             total_leaves,
//             total_free_leaves,
//             total_paid_leaves,
//             leave_deductions,
//             total_earnings,
//             total_deductions,
//             gross_salary,
//             net_salary
//         ]);

//         await connection.query("COMMIT");

//         return res.status(201).json({
//             success: true,
//             payroll_id: result.insertId,
//             message: "Payroll record created successfully"
//         });

//     } catch (err) {
//         console.error("Error creating payroll:", err);
//         await db.promise().query("ROLLBACK");

//         if (err.code === 'ER_DUP_ENTRY') {
//             return res.status(409).json({
//                 success: false,
//                 message: "Payroll record already exists for this employee/month/year"
//             });
//         }
//         if (err.code === 'ER_NO_REFERENCED_ROW') {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid employee_id: Employee does not exist"
//             });
//         }

//         return res.status(500).json({
//             success: false,
//             message: "Failed to create payroll record"
//         });
//     }
// };




// // Get payroll records for ALL employees for a specific month/year
// export const getAllPayrolls = async (req, res) => {
//   try {
//     const { month, year } = req.params; // Only month and year from route

//     // Month names for formatting
//     const months = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];

//     // SQL query without employee_id filter
//     const sql = `
//       SELECT 
//         p.payroll_id,
//         p.employee_id,
//         p.month,
//         p.year,
//         p.basic_salary,
//         p.total_earnings,
//         p.total_deductions,
//         p.gross_salary,
//         p.leave_deductions,
//         p.leave_days,
//         p.net_salary,
//         p.created_at,
//         p.updated_at,
//         e.id AS emp_id,
//         e.name AS emp_name,
//         e.email AS emp_email,
//         e.phone AS emp_phone,
//         e.salary AS emp_monthly_salary,
//         e.dateOfJoining AS emp_join_date,
//         e.employeeType AS emp_type,
//         e.experience AS emp_experience,
//         e.department AS emp_department
//       FROM payroll_master p
//       JOIN employees e ON p.employee_id = e.id
//       WHERE p.month = ? AND p.year = ?
//       ORDER BY e.name ASC
//     `;

//     // Execute query
//     const [results] = await db.promise().query(sql, [month, year]);

//     // Format results
//     const formattedResults = results.map(record => ({
//       payroll_id: record.payroll_id,
//       employee: {
//         id: record.emp_id,
//         name: record.emp_name,
//         email: record.emp_email,
//         phone: record.emp_phone,
//         monthly_salary: Number(record.emp_monthly_salary),
//         date_of_joining: record.emp_join_date,
//         type: record.emp_type,
//         experience: Number(record.emp_experience),
//         department: record.emp_department
//       },
//       period: {
//         month: record.month,
//         month_name: months[record.month - 1],
//         year: record.year,
//         formatted: `${months[record.month - 1]} ${record.year}`
//       },
//       salary_components: {
//         basic: Number(record.basic_salary),
//         total_earnings: Number(record.total_earnings),
//         total_deductions: Number(record.total_deductions),
//         gross: Number(record.gross_salary),
//         net: Number(record.net_salary)
//       },
//       leave_details: {
//         days_taken: record.leave_days,
//         amount_deducted: Number(record.leave_deductions)
//       },
//       system_info: {
//         created_at: record.created_at,
//         updated_at: record.updated_at
//       }
//     }));

//     res.status(200).json({
//       success: true,
//       count: formattedResults.length,
//       data: formattedResults
//     });

//   } catch (err) {
//     console.error("Error fetching payroll records:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch payroll records",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };



//storing employee information
// Store Employee Salary Info + Salary Partitions
export const addEmployeeSalary = (req, res) => {
    const { 
        employee_id,
        employee_name,       // Name of employee
        basic_salary,        // Basic Salary
        other_earnings,      // New: replaces total_earnings in table
        total_deductions,
        gross_salary,
        employee_net_salary,
        partitions // Array of { component_name, component_type, input_type, value, based_on, amount }
    } = req.body;

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Transaction start failed', details: err });
        }

        // 1️⃣ Insert into EmployeeSalaryInfo
        const salaryInfoQuery = `
            INSERT INTO EmployeeSalaryInfo 
                (employee_id, employee_name, basic_salary, other_earnings, total_deductions, gross_salary, employee_net_salary)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const salaryInfoValues = [
            employee_id, employee_name, basic_salary, other_earnings, total_deductions, gross_salary, employee_net_salary
        ];

        db.query(salaryInfoQuery, salaryInfoValues, (err, result) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ error: 'Failed to insert salary info', details: err });
                });
            }

            const salaryId = result.insertId; // Generated salary_id for linking

            // 2️⃣ Insert into EmployeeSalaryPartition (if any)
            if (!partitions || partitions.length === 0) {
                return db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Transaction commit failed', details: err });
                        });
                    }
                    res.status(201).json({ message: 'Salary data saved successfully (no partitions)', salary_id: salaryId });
                });
            }

            const partitionQuery = `
                INSERT INTO EmployeeSalaryPartition 
                    (salary_id, component_name, component_type, input_type, value, based_on, amount)
                VALUES ?
            `;

            const partitionValues = partitions.map(p => [
                salaryId,
                p.component_name,
                p.component_type,
                p.input_type || null,
                p.value || null,
                p.based_on || null,
                p.amount || null
            ]);

            db.query(partitionQuery, [partitionValues], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Failed to insert salary partitions', details: err });
                    });
                }

                // ✅ Commit transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Transaction commit failed', details: err });
                        });
                    }
                    res.status(201).json({ message: 'Salary data saved successfully', salary_id: salaryId });
                });
            });
        });
    });
};

// GET /api/reports/salary/:month/:year
export const getMonthlySalaryData = (req, res) => {
  const { month, year } = req.params;

  const monthNumber = isNaN(month)
    ? new Date(`${month} 1, 2000`).getMonth() + 1
    : parseInt(month, 10);

  const yearNumber = parseInt(year, 10);

  if (isNaN(monthNumber)) {
    return res.status(400).json({ error: 'Invalid month parameter' });
  }
  if (isNaN(yearNumber)) {
    return res.status(400).json({ error: 'Invalid year parameter' });
  }

  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

  (async () => {
    try {
      // Attendance
      const attendance = await executeQuery(`
        SELECT 
          a.emp_id AS employee_id,
          e.name AS employee_name,
          SUM(CASE WHEN a.work_day = 1 THEN 1 ELSE 0 END) AS days_present
        FROM attendance a
        JOIN employees e ON a.emp_id = e.id
        WHERE MONTH(a.date) = ? AND YEAR(a.date) = ?
        GROUP BY a.emp_id, e.name
      `, [monthNumber, yearNumber]);

      const firstDay = `${yearNumber}-${String(monthNumber).padStart(2, '0')}-01`;
      const lastDay = new Date(yearNumber, monthNumber, 0).toISOString().split('T')[0];

      // Paid Leaves
      const paidLeaves = await executeQuery(`
        SELECT 
          la.employee_id,
          e.name AS employee_name,
          SUM(
            GREATEST(
              0,
              DATEDIFF(
                LEAST(la.to_date, ?),
                GREATEST(la.from_date, ?)
              ) + 1
            )
          ) AS paid_leaves
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        WHERE
          la.leave_mode = 'Paid'
          AND la.to_date >= ?
          AND la.from_date <= ?
        GROUP BY la.employee_id, e.name
      `, [lastDay, firstDay, firstDay, lastDay]);

      // Salary Info (latest per employee)
      const salaryInfo = await executeQuery(`
        SELECT 
          s.employee_id, 
          s.employee_name, 
          s.employee_net_salary, 
          s.salary_id
        FROM EmployeeSalaryInfo s
        JOIN (
          SELECT employee_id, MAX(created_at) AS max_created_at
          FROM EmployeeSalaryInfo
          GROUP BY employee_id
        ) latest 
          ON latest.employee_id = s.employee_id 
         AND latest.max_created_at = s.created_at
      `);

      // Salary Partitions with days_calculated from policy master
      const salaryPartitions = await executeQuery(`
        SELECT 
          esp.salary_id,
          esp.component_name,
          esp.component_type,
          esp.amount,
          esi.employee_id,
          COALESCE(spm.days_calculated, 1) AS days_calculated
        FROM EmployeeSalaryPartition esp
        JOIN EmployeeSalaryInfo esi ON esp.salary_id = esi.salary_id
        JOIN (
          SELECT employee_id, MAX(created_at) AS max_created_at
          FROM EmployeeSalaryInfo
          GROUP BY employee_id
        ) latest 
          ON latest.employee_id = esi.employee_id 
         AND latest.max_created_at = esi.created_at
        LEFT JOIN salary_component_policy_master spm 
          ON spm.name = esp.component_name
      `);

      // Maps for quick lookup
      const nameMap = new Map();
      const attendanceMap = new Map();
      attendance.forEach(row => {
        const empId = row.employee_id;
        attendanceMap.set(empId, Number(row.days_present) || 0);
        nameMap.set(empId, row.employee_name);
      });

      const paidLeaveMap = new Map();
      paidLeaves.forEach(row => {
        const empId = row.employee_id;
        paidLeaveMap.set(empId, Number(row.paid_leaves) || 0);
        if (!nameMap.has(empId)) nameMap.set(empId, row.employee_name);
      });

      const salaryInfoMap = new Map();
      salaryInfo.forEach(row => {
        const empId = row.employee_id;
        salaryInfoMap.set(empId, {
          net_salary: Number(row.employee_net_salary) || 0,
          salary_id: row.salary_id
        });
        if (!nameMap.has(empId)) nameMap.set(empId, row.employee_name);
      });

      const partitionsMap = new Map();
      salaryPartitions.forEach(row => {
        const empId = row.employee_id;
        if (!partitionsMap.has(empId)) {
          partitionsMap.set(empId, []);
        }
        partitionsMap.get(empId).push({
          component_name: row.component_name,
          component_type: row.component_type,
          amount: Number(row.amount) || 0,
          days_calculated: Number(row.days_calculated) || 0
        });
      });

      // Collect all employee IDs
      const allEmpIds = new Set([
        ...attendance.map(row => row.employee_id),
        ...paidLeaves.map(row => row.employee_id),
        ...salaryInfo.map(row => row.employee_id)
      ]);

      // Build final report
      let report = Array.from(allEmpIds).map(empId => ({
        employee_id: empId,
        employee_name: nameMap.get(empId) || '',
        days_present: attendanceMap.get(empId) || 0,
        paid_leaves: paidLeaveMap.get(empId) || 0,
        net_salary: salaryInfoMap.get(empId)?.net_salary || 0,
        partitions: partitionsMap.get(empId) || []
      }));

      // Exclude the first data record
      if (report.length > 0) {
        report = report.slice(1);
      }

      // If all have 0 days_present and 0 paid_leaves → return no data found
      const allZero = report.every(r => r.days_present === 0 && r.paid_leaves === 0);
      if (report.length === 0 || allZero) {
        return res.status(404).json({ message: 'No data found' });
      }

      // Additional fields
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthYearString = `${monthNames[monthNumber - 1]}-${yearNumber}`;
      const totalDaysInMonth = new Date(yearNumber, monthNumber, 0).getDate();

      res.status(200).json({
        month: monthNumber,
        year: yearNumber,
        month_year: monthYearString,
        total_days_in_month: totalDaysInMonth,
        data: report
      });

    } catch (error) {
      console.error('Error in getMonthlySalaryData:', error);
      res.status(500).json({
        error: 'Failed to generate salary report',
        details: error.message
      });
    }
  })();
};


//save monthly salary report 

/**
 * Save multiple salary reports
 * POST /api/salary-reports
 */
export const saveSalaryReports = (req, res) => {
    const salaryReports = req.body;

    if (!Array.isArray(salaryReports) || salaryReports.length === 0) {
        return res.status(400).json({ message: "Invalid data format" });
    }

    const insertQuery = `
        INSERT INTO salary_report 
        (
            month_year, month, year, total_days, employee_id, employee_name,
            days_present, paid_leaves, employee_salary,
            earnings, deductions,
            total_earnings, total_deductions, total_amount
        )
        VALUES ?
    `;

    const values = salaryReports.map(report => [
        report.month_year,
        report.month,
        report.year,
        report.total_days,
        report.employee_id,
        report.employee_name,
        report.days_present,
        report.paid_leaves,
        report.employee_salary,
        JSON.stringify(report.earnings || {}),
        JSON.stringify(report.deductions || {}),
        report.total_earnings,
        report.total_deductions,
        report.total_amount
    ]);

    db.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error("Error inserting salary reports:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.status(201).json({
            message: "Salary reports saved successfully",
            insertedRows: result.affectedRows
        });
    });
};
