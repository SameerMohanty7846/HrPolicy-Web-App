import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import components
import HrHome from './HrHome';
import AddEmployee from './AddEmployee';
import ViewEmployees from './ViewEmployees';
import HrPolicy from './HrPolicy';
import AssignTask from './AssignTask';
import TaskManagement from './TaskManagement';
import ChangePassword from './ChangePassword'; // ✅ Imported

const HrDashboard = () => {
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
      case 'addEmployee':
        return <AddEmployee />;
      case 'viewEmployees':
        return <ViewEmployees />;
      case 'assignTask':
        return <AssignTask />;
      case 'hrPolicy':
        return <HrPolicy />;
      case 'taskManagement':
        return <TaskManagement employeeId={user.id} />;
      case 'changePassword':
        return <ChangePassword />;  // ✅ Case added
      default:
        return <HrHome user={user} />;
    }
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

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('addEmployee')}>
          Add Employee
        </button>

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('viewEmployees')}>
          View Employees
        </button>

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('hrPolicy')}>
          HR Policy
        </button>

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('assignTask')}>
          Assign Task
        </button>

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('taskManagement')}>
          Manage My Tasks
        </button>

        <button
          className="btn btn-light mt-2"
          onClick={() => navigate('/employee/granted-permissions')}
        >
          Granted Permissions
        </button>

        <button
          className="btn btn-light mt-2"
          onClick={() => setActiveComponent('changePassword')}
        >
          Change Password
        </button>

        <button className="btn btn-danger mt-3" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft: '220px', width: 'calc(100% - 220px)', overflowY: 'auto' }}
      >
        {renderContent()}
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

export default HrDashboard;
