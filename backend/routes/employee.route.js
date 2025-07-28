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
  changePassword,
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

// 📊 ANALYTICS CONTROLLER
import {
  getDailyRatings,
  getMonthlyRatings,
  getDailyEmployeeRatings,
  getMonthlyEmployeeRatings,
  getWeeklyEmployeeRatings,     // ✅ NEW Weekly (Mon–Sat) Ratings for all employees
  getYearlyEmployeeRatings      // ✅ NEW Yearly (Monthly) Ratings for all employees
} from "../controller/analytics.controller.js";
import { submitLeaveApplication } from "../controller/Leave.Controller.js";
//Leave Controller





const router = express.Router();


// === AUTH ROUTES ===
router.post('/login', login);
router.post('/register/admin', registerAdmin);

router.post('/auth/request-otp', requestOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/change-password-with-otp', changePasswordWithOtp);


// === HR ROUTES ===
router.post('/auth/change-password', changePassword);
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


// === ANALYTICS (Base Ratings Only) ===
router.get('/ratings/daily/:employeeId', getDailyRatings);
router.get('/ratings/monthly/:employeeId', getMonthlyRatings);


// === ANALYTICS (Employee Name + Floored Rating) ===
router.get('/ratings/daily-employee/:employeeId', getDailyEmployeeRatings);
router.get('/ratings/monthly-employee/:employeeId', getMonthlyEmployeeRatings);


// === ANALYTICS (Admin Dashboard) ===
router.get('/analytics/weekly-employee-ratings', getWeeklyEmployeeRatings);   // ✅ Admin Weekly
router.get('/analytics/yearly-employee-ratings', getYearlyEmployeeRatings);   // ✅ Admin Yearly


//Leaves
router.post('/leave/apply', submitLeaveApplication);


export default router;
