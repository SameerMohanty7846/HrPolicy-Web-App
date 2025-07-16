import express from "express";
import { 
    login, 
     
    registerEmployee, 
    registerAdmin 
} from "../controller/authentication.controller.js";

const router = express.Router();

// Authentication routes
router.post('/login', login);

// Registration routes
router.post('/register/employee', registerEmployee);
router.post('/register/admin', registerAdmin);

export default router;
