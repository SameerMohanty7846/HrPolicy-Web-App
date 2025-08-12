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
    let connection; // Declare the connection variable outside the try block

    try {
        // 1. Get a dedicated connection from the promise-based pool
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 2. Destructure and validate input
        const {
            employee_id,
            month,
            year,
            basic_salary,
            total_earnings = 0,
            total_deductions = 0,
            gross_salary = 0,
            leave_deductions = 0,
            total_days_in_month = 0,
            total_working_days = 0,
            total_leaves = 0,
            total_free_leaves = 0,
            total_paid_leaves = 0,
            net_salary = 0,
            components = [] // Array of dynamic components
        } = req.body;

        // Validate required fields
        const requiredFields = { employee_id, month, year, basic_salary, net_salary };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (value === undefined || value === null || value === '') {
                await connection.rollback();
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
            total_days_in_month: parseInt(total_days_in_month) || 0,
            total_working_days: parseInt(total_working_days) || 0,
            total_leaves: parseInt(total_leaves) || 0,
            total_free_leaves: parseInt(total_free_leaves) || 0,
            total_paid_leaves: parseInt(total_paid_leaves) || 0,
            net_salary: parseFloat(net_salary)
        };

        // Validate month range
        if (numericValues.month < 1 || numericValues.month > 12) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Month must be between 1-12"
            });
        }

        // 3. Check for existing payroll using the 'connection' object
        const checkSql = `SELECT id FROM monthly_salary_reports 
                           WHERE employee_id = ? AND month = ? AND year = ?`;
        const [existing] = await connection.query(checkSql, [
            employee_id,
            numericValues.month,
            numericValues.year
        ]);

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: "Payroll record already exists for this employee/month/year",
                existing_id: existing[0].id
            });
        }

        // 4. Insert main payroll record using the 'connection' object
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
            numericValues.month,
            numericValues.year,
            numericValues.basic_salary,
            numericValues.total_days_in_month,
            numericValues.total_working_days,
            numericValues.total_leaves,
            numericValues.total_free_leaves,
            numericValues.total_paid_leaves,
            numericValues.leave_deductions,
            numericValues.total_earnings,
            numericValues.total_deductions,
            numericValues.gross_salary,
            numericValues.net_salary
        ]);

        const payrollId = result.insertId;

        // 5. Insert dynamic components if they exist
        if (components && components.length > 0) {
            const componentInsertSql = `
              INSERT INTO payroll_components (
                payroll_id, component_name, component_type,
                calculation_type, value, amount, based_on
              ) VALUES ?
            `;

            const componentValues = components.map(comp => [
                payrollId,
                comp.name,
                comp.type,
                comp.value_type,
                parseFloat(comp.value) || 0,
                parseFloat(comp.amount) || 0,
                comp.based_on || null
            ]);
            await connection.query(componentInsertSql, [componentValues]);
        }

        // 6. Commit transaction
        await connection.commit();

        // 7. Return success response
        return res.status(201).json({
            success: true,
            payroll_id: payrollId,
            message: "Payroll record created successfully",
            data: {
                ...numericValues,
                employee_id,
                components: components || []
            }
        });

    } catch (err) {
        // Rollback on any error, making sure 'connection' is defined
        if (connection) {
            await connection.rollback();
        }
        console.error("Payroll creation error:", err);

        // Handle specific MySQL errors
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
            message: "Failed to create payroll record",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        // 8. Always release the connection back to the pool
        if (connection) {
            connection.release();
        }
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
