// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/postgres';
import { Pool } from 'pg';

interface User {
  id: number;
  email: string;
  username?: string;
  password_hash: string;
  is_active: boolean;
  status: string;
}

interface TokenPayload {
  userId: number;
  email: string;
  roles: string[];
  exp?: number;
}

class AuthService {
  private pool: Pool;
  private jwtSecret: string;
  private jwtExpiration: string;

  constructor() {
    this.pool = pool;
    this.jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '30d';
  }

  /**
   * Login a user with email and password
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // Find user by email
    const userResult = await this.pool.query(
      `SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.status
       FROM auth.users u
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user: User = userResult.rows[0];

    // Check if user is active
    if (!user.is_active || user.status !== 'ACTIVE') {
      throw new Error('Account is inactive or suspended');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Get user roles
    const rolesResult = await this.pool.query(
      `SELECT r.name 
       FROM auth.roles r
       JOIN auth.user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    const roles = rolesResult.rows.map(row => row.name);

    // Update last login timestamp
    await this.pool.query(
      `UPDATE auth.users
       SET last_login = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    // Generate JWT token
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration
    });

    // Get the matching employee record if it exists
    const employeeResult = await this.pool.query(
      `SELECT e.id, e.employee_id, e.first_name, e.last_name, e.employment_status,
              p.title as position, d.name as department
       FROM employee.employees e
       LEFT JOIN employee.employee_positions ep ON e.id = ep.employee_id AND ep.is_primary = true
       LEFT JOIN org.positions p ON ep.position_id = p.id
       LEFT JOIN org.departments d ON ep.department_id = d.id
       WHERE e.user_id = $1`,
      [user.id]
    );

    const employeeInfo = employeeResult.rows.length > 0 ? employeeResult.rows[0] : null;

    // Return user data without sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles,
      employee: employeeInfo
    };

    return {
      token,
      user: userData
    };
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string;
  }): Promise<any> {
    const { email, password, firstName, lastName, username } = userData;

    // Check if email already exists
    const existingUser = await this.pool.query(
      'SELECT id FROM auth.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email already in use');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Start transaction
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create user
      const userResult = await client.query(
        `INSERT INTO auth.users(email, username, password_hash)
         VALUES($1, $2, $3)
         RETURNING id`,
        [email, username || email, passwordHash]
      );

      const userId = userResult.rows[0].id;

      // Assign default role (EMPLOYEE)
      const roleResult = await client.query(
        'SELECT id FROM auth.roles WHERE name = $1',
        ['EMPLOYEE']
      );

      if (roleResult.rows.length > 0) {
        const roleId = roleResult.rows[0].id;
        await client.query(
          `INSERT INTO auth.user_roles(user_id, role_id)
           VALUES($1, $2)`,
          [userId, roleId]
        );
      }

      // Create employee record
      const employeeId = `EMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      await client.query(
        `INSERT INTO employee.employees(
          employee_id, user_id, first_name, last_name, 
          joined_date, employment_status, created_by
        )
        VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [
          employeeId,
          userId,
          firstName,
          lastName,
          new Date(),
          'ONBOARDING',
          userId
        ]
      );

      await client.query('COMMIT');

      // Get the created user
      const userData = await this.getUserData(userId);
      
      return userData;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user data by ID
   */
  async getUserData(userId: number): Promise<any> {
    // Get user info
    const userResult = await this.pool.query(
      `SELECT u.id, u.email, u.username, u.is_active, u.status
       FROM auth.users u
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Get user roles
    const rolesResult = await this.pool.query(
      `SELECT r.name 
       FROM auth.roles r
       JOIN auth.user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );

    const roles = rolesResult.rows.map(row => row.name);

    // Get the matching employee record if it exists
    const employeeResult = await this.pool.query(
      `SELECT e.id, e.employee_id, e.first_name, e.last_name, e.employment_status,
              p.title as position, d.name as department
       FROM employee.employees e
       LEFT JOIN employee.employee_positions ep ON e.id = ep.employee_id AND ep.is_primary = true
       LEFT JOIN org.positions p ON ep.position_id = p.id
       LEFT JOIN org.departments d ON ep.department_id = d.id
       WHERE e.user_id = $1`,
      [userId]
    );

    const employeeInfo = employeeResult.rows.length > 0 ? employeeResult.rows[0] : null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      is_active: user.is_active,
      status: user.status,
      roles,
      employee: employeeInfo
    };
  }

  /**
   * Validate a JWT token
   */
  validateToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    // Get current user
    const userResult = await this.pool.query(
      'SELECT password_hash FROM auth.users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.pool.query(
      `UPDATE auth.users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newPasswordHash, userId]
    );

    return true;
  }

  /**
   * Reset user password (admin function)
   */
  async resetPassword(userId: number, newPassword: string): Promise<boolean> {
    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const result = await this.pool.query(
      `UPDATE auth.users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newPasswordHash, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('User not found');
    }

    return true;
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: number, roleNames: string[]): Promise<string[]> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing roles
      await client.query(
        'DELETE FROM auth.user_roles WHERE user_id = $1',
        [userId]
      );

      // Get role IDs
      const roleIdsResult = await client.query(
        'SELECT id, name FROM auth.roles WHERE name = ANY($1)',
        [roleNames]
      );

      const roleIds = roleIdsResult.rows;
      const validRoles: string[] = [];

      // Assign new roles
      for (const role of roleIds) {
        await client.query(
          'INSERT INTO auth.user_roles(user_id, role_id) VALUES($1, $2)',
          [userId, role.id]
        );
        validRoles.push(role.name);
      }

      await client.query('COMMIT');
      return validRoles;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new AuthService();

// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

class AuthController {
  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  }

  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, username } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, first name, and last name are required'
        });
      }

      const userData = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        username
      });

      res.status(201).json({
        success: true,
        data: userData,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const userData = await AuthService.getUserData(req.user.userId);

      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user profile'
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        });
      }

      const result = await AuthService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password'
      });
    }
  }

  /**
   * Reset user password (admin function)
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'User ID and new password are required'
        });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        });
      }

      const result = await AuthService.resetPassword(userId, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reset password'
      });
    }
  }

  /**
   * Update user roles (admin function)
   */
  async updateUserRoles(req: Request, res: Response) {
    try {
      const { userId, roles } = req.body;

      if (!userId || !Array.isArray(roles)) {
        return res.status(400).json({
          success: false,
          message: 'User ID and roles array are required'
        });
      }

      const updatedRoles = await AuthService.updateUserRoles(userId, roles);

      res.status(200).json({
        success: true,
        data: { roles: updatedRoles },
        message: 'User roles updated successfully'
      });
    } catch (error) {
      console.error('Role update error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user roles'
      });
    }
  }
}

export default new AuthController();

// src/routes/auth.routes.ts
import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/change-password', authenticate, AuthController.changePassword);

// Admin routes
router.post(
  '/reset-password',
  authenticate,
  authorize(['SUPER_ADMIN', 'HR_ADMIN']),
  AuthController.resetPassword
);
router.post(
  '/update-roles',
  authenticate,
  authorize(['SUPER_ADMIN', 'HR_ADMIN']),
  AuthController.updateUserRoles
);

export default router;