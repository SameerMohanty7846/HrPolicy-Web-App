import db from "../config/db.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET_KEY = 'your_secret_key';
const SALT_ROUNDS = 10;

//all the login in single page
export const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful`,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    });
};

// Register New Employee
export const registerEmployee = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Error processing request' });
        }

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'employee')";
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering employee:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            return res.status(201).json({ message: 'Employee registered successfully' });
        });
    });
};

// Register New Admin
export const registerAdmin = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Error processing request' });
        }

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')";
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering admin:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            return res.status(201).json({ message: 'Admin registered successfully' });
        });
    });
};
