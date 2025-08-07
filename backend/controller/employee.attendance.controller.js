import db from '../config/db.js';

export const getAttendanceReport = (req, res) => {
  const emp_id = req.params.emp_id;
  const monthYear = req.query.monthYear;

  if (!monthYear || !emp_id) {
    return res.status(400).json({ error: 'emp_id and monthYear are required (format: MM-YYYY)' });
  }

  const [month, year] = monthYear.split('-');

  const query = `
    SELECT 
      id, emp_id, emp_name, date, check_in, check_out, work_day,
      MONTH(date) AS month,
      YEAR(date) AS year
    FROM 
      attendance
    WHERE 
      emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
    ORDER BY date ASC;
  `;

  const sumQuery = `
    SELECT 
      SUM(work_day) AS total_work_days
    FROM 
      attendance
    WHERE 
      emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?;
  `;

  db.query(query, [emp_id, month, year], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching attendance data' });
    }

    db.query(sumQuery, [emp_id, month, year], (sumErr, sumResult) => {
      if (sumErr) {
        return res.status(500).json({ error: 'Error calculating work_day sum' });
      }

      res.status(200).json({
        employee_id: emp_id,
        month,
        year,
        attendance_data: result,
        total_work_days: sumResult[0].total_work_days || 0
      });
    });
  });
};



export const getMonthlySalaryReport = (req, res) => {
  const { monthYear } = req.params; // format MM-YYYY like 08-2025
  const [month, year] = monthYear.split('-');

  // ✅ Validate monthYear format
  if (!/^\d{2}-\d{4}$/.test(monthYear)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid month format. Use MM-YYYY (e.g., 08-2025)'
    });
  }

  // ✅ Query to check if any leaves (Approved) exist for the month
  const checkAnyLeaveQuery = `
    SELECT COUNT(*) AS total_leaves
    FROM leave_applications
    WHERE status = 'Approved'
      AND (
        (YEAR(from_date) = ? AND MONTH(from_date) = ?)
        OR (YEAR(to_date) = ? AND MONTH(to_date) = ?)
      )`;

  db.query(checkAnyLeaveQuery, [year, month, year, month], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to check leave records',
        details: err.message
      });
    }

    const totalLeaves = result[0]?.total_leaves || 0;

    if (totalLeaves === 0) {
      return res.status(200).json({
        success: true,
        month: monthYear,
        message: 'No leave data found for this month',
        report: []
      });
    }

    const employeesQuery = `
      SELECT id, name, salary, department 
      FROM employees
      ORDER BY id`;

    const freeLeavesQuery = `
      SELECT 
        la.employee_id,
        SUM(la.no_of_days) AS total_free_leaves
      FROM leave_applications la
      JOIN hr_leave_policy hlp ON la.leave_type = hlp.leave_type
      WHERE 
        la.status = 'Approved'
        AND hlp.mode = 'Free'
        AND (
          (YEAR(la.from_date) = ? AND MONTH(la.from_date) = ?)
          OR (YEAR(la.to_date) = ? AND MONTH(la.to_date) = ?)
        )
      GROUP BY la.employee_id`;

    const paidLeavesQuery = `
      SELECT 
        la.employee_id,
        SUM(la.no_of_days) AS total_paid_leaves
      FROM leave_applications la
      JOIN hr_leave_policy hlp ON la.leave_type = hlp.leave_type
      WHERE 
        la.status = 'Approved'
        AND hlp.mode = 'Paid'
        AND (
          (YEAR(la.from_date) = ? AND MONTH(la.from_date) = ?)
          OR (YEAR(la.to_date) = ? AND MONTH(la.to_date) = ?)
        )
      GROUP BY la.employee_id`;

    db.query(employeesQuery, (err, employees) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch employees',
          details: err.message
        });
      }

      if (!employees || employees.length === 0) {
        return res.status(200).json({
          success: true,
          month: monthYear,
          message: 'No employee data found',
          report: []
        });
      }

      db.query(freeLeavesQuery, [year, month, year, month], (err, freeLeaves) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch free leave data',
            details: err.message
          });
        }

        db.query(paidLeavesQuery, [year, month, year, month], (err, paidLeaves) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch paid leave data',
              details: err.message
            });
          }

          const report = employees.map(employee => {
            const salary = Number(employee.salary);
            const freeLeave = freeLeaves.find(l => l.employee_id === employee.id) || { total_free_leaves: 0 };
            const paidLeave = paidLeaves.find(l => l.employee_id === employee.id) || { total_paid_leaves: 0 };

            const dailySalary = salary / 30;
            const deduction = dailySalary * freeLeave.total_free_leaves;
            const netSalary = salary - deduction;

            return {
              employee_id: employee.id,
              employee_name: employee.name,
              department: employee.department,
              fixed_salary: salary.toFixed(2),
              total_free_leaves: freeLeave.total_free_leaves,
              total_paid_leaves: paidLeave.total_paid_leaves,
              daily_salary: dailySalary.toFixed(2),
              salary_deduction: deduction.toFixed(2),
              net_salary: netSalary.toFixed(2),
              month_year: monthYear
            };
          });

          return res.status(200).json({
            success: true,
            month: monthYear,
            report: report
          });
        });
      });
    });
  });
};


export const insertSalaryReport = (req, res) => {
  const { month_year, report } = req.body;

  if (!month_year || !Array.isArray(report)) {
    return res.status(400).json({ error: 'month_year and report array are required' });
  }

  const insertQuery = `
    INSERT INTO monthly_salary_reports (
      employee_id, month_year, fixed_salary, total_free_leaves, paid_leaves, daily_salary, salary_deduction, net_salary
    ) VALUES ?
  `;

  // Build values array for bulk insert
  const values = report.map(emp => [
    emp.employee_id,
    month_year,
    emp.fixed_salary,
    emp.total_free_leaves,
    emp.paid_leaves,
    emp.daily_salary,
    emp.salary_deduction,
    emp.net_salary,
  ]);

  db.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Error inserting salary report data' });
    }

    res.status(201).json({
      message: 'Salary report inserted successfully',
      inserted_rows: result.affectedRows,
    });
  });
};

// http://localhost:2000/api/monthly-salary-report/07-2025