import db from "../config/db.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendEmail } from '../services/mailService.js';

const SECRET_KEY = 'your_secret_key';
const SALT_ROUNDS = 10;

// Login (common for all roles)
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

// Register Employee
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

// Register Admin
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

// Register HR
export const registerHR = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Error processing request' });
        }

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'hr')";
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering HR:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            return res.status(201).json({ message: 'HR registered successfully' });
        });
    });
};

// Request OTP
export const requestOtp = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const userCheckQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(userCheckQuery, [email], (err, results) => {
    if (err) {
      console.error('Error verifying email:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const upsertQuery = `
      INSERT INTO user_otps (email, otp, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?
    `;

    db.query(upsertQuery, [email, otp, expiresAt, otp, expiresAt], async (err) => {
      if (err) {
        console.error('Error saving OTP:', err);
        return res.status(500).json({ message: 'Failed to generate OTP' });
      }

      // ✅ Replace this with your actual logo URL
      const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAZCAMAAABn0dyjAAAAeFBMVEVHcEzQ2cWZnZaCg4R/f4F6e3xpaWthYmRoaWtub3G/0Ki6u7mMjI1bXF5gYGNdXWB/gX9gYWNlZmiLi4ynt5OmpqdsbW+1tbZ4eHqLjI1TVFaEhoWdvHaFq1WPs2CWs3F0dnR8pUp6pEeGq1iNqWtjY2Z4oUKBqU+LEb/aAAAAKHRSTlMABjV1r8vh/OzRDxqB/+D2iez4ZilWs0FVRP+WS3Z+bJ3R3auVy//AHsCXXAAAAV5JREFUeAF1kgWCxCAMRQPUIXjdR+9/w62v/5n6iwcuEcqCMIrjJA0YzeCnuIhilFJpbYzEOBL822ciLKaRA04BPIc8KtCKL17KFLEC8sUA6hij8vpuFat+RCWVM/FBlHHTwh8SDeawKEuUoJfhogwIr1nBvTB2TbVd7An3Xdf3wzCOo56KCLFBvvoIALzFCeh8m++PRzs9DaIyz0JXNQHQKqbAkMGCueIpEU06uYry7u5hk2sEhA3bMtFsHD3A/TWup+4EQohQHA14v3rI5m8AwwSsPAuYfwOQxpAgI/8CTiVLDvp/D2zJQSD7F9iqoFZN/wFbH7ZObsDtBMjjTWlFj04CTxTbZjFcHrybnrLibp8F5Hj48P4Avk9z2wdX7bVmayevfcivjYmujSJjd25UUsKlTMdYpA4yD8AzqNMC45Z/2zAuIsSnNEJI+URMWg8/lVERpMnyLQ1E/Wn9ARtjH0l/GfPXAAAAAElFTkSuQmCC'; // Example logo

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
            <img 
              src="${logoUrl}" 
              alt="HR Logo" 
              style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 20px; object-fit: contain;" 
            />
            <h2 style="color: #2b6777;">Your OTP Code</h2>
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">Use the following OTP to reset your password. This OTP is valid for <strong>10 minutes</strong>.</p>
            <div style="font-size: 32px; font-weight: bold; color: #2b6777; margin: 20px 0;">${otp}</div>
            <p style="font-size: 14px; color: #888;">If you did not request this, please ignore this email.</p>
            <p style="margin-top: 40px; font-size: 14px;">Regards,<br><strong>HR Policy App Team</strong></p>
          </div>
        </div>
      `;

      try {
        await sendEmail(email, 'Your OTP Code - HR Policy App', htmlContent);
        return res.status(200).json({ message: 'OTP sent successfully' });
      } catch (emailErr) {
        console.error('Error sending OTP email:', emailErr);
        return res.status(500).json({ message: 'Failed to send OTP email' });
      }
    });
  });
};

// Verify OTP
export const verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const query = 'SELECT * FROM user_otps WHERE email = ? AND otp = ?';
    db.query(query, [email, otp], (err, results) => {
        if (err) {
            console.error('Error verifying OTP:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0 || new Date(results[0].expires_at) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        return res.status(200).json({ message: 'OTP verified successfully' });
    });
};

export const changePasswordWithOtp = (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required' });
    }

    // Check if user exists by email
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(findUserQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error while looking up user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Hash the new password
        bcrypt.hash(newPassword, SALT_ROUNDS, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing new password:', err);
                return res.status(500).json({ message: 'Failed to process password' });
            }

            // Update the password
            const updatePasswordQuery = 'UPDATE users SET password = ? WHERE email = ?';
            db.query(updatePasswordQuery, [hashedPassword, email], (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ message: 'Failed to update password' });
                }

                return res.status(200).json({ message: 'Password updated successfully' });
            });
        });
    });
};

