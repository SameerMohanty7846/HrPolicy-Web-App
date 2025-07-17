import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeePermissionList = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/hr/getallemployees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to fetch employees.');
    }
  };

  const handlePermissionClick = (id) => {
    // ✅ Corrected navigation path
    navigate(`/admin/permission/${id}`);
  };

  return (
    <div className="register-bg d-flex align-items-center justify-content-center min-vh-100 py-4 px-3">
      <div className="glass-card p-4 rounded-4 w-100" style={{ maxWidth: '1200px' }}>
        <h4 className="text-center mb-4 text-white fw-bold">Employee Permission List</h4>
        <div className="table-responsive">
          <table className="table table-hover table-bordered mb-0">
            <thead className="table-light">
              <tr className="text-center align-middle">
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Employee Type</th>
                <th>Experience (Years)</th>
                <th>Permission</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-white py-4">
                    No Employees Found
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employee.id} className="text-center align-middle">
                    <td>{index + 1}</td>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.employeeType}</td>
                    <td>{employee.experience}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm fw-semibold"
                        onClick={() => handlePermissionClick(employee.id)}
                      >
                        Permission
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          .register-bg {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .table th, .table td {
            padding: 0.85rem 0.75rem;
            vertical-align: middle;
            font-size: 0.95rem;
          }
          .btn-primary {
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 0.9rem;
          }
        `}
      </style>
    </div>
  );
};

export default EmployeePermissionList;
