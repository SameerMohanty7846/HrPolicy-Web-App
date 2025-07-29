// controllers/leaveController.js

import db from '../config/db.js';  // Adjust import as per your setup

export const submitLeaveApplication = (req, res) => {
  const { employee_id, employee_name, leave_type, from_date, to_date, reason } = req.body;

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




export const updateLeaveStatus = (req, res) => {
  const { application_id } = req.params;
  const { status } = req.body;

  // Add logging to debug
  console.log('Request params:', { application_id, status });

  // 1. Validate status
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  // 2. Fetch leave application details
  const fetchQuery = `
    SELECT employee_id, leave_type, no_of_days 
    FROM leave_applications 
    WHERE application_id = ?
  `;

  db.query(fetchQuery, [application_id], (err, results) => {
    if (err) {
      console.error("Error fetching leave:", err);
      return res.status(500).json({ error: "Failed to fetch leave application" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Leave application not found" });
    }

    const { employee_id, leave_type, no_of_days } = results[0];
    console.log('Leave details:', { employee_id, leave_type, no_of_days });

    // 3. Update status in leave_applications
    const updateStatusQuery = `
      UPDATE leave_applications SET status = ? WHERE application_id = ?
    `;
    db.query(updateStatusQuery, [status, application_id], (err2, result2) => {
      if (err2) {
        console.error("Error updating status:", err2);
        return res.status(500).json({ error: "Failed to update status" });
      }

      if (status === 'Approved') {
        // 4. Determine which column to update in summary - More flexible matching
        let leaveTakenColumn;
        
        // Convert leave_type to uppercase and handle different formats
        const normalizedLeaveType = leave_type.toString().toUpperCase().trim();
        
        switch (normalizedLeaveType) {
          case 'EL':
          case 'EARNED LEAVE':
          case 'EARNED_LEAVE':
            leaveTakenColumn = 'earned_leave_taken'; 
            break;
          case 'CL':
          case 'CASUAL LEAVE':
          case 'CASUAL_LEAVE':
            leaveTakenColumn = 'casual_leave_taken'; 
            break;
          case 'SL':
          case 'SICK LEAVE':
          case 'SICK_LEAVE':
            leaveTakenColumn = 'sick_leave_taken'; 
            break;
          case 'LWP':
          case 'LEAVE WITHOUT PAY':
          case 'LEAVE_WITHOUT_PAY':
            leaveTakenColumn = 'lwp_leave_taken'; 
            break;
          default:
            console.error("Invalid leave type:", leave_type);
            console.error("Normalized leave type:", normalizedLeaveType);
            return res.status(400).json({ 
              error: `Invalid leave type: ${leave_type}. Expected: EL, CL, SL, or LWP` 
            });
        }

        console.log('Updating column:', leaveTakenColumn);

        // 5. Update employee_leave_summary
        const updateSummaryQuery = `
          UPDATE employee_leave_summary
          SET ${leaveTakenColumn} = ${leaveTakenColumn} + ?
          WHERE employee_id = ?
        `;
        
        console.log('Update query:', updateSummaryQuery);
        console.log('Query parameters:', [no_of_days, employee_id]);
        
        db.query(updateSummaryQuery, [no_of_days, employee_id], (err3, result3) => {
          if (err3) {
            console.error("Error updating leave summary:", err3);
            return res.status(500).json({ error: "Failed to update leave summary" });
          }

          console.log('Leave summary updated successfully');
          return res.status(200).json({ message: "Leave approved and summary updated." });
        });
      } else {
        return res.status(200).json({ message: "Leave rejected successfully." });
      }
    });
  });
};


//controller to get status of the summary for tha apply page
export const getLeaveSummaryByEmployeeId = (req, res) => {
  const { employee_id } = req.params;

  const query = `
    SELECT 
      total_leaves_present,
      total_leaves_taken
    FROM employee_leave_summary
    WHERE employee_id = ?
  `;

  db.query(query, [employee_id], (err, results) => {
    if (err) {
      console.error("[getLeaveSummaryByEmployeeId] DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No summary found for this employee" });
    }

    res.status(200).json(results[0]);
  });
};
