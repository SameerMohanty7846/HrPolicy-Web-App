import db from '../config/db.js'; // assuming db is your database connection

// 1. Insert salary component
export const createSalaryComponent = async (req, res) => {
  const { name, type, value_type, based_on } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO salary_component_policy_master (name, type, value_type, based_on)
       VALUES (?, ?, ?, ?)`,
      [name, type, value_type, based_on]
    );
    res.status(201).json({ message: 'Component inserted', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get all components
export const getAllSalaryComponents = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM salary_component_policy_master`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get by ID
export const getComponentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(`SELECT * FROM salary_component_policy_master WHERE id = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Component not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Get by name
export const getComponentByName = async (req, res) => {
  const { name } = req.params;
  try {
    const [rows] = await db.execute(`SELECT * FROM salary_component_policy_master WHERE name = ?`, [name]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Get by type (earning/deduction)
export const getComponentsByType = async (req, res) => {
  const { type } = req.params;
  try {
    const [rows] = await db.execute(`SELECT * FROM salary_component_policy_master WHERE type = ?`, [type]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Get by value_type (flat/percentage)
export const getComponentsByValueType = async (req, res) => {
  const { value_type } = req.params;
  try {
    const [rows] = await db.execute(`SELECT * FROM salary_component_policy_master WHERE value_type = ?`, [value_type]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
