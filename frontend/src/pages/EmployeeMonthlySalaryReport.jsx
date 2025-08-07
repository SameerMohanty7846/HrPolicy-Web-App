import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeeMonthlySalaryReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('07'); // default July
  const [selectedYear, setSelectedYear] = useState('2025'); // default 2025

  // Month options
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Year options (2020 to 2030)
  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());

  // Local state to hold editable report rows
  const [editableRows, setEditableRows] = useState([]);

  const fetchReport = async (month, year) => {
    setLoading(true);
    setError(null);
    setSubmitStatus(null);
    try {
      const monthYear = `${month}-${year}`;
      const response = await axios.get(`http://localhost:2000/api/monthly-salary-report/${monthYear}`);
      setReportData(response.data);

      if (response.data && response.data.report) {
        const editableData = response.data.report.map(emp => ({ ...emp }));
        setEditableRows(editableData);
      } else {
        setEditableRows([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch salary report');
      setReportData(null);
      setEditableRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Submit handler
  const handleSubmit = async () => {
    setSubmitStatus(null);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:2000/api/submit-salary-report', {
        month_year: `${selectedMonth}-${selectedYear}`,
        report: editableRows,
      });

      setSubmitStatus({ success: true, message: 'Salary report submitted successfully!' });
    } catch (err) {
      setSubmitStatus({ success: false, message: err.response?.data?.error || 'Failed to submit salary report' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white">
          <h1 className="text-center mb-0">EMPLOYEE MONTHLY SALARY REPORT</h1>
        </div>
        
        <div className="card-body">
          {/* Dropdown selectors with improved styling */}
          <div className="row mb-4 g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light">Month</span>
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  aria-label="Select month"
                >
                  {months.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light">Year</span>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Select year"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status messages */}
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">{submitStatus ? submitStatus.message : 'Loading salary report...'}</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {submitStatus && !loading && (
            <div className={`alert ${submitStatus.success ? 'alert-success' : 'alert-danger'} text-center`}>
              {submitStatus.success ? (
                <i className="bi bi-check-circle-fill me-2"></i>
              ) : (
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
              )}
              {submitStatus.message}
            </div>
          )}

          {/* Report table */}
          {reportData && !loading && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0 text-muted">
                  <i className="bi bi-calendar-date me-2"></i>
                  Salary Report for {reportData.month}
                </h4>
                <button 
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={editableRows.length === 0}
                >
                  <i className="bi bi-send-check me-2"></i>
                  Submit Report
                </button>
              </div>

              {editableRows.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                  <i className="bi bi-file-earmark-excel fs-1 text-muted"></i>
                  <p className="mt-3">No data found for the selected month and year.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-primary">
                      <tr>
                        <th className="text-nowrap">Employee ID</th>
                        <th className="text-nowrap">Name</th>
                        <th className="text-nowrap">Department</th>
                        <th className="text-nowrap text-end">Fixed Salary</th>
                        <th className="text-nowrap text-center">Free Leaves</th>
                        <th className="text-nowrap text-center">Paid Leaves</th>
                        <th className="text-nowrap text-end">Daily Salary</th>
                        <th className="text-nowrap text-end">Deduction</th>
                        <th className="text-nowrap text-end">Net Salary</th>
                        <th className="text-nowrap">Month-Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableRows
                        .filter(emp => emp.employee_id !== 1)
                        .map((employee) => (
                          <tr key={employee.employee_id}>
                            <td className="fw-bold">{employee.employee_id}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm bg-light"
                                value={employee.employee_name}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm bg-light"
                                value={employee.department}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm bg-light text-end"
                                value={employee.fixed_salary}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm bg-light text-center"
                                value={employee.total_free_leaves}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm bg-light text-center"
                                value={employee.total_paid_leaves || 0}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm bg-light text-end"
                                value={employee.daily_salary}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm bg-light text-end"
                                value={employee.salary_deduction}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm bg-success text-white text-end fw-bold"
                                value={employee.net_salary}
                                readOnly
                              />
                            </td>
                            <td className="text-muted">{employee.month_year}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMonthlySalaryReport;