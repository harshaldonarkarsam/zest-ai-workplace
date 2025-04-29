import { Router } from 'express';
import EmployeeController, { upload } from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all employees (accessible by HR, Managers, Admins)
router.get(
  '/',
  authorize(['HR_ADMIN', 'HR_SPECIALIST', 'MANAGER', 'EXECUTIVE']),
  EmployeeController.getAllEmployees
);

// Get employee by ID (accessible by HR, the employee's manager, or the employee themselves)
router.get(
  '/:id',
  authorize(['HR_ADMIN', 'HR_SPECIALIST', 'MANAGER', 'EMPLOYEE', 'EXECUTIVE']),
  EmployeeController.getEmployeeById
);

// Create a new employee (accessible by HR Admins)
router.post(
  '/',
  authorize(['HR_ADMIN']),
  EmployeeController.createEmployee
);

// Update an employee (accessible by HR Admins)
router.put(
  '/:id',
  authorize(['HR_ADMIN']),
  EmployeeController.updateEmployee
);

// Delete an employee (accessible by HR Admins)
router.delete(
  '/:id',
  authorize(['HR_ADMIN']),
  EmployeeController.deleteEmployee
);

// Add a position to an employee (accessible by HR Admins)
router.post(
  '/:id/positions',
  authorize(['HR_ADMIN']),
  EmployeeController.addEmployeePosition
);

// Upload a document for an employee (accessible by HR or the employee)
router.post(
  '/:id/documents',
  authorize(['HR_ADMIN', 'HR_SPECIALIST', 'EMPLOYEE']),
  upload.single('document'),
  EmployeeController.uploadEmployeeDocument
);

// Get an employee document (accessible by HR or the employee)
router.get(
  '/:id/documents/:documentId',
  authorize(['HR_ADMIN', 'HR_SPECIALIST', 'EMPLOYEE']),
  EmployeeController.getEmployeeDocument
);

// Verify an employee document (accessible by HR Admins)
router.post(
  '/:id/documents/:documentId/verify',
  authorize(['HR_ADMIN']),
  EmployeeController.verifyEmployeeDocument
);

export default router;