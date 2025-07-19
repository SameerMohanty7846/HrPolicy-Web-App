import express from "express";
import { 
    login, registerAdmin 
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
    finishTask
} from "../controller/hrpolicy.controller.js";

const router = express.Router();

// Authentication
router.post('/login', login);
router.post('/register/admin', registerAdmin);

// HR Functionalities
router.post('/hr/insertemployee', registerEmployee);
router.post('/hr/inserthr', registerHR);

router.get('/hr/getallemployees', getAllEmployees);
router.delete('/hr/employees/:id', deleteEmployee);
router.get('/hr/employee-increments', getEmployeeIncrements);
router.get('/hr/salary-report', getSalaryReport);
router.post('/hr/assigntasks', assignTaskToEmployees);

// Permissions
router.get('/employee/:id/permission', getEmployeeWithPermission);
router.put('/employee/:id/permission', updateEmployeePermission);
router.get('/employee/:id/granted-permissions', getGrantedPermissions);

// Tasks APIs
router.get('/tasks/:employeeId', getAllTasksByEmployee);
router.post('/tasks/start', startTask);
router.post('/tasks/pause', pauseTask);
router.post('/tasks/resume', resumeTask);
router.post('/tasks/finish', finishTask);

export default router;
