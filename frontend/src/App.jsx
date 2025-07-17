import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HrDashboard from './pages/HrDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionComponent from './pages/PermissionComponent'
import AddEmployee from './pages/AddEmployee'
import ViewEmployees from './pages/ViewEmployees';
import HrPolicy from './pages/HrPolicy';
import AssignTask from './pages/AssignTask';
import EmployeeGrantedPermission from './pages/EmployeeGrantedPermission';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin" Component={AdminDashboard} />
          }
        />

        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRole="employee" Component={EmployeeDashboard} />
          }
        />

        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRole="hr" Component={HrDashboard} />
          }
        />
        <Route path="/admin/permission/:id" element={<PermissionComponent />} />
        <Route
          path="/employee/granted-permissions"
          element={<EmployeeGrantedPermission />}
        />


      </Routes>

    </BrowserRouter>
  );
};

export default App;
