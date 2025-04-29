// src/controllers/employee.controller.ts
import { Request, Response } from 'express';
import EmployeeModel, { Employee } from '../models/postgres/employee.model';
import EmployeeDocumentModel from '../models/mongo/employee.document.model';
import { createReadStream } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || ''
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/uploads/'); // Temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common document types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed.'));
    }
  }
});

class EmployeeController {
  /**
   * Get all employees with pagination and filtering
   */
  async getAllEmployees(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Extract filters from query params
      const filters: Record<string, any> = {};
      
      if (req.query.status) {
        filters.employment_status = req.query.status;
      }
      
      if (req.query.department) {
        filters.department_id = req.query.department;
      }
      
      if (req.query.search) {
        filters.search = req.query.search;
      }
      
      const { data, total } = await EmployeeModel.findAll(page, limit, filters);
      
      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get employee by ID
   */
  async getEmployeeById(req: Request, res: Response) {
    try {
      const employeeId = parseInt(req.params.id);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employee ID'
        });
      }
      
      const employee = await EmployeeModel.getEmployeeWithDetails(employeeId);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      // Get employee positions
      const positions = await EmployeeModel.getEmployeePositions(employeeId);
      
      // Get employee documents from MongoDB
      const documents = await EmployeeDocumentModel.find({ 
        employeeId: employee.employee_id 
      }).sort({ uploadedAt: -1 });
      
      res.status(200).json({
        success: true,
        data: {
          ...employee,
          positions,
          documents: documents.map(doc => ({
            id: doc._id,
            documentType: doc.documentType,
            fileName: doc.fileName,
            uploadedAt: doc.uploadedAt,
            expiryDate: doc.expiryDate,
            isVerified: doc.isVerified
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Create a new employee
   */
  async createEmployee(req: Request, res: Response) {
    try {
      const employeeData: Employee = req.body;
      
      // Set creator
      employeeData.created_by = req.user?.userId;
      
      // Generate employee ID if not provided
      if (!employeeData.employee_id) {
        // Format: EMP-YYYYMMDD-XXX
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        employeeData.employee_id = `EMP-${dateStr}-${randomId}`;
      }
      
      const newEmployee = await EmployeeModel.create(employeeData);
      
      res.status(201).json({
        success: true,
        data: newEmployee,
        message: 'Employee created successfully'
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create employee',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Update an employee
   */
  async updateEmployee(req: Request, res: Response) {
    try {
      const employeeId = parseInt(req.params.id);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employee ID'
        });
      }
      
      const employeeData: Partial<Employee> = req.body;
      
      // Set updater
      employeeData.updated_by = req.user?.userId;
      
      const updatedEmployee = await EmployeeModel.update(employeeId, employeeData);
      
      if (!updatedEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: updatedEmployee,
        message: 'Employee updated successfully'
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update employee',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Delete an employee
   */
  async deleteEmployee(req: Request, res: Response) {
    try {
      const employeeId = parseInt(req.params.id);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employee ID'
        });
      }
      
      const result = await EmployeeModel.delete(employeeId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete employee',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Add a position to an employee
   */
  async addEmployeePosition(req: Request, res: Response) {
    try {
      const employeeId = parseInt(req.params.id);
      
      if (isNaN(employeeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employee ID'
        });
      }
      
      const positionData = req.body;
      positionData.employee_id = employeeId;
      
      // If is_primary is true, update existing primary positions
      if (positionData.is_primary) {
        // Get existing positions
        const positions = await EmployeeModel.getEmployeePositions(employeeId);
        
        // If there's an existing primary position, update it
        const primaryPosition = positions.find(p => p.is_primary);
        
        if (primaryPosition) {
          await EmployeeModel.update(primaryPosition.id, { is_primary: false });
        }
      }
      
      const newPosition = await EmployeeModel.addPosition(positionData);
      
      res.status(201).json({
        success: true,
        data: newPosition,
        message: 'Position added successfully'
      });
    } catch (error) {
      console.error('Error adding employee position:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add position',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Upload a document for an employee
   */
  async uploadEmployeeDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const employeeId = req.params.id;
      const { documentType, expiryDate } = req.body;
      
      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: 'Document type is required'
        });
      }
      
      // Upload file to S3
      const fileContent = createReadStream(req.file.path);
      const fileKey = `employees/${employeeId}/documents/${uuidv4()}${path.extname(req.file.originalname)}`;
      
      const uploadParams = {
        Bucket: process.env.STORAGE_BUCKET || 'zesthr-files',
        Key: fileKey,
        Body: fileContent,
        ContentType: req.file.mimetype
      };
      
      const s3Command = new PutObjectCommand(uploadParams);
      await s3Client.send(s3Command);
      
      // Create document record in MongoDB
      const documentData = {
        employeeId,
        documentType,
        fileName: req.file.originalname,
        filePath: fileKey,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user?.userId,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        isVerified: false
      };
      
      const document = await EmployeeDocumentModel.create(documentData);
      
      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get an employee document
   */
  async getEmployeeDocument(req: Request, res: Response) {
    try {
      const documentId = req.params.documentId;
      
      const document = await EmployeeDocumentModel.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // Generate pre-signed URL for document access
      // This would typically use S3's getSignedUrl method
      const documentUrl = `https://${process.env.STORAGE_BUCKET}.s3.${process.env.STORAGE_REGION}.amazonaws.com/${document.filePath}`;
      
      res.status(200).json({
        success: true,
        data: {
          ...document.toObject(),
          url: documentUrl
        }
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch document',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Verify an employee document
   */
  async verifyEmployeeDocument(req: Request, res: Response) {
    try {
      const documentId = req.params.documentId;
      
      const document = await EmployeeDocumentModel.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // Update verification status
      document.isVerified = true;
      document.verifiedBy = req.user?.userId;
      document.verifiedAt = new Date();
      
      await document.save();
      
      res.status(200).json({
        success: true,
        message: 'Document verified successfully'
      });
    } catch (error) {
      console.error('Error verifying document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify document',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new EmployeeController();