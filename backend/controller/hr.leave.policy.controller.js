import db from '../config/db.js';

// ✅ Add new leave policy
// ✅ Add new leave policy with validation
export const addLeavePolicy = (req, res) => {
  const { leave_type, allowed_days } = req.body;

  // 1. Input validation
  if (!leave_type || allowed_days === undefined) {
    return res.status(400).json({ error: 'Leave type and allowed days are required' });
  }

  if (isNaN(allowed_days) || allowed_days < 0) {
    return res.status(400).json({ error: 'Allowed days must be a valid non-negative number' });
  }

  // 2. Prevent duplicate leave types
  const checkQuery = `SELECT * FROM hr_leave_policy WHERE leave_type = ?`;
  db.query(checkQuery, [leave_type], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking leave policy:', checkErr);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ error: 'Leave type already exists' });
    }

    // 3. Insert the new policy
    const insertQuery = `INSERT INTO hr_leave_policy (leave_type, allowed_days) VALUES (?, ?)`;
    db.query(insertQuery, [leave_type, allowed_days], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting leave policy:', insertErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({ message: 'Leave policy added successfully' });
    });
  });
};

// ✅ Get all leave policies
// ✅ Get only leave type names
export const getLeaveTypeNames = (req, res) => {
  const query = `SELECT leave_type FROM hr_leave_policy ORDER BY leave_type ASC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching leave type names:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Return array of leave type strings only, not array of objects
    const leaveTypes = results.map(row => row.leave_type);
    res.status(200).json(leaveTypes);
  });
};


// ✅ Delete leave policy by ID
export const deleteLeavePolicy = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM hr_leave_policy WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting leave policy:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.status(200).json({ message: 'Leave policy deleted successfully' });
  });
};

// ✅ Get all leave policies with full details
export const getAllLeavePolicies = (req, res) => {
  const query = `SELECT * FROM hr_leave_policy ORDER BY id ASC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching leave policies:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(results);
  });
};
