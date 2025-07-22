import express from "express";
import { 
    login, 
    registerAdmin 
} from "../controller/authentication.controller.js";

import { 
    registerEmployee, 
    getAllEmployees, 
    deleteEmployee, 
    getEmployeeIncrements, 
    getSalaryReport, 
    assignTaskToEmployees, 
    getEmployeeWithPermission, 
    updateEmployeePermission, 
    getGrantedPermissions,
    registerHR,
    getAllTasksByEmployee,
    startTask,
    pauseTask,
    resumeTask,
    finishTask,
    changePassword   // ✅ Import Change Password controller
} from "../controller/hrpolicy.controller.js";

const router = express.Router();

// === AUTHENTICATION ROUTES ===
router.post('/login', login);
router.post('/register/admin', registerAdmin);

// === HR MANAGEMENT ROUTES ===
router.post('/hr/insertemployee', registerEmployee);
router.post('/hr/inserthr', registerHR);

router.get('/hr/getallemployees', getAllEmployees);
router.delete('/hr/employees/:id', deleteEmployee);
router.get('/hr/employee-increments', getEmployeeIncrements);
router.get('/hr/salary-report', getSalaryReport);
router.post('/hr/assigntasks', assignTaskToEmployees);

// === EMPLOYEE PERMISSION ROUTES ===
router.get('/employee/:id/permission', getEmployeeWithPermission);
router.put('/employee/:id/permission', updateEmployeePermission);
router.get('/employee/:id/granted-permissions', getGrantedPermissions);

// === TASK MANAGEMENT ROUTES ===
router.get('/tasks/:employeeId', getAllTasksByEmployee);
router.post('/tasks/start', startTask);
router.post('/tasks/pause', pauseTask);
router.post('/tasks/resume', resumeTask);
router.post('/tasks/finish', finishTask);

// === ACCOUNT MANAGEMENT ROUTES ===
router.post('/hr/change-password', changePassword);

export default router;
