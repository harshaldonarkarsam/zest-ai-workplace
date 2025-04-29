// src/models/postgres/recruitment.model.ts
import { Pool } from 'pg';
import pool from '../../config/postgres';

interface JobRequisition {
  id?: number;
  requisition_id: string;
  department_id: number;
  position_id: number;
  hiring_manager_id: number;
  recruiter_id?: number;
  title: string;
  description: string;
  vacancies: number;
  priority: string;
  status: string;
  target_date?: Date;
  skills_required?: any;
  qualifications?: any;
  employment_type: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

interface JobApplication {
  id?: number;
  job_requisition_id: number;
  candidate_id: number;
  status: string;
  application_date: Date;
  source: string;
  screening_results?: any;
  custom_fields?: any;
  created_at?: Date;
  updated_at?: Date;
}

interface Interview {
  id?: number;
  job_application_id: number;
  interviewer_id: number;
  schedule_time: Date;
  interview_type: string;
  status: string;
  location?: string;
  meeting_link?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface InterviewFeedback {
  id?: number;
  interview_id: number;
  rating: number;
  strengths?: string;
  weaknesses?: string;
  comments?: string;
  recommendation: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
}

interface Offer {
  id?: number;
  job_application_id: number;
  salary_offered: number;
  benefits_offered?: any;
  start_date: Date;
  expiration_date: Date;
  status: string;
  notes?: string;
  document_url?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
}

class RecruitmentModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Job Requisition methods
  async createJobRequisition(jobReq: JobRequisition): Promise<JobRequisition> {
    const result = await this.pool.query(
      `INSERT INTO recruitment.job_requisitions(
        requisition_id, department_id, position_id, hiring_manager_id, 
        recruiter_id, title, description, vacancies, priority, status, 
        target_date, skills_required, qualifications, employment_type, created_by
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *`,
      [
        jobReq.requisition_id,
        jobReq.department_id,
        jobReq.position_id,
        jobReq.hiring_manager_id,
        jobReq.recruiter_id,
        jobReq.title,
        jobReq.description,
        jobReq.vacancies,
        jobReq.priority,
        jobReq.status,
        jobReq.target_date,
        JSON.stringify(jobReq.skills_required || {}),
        JSON.stringify(jobReq.qualifications || {}),
        jobReq.employment_type,
        jobReq.created_by
      ]
    );
    
    return result.rows[0];
  }

  async findJobRequisitionById(id: number): Promise<JobRequisition | null> {
    const result = await this.pool.query(
      'SELECT * FROM recruitment.job_requisitions WHERE id = $1',
      [id]
    );
    
    return result.rows.length ? result.rows[0] : null;
  }

  async updateJobRequisition(id: number, jobReq: Partial<JobRequisition>): Promise<JobRequisition | null> {
    // Generate dynamic update query based on provided fields
    const keys = Object.keys(jobReq).filter(key => 
      key !== 'id' && key !== 'created_at' && key !== 'created_by'
    );
    
    if (keys.length === 0) return null;
    
    const values = keys.map(key => {
      const value = jobReq[key as keyof JobRequisition];
      if (key === 'skills_required' || key === 'qualifications') {
        return JSON.stringify(value || {});
      }
      return value;
    });
    
    // Add updated_at, updated_by, and id to values
    values.push(new Date());
    values.push(jobReq.updated_by);
    values.push(id);
    
    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    const updateQuery = `
      UPDATE recruitment.job_requisitions
      SET ${setClauses.join(', ')}, 
          updated_at = $${keys.length + 1},
          updated_by = $${keys.length + 2}
      WHERE id = $${keys.length + 3}
      RETURNING *
    `;
    
    const result = await this.pool.query(updateQuery, values);
    return result.rows.length ? result.rows[0] : null;
  }

