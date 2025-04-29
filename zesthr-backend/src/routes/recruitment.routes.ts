import { Router } from 'express';
import RecruitmentController, { upload } from '../controllers/recruitment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes except public job application
router.use('/jobs/:id/apply', (req, res, next) => {
  // Skip authentication for the public job application endpoint
  next();
});

router.use(authenticate);

// Job Requisition Routes
// Get all job requisitions (accessible by HR, Managers, Recruiters)
router.get(
  '/jobs',
  authorize(['HR_ADMIN', 'HR_SPECIALIST', 'RECRUITER', 'MANAGER', 'EXECUTIVE']),
  RecruitmentController.getAllJobRequisitions
);

// Get job requisition by ID
router.get(
  '/jobs/:id',
  authorize(['HR_ADMIN', 'HR_SPECIALIST', 'RECRUITER', 'MANAGER', 'EXECUTIVE']),
  RecruitmentController.getJobRequisitionById
);

// Create a new job requisition
router.post(
  '/jobs',
  authorize(['HR_ADMIN', 'RECRUITER']),
  RecruitmentController.createJobRequisition
);

// Update a job requisition
router.put(
  '/jobs/:id',
  authorize(['HR_ADMIN', 'RECRUITER']),
  RecruitmentController.updateJobRequisition
);

// Application Routes
// Get all applications for a job
router.get(
  '/jobs/:id/applications',
  authorize(['HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER']),
  RecruitmentController.getApplicationsForJob
);

// Upload resume and apply (public endpoint)
router.post(
  '/jobs/:id/apply',
  upload.single('resume'),
  RecruitmentController.uploadResumeAndApply
);

// Update application status
router.put(
  '/applications/:applicationId/status',
  authorize(['HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER']),
  RecruitmentController.updateApplicationStatus
);

// Interview Routes
// Schedule an interview
router.post(
  '/applications/:applicationId/interviews',
  authorize(['HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER']),
  RecruitmentController.scheduleInterview
);

// Submit interview feedback
router.post(
  '/interviews/:interviewId/feedback',
  authorize(['HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER']),
  RecruitmentController.submitInterviewFeedback
);

// Offer Routes
// Create an offer
router.post(
  '/applications/:applicationId/offers',
  authorize(['HR_ADMIN', 'RECRUITER']),
  RecruitmentController.createOffer
);

// Update offer status
router.put(
  '/offers/:offerId/status',
  authorize(['HR_ADMIN', 'RECRUITER']),
  RecruitmentController.updateOfferStatus
);

// AI-powered features
// Get top candidates for a job
router.get(
  '/jobs/:id/candidates/top',
  authorize(['HR_ADMIN', 'RECRUITER', 'HIRING_MANAGER']),
  RecruitmentController.getTopCandidatesForJob
);

// Analytics
// Get recruitment analytics
router.get(
  '/analytics',
  authorize(['HR_ADMIN', 'RECRUITER', 'EXECUTIVE']),
  RecruitmentController.getRecruitmentAnalytics
);

export default router;