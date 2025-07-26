import db from "../config/db.js";

// 📅 Daily Ratings (Performance per Day - Current Week Only)
export const getDailyRatings = (req, res) => {
  const { employeeId } = req.params;
  console.log(`[DailyRatings] API hit with employeeId: ${employeeId}`);

  // Optional: Validate employeeId
  if (!employeeId || isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const query = `
    SELECT 
      DATE(assignment_date) AS label,
      ROUND(AVG(rating), 2) AS avg_rating
    FROM tasks
    WHERE employee_id = ?
      AND YEARWEEK(assignment_date, 1) = YEARWEEK(CURDATE(), 1)
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

// 📅 Monthly Ratings (Performance per Month - Current Year)
export const getMonthlyRatings = (req, res) => {
  const { employeeId } = req.params;
  console.log(`[MonthlyRatings] API hit with employeeId: ${employeeId}`);

  // Optional: Validate employeeId
  if (!employeeId || isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const query = `
    SELECT 
      DATE_FORMAT(assignment_date, '%Y-%m') AS label,
      ROUND(AVG(rating), 2) AS avg_rating
    FROM tasks
    WHERE employee_id = ?
      AND YEAR(assignment_date) = YEAR(CURDATE())
      AND assignment_date <= CURDATE()
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
//avg rating per user per day and per month 
export const getDailyEmployeeRatings = (req, res) => {
  const { employeeId } = req.params;
  console.log(`[DailyEmployeeRatings] API hit with employeeId: ${employeeId}`);

  if (!employeeId || isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const query = `
    SELECT 
      DATE(assignment_date) AS label,
      FLOOR(AVG(rating)) AS avg_rating,
      employee_name
    FROM tasks
    WHERE employee_id = ?
      AND YEARWEEK(assignment_date, 1) = YEARWEEK(CURDATE(), 1)
    GROUP BY DATE(assignment_date), employee_name
    ORDER BY DATE(assignment_date)
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("[DailyEmployeeRatings] MySQL Error:", err.message);
      return res.status(500).json({ error: "Failed to fetch daily employee ratings" });
    }
    res.json(results);
  });
};
export const getMonthlyEmployeeRatings = (req, res) => {
  const { employeeId } = req.params;
  console.log(`[MonthlyEmployeeRatings] API hit with employeeId: ${employeeId}`);

  if (!employeeId || isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const query = `
    SELECT 
      DATE_FORMAT(assignment_date, '%Y-%m') AS label,
      FLOOR(AVG(rating)) AS avg_rating,
      employee_name
    FROM tasks
    WHERE employee_id = ?
      AND YEAR(assignment_date) = YEAR(CURDATE())
      AND assignment_date <= CURDATE()
    GROUP BY DATE_FORMAT(assignment_date, '%Y-%m'), employee_name
    ORDER BY DATE_FORMAT(assignment_date, '%Y-%m')
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("[MonthlyEmployeeRatings] MySQL Error:", err.message);
      return res.status(500).json({ error: "Failed to fetch monthly employee ratings" });
    }
    res.json(results);
  });
};


//Analytics for admin
// 📅 Weekly Ratings (Mon–Sat)
export const getWeeklyEmployeeRatings = (req, res) => {
  const query = `
    SELECT 
      DAYNAME(assignment_date) AS day,
      employee_name,
      ROUND(AVG(rating), 2) AS avg_rating
    FROM tasks
    WHERE 
      WEEK(assignment_date) = WEEK(CURDATE())
      AND YEAR(assignment_date) = YEAR(CURDATE())
      AND DAYOFWEEK(assignment_date) BETWEEN 2 AND 7 -- Mon (2) to Sat (7)
    GROUP BY day, employee_name
    ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("[WeeklyRatings] Error:", err);
      return res.status(500).json({ error: "Failed to get weekly ratings" });
    }

    const groupedData = {};

    results.forEach(row => {
      const day = row.day.slice(0, 3); // "Monday" → "Mon"
      if (!groupedData[day]) groupedData[day] = { day };
      groupedData[day][row.employee_name] = row.avg_rating;
    });

    const finalData = Object.values(groupedData);
    res.json(finalData);
  });
};
// 📆 Monthly Ratings (Jan–Dec)
export const getYearlyEmployeeRatings = (req, res) => {
  const query = `
    SELECT 
      MONTHNAME(assignment_date) AS month,
      employee_name,
      ROUND(AVG(rating), 2) AS avg_rating
    FROM tasks
    WHERE 
      YEAR(assignment_date) = YEAR(CURDATE())
    GROUP BY month, employee_name
    ORDER BY FIELD(month, 
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    );
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("[YearlyRatings] Error:", err);
      return res.status(500).json({ error: "Failed to get yearly ratings" });
    }

    const groupedData = {};

    results.forEach(row => {
      const month = row.month.slice(0, 3); // "January" → "Jan"
      if (!groupedData[month]) groupedData[month] = { month };
      groupedData[month][row.employee_name] = row.avg_rating;
    });

    const finalData = Object.values(groupedData);
    res.json(finalData);
  });
};

