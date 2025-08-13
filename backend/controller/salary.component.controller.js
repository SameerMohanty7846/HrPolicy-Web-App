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


export const createPayroll = async (req, res) => {
    try {
        const {
            employee_id,
            month,
            year,
            basic_salary,
            total_days_in_month = null,
            total_working_days = null,
            total_leaves = null,
            total_free_leaves = null,
            total_paid_leaves = null,
            leave_deductions = 0,
            total_earnings = 0,
            total_deductions = 0,
            gross_salary = 0,
            net_salary
        } = req.body;

        // Required fields check
        if (!employee_id || !month || !year || !basic_salary || net_salary === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Month validation
        if (month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: "Month must be between 1 and 12"
            });
        }

        const connection = db.promise();
        await connection.query("START TRANSACTION");

        // Duplicate check
        const [existing] = await connection.query(
            `SELECT id FROM monthly_salary_reports WHERE employee_id = ? AND month = ? AND year = ?`,
            [employee_id, month, year]
        );
        if (existing.length > 0) {
            await connection.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "Payroll already exists for this employee/month/year",
                existing_id: existing[0].id
            });
        }

        // Insert into monthly_salary_reports
        const insertSql = `
            INSERT INTO monthly_salary_reports (
                employee_id, month, year, basic_salary,
                total_days_in_month, total_working_days, total_leaves,
                total_free_leaves, total_paid_leaves, leave_deductions,
                total_earnings, total_deductions, gross_salary, net_salary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(insertSql, [
            employee_id,
            month,
            year,
            basic_salary,
            total_days_in_month,
            total_working_days,
            total_leaves,
            total_free_leaves,
            total_paid_leaves,
            leave_deductions,
            total_earnings,
            total_deductions,
            gross_salary,
            net_salary
        ]);

        await connection.query("COMMIT");

        return res.status(201).json({
            success: true,
            payroll_id: result.insertId,
            message: "Payroll record created successfully"
        });

    } catch (err) {
        console.error("Error creating payroll:", err);
        await db.promise().query("ROLLBACK");

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: "Payroll record already exists for this employee/month/year"
            });
        }
        if (err.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                success: false,
                message: "Invalid employee_id: Employee does not exist"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create payroll record"
        });
    }
};




// Get payroll records for ALL employees for a specific month/year
export const getAllPayrolls = async (req, res) => {
  try {
    const { month, year } = req.params; // Only month and year from route

    // Month names for formatting
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // SQL query without employee_id filter
    const sql = `
      SELECT 
        p.payroll_id,
        p.employee_id,
        p.month,
        p.year,
        p.basic_salary,
        p.total_earnings,
        p.total_deductions,
        p.gross_salary,
        p.leave_deductions,
        p.leave_days,
        p.net_salary,
        p.created_at,
        p.updated_at,
        e.id AS emp_id,
        e.name AS emp_name,
        e.email AS emp_email,
        e.phone AS emp_phone,
        e.salary AS emp_monthly_salary,
        e.dateOfJoining AS emp_join_date,
        e.employeeType AS emp_type,
        e.experience AS emp_experience,
        e.department AS emp_department
      FROM payroll_master p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.month = ? AND p.year = ?
      ORDER BY e.name ASC
    `;

    // Execute query
    const [results] = await db.promise().query(sql, [month, year]);

    // Format results
    const formattedResults = results.map(record => ({
      payroll_id: record.payroll_id,
      employee: {
        id: record.emp_id,
        name: record.emp_name,
        email: record.emp_email,
        phone: record.emp_phone,
        monthly_salary: Number(record.emp_monthly_salary),
        date_of_joining: record.emp_join_date,
        type: record.emp_type,
        experience: Number(record.emp_experience),
        department: record.emp_department
      },
      period: {
        month: record.month,
        month_name: months[record.month - 1],
        year: record.year,
        formatted: `${months[record.month - 1]} ${record.year}`
      },
      salary_components: {
        basic: Number(record.basic_salary),
        total_earnings: Number(record.total_earnings),
        total_deductions: Number(record.total_deductions),
        gross: Number(record.gross_salary),
        net: Number(record.net_salary)
      },
      leave_details: {
        days_taken: record.leave_days,
        amount_deducted: Number(record.leave_deductions)
      },
      system_info: {
        created_at: record.created_at,
        updated_at: record.updated_at
      }
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (err) {
    console.error("Error fetching payroll records:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payroll records",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
