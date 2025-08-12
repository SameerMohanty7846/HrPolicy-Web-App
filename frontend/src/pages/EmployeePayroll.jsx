import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [basicSalary, setBasicSalary] = useState(0);
  const [showSalaryInput, setShowSalaryInput] = useState(false);
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [componentValues, setComponentValues] = useState({});
  const [leaveData, setLeaveData] = useState({
    employee_id: '',
    monthYear: '',
    totalDaysInMonth: 0,
    totalWorkingDays: 0,
    totalLeaves: 0,
    totalFreeLeaves: 0,
    totalPaidLeaves: 0
  });
  const [leaveDeduction, setLeaveDeduction] = useState(0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['2023', '2024', '2025', '2026'];

  useEffect(() => {
    // Fetch employees
    axios.get('http://localhost:2000/api/hr/getallemployees')
      .then(response => setEmployees(response.data))
      .catch(error => console.error('Error fetching employees:', error));

    // Fetch salary components
    axios.get('http://localhost:2000/api/salary-components/list-without-first')
      .then(response => {
        setSalaryComponents(response.data);
        // Initialize component values
        const initialValues = {};
        response.data.forEach(comp => {
          initialValues[comp.id] = {
            enabled: false,
            value: '',
            type: comp.type,
            value_type: 'percentage',
            based_on: comp.based_on,
            amount: 0,
            days: 0
          };
        });
        setComponentValues(initialValues);
      })
      .catch(error => console.error('Error fetching salary components:', error));
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedMonth && selectedYear) {
      setShowSalaryInput(true);
      const monthNumber = (months.indexOf(selectedMonth) + 1).toString().padStart(2, '0');
      const monthYear = `${monthNumber}-${selectedYear}`;
      
      axios.get(`http://localhost:2000/api/leaves/free/${selectedEmployee}/${monthYear}`)
        .then(response => {
          const data = response.data;
          setLeaveData({
            employee_id: data.employee_id,
            monthYear: data.monthYear,
            totalDaysInMonth: parseInt(data.total_days_in_month) || 0,
            totalWorkingDays: parseInt(data.total_working_days) || 0,
            totalLeaves: parseInt(data.total_leaves) || 0,
            totalFreeLeaves: parseInt(data.total_free_leaves) || 0,
            totalPaidLeaves: parseInt(data.total_paid_leaves) || 0
          });
          
          const dailySalary = basicSalary / 30;
          setLeaveDeduction(dailySalary * (parseInt(data.total_free_leaves) || 0));
        })
        .catch(error => {
          console.error('Error fetching leave data:', error);
          setLeaveData({
            employee_id: '',
            monthYear: '',
            totalDaysInMonth: 0,
            totalWorkingDays: 0,
            totalLeaves: 0,
            totalFreeLeaves: 0,
            totalPaidLeaves: 0
          });
          setLeaveDeduction(0);
        });
    } else {
      setShowSalaryInput(false);
    }
  }, [selectedEmployee, selectedMonth, selectedYear, basicSalary]);

  const handleComponentToggle = (componentId) => {
    setComponentValues(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        enabled: !prev[componentId].enabled,
        value: prev[componentId].enabled ? '' : '0',
        amount: 0
      }
    }));
  };

  const calculateAmount = (componentId, value, valueType) => {
    if (!value) return 0;
    
    const numericValue = parseFloat(value) || 0;
    
    if (valueType === 'flat') {
      return numericValue;
    } else if (valueType === 'percentage') {
      return (basicSalary * numericValue) / 100;
    }
    return 0;
  };

  const handleValueChange = (componentId, value) => {
    const component = componentValues[componentId];
    const amount = calculateAmount(componentId, value, component.value_type);
    
    setComponentValues(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        value: value,
        amount: amount
      }
    }));
  };

  const handleValueTypeChange = (componentId, valueType) => {
    const component = componentValues[componentId];
    const amount = calculateAmount(componentId, component.value, valueType);
    
    setComponentValues(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        value_type: valueType,
        amount: amount
      }
    }));
  };

  const calculateSalarySummary = () => {
    let totalEarnings = 0;
    let totalDeductions = 0;

    Object.values(componentValues).forEach(comp => {
      if (comp.enabled) {
        if (comp.type === 'earning') {
          totalEarnings += comp.amount;
        } else if (comp.type === 'deduction') {
          totalDeductions += comp.amount;
        }
      }
    });

    totalDeductions += leaveDeduction;

    const grossSalary = basicSalary + totalEarnings;
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      totalEarnings,
      totalDeductions,
      grossSalary,
      netSalary,
      ...leaveData,
      leaveDeduction
    };
  };

  const salarySummary = calculateSalarySummary();

  const handleSubmit = async () => {
    const monthNumber = months.indexOf(selectedMonth) + 1;
    const salarySummary = calculateSalarySummary();

    const payload = {
      employee_id: Number(selectedEmployee),
      month: monthNumber,
      year: Number(selectedYear),
      basic_salary: Number(basicSalary),
      total_earnings: Number(salarySummary.totalEarnings.toFixed(2)),
      total_deductions: Number(salarySummary.totalDeductions.toFixed(2)),
      gross_salary: Number((basicSalary + salarySummary.totalEarnings).toFixed(2)),
      leave_deductions: Number(salarySummary.leaveDeduction.toFixed(2)),
      total_days_in_month: Number(salarySummary.totalDaysInMonth),
      total_working_days: Number(salarySummary.totalWorkingDays),
      total_leaves: Number(salarySummary.totalLeaves),
      total_free_leaves: Number(salarySummary.totalFreeLeaves),
      total_paid_leaves: Number(salarySummary.totalPaidLeaves),
      net_salary: Number(salarySummary.netSalary.toFixed(2))
    };

    console.log("Final payload:", payload);

    try {
      const response = await axios.post('http://localhost:2000/api/payroll', payload);
      console.log('Success:', response.data);
      alert('Payroll saved successfully!');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || 'Failed to save payroll'}`);
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-sm">
        <div className="card-header bg-light py-2">
          <h5 className="mb-0">Employee Payroll</h5>
        </div>
        
        <div className="card-body p-3">
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <label className="form-label small fw-bold">Employee</label>
              <select
                className="form-select form-select-sm"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold">Month</label>
              <select
                className="form-select form-select-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold">Year</label>
              <select
                className="form-select form-select-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {showSalaryInput && (
            <div className="border-top pt-3">
              <h6 className="small fw-bold mb-3">Salary for {selectedMonth} {selectedYear}</h6>
              
              {/* Basic Salary Input */}
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small">Basic Salary (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                    placeholder="Enter basic salary"
                  />
                </div>
              </div>

              {/* Leave Information Card */}
              <div className="card mb-3">
                <div className="card-header bg-light py-2">
                  <h6 className="small fw-bold mb-0">Leave Information</h6>
                </div>
                <div className="card-body p-3">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Total Days in Month:</span>
                        <span className="small fw-bold">{leaveData.totalDaysInMonth}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Working Days:</span>
                        <span className="small fw-bold">{leaveData.totalWorkingDays}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Total Leaves:</span>
                        <span className="small fw-bold">{leaveData.totalLeaves}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Paid Leaves:</span>
                        <span className="small fw-bold text-success">{leaveData.totalPaidLeaves}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Free Leaves:</span>
                        <span className="small fw-bold text-danger">{leaveData.totalFreeLeaves}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Leave Deduction:</span>
                        <span className="small fw-bold text-danger">₹{leaveDeduction.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Components Table */}
              <div className="table-responsive mb-4">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th width="5%">Include</th>
                      <th width="20%">Component</th>
                      <th width="15%">Type</th>
                      <th width="15%">Input Type</th>
                      <th width="20%">Value</th>
                      <th width="15%">Based On</th>
                      <th width="10%">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryComponents.map(component => {
                      const componentValue = componentValues[component.id];
                      
                      return (
                        <tr key={component.id} className={componentValue?.enabled ? '' : 'text-muted'}>
                          <td>
                            <input
                              type="checkbox"
                              checked={componentValue?.enabled || false}
                              onChange={() => handleComponentToggle(component.id)}
                            />
                          </td>
                          <td>{component.name}</td>
                          <td>
                            <span className={`badge ${component.type === 'earning' ? 'bg-success' : 'bg-danger'}`}>
                              {component.type}
                            </span>
                          </td>
                          <td>
                            {componentValue?.enabled ? (
                              <select
                                className="form-select form-select-sm"
                                value={componentValue?.value_type || 'percentage'}
                                onChange={(e) => handleValueTypeChange(component.id, e.target.value)}
                              >
                                <option value="percentage">Percentage</option>
                                <option value="flat">Flat</option>
                              </select>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {componentValue?.enabled ? (
                              componentValue?.value_type === 'flat' ? (
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={componentValue?.value || ''}
                                  onChange={(e) => handleValueChange(component.id, e.target.value)}
                                  placeholder="Enter amount"
                                />
                              ) : (
                                <div className="input-group input-group-sm">
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={componentValue?.value || ''}
                                    onChange={(e) => handleValueChange(component.id, e.target.value)}
                                    placeholder="Percentage"
                                  />
                                  <span className="input-group-text">%</span>
                                </div>
                              )
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {component.based_on || '-'}
                          </td>
                          <td className="text-end">
                            {componentValue?.enabled ? (
                              componentValue?.amount.toFixed(2)
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Salary Summary */}
              <div className="card bg-light mb-3">
                <div className="card-body p-3">
                  <h6 className="small fw-bold mb-3">Salary Summary</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Basic Salary:</span>
                        <span className="small fw-bold">₹{salarySummary.basicSalary.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Total Earnings:</span>
                        <span className="small fw-bold text-success">₹{salarySummary.totalEarnings.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Total Deductions:</span>
                        <span className="small fw-bold text-danger">₹{salarySummary.totalDeductions.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Gross Salary:</span>
                        <span className="small fw-bold">₹{salarySummary.grossSalary.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Leave Deductions:</span>
                        <span className="small fw-bold text-danger">₹{salarySummary.leaveDeduction.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="small">Net Salary:</span>
                        <span className="small fw-bold text-primary">₹{salarySummary.netSalary.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-end">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleSubmit}
                  disabled={!basicSalary || basicSalary <= 0}
                >
                  Save Payroll
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePayroll;