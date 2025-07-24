import db from "../config/db.js";

// 📅 Daily Ratings (Performance per Day)
export const getDailyRatings = (req, res) => {
  const { employeeId } = req.params;
  console.log(`[DailyRatings] API hit with employeeId: ${employeeId}`);

  const query = `
    SELECT 
      DATE(assignment_date) AS label,
      ROUND(AVG(rating), 2) AS avg_rating
    FROM tasks
    WHERE employee_id = ?
    GROUP BY DATE(assignment_date)
    ORDER BY DATE(assignment_date)
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("[DailyRatings] MySQL Error:", err.message);
      return res.status(500).json({ error: "Failed to fetch daily ratings" });
    }
    console.log("[DailyRatings] Results:", results);
    res.json(results);
  });
};

// 📅 Monthly Ratings (Performance per Month)
export const getMonthlyRatings = (req, res) => {
  const { employeeId } = req.params;
  console.log(`[MonthlyRatings] API hit with employeeId: ${employeeId}`);

  const query = `
    SELECT 
      DATE_FORMAT(assignment_date, '%Y-%m') AS label,
      ROUND(AVG(rating), 2) AS avg_rating
    FROM tasks
    WHERE employee_id = ?
    GROUP BY DATE_FORMAT(assignment_date, '%Y-%m')
    ORDER BY DATE_FORMAT(assignment_date, '%Y-%m')
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("[MonthlyRatings] MySQL Error:", err.message);
      return res.status(500).json({ error: "Failed to fetch monthly ratings" });
    }
    console.log("[MonthlyRatings] Results:", results);
    res.json(results);
  });
};
