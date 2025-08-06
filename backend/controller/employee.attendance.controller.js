import db from '../config/db.js';

export const getAttendanceReport = (req, res) => {
  const emp_id = req.params.emp_id;
  const monthYear = req.query.monthYear;

  if (!monthYear || !emp_id) {
    return res.status(400).json({ error: 'emp_id and monthYear are required (format: MM-YYYY)' });
  }

  const [month, year] = monthYear.split('-');

  const query = `
    SELECT 
      id, emp_id, emp_name, date, check_in, check_out, work_day,
      MONTH(date) AS month,
      YEAR(date) AS year
    FROM 
      attendance
    WHERE 
      emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
    ORDER BY date ASC;
  `;

  const sumQuery = `
    SELECT 
      SUM(work_day) AS total_work_days
    FROM 
      attendance
    WHERE 
      emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?;
  `;

  db.query(query, [emp_id, month, year], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching attendance data' });
    }

    db.query(sumQuery, [emp_id, month, year], (sumErr, sumResult) => {
      if (sumErr) {
        return res.status(500).json({ error: 'Error calculating work_day sum' });
      }

      res.status(200).json({
        employee_id: emp_id,
        month,
        year,
        attendance_data: result,
        total_work_days: sumResult[0].total_work_days || 0
      });
    });
  });
};
