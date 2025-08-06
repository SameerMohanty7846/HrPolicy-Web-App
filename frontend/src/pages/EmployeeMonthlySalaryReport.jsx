import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeeMonthlySalaryReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('07-2025');

  // Generate month buttons (JAN-25 to DEC-25)
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthStr = monthNum.toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      value: `${monthStr}-2025`,
      label: `${monthNames[i]}-25`
    };
  });

  const fetchReport = async (monthYear) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:2000/api/monthly-salary-report/${monthYear}`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch salary report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (monthYear) => {
    setSelectedMonth(monthYear);
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">EMPLOYEE MONTHLY SALARY REPORT</h1>
      
      {/* Month Selection Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
        {months.map((month) => (
          <button
            key={month.value}
            className={`btn ${selectedMonth === month.value ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleMonthChange(month.value)}
          >
            {month.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading salary report...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}

      {reportData && !loading && (
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Salary Report for {reportData.month}</h4>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Fixed Salary</th>
                    <th>Free Leaves</th>
                    <th>Daily Salary</th>
                    <th>Deduction</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.report.filter(emp => emp.employee_id !== 1).map((employee) => (
                    <tr key={employee.employee_id}>
                      <td>{employee.employee_id}</td>
                      <td>{employee.employee_name}</td>
                      <td>{employee.department}</td>
                      <td>₹{employee.fixed_salary}</td>
                      <td>{employee.total_free_leaves}</td>
                      <td>₹{employee.daily_salary}</td>
                      <td>₹{employee.salary_deduction}</td>
                      <td className="fw-bold">₹{employee.net_salary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMonthlySalaryReport;