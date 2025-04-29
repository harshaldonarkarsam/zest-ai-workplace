// src/controllers/recruitment.controller.ts
import { Request, Response } from 'express';
import RecruitmentModel, { 
  JobRequisition, 
  JobApplication,
  Interview,
  InterviewFeedback,
  Offer
} from '../models/postgres/recruitment.model';
import CandidateModel from '../models/mongo/candidate.model';
import RecruitmentAIService from '../services/ai/recruitment.ai.service';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || ''
  }
});

// Configure multer for resume uploads
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
    // Accept resume file types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word documents, and plain text are allowed.'));
    }
  }
});

class RecruitmentController {
  /**
   * Get all job requisitions with pagination and filtering
   */
  async getAllJobRequisitions(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Extract filters from query params
      const filters: Record<string, any> = {};
      
      if (req.query.status) {
        filters.status = req.query.status;
      }
      
      if (req.query.department) {
        filters.department_id = req.query.department;
      }
      
      if (req.query.hiring_manager) {
        filters.hiring_manager_id = req.query.hiring_manager;
      }
      
      if (req.query.search) {
        filters.search = req.query.search;
      }
      
      const { data, total } = await RecruitmentModel.findJobRequisitions(page, limit, filters);
      
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
      console.error('Error fetching job requisitions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job requisitions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get job requisition by ID
   */
  async getJobRequisitionById(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job requisition ID'
        });
      }
      
