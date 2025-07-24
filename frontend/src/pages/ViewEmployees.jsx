import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

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

  // 🔍 Filter before pagination
  const filteredEmployees = employees.filter((emp) =>
    Object.values(emp).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);

  return (
    <div className="register-bg d-flex align-items-center justify-content-center min-vh-100 py-4 px-3">
      <div className="glass-card p-4 rounded-4 w-100" style={{ maxWidth: '1100px' }}>
        <h4 className="text-center mb-4 text-white fw-bold">Registered Employees</h4>

        {/* 🔍 Search Input */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-bordered mb-0 small-table">
            <thead className="table-light">
              <tr className="text-center align-middle">
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Salary</th>
                <th>Date of Joining</th>
                <th>Type</th>
                <th>Experience</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-white py-4">
                    No Employees Found
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee, index) => (
                  <tr key={employee.id} className="text-center align-middle">
                    <td>{startIndex + index + 1}</td>
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

        {/* ⬅️➡️ Pagination Buttons */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-white small">
            Page {currentPage} of {totalPages}
          </span>
          <div>
            <button
              className="btn btn-light btn-sm me-2"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="btn btn-light btn-sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 🖼️ Styles */}
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
          .small-table th, .small-table td {
            padding: 0.5rem 0.4rem;
            font-size: 0.8rem;
          }
          .small-table thead th {
            font-weight: 700;
            font-size: 0.9rem;
          }
          .btn-danger {
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 0.8rem;
          }
        `}
      </style>
    </div>
  );
};

export default ViewEmployees;
