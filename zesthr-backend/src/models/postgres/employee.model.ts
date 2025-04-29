// src/models/postgres/employee.model.ts
import { Pool } from 'pg';
import pool from '../../config/postgres';

interface Employee {
  id?: number;
  employee_id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  gender?: string;
  national_id?: string;
  marital_status?: string;
  joined_date: Date;
  employment_status: string;
  emergency_contact?: any;
  contact_details?: any;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

interface EmployeePosition {
  id?: number;
  employee_id: number;
  position_id: number;
  department_id: number;
  location_id?: number;
  reporting_manager_id?: number;
  effective_from: Date;
  effective_to?: Date;
  is_primary: boolean;
  employment_type: string;
  created_at?: Date;
  updated_at?: Date;
}

class EmployeeModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async create(employee: Employee): Promise<Employee> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const employeeResult = await client.query(
        `INSERT INTO employee.employees(
          employee_id, user_id, first_name, last_name, date_of_birth, gender,
          national_id, marital_status, joined_date, employment_status,
          emergency_contact, contact_details, created_by
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *`,
        [
          employee.employee_id,
          employee.user_id,
          employee.first_name,
          employee.last_name,
          employee.date_of_birth,
          employee.gender,
          employee.national_id,
          employee.marital_status,
          employee.joined_date,
          employee.employment_status,
          JSON.stringify(employee.emergency_contact || {}),
          JSON.stringify(employee.contact_details || {}),
          employee.created_by
        ]
      );
      
      await client.query('COMMIT');
      return employeeResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Employee | null> {
    const result = await this.pool.query(
      'SELECT * FROM employee.employees WHERE id = $1',
      [id]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee | null> {
    const result = await this.pool.query(
      'SELECT * FROM employee.employees WHERE employee_id = $1',
      [employeeId]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  async update(id: number, employee: Partial<Employee>): Promise<Employee | null> {
    // Generate dynamic update query based on provided fields
    const keys = Object.keys(employee).filter(key => key !== 'id' && key !== 'created_at');
    
    if (keys.length === 0) return null;
    
    const values = keys.map(key => employee[key as keyof Employee]);
    
    // Add updated_at and id to values
    values.push(new Date());
    values.push(id);
    
    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    const updateQuery = `
      UPDATE employee.employees
      SET ${setClauses.join(', ')}, updated_at = $${keys.length + 1}
      WHERE id = $${keys.length + 2}
      RETURNING *
    `;
    
    const result = await this.pool.query(updateQuery, values);
    return result.rows.length ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM employee.employees WHERE id = $1',
      [id]
    );
    
    return result.rowCount > 0;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: Employee[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Build WHERE clause based on filters
    const whereConditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle different filter types appropriately
        if (key === 'employment_status' && value) {
          whereConditions.push(`employment_status = $${paramIndex++}`);
          values.push(value);
        } else if (key === 'department_id' && value) {
          whereConditions.push(`id IN (
            SELECT employee_id FROM employee.employee_positions 
            WHERE department_id = $${paramIndex++} AND is_primary = true
          )`);
          values.push(value);
        } else if (key === 'search' && value) {
          whereConditions.push(`(
            first_name ILIKE $${paramIndex} OR 
            last_name ILIKE $${paramIndex} OR
            employee_id ILIKE $${paramIndex}
          )`);
          values.push(`%${value}%`);
          paramIndex++;
        }
      }
    });
    
    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM employee.employees
      ${whereClause}
    `;
    
    const countResult = await this.pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated results
    const dataQuery = `
      SELECT *
      FROM employee.employees
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const dataResult = await this.pool.query(
      dataQuery,
      [...values, limit, offset]
    );
    
    return {
      data: dataResult.rows,
      total
    };
  }

  // Position-related methods
  async addPosition(position: EmployeePosition): Promise<EmployeePosition> {
    const result = await this.pool.query(
      `INSERT INTO employee.employee_positions(
        employee_id, position_id, department_id, location_id,
        reporting_manager_id, effective_from, effective_to,
        is_primary, employment_type
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        position.employee_id,
        position.position_id,
        position.department_id,
        position.location_id,
        position.reporting_manager_id,
        position.effective_from,
        position.effective_to,
        position.is_primary,
        position.employment_type
      ]
    );
    
    return result.rows[0];
  }

  async getEmployeePositions(employeeId: number): Promise<EmployeePosition[]> {
    const result = await this.pool.query(
      `SELECT ep.*, p.title as position_title, d.name as department_name
       FROM employee.employee_positions ep
       JOIN org.positions p ON ep.position_id = p.id
       JOIN org.departments d ON ep.department_id = d.id
       WHERE ep.employee_id = $1
       ORDER BY ep.is_primary DESC, ep.effective_from DESC`,
      [employeeId]
    );
    
    return result.rows;
  }

  async getEmployeeWithDetails(id: number): Promise<any> {
    const query = `
      SELECT 
        e.*,
        p.title as position,
        d.name as department,
        l.name as location,
        m.first_name || ' ' || m.last_name as manager_name
      FROM 
        employee.employees e
      LEFT JOIN 
        employee.employee_positions ep ON e.id = ep.employee_id AND ep.is_primary = true
      LEFT JOIN 
        org.positions p ON ep.position_id = p.id
      LEFT JOIN 
        org.departments d ON ep.department_id = d.id
      LEFT JOIN 
        org.locations l ON ep.location_id = l.id
      LEFT JOIN 
        employee.employees m ON ep.reporting_manager_id = m.id
      WHERE 
        e.id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows.length ? result.rows[0] : null;
  }
}

export default new EmployeeModel();
export { Employee, EmployeePosition };

// src/models/mongo/employee.document.model.ts
import mongoose, { Document, Schema } from 'mongoose';

interface EmployeeDocument extends Document {
  employeeId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  expiryDate?: Date;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  metadata?: Record<string, any>;
}

const employeeDocumentSchema = new Schema<EmployeeDocument>({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  documentType: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create indexes for common queries
employeeDocumentSchema.index({ employeeId: 1, documentType: 1 });
employeeDocumentSchema.index({ uploadedAt: -1 });
employeeDocumentSchema.index({ expiryDate: 1 }, { sparse: true });

const EmployeeDocumentModel = mongoose.model<EmployeeDocument>(
  'EmployeeDocument',
  employeeDocumentSchema
);

export default EmployeeDocumentModel;
export { EmployeeDocument };