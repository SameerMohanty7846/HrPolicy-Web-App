import express from "express";

// 🔐 AUTHENTICATION CONTROLLER (OTP-based Forgot Password)
import {
    login,
    registerAdmin,
    requestOtp,
    verifyOtp,
    changePasswordWithOtp
} from "../controller/authentication.controller.js";

// 👔 HR CONTROLLER (Normal Password Change and HR Operations)
import {
    changePassword, // ✅ Normal change password (old + new password)
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

// === AUTH ROUTES ===
router.post('/login', login);
router.post('/register/admin', registerAdmin);

router.post('/auth/request-otp', requestOtp);                           // Step 1: Request OTP
router.post('/auth/verify-otp', verifyOtp);                             // Step 2: Verify OTP
router.post('/auth/change-password-with-otp', changePasswordWithOtp);  // Step 3: Set New Password (Forgot)

// === HR ROUTES ===
router.post('/auth/change-password', changePassword); // ✅ Normal Change Password

router.post('/hr/insertemployee', registerEmployee);
router.post('/hr/inserthr', registerHR);

router.get('/hr/getallemployees', getAllEmployees);
router.delete('/hr/employees/:id', deleteEmployee);
router.get('/hr/employee-increments', getEmployeeIncrements);
router.get('/hr/salary-report', getSalaryReport);
router.post('/hr/assigntasks', assignTaskToEmployees);

// === EMPLOYEE PERMISSIONS ===
router.get('/employee/:id/permission', getEmployeeWithPermission);
router.put('/employee/:id/permission', updateEmployeePermission);
router.get('/employee/:id/granted-permissions', getGrantedPermissions);

// === TASK MANAGEMENT ===
router.get('/tasks/:employeeId', getAllTasksByEmployee);
router.post('/tasks/start', startTask);
router.post('/tasks/pause', pauseTask);
router.post('/tasks/resume', resumeTask);
router.post('/tasks/finish', finishTask);

export default router;
