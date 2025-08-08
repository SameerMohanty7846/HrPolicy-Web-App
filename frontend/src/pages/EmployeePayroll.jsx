import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [showSalaryInput, setShowSalaryInput] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [componentValues, setComponentValues] = useState({});

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
    axios.get('http://localhost:2000/api/salary-components/list')
      .then(response => setSalaryComponents(response.data))
      .catch(error => console.error('Error fetching salary components:', error));
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedMonth && selectedYear) {
      const emp = employees.find(e => e.id === selectedEmployee);
      setSelectedEmployeeDetails(emp);
      setShowSalaryInput(true);
      
      // Initialize component values
      const initialValues = {};
      salaryComponents.forEach(comp => {
        initialValues[comp.id] = {
          enabled: false,
          value: '',
          type: comp.type,
          value_type: comp.value_type,
          based_on: comp.based_on,
          total: 0
        };
      });
      setComponentValues(initialValues);
    } else {
      setShowSalaryInput(false);
    }
  }, [selectedEmployee, selectedMonth, selectedYear, employees, salaryComponents]);

  const handleComponentToggle = (id) => {
    setComponentValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id]?.enabled,
        value: prev[id]?.enabled ? '' : prev[id]?.value
      }
    }));
  };

  const handleValueChange = (id, value) => {
    setComponentValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        value: value,
        total: calculateTotal(id, value, prev[id])
      }
    }));
  };

  const calculateTotal = (id, value, component) => {
    if (!value) return 0;
    
    if (component.value_type === 'flat') {
      return parseFloat(value) || 0;
    } else if (component.value_type === 'percentage') {
      const baseValue = component.based_on === 'Basic Salary' ? parseFloat(basicSalary) || 0 : 0;
      return (baseValue * parseFloat(value) / 100) || 0;
    }
    return 0;
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
                    onChange={(e) => setBasicSalary(e.target.value)}
                    placeholder="Enter basic salary"
                  />
                </div>
              </div>

              {/* Salary Components Table */}
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th width="5%">Include</th>
                      <th width="25%">Component</th>
                      <th width="15%">Type</th>
                      <th width="20%">Value</th>
                      <th width="20%">Based On</th>
                      <th width="15%">Amount (₹)</th>
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
                          <select
                            className="form-select form-select-sm"
                            value={componentValues[component.id]?.type || ''}
                            disabled
                          >
                            <option value="earning">Earning</option>
                            <option value="deduction">Deduction</option>
                          </select>
                        </td>
                        <td>
                          {componentValues[component.id]?.enabled ? (
                            component.value_type === 'flat' ? (
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
                            componentValues[component.id]?.total.toFixed(2)
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePayroll;