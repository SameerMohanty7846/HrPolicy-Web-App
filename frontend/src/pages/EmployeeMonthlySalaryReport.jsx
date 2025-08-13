import React, { useState, useEffect } from 'react';

const EmployeeMonthlySalaryReport = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [salaryData, setSalaryData] = useState([]);

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

  const fetchSalaryReport = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Dummy salary data with detailed earnings and deductions
      const dummySalaryData = [
        {
          employee_id: 101,
          employee_name: 'John Doe',
          employee_salary: 25000,
          total_days_present: 22,
          total_paid_leaves: 3,
          earnings: [
            { name: 'HRA', amount: 12500 },
            { name: 'DA', amount: 5000 },
            { name: 'Bonus', amount: 3000 }
          ],
          deductions: [
            { name: 'PF', amount: 1800 },
            { name: 'Professional Tax', amount: 200 },
            { name: 'TDS', amount: 1500 }
          ],
          total_amount_to_be_paid: (25000 + 12500 + 5000 + 3000) - (1800 + 200 + 1500)
        },
        {
          employee_id: 102,
          employee_name: 'Jane Smith',
          employee_salary: 30000,
          total_days_present: 20,
          total_paid_leaves: 5,
          earnings: [
            { name: 'HRA', amount: 15000 },
            { name: 'DA', amount: 6000 },
            { name: 'Bonus', amount: 4000 }
          ],
          deductions: [
            { name: 'PF', amount: 2160 },
            { name: 'Professional Tax', amount: 200 },
            { name: 'TDS', amount: 1800 }
          ],
          total_amount_to_be_paid: (30000 + 15000 + 6000 + 4000) - (2160 + 200 + 1800)
        },
        {
          employee_id: 103,
          employee_name: 'Robert Johnson',
          employee_salary: 22000,
          total_days_present: 18,
          total_paid_leaves: 7,
          earnings: [
            { name: 'HRA', amount: 11000 },
            { name: 'DA', amount: 4400 },
            { name: 'Bonus', amount: 2000 }
          ],
          deductions: [
            { name: 'PF', amount: 1584 },
            { name: 'Professional Tax', amount: 200 },
            { name: 'TDS', amount: 1320 }
          ],
          total_amount_to_be_paid: (22000 + 11000 + 4400 + 2000) - (1584 + 200 + 1320)
        }
      ];
      
      setSalaryData(dummySalaryData);
      setLoading(false);
    }, 1000);
  };

  // Calculate totals for summary
  const calculateTotals = () => {
    const totals = {
      employee_salary: 0,
      total_amount_to_be_paid: 0,
      total_days_present: 0,
      total_paid_leaves: 0,
      earnings: {},
      deductions: {}
    };

    salaryData.forEach(employee => {
      totals.employee_salary += employee.employee_salary || 0;
      totals.total_amount_to_be_paid += employee.total_amount_to_be_paid || 0;
      totals.total_days_present += employee.total_days_present || 0;
      totals.total_paid_leaves += employee.total_paid_leaves || 0;

      // Calculate earnings totals
      employee.earnings.forEach(earning => {
        if (!totals.earnings[earning.name]) {
          totals.earnings[earning.name] = 0;
        }
        totals.earnings[earning.name] += earning.amount;
      });

      // Calculate deductions totals
      employee.deductions.forEach(deduction => {
        if (!totals.deductions[deduction.name]) {
          totals.deductions[deduction.name] = 0;
        }
        totals.deductions[deduction.name] += deduction.amount;
      });
    });

    return totals;
  };

  const totals = calculateTotals();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

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

          {/* Report Table */}
          {salaryData.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Employee Salary</th>
                    <th>Days Present</th>
                    <th>Paid Leaves</th>
                    <th className="bg-success bg-opacity-10" style={{ minWidth: '250px' }}>Total Earnings</th>
                    <th className="bg-danger bg-opacity-10" style={{ minWidth: '250px' }}>Total Deductions</th>
                    <th>Total Amount to be Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryData.map(employee => (
                    <tr key={employee.employee_id}>
                      <td>{employee.employee_id}</td>
                      <td>{employee.employee_name}</td>
                      <td className="text-end">{formatCurrency(employee.employee_salary)}</td>
                      <td className="text-center">{employee.total_days_present}</td>
                      <td className="text-center">{employee.total_paid_leaves}</td>
                      
                      {/* Earnings Column */}
                      <td className="bg-success bg-opacity-10">
                        <div className="d-flex flex-column">
                          {employee.earnings.map((earning, index) => (
                            <div key={index} className="d-flex justify-content-between">
                              <span>{earning.name}:</span>
                              <span>{formatCurrency(earning.amount)}</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1">
                            <span>Total Earnings:</span>
                            <span>{formatCurrency(employee.earnings.reduce((sum, e) => sum + e.amount, 0))}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Deductions Column */}
                      <td className="bg-danger bg-opacity-10">
                        <div className="d-flex flex-column">
                          {employee.deductions.map((deduction, index) => (
                            <div key={index} className="d-flex justify-content-between">
                              <span>{deduction.name}:</span>
                              <span>{formatCurrency(deduction.amount)}</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1">
                            <span>Total Deductions:</span>
                            <span>{formatCurrency(employee.deductions.reduce((sum, d) => sum + d.amount, 0))}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="text-end fw-bold text-primary">
                        {formatCurrency(employee.total_amount_to_be_paid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <th colSpan="2" className="text-end">Total:</th>
                    <th className="text-end">{formatCurrency(totals.employee_salary)}</th>
                    <th className="text-center">{totals.total_days_present}</th>
                    <th className="text-center">{totals.total_paid_leaves}</th>
                    
                    {/* Earnings Total */}
                    <th className="bg-success bg-opacity-10">
                      <div className="d-flex flex-column">
                        {Object.entries(totals.earnings).map(([name, amount], index) => (
                          <div key={index} className="d-flex justify-content-between">
                            <span>{name}:</span>
                            <span>{formatCurrency(amount)}</span>
                          </div>
                        ))}
                        <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1">
                          <span>Total Earnings:</span>
                          <span>{formatCurrency(Object.values(totals.earnings).reduce((a, b) => a + b, 0))}</span>
                        </div>
                      </div>
                    </th>
                    
                    {/* Deductions Total */}
                    <th className="bg-danger bg-opacity-10">
                      <div className="d-flex flex-column">
                        {Object.entries(totals.deductions).map(([name, amount], index) => (
                          <div key={index} className="d-flex justify-content-between">
                            <span>{name}:</span>
                            <span>{formatCurrency(amount)}</span>
                          </div>
                        ))}
                        <div className="d-flex justify-content-between fw-bold border-top mt-1 pt-1">
                          <span>Total Deductions:</span>
                          <span>{formatCurrency(Object.values(totals.deductions).reduce((a, b) => a + b, 0))}</span>
                        </div>
                      </div>
                    </th>
                    
                    <th className="text-end fw-bold text-primary">
                      {formatCurrency(totals.total_amount_to_be_paid)}
                    </th>
                  </tr>
                  <tr>
                    <th colSpan="7" className="text-end">
                      Net Amount to be Paid this Month:
                    </th>
                    <th className="text-end fw-bold text-success">
                      {formatCurrency(totals.total_amount_to_be_paid)}
                    </th>
                  </tr>
                </tfoot>
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