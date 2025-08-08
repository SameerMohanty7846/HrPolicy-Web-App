import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import AddEmployee from './AddEmployee';
import AddHr from './AddHr';
import ViewEmployees from './ViewEmployees';
import EmployeePermissionList from './EmployeePermissionList';
import ChangePassword from './ChangePassword';
import HrLeavePolicy from './HrLeavePolicy';
import EmployeeCurrentMonthSalary from './EmployeeCurrentMonthSalary';
import EmployeeAttendanceReport from './EmployeeAttendanceReport';
import EmployeeMonthlySalaryReport from './EmployeeMonthlySalaryReport';
import SalaryPolicyForm from './SalaryPolicyForm';
import EmployeePayroll from './EmployeePayroll'; // ✅ New

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('home');
  const [weeklyData, setWeeklyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    axios.get('http://localhost:2000/api/analytics/weekly-employee-ratings')
      .then(response => {
        const result = response.data;
        setWeeklyData(Array.isArray(result) ? result : []);
      })
      .catch(error => {
        console.error('Error fetching weekly ratings:', error);
      });

    axios.get('http://localhost:2000/api/analytics/yearly-employee-ratings')
      .then(response => {
        const result = response.data;
        setYearlyData(Array.isArray(result) ? result : []);
      })
      .catch(error => {
        console.error('Error fetching yearly ratings:', error);
      });
  }, []);

  const getUniqueEmployeeNames = (data) => {
    if (!Array.isArray(data)) return [];
    const names = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'day' && key !== 'month') names.add(key);
      });
    });
    return Array.from(names);
  };

  const prepareChartData = (data, key, baseKeys) => {
    const chartData = baseKeys.map(k => ({ [key]: k }));
    const employees = getUniqueEmployeeNames(data);
    chartData.forEach(entry => {
      const match = data.find(item => item[key] === entry[key]);
      if (match) {
        employees.forEach(emp => {
          entry[emp] = match[emp] ?? 0;
        });
      } else {
        employees.forEach(emp => {
          entry[emp] = 0;
        });
      }
    });
    return chartData;
  };

  const weeklyChartData = prepareChartData(weeklyData, 'day', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const yearlyChartData = prepareChartData(yearlyData, 'month', [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]);

  const weeklyEmployees = getUniqueEmployeeNames(weeklyData);
  const yearlyEmployees = getUniqueEmployeeNames(yearlyData);

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
      case 'leavePolicy':
        return <HrLeavePolicy />;
      case 'attendanceReport':
        return <EmployeeAttendanceReport />;
      case 'monthlySalaryReport':
        return <EmployeeMonthlySalaryReport />;
      case 'salaryPolicy':
        return <SalaryPolicyForm />;
      case 'employeePayroll':
        return <EmployeePayroll />; // ✅ Added
      default:
        return (
          <div className="px-3">
            <div className="welcome-card mb-4 p-4 rounded shadow text-white">
              <h2 className="fw-bold mb-2">👋 Welcome back, {user?.name}</h2>
              <p className="mb-0">Logged in as <strong>{user?.role}</strong></p>
            </div>

            <h2>📊 Weekly Ratings Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={weeklyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#444" />
                <XAxis dataKey="day" tick={{ fill: '#fff', fontSize: 14 }} />
                <YAxis domain={[0, 5]} tick={{ fill: '#fff', fontSize: 14 }} />
                <Tooltip wrapperStyle={{ backgroundColor: '#222', border: '1px solid #555' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                {weeklyEmployees.map((emp, idx) => (
                  <Bar
                    key={emp}
                    dataKey={emp}
                    fill={`hsl(${(idx * 47) % 360}, 65%, 55%)`}
                    radius={[10, 10, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>

            <h2 style={{ marginTop: '4rem' }}>📈 Yearly Ratings Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={yearlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#444" />
                <XAxis dataKey="month" tick={{ fill: '#fff', fontSize: 14 }} />
                <YAxis domain={[0, 5]} tick={{ fill: '#fff', fontSize: 14 }} />
                <Tooltip wrapperStyle={{ backgroundColor: '#222', border: '1px solid #555' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                {yearlyEmployees.map((emp, idx) => (
                  <Bar
                    key={emp}
                    dataKey={emp}
                    fill={`hsl(${(idx * 47) % 360}, 65%, 55%)`}
                    radius={[10, 10, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
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
        <button className="sidebar-btn" onClick={() => setActiveComponent('leavePolicy')}>📋 HR Leave Policy</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('attendanceReport')}>📝 Attendance Report</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('monthlySalaryReport')}>💰 Monthly Salary Report</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('salaryPolicy')}>📑 Salary Policy</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('employeePayroll')}>📤 Payroll</button> {/* ✅ New Button */}

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
