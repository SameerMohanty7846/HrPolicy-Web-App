import React, { useState, useEffect } from 'react';

const EmployeeMonthlySalaryReport = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  // Months and years for dropdowns
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (month && year) {
      fetchSalaryReport();
    }
  }, [month, year]);

  const fetchSalaryReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:2000/api/payroll-report/${year}/${month}`);
      const data = await response.json();
      
      if (data.message === "No data found") {
        setReportData({ data: [] });
      } else if (data.data) {
        setReportData(data);
      } else {
        setReportData({ data: [] });
      }
    } catch (error) {
      console.error('Error fetching salary report:', error);
      setError('Failed to fetch salary report');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Categorize partitions into earnings and deductions
  const categorizePartitions = (partitions) => {
    const earnings = partitions?.filter(p => p.component_type === 'earning') || [];
    const deductions = partitions?.filter(p => p.component_type === 'deduction') || [];
    return { earnings, deductions };
  };

  const hasData = reportData?.data?.length > 0;

  return (
    <div className="container-fluid py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Employee Monthly Salary Report</h5>
            <button className="btn btn-light btn-sm">
              <i className="fas fa-download me-2"></i>Download Report
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label">Month</label>
              <select 
                className="form-select"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Year</label>
              <select 
                className="form-select"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-end justify-content-end">
              <button 
                className="btn btn-primary"
                onClick={fetchSalaryReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* Report Table */}
          {hasData ? (
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Month-Year</th>
                    <th>Total Days</th>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th className="text-center">Days Present</th>
                    <th className="text-center">Paid Leaves</th>
                    <th className="text-end">Net Salary</th>
                    <th className="bg-success bg-opacity-10">Earnings</th>
                    <th className="bg-danger bg-opacity-10">Deductions</th>
                    <th className="text-end fw-bold">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map(employee => {
                    const { earnings, deductions } = categorizePartitions(employee.partitions);
                    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
                    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
                    const totalAmount = employee.net_salary;

                    return (
                      <tr key={employee.employee_id}>
                        <td>{reportData.month_year}</td>
                        <td>{reportData.total_days_in_month}</td>
                        <td>{employee.employee_id}</td>
                        <td>{employee.employee_name}</td>
                        <td className="text-center">{employee.days_present}</td>
                        <td className="text-center">{employee.paid_leaves}</td>
                        <td className="text-end">{formatCurrency(employee.net_salary)}</td>
                        
                        {/* Earnings Column */}
                        <td className="bg-success bg-opacity-10">
                          <div className="d-flex flex-column">
                            {earnings.length > 0 ? (
                              <>
                                {earnings.map((earning, index) => (
                                  <div key={index} className="d-flex justify-content-between">
                                    <span>{earning.component_name}:</span>
                                    <span>{formatCurrency(earning.amount)}</span>
                                  </div>
                                ))}
                                <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1">
                                  <span>Total:</span>
                                  <span>{formatCurrency(totalEarnings)}</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-muted">No earnings</div>
                            )}
                          </div>
                        </td>
                        
                        {/* Deductions Column */}
                        <td className="bg-danger bg-opacity-10">
                          <div className="d-flex flex-column">
                            {deductions.length > 0 ? (
                              <>
                                {deductions.map((deduction, index) => (
                                  <div key={index} className="d-flex justify-content-between">
                                    <span>{deduction.component_name}:</span>
                                    <span>{formatCurrency(deduction.amount)}</span>
                                  </div>
                                ))}
                                <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1">
                                  <span>Total:</span>
                                  <span>{formatCurrency(totalDeductions)}</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-muted">No deductions</div>
                            )}
                          </div>
                        </td>
                        
                        <td className="text-end fw-bold text-primary">
                          {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="alert alert-info">
                {loading ? 'Loading report data...' : 'No salary data found for the selected month and year.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMonthlySalaryReport;