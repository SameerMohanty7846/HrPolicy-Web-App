import db from '../config/db.js';

// 1. Create Salary Component
export const createSalaryComponent = (req, res) => {
  const { name, type, value_type, based_on } = req.body;

  if (!name || !type || !value_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const basedOnValue = value_type === 'percentage' ? based_on : null;

  db.query(
    `INSERT INTO salary_component_policy_master (name, type, value_type, based_on)
     VALUES (?, ?, ?, ?)`,
    [name, type, value_type, basedOnValue],
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