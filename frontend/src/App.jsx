import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HrDashboard from './pages/HrDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionComponent from './pages/PermissionComponent';
import AddEmployee from './pages/AddEmployee';
import ViewEmployees from './pages/ViewEmployees';
import HrPolicy from './pages/HrPolicy';
import AssignTask from './pages/AssignTask';
import EmployeeGrantedPermission from './pages/EmployeeGrantedPermission';
import EmployeeRead from './pages/EmployeeRead';
import EmployeeAdd from './pages/EmployeeAdd';
import EmployeeEdit from './pages/EmployeeEdit';
import EmployeeDelete from './pages/EmployeeDelete';
import LeaveApplicationDetail from './pages/LeaveApplicationDetail';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute allowedRole="admin" Component={AdminDashboard} />}
        />

        <Route
          path="/employee/dashboard"
          element={<ProtectedRoute allowedRole="employee" Component={EmployeeDashboard} />}
        />

        <Route
          path="/hr/dashboard"
          element={<ProtectedRoute allowedRole="hr" Component={HrDashboard} />}
        />

        {/* Changed to hyphen-separated path as requested */}
        <Route path="/leave-application-detail/:id" element={<LeaveApplicationDetail />} />

        <Route path="/admin/permission/:id" element={<PermissionComponent />} />
        <Route path="/employee/granted-permissions" element={<EmployeeGrantedPermission />} />
        <Route path="/employee/read" element={<EmployeeRead />} />
        <Route path="/employee/add" element={<EmployeeAdd />} />
        <Route path="/employee/edit" element={<EmployeeEdit />} />
        <Route path="/employee/delete" element={<EmployeeDelete />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;