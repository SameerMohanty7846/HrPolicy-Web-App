import db from '../config/db.js';

// ✅ Add new leave policy
export const addLeavePolicy = (req, res) => {
  const { leave_type, allowed_days } = req.body;

  if (!leave_type || !allowed_days) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `INSERT INTO hr_leave_policy (leave_type, allowed_days) VALUES (?, ?)`;
  db.query(query, [leave_type, allowed_days], (err, result) => {
    if (err) {
      console.error('Error inserting leave policy:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json({ message: 'Leave policy added successfully' });
  });
};

// ✅ Get all leave policies
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
