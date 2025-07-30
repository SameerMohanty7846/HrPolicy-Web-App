// controllers/leaveController.js

import db from '../config/db.js';  // Adjust import as per your setup

export const submitLeaveApplication = (req, res) => {
  const { employee_id, employee_name, leave_type, from_date, to_date, reason, no_of_days } = req.body;

  if (!employee_id || !employee_name || !from_date || !to_date || !no_of_days) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO leave_applications 
    (employee_id, employee_name, leave_type, from_date, to_date, reason, no_of_days) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [employee_id, employee_name, leave_type, from_date, to_date, reason, no_of_days],
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


export const getAllLeaveApplications = (req, res) => {
  const query = `
    SELECT 
      application_id,
      employee_id,
      employee_name,
      leave_type,
      from_date,
      to_date,
      no_of_days,
      reason,
      status,
      applied_date
    FROM leave_applications
    ORDER BY applied_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('[getAllLeaveApplications] Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve leave applications' });
    }
    return res.status(200).json(results);
  });
};

export const getLeaveApplicationsByEmployeeId = (req, res) => {
  const { employee_id } = req.params;

  const query = `
    SELECT 
      application_id,
      employee_id,
      employee_name,
      leave_type,
      from_date,
      to_date,
      no_of_days,
      reason,
      status,
      applied_date
    FROM leave_applications
    WHERE employee_id = ?
    ORDER BY applied_date DESC
  `;

  db.query(query, [employee_id], (err, results) => {
    if (err) {
      console.error('[getLeaveApplicationsByEmployeeId] Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve leave applications' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No leave applications found for this employee.' });
    }

    return res.status(200).json(results);
  });
};




export const updateLeaveStatus = (req, res) => {
  const { application_id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  // Fetch leave application first
  const getLeaveSQL = `SELECT employee_id, leave_type, no_of_days, status FROM leave_applications WHERE application_id = ?`;

  db.query(getLeaveSQL, [application_id], (err, results) => {
    if (err) {
      console.error('Error fetching leave application:', err);
      return res.status(500).json({ error: 'Failed to fetch leave application' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    const { employee_id, leave_type, no_of_days, status: currentStatus } = results[0];

    if (currentStatus !== 'Pending') {
      return res.status(400).json({ error: 'Only pending applications can be updated' });
    }

    // Step 1: Update status in leave_applications
    const updateStatusSQL = `UPDATE leave_applications SET status = ? WHERE application_id = ?`;

    db.query(updateStatusSQL, [status, application_id], (updateErr) => {
      if (updateErr) {
        console.error('Error updating status:', updateErr);
        return res.status(500).json({ error: 'Failed to update leave status' });
      }

      if (status === 'Rejected') {
        return res.status(200).json({ message: 'Leave application rejected successfully' });
      }

      // Step 2: If approved, update employee_leave_summary
      const updateLeaveSummarySQL = `
        UPDATE employee_leave_summary
        SET taken_days = taken_days + ?
        WHERE employee_id = ? AND leave_type = ?
      `;

      db.query(updateLeaveSummarySQL, [no_of_days, employee_id, leave_type], (summaryErr) => {
        if (summaryErr) {
          console.error('Error updating leave summary:', summaryErr);
          return res.status(500).json({ error: 'Leave approved but failed to update leave summary' });
        }

        res.status(200).json({ message: 'Leave application approved and summary updated successfully' });
      });
    });
  });
};
//Summary Of Employee Leaves for  by their id for the dashboard
export const getLeaveSummaryByEmployee = (req, res) => {
  const { employee_id } = req.params;

  const query = `
    SELECT leave_type, mode, total_leaves, taken_days
    FROM employee_leave_summary
    WHERE employee_id = ?
  `;

  db.query(query, [employee_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({
      employee_id,
      summary: results
    });
  });
};



