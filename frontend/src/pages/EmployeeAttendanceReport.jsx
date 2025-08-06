import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const monthsList = [
  '01-JAN', '02-FEB', '03-MAR', '04-APR', '05-MAY', '06-JUN',
  '07-JUL', '08-AUG', '09-SEP', '10-OCT', '11-NOV', '12-DEC'
];

const EmployeeAttendanceReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:2000/api/hr/getallemployees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error('Error fetching employees', err));
  }, []);

  const currentYear = new Date().getFullYear();
  const monthOptions = monthsList.map(month => {
    return {
      label: `${month.split('-')[1]}-${currentYear}`,
      value: `${month.split('-')[0]}-${currentYear}`
    };
  });

  const handleMonthChange = (empId, value) => {
    setSelectedMonths(prev => ({ ...prev, [empId]: value }));
  };

  const handleViewAttendance = (empId) => {
    const selectedMonthYear = selectedMonths[empId];
    if (!selectedMonthYear) {
      alert('Please select a month for this employee');
      return;
    }
    navigate(`/attendance/${empId}?monthYear=${selectedMonthYear}`);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Employee Attendance Report</h2>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Department</th>
                  <th scope="col">Select Month</th>
                  <th scope="col">View</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.department}</td>
                    <td>
                      <select
                        className="form-select"
                        value={selectedMonths[emp.id] || ''}
                        onChange={e => handleMonthChange(emp.id, e.target.value)}
                      >
                        <option value="">-- Select --</option>
                        {monthOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewAttendance(emp.id)}
                      >
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceReport;