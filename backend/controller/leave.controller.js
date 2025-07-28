import db from "../config/db.js";
//submit leave application
export const submitLeaveApplication = (req, res) => {
  const {
    employee_id,
    employee_name,
    leave_type,
    from_date,
    to_date,
    reason
  } = req.body;

  // Validate that employee_name exists
  if (!employee_id || !employee_name || !from_date || !to_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO leave_applications 
    (employee_id, employee_name, leave_type, from_date, to_date, reason) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [employee_id, employee_name, leave_type, from_date, to_date, reason],
    (err, result) => {
      if (err) {
        console.error('[submitLeaveApplication] Error:', err);
        return res.status(500).json({ error: 'Database insertion failed' });
      }

      return res.status(201).json({
        message: 'Leave application submitted successfully',
        application_id: result.insertId
      });
    }
  );
};

// Get leave summary for a specific employee
export const getLeaveSummaryByEmployeeId = (req, res) => {
  const { employeeId } = req.params;

  const query = `
    SELECT 
      employee_id,
      employee_name,

      (total_earned_leave - earned_leave_taken) AS el_remaining,
      (total_casual_leave - casual_leave_taken) AS cl_remaining,
      (total_sick_leave - sick_leave_taken) AS sl_remaining,
      (total_lwp_leave - lwp_leave_taken) AS lwp_remaining,

      -- ✅ Total unpaid = total EL + CL + SL only (initial allocation)
      (total_earned_leave + total_casual_leave + total_sick_leave) AS total_unpaid_leave,

      total_lwp_leave AS total_lwp

    FROM employee_leave_summary
    WHERE employee_id = ?
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("Error fetching leave summary:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(results[0]);
  });
};
