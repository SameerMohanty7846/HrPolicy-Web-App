import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PermissionComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [permissions, setPermissions] = useState({
    E_add: false,
    E_read: false,
    E_edit: false,
    E_delete: false
  });

  useEffect(() => {
    fetchEmployeePermission();
  }, []);

  const fetchEmployeePermission = async () => {
    try {
      const response = await axios.get(`http://localhost:2000/api/employee/${id}/permission`);
      setEmployee(response.data.employee);
      if (response.data.permissions) {
        setPermissions(response.data.permissions);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Failed to fetch employee data or permissions');
    }
  };

  const handleCheckboxChange = (e) => {
    setPermissions({
      ...permissions,
      [e.target.name]: e.target.checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:2000/api/employee/${id}/permission`, permissions);
      alert('✅ Permissions updated successfully');
    } catch (err) {
      console.error('Error updating permissions:', err);
      alert('❌ Failed to update permissions');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Employee Permission Management</h2>

      {employee ? (
        <div className="mb-4">
          <h5>Employee Details:</h5>
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Phone:</strong> {employee.phone}</p>
        </div>
      ) : (
        <p>Loading employee details...</p>
      )}

      <form onSubmit={handleSubmit}>
        <table className="table table-bordered text-center">
          <thead className="table-light">
            <tr>
              <th>Permission</th>
              <th>Allowed</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissions)
              .filter(([key]) => key !== 'id' && key !== 'employee_id')
              .map(([key, value]) => (
                <tr key={key}>
                  <td>{key.replace('E_', '')}</td>
                  <td>
                    <input
                      type="checkbox"
                      name={key}
                      checked={value}
                      onChange={handleCheckboxChange}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <button type="submit" className="btn btn-primary mt-3 me-2">Update Permissions</button>
        <button type="button" className="btn btn-secondary mt-3" onClick={handleBack}>Go Back</button>
      </form>
    </div>
  );
};

export default PermissionComponent;
