import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import components
import AssignTask from './AssignTask';
import TaskManagement from './TaskManagement';
import ChangePassword from './ChangePassword';
import EmployeeGrantedPermission from './EmployeeGrantedPermission';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('home');

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

  const renderContent = () => {
    if (!user) return null;

    switch (activeComponent) {
      case 'assignTask':
        return <AssignTask />;
      case 'taskManagement':
        return <TaskManagement employeeId={user.id} />;
      case 'changePassword':
        return <ChangePassword />;
      case 'grantedPermissions':
        return <EmployeeGrantedPermission employeeId={user.id} />;
      default:
        return (
          <div className="text-center mt-5">
            <h1>Welcome, {user.name}!</h1>
            <p className="lead">
              You are logged in as <strong>{user.role}</strong>.
            </p>
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
              className="rounded-circle bg-dark bg-opacity-50 d-inline-flex align-items-center justify-content-center border border-white"
              style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}
            >
              {getInitial(user.name)}
            </div>
            <div className="mt-2 fw-bold">{user.name}</div>
            <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
            <div className="text-capitalize">{user.role}</div>
          </div>
        )}

        <button className="sidebar-btn" onClick={() => setActiveComponent('assignTask')}>
          Assign Task
        </button>

        <button className="sidebar-btn" onClick={() => setActiveComponent('taskManagement')}>
          Manage My Tasks
        </button>

        <button className="sidebar-btn" onClick={() => setActiveComponent('grantedPermissions')}>
          Granted Permissions
        </button>

        <button className="sidebar-btn" onClick={() => setActiveComponent('changePassword')}>
          Change Password
        </button>

        <button
          className="btn btn-danger mt-4 fw-bold rounded-3 shadow logout-btn"
          onClick={handleLogout}
        >
          Logout
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
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364, #1f4037);
          width: 100%;
        }

        .glass-sidebar {
          background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          backdrop-filter: blur(14px);
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.05);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-btn {
          background: linear-gradient(to right, #4b6cb7, #182848);
          color: white;
          border: none;
          padding: 10px 16px;
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
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }

        .logout-btn {
          transition: transform 0.2s ease;
        }

        .logout-btn:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
