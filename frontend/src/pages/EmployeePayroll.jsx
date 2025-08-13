import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showSalaryInput, setShowSalaryInput] = useState(false);
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [componentValues, setComponentValues] = useState({});
  const [basicSalary, setBasicSalary] = useState(0);

  useEffect(() => {
    // Fetch employees
    axios.get('http://localhost:2000/api/hr/getallemployees')
      .then(response => setEmployees(response.data))
      .catch(error => console.error('Error fetching employees:', error));

    // Fetch salary components
    axios.get('http://localhost:2000/api/salary-components/list')
      .then(response => {
        setSalaryComponents(response.data);
        // Initialize component values
        const initialValues = {};
        response.data.forEach(comp => {
          initialValues[comp.id] = {
            enabled: comp.name.toLowerCase() === 'basic salary', // Enable Basic Salary by default
            value: comp.default_value || '0',
            type: comp.type,
            value_type: comp.value_type || 'flat', // Basic Salary should be flat
            based_on: comp.based_on,
            amount: comp.default_value ? parseFloat(comp.default_value) : 0,
            days: 0
          };
          
          // Set basic salary if this is the Basic Salary component
          if (comp.name.toLowerCase() === 'basic salary') {
            setBasicSalary(comp.default_value ? parseFloat(comp.default_value) : 0);
          }
        });
        setComponentValues(initialValues);
      })
      .catch(error => console.error('Error fetching salary components:', error));
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      setShowSalaryInput(true);
    } else {
      setShowSalaryInput(false);
    }
  }, [selectedEmployee]);

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

  const calculateAmount = (componentId, value, valueType, componentName) => {
    if (!value) return 0;
    
    const numericValue = parseFloat(value) || 0;
    
    if (valueType === 'flat') {
      // If this is Basic Salary component, update the basicSalary state
      if (componentName.toLowerCase() === 'basic salary') {
        setBasicSalary(numericValue);
      }
      return numericValue;
    } else if (valueType === 'percentage') {
      return (basicSalary * numericValue) / 100;
    }
    return 0;
  };

  const handleValueChange = (componentId, value, componentName) => {
    const component = componentValues[componentId];
    const amount = calculateAmount(componentId, value, component.value_type, componentName);
    
    setComponentValues(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        value: value,
        amount: amount
      }
    }));
  };

  const handleValueTypeChange = (componentId, valueType, componentName) => {
    const component = componentValues[componentId];
    const amount = calculateAmount(componentId, component.value, valueType, componentName);
    
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

    Object.entries(componentValues).forEach(([id, comp]) => {
      if (comp.enabled) {
        if (comp.type === 'earning') {
          totalEarnings += comp.amount;
        } else if (comp.type === 'deduction') {
          totalDeductions += comp.amount;
        }
      }
    });

    const grossSalary = totalEarnings;
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      totalEarnings,
      totalDeductions,
      grossSalary,
      netSalary
    };
  };

  const salarySummary = calculateSalarySummary();

  const handleSubmit = async () => {
    const payload = {
      employee_id: Number(selectedEmployee),
      basic_salary: Number(basicSalary),
      total_earnings: Number(salarySummary.totalEarnings.toFixed(2)),
      total_deductions: Number(salarySummary.totalDeductions.toFixed(2)),
      gross_salary: Number(salarySummary.grossSalary.toFixed(2)),
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
            <div className="col-md-12">
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
          </div>

          {showSalaryInput && (
            <div className="border-top pt-3">
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
                              disabled={component.name.toLowerCase() === 'basic salary'} // Disable toggle for Basic Salary
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
                                onChange={(e) => handleValueTypeChange(component.id, e.target.value, component.name)}
                                disabled={component.name.toLowerCase() === 'basic salary'} // Disable type change for Basic Salary
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
                                  onChange={(e) => handleValueChange(component.id, e.target.value, component.name)}
                                  placeholder="Enter amount"
                                />
                              ) : (
                                <div className="input-group input-group-sm">
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={componentValue?.value || ''}
                                    onChange={(e) => handleValueChange(component.id, e.target.value, component.name)}
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
                        <span className="small fw-bold">₹{basicSalary.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Total Earnings:</span>
                        <span className="small fw-bold text-success">₹{salarySummary.totalEarnings.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Total Deductions:</span>
                        <span className="small fw-bold text-danger">₹{salarySummary.totalDeductions.toFixed(2)}</span>
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