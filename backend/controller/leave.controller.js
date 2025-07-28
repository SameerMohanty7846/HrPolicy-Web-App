import db from "../config/db.js";

export const submitLeaveApplication = (req, res) => {
  const {
    employee_id,
    leave_type,
    from_date,
    to_date,
    reason
  } = req.body;

  const query = `
    INSERT INTO leave_applications 
    (employee_id, leave_type, from_date, to_date, reason) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [employee_id, leave_type, from_date, to_date, reason], (err, result) => {
    if (err) {
      console.error('[submitLeaveApplication] Error:', err);
      return res.status(500).json({ error: 'Database insertion failed' });
    }

    return res.status(201).json({
      message: 'Leave application submitted successfully',
      application_id: result.insertId
    });
  });
};
