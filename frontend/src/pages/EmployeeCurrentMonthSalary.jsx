import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const EmployeeCurrentMonthSalary = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const response = await axios.get('http://localhost:2000/api/leaves/monthly-summary');
        if (response.data.success) {
          setLeaveData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

  return (
    <div className="container mt-5">
      <div className="card border-0 shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0 text-center">Current Month Leave Summary</h2>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="thead-light">
                <tr>
                  <th className="text-center">#</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th className="text-end">Salary (₹)</th>
                  <th className="text-center">Free Leaves</th>
                  <th className="text-center">Paid Leaves</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : leaveData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No data available for the current month
                    </td>
                  </tr>
                ) : (
                  leaveData.map((emp, index) => (
                    <tr key={emp.employeeId}>
                      <td className="text-center">{index + 1}</td>
                      <td>{emp.employeeId}</td>
                      <td className="fw-semibold">{emp.employeeName}</td>
                      <td className="text-end">{parseFloat(emp.salary).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-center">
                        <span className={`badge ${emp.free_leaves > 0 ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
                          {emp.free_leaves}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${emp.paid_leaves > 0 ? 'bg-info text-dark' : 'bg-light text-dark'}`}>
                          {emp.paid_leaves}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {leaveData.length > 0 && (
          <div className="card-footer text-muted small">
            Showing {leaveData.length} employee records
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCurrentMonthSalary;