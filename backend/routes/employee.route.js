import express from "express";

import {login,registerAdmin,registerHR} from "../controller/authentication.controller.js";

import {registerEmployee,getAllEmployees,deleteEmployee,getEmployeeIncrements,getSalaryReport,assignTaskToEmployees,getEmployeeWithPermission,updateEmployeePermission,getGrantedPermissions} from "../controller/hrpolicy.controller.js";


const router = express.Router();

// Authentication routes
router.post('/login', login);

// Registration routes==>These are for testing
router.post('/register/admin', registerAdmin);
router.post('/register/hr', registerHR);

//functionality routes
router.post('/hr/insertemployee', registerEmployee);
router.get('/hr/getallemployees', getAllEmployees);
router.delete('/hr/employees/:id',deleteEmployee)
router.get('/hr/employee-increments',getEmployeeIncrements)
router.get('/hr/salary-report',getSalaryReport)
router.post('/hr/assigntasks',assignTaskToEmployees)
//related to permission
router.get('/employee/:id/permission', getEmployeeWithPermission);
router.put('/employee/:id/permission', updateEmployeePermission);
router.get('/employee/:id/granted-permissions', getGrantedPermissions);



export default router;
