import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="layout-bg d-flex" style={{ height: '100vh' }}>
      <div
        className="glass-sidebar d-flex flex-column text-white p-3"
        style={{ width: '220px', overflowY: 'auto', position: 'fixed', height: '100vh' }}
      >
        {user && (
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center border border-white"
              style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}
            >
              {getInitial(user.name)}
            </div>
            <div className="mt-2 fw-bold">{user.name}</div>
            <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
            <div className="text-capitalize">{user.role}</div>
          </div>
        )}

        <button
          className="btn btn-light mt-2"
          onClick={() => navigate('/employee/granted-permissions')}
        >
          Granted Permissions
        </button>

        <button className="btn btn-danger mt-3" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft: '220px', width: 'calc(100% - 220px)', overflowY: 'auto' }}
      >
        {user && (
          <div className="text-center mt-5">
            <h1>Welcome, {user.name}!</h1>
            <p className="lead">You are logged in as <strong>{user.role}</strong>.</p>
          </div>
        )}
      </div>

      <style>
        {`
          .layout-bg {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
            width: 100%;
          }
          .glass-sidebar {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border-right: 1px solid rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeDashboard;
