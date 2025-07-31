import express from "express";

// 🔐 AUTHENTICATION CONTROLLER (OTP-based Forgot Password)
import {
  login,
  registerAdmin,
  requestOtp,
  verifyOtp,
  changePasswordWithOtp,
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
  finishTask,
} from "../controller/hrpolicy.controller.js";

// 📊 ANALYTICS CONTROLLER
import {
  getDailyRatings,
  getMonthlyRatings,
  getDailyEmployeeRatings,
  getMonthlyEmployeeRatings,
  getWeeklyEmployeeRatings,
  getYearlyEmployeeRatings,
} from "../controller/analytics.controller.js";

// 📝 LEAVE POLICY CONTROLLERS
import {
  addLeavePolicy,
getLeaveTypeNames,  deleteLeavePolicy,getAllLeavePolicies
} from "../controller/hr.leave.policy.controller.js";

import {
  getAllLeaveApplications,
  getLeaveSummaryByEmployee,
  submitLeaveApplication,
  updateLeaveStatus,
  getLeaveApplicationsByEmployeeId,
  getLeaveApplicationById // Add this import
} from "../controller/leave.controller.js";
const router = express.Router();

// ========================= 🔐 AUTH ROUTES =========================
router.post("/login", login);
router.post("/register/admin", registerAdmin);
router.post("/auth/request-otp", requestOtp);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/change-password-with-otp", changePasswordWithOtp);

// ========================= 👔 HR ROUTES =========================
router.post("/auth/change-password", changePassword);
router.post("/hr/insertemployee", registerEmployee);
router.post("/hr/inserthr", registerHR);
router.get("/hr/getallemployees", getAllEmployees);
router.delete("/hr/employees/:id", deleteEmployee);
router.get("/hr/employee-increments", getEmployeeIncrements);
router.get("/hr/salary-report", getSalaryReport);
router.post("/hr/assigntasks", assignTaskToEmployees);

// ================= EMPLOYEE PERMISSIONS =================
router.get("/employee/:id/permission", getEmployeeWithPermission);
router.put("/employee/:id/permission", updateEmployeePermission);
router.get("/employee/:id/granted-permissions", getGrantedPermissions);

// ================= TASK MANAGEMENT =================
router.get("/tasks/:employeeId", getAllTasksByEmployee);
router.post("/tasks/start", startTask);
router.post("/tasks/pause", pauseTask);
router.post("/tasks/resume", resumeTask);
router.post("/tasks/finish", finishTask);

// ================= 📊 ANALYTICS =================
// → Base Ratings
router.get("/ratings/daily/:employeeId", getDailyRatings);
router.get("/ratings/monthly/:employeeId", getMonthlyRatings);

// → Ratings with Employee Names
router.get("/ratings/daily-employee/:employeeId", getDailyEmployeeRatings);
router.get("/ratings/monthly-employee/:employeeId", getMonthlyEmployeeRatings);

// → Admin Dashboard: Weekly & Yearly
router.get("/analytics/weekly-employee-ratings", getWeeklyEmployeeRatings);
router.get("/analytics/yearly-employee-ratings", getYearlyEmployeeRatings);

// ================= 📝 LEAVES =================
// Leave application submission
router.post("/leave/apply", submitLeaveApplication);

// Get all leave applications
router.get("/leave/applications", getAllLeaveApplications);

// Update leave status (approve/reject)
router.patch("/leave/applications/:application_id/status", updateLeaveStatus);
router.get("/employee/leave-summary/:employee_id", getLeaveSummaryByEmployee);
router.get('/employee/leave-applications/:employee_id', getLeaveApplicationsByEmployeeId);
router.get("/leave/applications/:applicationId", getLeaveApplicationById);
// ================= 🛡️ HR LEAVE POLICY =================
// 🛡️ HR LEAVE POLICY ROUTES
router.post("/hr-leave-policy", addLeavePolicy);             // Add new policy
router.get("/hr-leave-policy", getAllLeavePolicies);         // ✅ Fetch all policies
router.get("/leave/type-names", getLeaveTypeNames);          // Get type names only (for dropdowns)
router.delete("/hr-leave-policy/:id", deleteLeavePolicy);    // Delete by ID


export default router;
