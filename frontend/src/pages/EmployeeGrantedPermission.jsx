import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeeGrantedPermission = () => {
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      fetchGrantedPermissions(storedUser.id);

      const interval = setInterval(() => {
        fetchGrantedPermissions(storedUser.id);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  const fetchGrantedPermissions = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:2000/api/employee/${employeeId}/granted-permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching granted permissions:', error);
      alert('Failed to load granted permissions');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePermissionClick = (permissionKey) => {
    const permissionRoutes = {
      E_add: '/employee/add',
      E_read: '/employee/read',
      E_edit: '/employee/edit',
      E_delete: '/employee/delete'
    };

    if (permissionRoutes[permissionKey]) {
      navigate(permissionRoutes[permissionKey]);
    }
  };

  const grantedPermissions = Object.entries(permissions).filter(
    ([key, value]) => key.startsWith('E_') && value
  );

  const buttonColors = {
    E_add: 'primary',
    E_read: 'success',
    E_edit: 'warning',
    E_delete: 'danger'
  };

  return (
    <div className="permission-bg d-flex justify-content-center align-items-center min-vh-100">
      <div className="glass-card p-5 rounded-4 text-center" style={{ width: '400px' }}>
        <h2 className="mb-4 text-white">Granted Permissions</h2>

        <div className="d-flex flex-column align-items-center mb-3 w-100">
          {grantedPermissions.length > 0 ? (
            grantedPermissions.map(([key]) => (
              <button
                key={key}
                className={`btn btn-${buttonColors[key]} mb-3 fw-semibold w-100 permission-btn text-uppercase`}
                onClick={() => handlePermissionClick(key)}
              >
                {key.replace('E_', '')}
              </button>
            ))
          ) : (
            <p className="text-light">No Permissions Granted</p>
          )}
        </div>

        <button onClick={handleBack} className="btn btn-light mt-3 w-100 fw-bold permission-btn text-uppercase">
          Back to Dashboard
        </button>
      </div>

      <style>
        {`
          .permission-bg {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }

          .permission-btn {
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            letter-spacing: 1px;
            transition: all 0.3s ease-in-out;
          }

          .permission-btn:hover {
            transform: scale(1.03);
            opacity: 0.9;
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeGrantedPermission;
