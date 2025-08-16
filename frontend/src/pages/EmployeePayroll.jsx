import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeePayroll = () => {
  // Initial state values
  const initialEmployeeState = '';
  const initialEmployeeNameState = '';
  const initialShowSalaryInputState = false;
  const initialSalaryComponentsState = [];
  const initialComponentValuesState = {};
  const initialBasicSalaryState = 0;
  const initialExistingSalaryIdState = null;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployeeState);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState(initialEmployeeNameState);
  const [showSalaryInput, setShowSalaryInput] = useState(initialShowSalaryInputState);
  const [salaryComponents, setSalaryComponents] = useState(initialSalaryComponentsState);
  const [componentValues, setComponentValues] = useState(initialComponentValuesState);
  const [basicSalary, setBasicSalary] = useState(initialBasicSalaryState);
  const [existingSalaryId, setExistingSalaryId] = useState(initialExistingSalaryIdState);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to safely convert to number
  const toNumber = (value) => {
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Function to reset all states to initial values
  const resetAllStates = () => {
    setSelectedEmployee(initialEmployeeState);
    setSelectedEmployeeName(initialEmployeeNameState);
    setShowSalaryInput(initialShowSalaryInputState);
    setComponentValues(initialComponentValuesState);
    setBasicSalary(initialBasicSalaryState);
    setExistingSalaryId(initialExistingSalaryIdState);
  };

  useEffect(() => {
    // Fetch employees
    axios.get('http://localhost:2000/api/hr/getallemployees')
      .then(response => {
        setEmployees(response.data);
      })
      .catch(error => console.error('Error fetching employees:', error));

    // Fetch salary components
    axios.get('http://localhost:2000/api/salary-components/list')
      .then(response => {
        const components = response.data;
        setSalaryComponents(components);
        
        // Initialize component values
        const initialValues = {};
        let basicSal = 0;
        
        components.forEach(comp => {
          const isBasicSalary = comp.name.toLowerCase() === 'basic salary';
          const amount = toNumber(comp.default_value);
          
          initialValues[comp.id] = {
            enabled: isBasicSalary,
            value: comp.default_value || '0',
            type: comp.type,
            value_type: isBasicSalary ? 'flat' : (comp.value_type || 'percentage'),
            based_on: comp.based_on,
            amount: amount,
            name: comp.name
          };
          
          if (isBasicSalary) {
            basicSal = amount;
            setBasicSalary(basicSal);
          }
        });
        
        setComponentValues(initialValues);
      })
      .catch(error => console.error('Error fetching salary components:', error));
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id == selectedEmployee);
      if (employee) {
        setSelectedEmployeeName(employee.name);
      }
      setShowSalaryInput(true);
      fetchExistingSalaryData(selectedEmployee);
    } else {
      setShowSalaryInput(false);
    }
  }, [selectedEmployee, employees]);

  const fetchExistingSalaryData = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:2000/api/salary/employee-salary-info/${employeeId}`);
      
      if (response.data) {
        const { salaryInfo, partitions } = response.data;
        
        // Set the existing salary ID for update purposes
        setExistingSalaryId(salaryInfo.salary_id);
        
        // Set basic salary
        setBasicSalary(toNumber(salaryInfo.basic_salary));
        
        // Update component values based on existing data
        const updatedComponentValues = { ...componentValues };
        
        // First, disable all components except basic salary
        Object.keys(updatedComponentValues).forEach(id => {
          const isBasic = updatedComponentValues[id].name.toLowerCase() === 'basic salary';
          updatedComponentValues[id] = {
            ...updatedComponentValues[id],
            enabled: isBasic,
            value: isBasic ? salaryInfo.basic_salary.toString() : '0',
            amount: isBasic ? toNumber(salaryInfo.basic_salary) : 0
          };
        });
        
        // Then enable and set values for components that exist in partitions
        partitions.forEach(partition => {
          const componentId = Object.keys(updatedComponentValues).find(
            id => updatedComponentValues[id].name === partition.component_name
          );
          
          if (componentId) {
            updatedComponentValues[componentId] = {
              ...updatedComponentValues[componentId],
              enabled: true,
              value: partition.value.toString(),
              type: partition.component_type,
              value_type: partition.input_type === 'Percentage' ? 'percentage' : 'flat',
              based_on: partition.based_on,
              amount: toNumber(partition.amount),
              name: partition.component_name
            };
          }
        });
        
        setComponentValues(updatedComponentValues);
      } else {
        // No existing data found, reset to defaults
        setExistingSalaryId(null);
        const initialValues = {};
        salaryComponents.forEach(comp => {
          const isBasicSalary = comp.name.toLowerCase() === 'basic salary';
          initialValues[comp.id] = {
            enabled: isBasicSalary,
            value: comp.default_value || '0',
            type: comp.type,
            value_type: isBasicSalary ? 'flat' : (comp.value_type || 'percentage'),
            based_on: comp.based_on,
            amount: toNumber(comp.default_value),
            name: comp.name
          };
        });
        setComponentValues(initialValues);
      }
    } catch (error) {
      console.error('Error fetching existing salary data:', error);
      // If error occurs, assume no existing data
      setExistingSalaryId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComponentToggle = (componentId) => {
    const component = componentValues[componentId];
    if (component.name.toLowerCase() === 'basic salary') return;
    
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
    
    const numericValue = toNumber(value);
    
    if (valueType === 'flat') {
      if (componentName.toLowerCase() === 'basic salary') {
        setBasicSalary(numericValue);
      }
      return numericValue;
    } else if (valueType === 'percentage') {
      return (basicSalary * numericValue) / 100;
    }
    return 0;
  };

  const handleBasicSalaryChange = (value) => {
    const numericValue = toNumber(value);
    setBasicSalary(numericValue);
    
    // Update the componentValues state for basic salary
    const basicSalaryComponentId = Object.keys(componentValues).find(
      id => componentValues[id].name.toLowerCase() === 'basic salary'
    );
    
    if (basicSalaryComponentId) {
      setComponentValues(prev => ({
        ...prev,
        [basicSalaryComponentId]: {
          ...prev[basicSalaryComponentId],
          value: value,
          amount: numericValue
        }
      }));
    }
    
    // Recalculate all percentage-based components
    Object.entries(componentValues).forEach(([id, comp]) => {
      if (comp.enabled && comp.name.toLowerCase() !== 'basic salary' && comp.value_type === 'percentage') {
        const amount = calculateAmount(id, comp.value, comp.value_type, comp.name);
        setComponentValues(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            amount: amount
          }
        }));
      }
    });
  };

  const handleValueChange = (componentId, value) => {
    const component = componentValues[componentId];
    const amount = calculateAmount(componentId, value, component.value_type, component.name);
    
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
    if (component.name.toLowerCase() === 'basic salary') return;
    
    const amount = calculateAmount(componentId, component.value, valueType, component.name);
    
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
    let otherEarnings = 0;
    let totalDeductions = 0;
    const partitions = [];

    Object.entries(componentValues).forEach(([id, comp]) => {
      if (comp.enabled) {
        if (comp.type === 'earning') {
          if (comp.name.toLowerCase() !== 'basic salary') {
            otherEarnings += toNumber(comp.amount);
          }
        } else if (comp.type === 'deduction') {
          totalDeductions += toNumber(comp.amount);
        }

        partitions.push({
          component_name: comp.name,
          component_type: comp.type,
          input_type: comp.value_type === 'percentage' ? 'Percentage' : 'Flat',
          value: comp.value,
          based_on: comp.based_on,
          amount: toNumber(comp.amount)
        });
      }
    });

    const grossSalary = basicSalary + otherEarnings;
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      otherEarnings,
      totalDeductions,
      grossSalary,
      netSalary,
      partitions
    };
  };

  const handleSubmit = async () => {
    const salarySummary = calculateSalarySummary();

    const payload = {
      salary_id: existingSalaryId || null,
      employee_id: Number(selectedEmployee),
      employee_name: selectedEmployeeName,
      basic_salary: toNumber(basicSalary),
      other_earnings: toNumber(salarySummary.otherEarnings.toFixed(2)),
      total_deductions: toNumber(salarySummary.totalDeductions.toFixed(2)),
      gross_salary: toNumber(salarySummary.grossSalary.toFixed(2)),
      employee_net_salary: toNumber(salarySummary.netSalary.toFixed(2)),
      partitions: salarySummary.partitions
    };

    console.log("Final payload:", payload);

    try {
      const response = existingSalaryId 
        ? await axios.put('http://localhost:2000/api/salary/employee-salary-info', payload)
        : await axios.post('http://localhost:2000/api/salary/employee-salary-info', payload);
      
      console.log('Success:', response.data);
      alert(`Payroll ${existingSalaryId ? 'updated' : 'saved'} successfully!`);
      
      if (!existingSalaryId && response.data.salary_id) {
        setExistingSalaryId(response.data.salary_id);
      }
      
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
                disabled={isLoading}
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

          {isLoading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading employee payroll data...</p>
            </div>
          )}

          {showSalaryInput && !isLoading && (
            <div className="border-top pt-3">
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
                      const isBasicSalary = component.name.toLowerCase() === 'basic salary';
                      const amount = componentValue?.enabled ? toNumber(componentValue.amount) : 0;
                      
                      return (
                        <tr key={component.id} className={componentValue?.enabled ? '' : 'text-muted'}>
                          <td>
                            <input
                              type="checkbox"
                              checked={componentValue?.enabled || false}
                              onChange={() => handleComponentToggle(component.id)}
                              disabled={isBasicSalary}
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
                                disabled={isBasicSalary}
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
                              isBasicSalary ? (
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={basicSalary || ''}
                                  onChange={(e) => handleBasicSalaryChange(e.target.value)}
                                  placeholder="Enter amount"
                                />
                              ) : componentValue?.value_type === 'flat' ? (
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
                              amount.toFixed(2)
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
                        <span className="small">Other Earnings:</span>
                        <span className="small fw-bold text-success">₹{calculateSalarySummary().otherEarnings.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Gross Salary:</span>
                        <span className="small fw-bold text-primary">₹{calculateSalarySummary().grossSalary.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Total Deductions:</span>
                        <span className="small fw-bold text-danger">₹{calculateSalarySummary().totalDeductions.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="small">Net Salary:</span>
                        <span className="small fw-bold text-primary">₹{calculateSalarySummary().netSalary.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-end">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleSubmit}
                >
                  {existingSalaryId ? 'Update Payroll' : 'Save Payroll'}
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