      const job = await RecruitmentModel.findJobRequisitionById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job requisition not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error fetching job requisition:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job requisition',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Create a new job requisition
   */
  async createJobRequisition(req: Request, res: Response) {
    try {
      const jobData: JobRequisition = req.body;
      
      // Set creator
      jobData.created_by = req.user?.userId;
      
      // Generate job requisition ID if not provided
      if (!jobData.requisition_id) {
        // Format: JR-YYYYMMDD-XXX
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        jobData.requisition_id = `JR-${dateStr}-${randomId}`;
      }
      
      // Set initial status to DRAFT if not provided
      if (!jobData.status) {
        jobData.status = 'DRAFT';
      }
      
      const newJob = await RecruitmentModel.createJobRequisition(jobData);
      
      res.status(201).json({
        success: true,
        data: newJob,
        message: 'Job requisition created successfully'
      });
    } catch (error) {
      console.error('Error creating job requisition:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create job requisition',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Update a job requisition
   */
  async updateJobRequisition(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job requisition ID'
        });
      }
      
      const jobData: Partial<JobRequisition> = req.body;
      
      // Set updater
      jobData.updated_by = req.user?.userId;
      
      const updatedJob = await RecruitmentModel.updateJobRequisition(jobId, jobData);
      
      if (!updatedJob) {
        return res.status(404).json({
          success: false,
          message: 'Job requisition not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: updatedJob,
        message: 'Job requisition updated successfully'
      });
    } catch (error) {
      console.error('Error updating job requisition:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update job requisition',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get all applications for a job
   */
  async getApplicationsForJob(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job requisition ID'
        });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      
      const { data, total } = await RecruitmentModel.findApplicationsForJob(
        jobId, page, limit, status
      );
      
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
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Upload a candidate resume and create application
   */
  async uploadResumeAndApply(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No resume file uploaded'
        });
      }
      
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job requisition ID'
        });
      }
      
      const {
        firstName,
        lastName,
        email,
        phone,
        source = 'Website'
      } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
      }
      
      // Check if the job exists
      const job = await RecruitmentModel.findJobRequisitionById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job requisition not found'
        });
      }
      
      // Upload resume to S3
      const fileContent = createReadStream(req.file.path);
      const fileKey = `recruitment/resumes/${uuidv4()}${path.extname(req.file.originalname)}`;
      
      const uploadParams = {
        Bucket: process.env.STORAGE_BUCKET || 'zesthr-files',
        Key: fileKey,
        Body: fileContent,
        ContentType: req.file.mimetype
      };
      
      const s3Command = new PutObjectCommand(uploadParams);
      await s3Client.send(s3Command);
      
      // Parse resume using AI service
      const fileBuffer = createReadStream(req.file.path).read();
      const parsedResume = await RecruitmentAIService.parseResume(fileBuffer, req.file.mimetype);
      
      // Generate candidate ID
      const candidateId = `CAND-${Date.now()}`;
      
      // Create candidate in MongoDB
      const candidateData = {
        candidateId,
        firstName,
        lastName,
        email,
        phone,
        resumeData: {
          ...parsedResume,
          originalFile: {
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: fileKey
          }
        },
        applications: [{
          jobRequisitionId: job.requisition_id,
          applicationDate: new Date(),
          status: 'NEW',
          source
        }]
      };
      
      // Extract skills, experience, and education from parsed resume
      if (parsedResume.parsed) {
        if (parsedResume.parsed.skills) {
          candidateData.skills = parsedResume.parsed.skills.map((skill: string) => ({
            name: skill
          }));
        }
        
        if (parsedResume.parsed.workExperience) {
          candidateData.experience = parsedResume.parsed.workExperience.map((exp: any) => ({
            company: exp.company,
            title: exp.title,
            description: exp.description,
            // Approximate dates based on duration if available
            startDate: new Date(), // This should be parsed more accurately in production
            isCurrent: true
          }));
        }
        
        if (parsedResume.parsed.education) {
          candidateData.education = parsedResume.parsed.education.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree || 'Unknown Degree',
            field: edu.field || 'Unknown Field',
            // Use year if available
            endDate: edu.year ? new Date(edu.year, 0) : undefined
          }));
        }
      }
      
      const candidate = await CandidateModel.create(candidateData);
      
      // Create application in PostgreSQL
      const applicationData: JobApplication = {
        job_requisition_id: jobId,
        candidate_id: parseInt(candidate._id.toString()),
        status: 'NEW',
        application_date: new Date(),
        source,
        screening_results: {}
      };
      
      const application = await RecruitmentModel.createJobApplication(applicationData);
      
      // Perform AI matching
      const matchResult = await RecruitmentAIService.matchCandidateToJob(
        candidateId, jobId
      );
      
      // Update candidate with AI analysis
      await CandidateModel.findByIdAndUpdate(
        candidate._id,
        {
          aiAnalysis: {
            skillMatch: matchResult.skillMatch,
            experienceRelevance: matchResult.experienceRelevance,
            overallScore: matchResult.overallScore,
            insights: matchResult.insights,
            flags: matchResult.flags
          }
        }
      );
      
      // Return the created application with matching results
      res.status(201).json({
        success: true,
        data: {
          application,
          candidate: {
            id: candidate._id,
            candidateId: candidate.candidateId,
            name: `${candidate.firstName} ${candidate.lastName}`,
            email: candidate.email
          },
          matchResult
        },
        message: 'Application submitted successfully'
      });
    } catch (error) {
      console.error('Error processing application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process application',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Update application status
   */
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      
      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application ID'
        });
      }
      
      const { status, data } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      const updatedApplication = await RecruitmentModel.updateApplicationStatus(
        applicationId, status, data
      );
      
      if (!updatedApplication) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: updatedApplication,
        message: 'Application status updated successfully'
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Schedule an interview
   */
  async scheduleInterview(req: Request, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      
      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application ID'
        });
      }
      
      const interviewData: Interview = {
        ...req.body,
        job_application_id: applicationId,
        status: 'SCHEDULED'
      };
      
      // Validate required fields
      if (!interviewData.interviewer_id || !interviewData.schedule_time || !interviewData.interview_type) {
        return res.status(400).json({
          success: false,
          message: 'Interviewer, schedule time, and interview type are required'
        });
      }
      
      const interview = await RecruitmentModel.scheduleInterview(interviewData);
      
      // Update application status to INTERVIEW if it's not already past that stage
      await RecruitmentModel.updateApplicationStatus(applicationId, 'INTERVIEW');
      
      res.status(201).json({
        success: true,
        data: interview,
        message: 'Interview scheduled successfully'
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule interview',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Submit interview feedback
   */
  async submitInterviewFeedback(req: Request, res: Response) {
    try {
      const interviewId = parseInt(req.params.interviewId);
      
      if (isNaN(interviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid interview ID'
        });
      }
      
      const feedbackData: InterviewFeedback = {
        ...req.body,
        interview_id: interviewId,
        created_by: req.user?.userId
      };
      
      // Validate required fields
      if (feedbackData.rating === undefined || feedbackData.recommendation === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Rating and recommendation are required'
        });
      }
      
      const feedback = await RecruitmentModel.submitInterviewFeedback(feedbackData);
      
      // Analyze feedback with AI if comments provided
      let sentimentAnalysis = null;
      if (feedbackData.comments) {
        sentimentAnalysis = await RecruitmentAIService.analyzeInterviewFeedback(feedbackData.comments);
      }
      
      res.status(201).json({
        success: true,
        data: {
          feedback,
          sentimentAnalysis
        },
        message: 'Interview feedback submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting interview feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit interview feedback',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Create an offer
   */
  async createOffer(req: Request, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      
      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application ID'
        });
      }
      
      const offerData: Offer = {
        ...req.body,
        job_application_id: applicationId,
        status: 'PENDING',
        created_by: req.user?.userId
      };
      
      // Validate required fields
      if (!offerData.salary_offered || !offerData.start_date || !offerData.expiration_date) {
        return res.status(400).json({
          success: false,
          message: 'Salary, start date, and expiration date are required'
        });
      }
      
      const offer = await RecruitmentModel.createOffer(offerData);
      
      res.status(201).json({
        success: true,
        data: offer,
        message: 'Offer created successfully'
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create offer',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Update offer status
   */
  async updateOfferStatus(req: Request, res: Response) {
    try {
      const offerId = parseInt(req.params.offerId);
      
      if (isNaN(offerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid offer ID'
        });
      }
      
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      const updatedOffer = await RecruitmentModel.updateOfferStatus(offerId, status, notes);
      
      if (!updatedOffer) {
        return res.status(404).json({
          success: false,
          message: 'Offer not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: updatedOffer,
        message: 'Offer status updated successfully'
      });
    } catch (error) {
      console.error('Error updating offer status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update offer status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get top candidates for a job
   */
  async getTopCandidatesForJob(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job requisition ID'
        });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      
      const candidates = await RecruitmentAIService.getTopCandidatesForJob(jobId, limit);
      
      res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      console.error('Error fetching top candidates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top candidates',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get recruitment analytics
   */
  async getRecruitmentAnalytics(req: Request, res: Response) {
    try {
      const analytics = await RecruitmentModel.getRecruitmentAnalytics();
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching recruitment analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recruitment analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new RecruitmentController();