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


//7.Get Total free leaves for that month year
export const getFreeLeavesByEmployeeAndMonth = (req, res) => {
  const { employee_id, monthYear } = req.params; // monthYear format should be MM-YYYY

  // Split MM-YYYY
  const [month, year] = monthYear.split('-');

  const query = `
    SELECT 
      SUM(la.no_of_days) AS total_free_leaves
    FROM 
      leave_applications la
    JOIN 
      hr_leave_policy hp ON la.leave_type = hp.leave_type
    WHERE 
      la.employee_id = ? 
      AND la.status = 'Approved'
      AND hp.mode = 'Free'
      AND MONTH(la.from_date) = ? 
      AND YEAR(la.from_date) = ?
  `;

  db.query(query, [employee_id, month, year], (error, results) => {
    if (error) {
      console.error('Error fetching free leaves:', error);
      return res.status(500).json({ error: error.message });
    }

    const totalFreeLeaves = results[0].total_free_leaves || 0;

    res.status(200).json({ employee_id, monthYear, totalFreeLeaves });
  });
};
// /api/leaves/free/2/08-2025


//save payroll
// Insert Payroll Record
export const createPayroll = async (req, res) => {
  try {
    // 1. Destructure and validate input
    const {
      employee_id,
      month,
      year,
      basic_salary,
      total_earnings = 0,
      total_deductions = 0,
      gross_salary = 0,
      leave_deductions = 0,
      leave_days = 0,
      net_salary = 0
    } = req.body;

    // Validate required fields
    const requiredFields = { employee_id, month, year, basic_salary };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === '') {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Convert and validate numeric values
    const numericValues = {
      month: Number(month),
      year: Number(year),
      basic_salary: parseFloat(basic_salary),
      total_earnings: parseFloat(total_earnings) || 0,
      total_deductions: parseFloat(total_deductions) || 0,
      gross_salary: parseFloat(gross_salary) || 0,
      leave_deductions: parseFloat(leave_deductions) || 0,
      leave_days: parseInt(leave_days) || 0,
      net_salary: parseFloat(net_salary) || 0
    };

    // Validate month range
    if (numericValues.month < 1 || numericValues.month > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1-12"
      });
    }

    // 2. Explicit duplicate check (even though UNIQUE constraint exists)
    const checkSql = `SELECT payroll_id FROM payroll_master 
                     WHERE employee_id = ? AND month = ? AND year = ?`;
    const [existing] = await db.promise().query(checkSql, [
      employee_id,
      numericValues.month,
      numericValues.year
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Payroll record already exists for this employee/month/year",
        existing_id: existing[0].payroll_id
      });
    }

    // 3. Insert new record
    const insertSql = `
      INSERT INTO payroll_master (
        employee_id, month, year, basic_salary,
        total_earnings, total_deductions, gross_salary,
        leave_deductions, leave_days, net_salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().query(insertSql, [
      employee_id,
      numericValues.month,
      numericValues.year,
      numericValues.basic_salary,
      numericValues.total_earnings,
      numericValues.total_deductions,
      numericValues.gross_salary,
      numericValues.leave_deductions,
      numericValues.leave_days,
      numericValues.net_salary
    ]);

    // 4. Return success response
    return res.status(201).json({
      success: true,
      payroll_id: result.insertId,
      message: "Payroll record created successfully",
      data: {
        ...numericValues,
        employee_id
      }
    });

  } catch (err) {
    console.error("Payroll creation error:", err);
    
    // Handle duplicate entry error from MySQL (secondary check)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: "Payroll record already exists for this employee/month/year"
      });
    }

    // Handle foreign key constraint violation
    if (err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({
        success: false,
        message: "Invalid employee_id: Employee does not exist"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create payroll record",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// Get filtered payroll records by employee_id, month, and year
export const getAllPayrolls = async (req, res) => {
  try {
    const { employee_id, month, year } = req.params; // Get path params

    // Month names for formatting
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // SQL query with WHERE clause for filtering
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
      WHERE p.employee_id = ? AND p.month = ? AND p.year = ?
      ORDER BY p.year DESC, p.month DESC, e.name ASC
    `;

    // Execute query with filtering params
    const [results] = await db.promise().query(sql, [employee_id, month, year]);

    // Format the results
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

    // Return successful response
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
