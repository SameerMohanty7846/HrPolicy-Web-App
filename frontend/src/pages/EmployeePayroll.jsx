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
  const [freeLeaves, setFreeLeaves] = useState(0);
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
            value_type: 'percentage', // Default to percentage
            based_on: comp.based_on,
            amount: 0
          };
        });
        setComponentValues(initialValues);
      })
      .catch(error => console.error('Error fetching salary components:', error));
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedMonth && selectedYear) {
      setShowSalaryInput(true);
      // Fetch free leaves for selected employee and month-year
      const monthNumber = (months.indexOf(selectedMonth) + 1).toString().padStart(2, '0');
      const monthYear = `${monthNumber}-${selectedYear}`;
      
      axios.get(`http://localhost:2000/api/leaves/free/${selectedEmployee}/${monthYear}`)
        .then(response => {
          const leaves = parseInt(response.data.totalFreeLeaves) || 0;
          setFreeLeaves(leaves);
          // Calculate leave deduction (1 day salary deduction per leave)
          const dailySalary = basicSalary / 30;
          setLeaveDeduction(dailySalary * leaves);
        })
        .catch(error => {
          console.error('Error fetching free leaves:', error);
          setFreeLeaves(0);
          setLeaveDeduction(0);
        });
    } else {
      setShowSalaryInput(false);
    }
  }, [selectedEmployee, selectedMonth, selectedYear, basicSalary]);

  useEffect(() => {
    // Recalculate amounts when basic salary changes or value_type changes
    const updatedValues = {...componentValues};
    let needsUpdate = false;

    Object.keys(updatedValues).forEach(id => {
      const comp = updatedValues[id];
      if (comp.enabled && comp.value) {
        const newAmount = calculateAmount(id, comp.value, comp.value_type);
        if (comp.amount !== newAmount) {
          updatedValues[id].amount = newAmount;
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      setComponentValues(updatedValues);
    }
  }, [basicSalary, componentValues]);

  const handleComponentToggle = (componentId) => {
    setComponentValues(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        enabled: !prev[componentId].enabled,
        value: prev[componentId].enabled ? '' : prev[componentId].value,
        amount: prev[componentId].enabled ? 0 : calculateAmount(componentId, prev[componentId].value, prev[componentId].value_type)
      }
    }));
  };

  const calculateAmount = (componentId, value, valueType) => {
    if (!value) return 0;
    
    const component = salaryComponents.find(c => c.id === parseInt(componentId));
    if (!component) return 0;

    if (valueType === 'flat') {
      return parseFloat(value) || 0;
    } else if (valueType === 'percentage') {
      const percentage = parseFloat(value) || 0;
      return (basicSalary * percentage) / 100;
    }
    return 0;
  };

  const handleValueChange = (componentId, value) => {
    const valueType = componentValues[componentId]?.value_type || 'percentage';
    const amount = calculateAmount(componentId, value, valueType);
    
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
    const currentValue = componentValues[componentId]?.value || '';
    const amount = calculateAmount(componentId, currentValue, valueType);
    
    setComponentValues(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        value_type: valueType,
        amount: amount
      }
    }));
  };

  // Calculate salary summary - now includes leave deduction
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

    // Add leave deduction to total deductions
    totalDeductions += leaveDeduction;

    const grossSalary = basicSalary + totalEarnings;
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      totalEarnings,
      totalDeductions,
      grossSalary,
      netSalary,
      freeLeaves,
      leaveDeduction
    };
  };

  const salarySummary = calculateSalarySummary();

  const handleSubmit = () => {
    const payload = {
      employeeId: selectedEmployee,
      month: selectedMonth,
      year: selectedYear,
      basicSalary: basicSalary,
      components: Object.entries(componentValues)
        .filter(([_, comp]) => comp.enabled)
        .map(([id, comp]) => ({
          componentId: parseInt(id),
          value: comp.value,
          value_type: comp.value_type,
          amount: comp.amount,
          type: comp.type
        })),
      freeLeaves: freeLeaves,
      leaveDeduction: leaveDeduction,
      grossSalary: salarySummary.grossSalary,
      totalDeductions: salarySummary.totalDeductions,
      netSalary: salarySummary.netSalary
    };

    console.log('Payload to be submitted:', payload);
    // Here you would call your API to save the payroll data
    // axios.post('http://localhost:2000/api/payroll/save', payload)
    //   .then(response => {
    //     console.log('Payroll saved successfully:', response);
    //     alert('Payroll saved successfully!');
    //   })
    //   .catch(error => {
    //     console.error('Error saving payroll:', error);
    //     alert('Error saving payroll!');
    //   });
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

              {/* Salary Components Table */}
              <div className="table-responsive mb-4">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th width="5%">Include</th>
                      <th width="20%">Component</th>
                      <th width="15%">Type</th>
                      <th width="15%">Value Type</th>
                      <th width="20%">Value</th>
                      <th width="15%">Based On</th>
                      <th width="10%">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryComponents.map(component => (
                      <tr key={component.id} className={componentValues[component.id]?.enabled ? '' : 'text-muted'}>
                        <td>
                          <input
                            type="checkbox"
                            checked={componentValues[component.id]?.enabled || false}
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
                          {componentValues[component.id]?.enabled ? (
                            <select
                              className="form-select form-select-sm"
                              value={componentValues[component.id]?.value_type || 'percentage'}
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
                          {componentValues[component.id]?.enabled ? (
                            componentValues[component.id]?.value_type === 'flat' ? (
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={componentValues[component.id]?.value || ''}
                                onChange={(e) => handleValueChange(component.id, e.target.value)}
                                placeholder="Enter amount"
                              />
                            ) : (
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={componentValues[component.id]?.value || ''}
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
                          {componentValues[component.id]?.enabled ? (
                            componentValues[component.id]?.amount.toFixed(2)
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
                        <span className="small fw-bold text-danger">₹{salarySummary.leaveDeduction.toFixed(2)} ({salarySummary.freeLeaves} days)</span>
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