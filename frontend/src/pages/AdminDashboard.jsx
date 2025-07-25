import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import AddEmployee from './AddEmployee';
import AddHr from './AddHr';
import ViewEmployees from './ViewEmployees';
import EmployeePermissionList from './EmployeePermissionList';
import ChangePassword from './ChangePassword';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('home');

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '');

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const renderContent = () => {
    if (!user) return null;

    switch (activeComponent) {
      case 'addEmployee':
        return <AddEmployee />;
      case 'addHr':
        return <AddHr />;
      case 'viewEmployees':
        return <ViewEmployees />;
      case 'permissions':
        return <EmployeePermissionList />;
      case 'changePassword':
        return <ChangePassword />;
      default:
        return (
          <div className="px-3">
            <div className="welcome-card mb-4 p-4 rounded shadow text-white">
              <h2 className="fw-bold mb-2">👋 Welcome back, {user?.name}</h2>
              <p className="mb-0">Logged in as <strong>{user?.role}</strong></p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="layout-bg d-flex" style={{ height: '100vh' }}>
      <div
        className="glass-sidebar d-flex flex-column text-white p-3"
        style={{ width: '220px', position: 'fixed', height: '100vh', overflowY: 'auto' }}
      >
        {user && (
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-white bg-opacity-10 d-inline-flex align-items-center justify-content-center border border-light"
              style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}
            >
              {getInitial(user.name)}
            </div>
            <div className="mt-2 fw-bold">{user.name}</div>
            <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
            <div className="text-capitalize">{user.role}</div>
          </div>
        )}

        <button className="sidebar-btn" onClick={() => setActiveComponent('addEmployee')}>➕ Add Employee</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('addHr')}>👤 Add HR</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('viewEmployees')}>👥 View Employees</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('permissions')}>🔒 Permissions</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('changePassword')}>🔐 Change Password</button>

        <button className="btn btn-danger mt-4 fw-bold rounded-3 shadow logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft: '220px', width: 'calc(100% - 220px)', overflowY: 'auto' }}
      >
        {renderContent()}
      </div>

      <style>{`
        .layout-bg {
          background: linear-gradient(135deg, #1e1e2f, #1a1a27);
        }

        .glass-sidebar {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border-right: 1px solid rgba(255,255,255,0.1);
        }

        .sidebar-btn {
          background: linear-gradient(to right, #4b6cb7, #182848);
          color: white;
          border: none;
          padding: 10px 14px;
          margin-top: 10px;
          border-radius: 12px;
          font-weight: 600;
          text-align: left;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .sidebar-btn:hover {
          background: linear-gradient(to right, #43cea2, #185a9d);
          transform: translateX(4px);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
        }

        .logout-btn:hover {
          transform: scale(1.05);
        }

        .welcome-card {
          background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3));
          border-left: 4px solid #00e6e6;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