  async findJobRequisitions(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: JobRequisition[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Build WHERE clause based on filters
    const whereConditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'status' && value) {
          whereConditions.push(`status = ${paramIndex++}`);
          values.push(value);
        } else if (key === 'department_id' && value) {
          whereConditions.push(`department_id = ${paramIndex++}`);
          values.push(value);
        } else if (key === 'hiring_manager_id' && value) {
          whereConditions.push(`hiring_manager_id = ${paramIndex++}`);
          values.push(value);
        } else if (key === 'priority' && value) {
          whereConditions.push(`priority = ${paramIndex++}`);
          values.push(value);
        } else if (key === 'search' && value) {
          whereConditions.push(`(
            title ILIKE ${paramIndex} OR 
            description ILIKE ${paramIndex} OR
            requisition_id ILIKE ${paramIndex}
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
      FROM recruitment.job_requisitions
      ${whereClause}
    `;
    
    const countResult = await this.pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated results
    const dataQuery = `
      SELECT jr.*, 
             d.name as department_name,
             p.title as position_title,
             CONCAT(e.first_name, ' ', e.last_name) as hiring_manager_name
      FROM recruitment.job_requisitions jr
      LEFT JOIN org.departments d ON jr.department_id = d.id
      LEFT JOIN org.positions p ON jr.position_id = p.id
      LEFT JOIN employee.employees e ON jr.hiring_manager_id = e.id
      ${whereClause}
      ORDER BY jr.updated_at DESC
      LIMIT ${paramIndex++} OFFSET ${paramIndex++}
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

  // Job Application methods
  async createJobApplication(application: JobApplication): Promise<JobApplication> {
    const result = await this.pool.query(
      `INSERT INTO recruitment.job_applications(
        job_requisition_id, candidate_id, status, application_date, 
        source, screening_results, custom_fields
      ) VALUES($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        application.job_requisition_id,
        application.candidate_id,
        application.status,
        application.application_date,
        application.source,
        JSON.stringify(application.screening_results || {}),
        JSON.stringify(application.custom_fields || {})
      ]
    );
    
    return result.rows[0];
  }

  async findApplicationsForJob(
    jobRequisitionId: number,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE ja.job_requisition_id = $1';
    const values = [jobRequisitionId];
    
    if (status) {
      whereClause += ' AND ja.status = $2';
      values.push(status);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM recruitment.job_applications ja
      ${whereClause}
    `;
    
    const countResult = await this.pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated results with candidate info
    const dataQuery = `
      SELECT 
        ja.*,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        jr.title as job_title,
        jr.requisition_id as job_requisition_code
      FROM 
        recruitment.job_applications ja
      JOIN 
        recruitment.candidates c ON ja.candidate_id = c.id
      JOIN 
        recruitment.job_requisitions jr ON ja.job_requisition_id = jr.id
      ${whereClause}
      ORDER BY 
        CASE
          WHEN ja.status = 'NEW' THEN 1
          WHEN ja.status = 'SCREENING' THEN 2
          WHEN ja.status = 'INTERVIEW' THEN 3
          WHEN ja.status = 'ASSESSMENT' THEN 4
          WHEN ja.status = 'OFFER' THEN 5
          ELSE 6
        END,
        ja.application_date DESC
      LIMIT ${values.length + 1} OFFSET ${values.length + 2}
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

  async updateApplicationStatus(id: number, status: string, data?: any): Promise<JobApplication | null> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update the application status
      const result = await client.query(
        `UPDATE recruitment.job_applications
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      // If additional data is provided, update that as well (e.g., screening results)
      if (data) {
        await client.query(
          `UPDATE recruitment.job_applications
           SET screening_results = $1, updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(data), id]
        );
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Interview methods
  async scheduleInterview(interview: Interview): Promise<Interview> {
    const result = await this.pool.query(
      `INSERT INTO recruitment.interviews(
        job_application_id, interviewer_id, schedule_time, 
        interview_type, status, location, meeting_link, notes
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        interview.job_application_id,
        interview.interviewer_id,
        interview.schedule_time,
        interview.interview_type,
        interview.status,
        interview.location,
        interview.meeting_link,
        interview.notes
      ]
    );
    
    return result.rows[0];
  }

  async submitInterviewFeedback(feedback: InterviewFeedback): Promise<InterviewFeedback> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert feedback
      const result = await client.query(
        `INSERT INTO recruitment.interview_feedback(
          interview_id, rating, strengths, weaknesses, 
          comments, recommendation, created_by
        ) VALUES($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          feedback.interview_id,
          feedback.rating,
          feedback.strengths,
          feedback.weaknesses,
          feedback.comments,
          feedback.recommendation,
          feedback.created_by
        ]
      );
      
      // Update interview status
      await client.query(
        `UPDATE recruitment.interviews
         SET status = 'COMPLETED', updated_at = NOW()
         WHERE id = $1`,
        [feedback.interview_id]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getInterviewsForApplication(applicationId: number): Promise<any[]> {
    const query = `
      SELECT 
        i.*,
        CONCAT(e.first_name, ' ', e.last_name) as interviewer_name,
        e.email as interviewer_email,
        f.id as feedback_id,
        f.rating,
        f.recommendation
      FROM 
        recruitment.interviews i
      LEFT JOIN 
        employee.employees e ON i.interviewer_id = e.id
      LEFT JOIN 
        recruitment.interview_feedback f ON i.id = f.interview_id
      WHERE 
        i.job_application_id = $1
      ORDER BY 
        i.schedule_time ASC
    `;
    
    const result = await this.pool.query(query, [applicationId]);
    return result.rows;
  }

  // Offer methods
  async createOffer(offer: Offer): Promise<Offer> {
    const result = await this.pool.query(
      `INSERT INTO recruitment.offers(
        job_application_id, salary_offered, benefits_offered,
        start_date, expiration_date, status, notes,
        document_url, created_by
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        offer.job_application_id,
        offer.salary_offered,
        JSON.stringify(offer.benefits_offered || {}),
        offer.start_date,
        offer.expiration_date,
        offer.status,
        offer.notes,
        offer.document_url,
        offer.created_by
      ]
    );
    
    // Update application status
    await this.pool.query(
      `UPDATE recruitment.job_applications
       SET status = 'OFFER', updated_at = NOW()
       WHERE id = $1`,
      [offer.job_application_id]
    );
    
    return result.rows[0];
  }

  async updateOfferStatus(id: number, status: string, notes?: string): Promise<Offer | null> {
    const query = `
      UPDATE recruitment.offers
      SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [status, notes, id]);
    
    // If accepted, update job requisition and application
    if (status === 'ACCEPTED') {
      const offer = result.rows[0];
      
      // Get application info
      const appResult = await this.pool.query(
        'SELECT job_requisition_id FROM recruitment.job_applications WHERE id = $1',
        [offer.job_application_id]
      );
      
      if (appResult.rows.length > 0) {
        const jobReqId = appResult.rows[0].job_requisition_id;
        
        // Check if job has been filled
        const jobResult = await this.pool.query(
          'SELECT vacancies FROM recruitment.job_requisitions WHERE id = $1',
          [jobReqId]
        );
        
        if (jobResult.rows.length > 0) {
          const vacancies = jobResult.rows[0].vacancies;
          
          // Count accepted offers for this job
          const offerCountResult = await this.pool.query(
            `SELECT COUNT(*) as filled
             FROM recruitment.offers o
             JOIN recruitment.job_applications a ON o.job_application_id = a.id
             WHERE a.job_requisition_id = $1 AND o.status = 'ACCEPTED'`,
            [jobReqId]
          );
          
          const filled = parseInt(offerCountResult.rows[0].filled);
          
          // If all positions filled, update job requisition status
          if (filled >= vacancies) {
            await this.pool.query(
              `UPDATE recruitment.job_requisitions
               SET status = 'FILLED', updated_at = NOW()
               WHERE id = $1`,
              [jobReqId]
            );
          }
        }
      }
    }
    
    return result.rows.length ? result.rows[0] : null;
  }

  // Analytics methods
  async getRecruitmentAnalytics(): Promise<any> {
    const openPositionsQuery = `
      SELECT COUNT(*) as open_positions,
             SUM(vacancies) as total_vacancies
      FROM recruitment.job_requisitions
      WHERE status = 'OPEN'
    `;
    
    const applicationStatsQuery = `
      SELECT status, COUNT(*) as count
      FROM recruitment.job_applications
      GROUP BY status
    `;
    
    const timeToFillQuery = `
      SELECT AVG(EXTRACT(EPOCH FROM (o.created_at - jr.created_at)) / 86400) as avg_days
      FROM recruitment.offers o
      JOIN recruitment.job_applications ja ON o.job_application_id = ja.id
      JOIN recruitment.job_requisitions jr ON ja.job_requisition_id = jr.id
      WHERE o.status = 'ACCEPTED'
    `;
    
    const sourcingAnalyticsQuery = `
      SELECT source, COUNT(*) as count
      FROM recruitment.job_applications
      GROUP BY source
      ORDER BY count DESC
    `;
    
    const [
      openPositionsResult,
      applicationStatsResult,
      timeToFillResult,
      sourcingAnalyticsResult
    ] = await Promise.all([
      this.pool.query(openPositionsQuery),
      this.pool.query(applicationStatsQuery),
      this.pool.query(timeToFillQuery),
      this.pool.query(sourcingAnalyticsQuery)
    ]);
    
    // Process application stats into a more usable format
    const applicationStats = applicationStatsResult.rows.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = parseInt(curr.count);
      return acc;
    }, {});
    
    return {
      openPositions: parseInt(openPositionsResult.rows[0].open_positions),
      totalVacancies: parseInt(openPositionsResult.rows[0].total_vacancies),
      applications: applicationStats,
      avgTimeToFill: parseFloat(timeToFillResult.rows[0].avg_days) || 0,
      sourcingAnalytics: sourcingAnalyticsResult.rows
    };
  }
}

export default new RecruitmentModel();
export { 
  JobRequisition, 
  JobApplication, 
  Interview, 
  InterviewFeedback, 
  Offer 
};