import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`http://localhost:2000/api/hr/employees/${id}`);
      alert(response.data);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee.');
    }
  };

  return (
    <div className="register-bg d-flex align-items-center justify-content-center min-vh-100 py-4 px-3">
      <div className="glass-card p-4 rounded-4 w-100" style={{ maxWidth: '1200px' }}>
        <h4 className="text-center mb-4 text-white fw-bold">Registered Employees</h4>
        <div className="table-responsive">
          <table className="table table-hover table-bordered mb-0">
            <thead className="table-light">
              <tr className="text-center align-middle">
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Salary</th>
                <th>Date of Joining</th>
                <th>Employee Type</th>
                <th>Experience (Years)</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-white py-4">
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
                    <td>{employee.salary}</td>
                    <td>{new Date(employee.dateOfJoining).toISOString().slice(0, 10)}</td>
                    <td>{employee.employeeType}</td>
                    <td>{employee.experience}</td>
                    <td>{employee.department || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm fw-semibold"
                        onClick={() => handleDelete(employee.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          .table thead th {
            font-weight: 700;
            font-size: 1rem;
          }
          .btn-danger {
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 0.9rem;
          }
        `}
      </style>
    </div>
  );
};

export default ViewEmployees;
