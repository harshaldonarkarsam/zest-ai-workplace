// src/models/mongo/candidate.model.ts
import mongoose, { Document, Schema } from 'mongoose';

interface CandidateEducation {
  institution: string;
  degree: string;
  field: string;
  startDate?: Date;
  endDate?: Date;
  gpa?: number;
  achievements?: string[];
}

interface CandidateExperience {
  company: string;
  title: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description?: string;
  skills?: string[];
  achievements?: string[];
}

interface CandidateSkill {
  name: string;
  level?: string;
  yearsOfExperience?: number;
  endorsements?: number;
}

interface Candidate extends Document {
  candidateId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  currentTitle?: string;
  currentCompany?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  summary?: string;
  skills: CandidateSkill[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  languages?: { name: string; proficiency?: string }[];
  certifications?: { name: string; issuer?: string; date?: Date; expires?: Date }[];
  resumeData: {
    rawText: string;
    parsed: {
      skills: string[];
      workExperience: any[];
      education: any[];
      otherSections?: Record<string, any>;
    };
    originalFile: {
      filename: string;
      mimeType: string;
      size: number;
      url: string;
    };
    metaData: {
      parseDate: Date;
      parserVersion: string;
      confidenceScore: number;
    };
  };
  tags?: string[];
  notes?: { authorId: string; text: string; timestamp: Date }[];
  aiAnalysis?: {
    skillMatch?: number;
    experienceRelevance?: number;
    cultureFit?: number;
    overallScore?: number;
    insights?: string[];
    flags?: string[];
    vectors?: {
      skills: number[];
      experience: number[];
      education: number[];
    };
  };
  applications?: {
    jobRequisitionId: string;
    applicationDate: Date;
    status: string;
    source: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<Candidate>({
  candidateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone: String,
  location: String,
  currentTitle: String,
  currentCompany: String,
  linkedInUrl: String,
  portfolioUrl: String,
  githubUrl: String,
  summary: String,
  skills: [{
    name: { type: String, required: true },
    level: String,
    yearsOfExperience: Number,
    endorsements: Number
  }],
  experience: [{
    company: { type: String, required: true },
    title: { type: String, required: true },
    location: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    isCurrent: Boolean,
    description: String,
    skills: [String],
    achievements: [String]
  }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    gpa: Number,
    achievements: [String]
  }],
  languages: [{
    name: { type: String, required: true },
    proficiency: String
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: String,
    date: Date,
    expires: Date
  }],
  resumeData: {
    rawText: { type: String, required: true },
    parsed: {
      skills: [String],
      workExperience: [{
        company: String,
        title: String,
        duration: String,
        description: String
      }],
      education: [{
        institution: String,
        degree: String,
        year: Number
      }],
      otherSections: Schema.Types.Mixed
    },
    originalFile: {
      filename: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      url: { type: String, required: true }
    },
    metaData: {
      parseDate: { type: Date, default: Date.now },
      parserVersion: String,
      confidenceScore: Number
    }
  },
  tags: [String],
  notes: [{
    authorId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  aiAnalysis: {
    skillMatch: Number,
    experienceRelevance: Number,
    cultureFit: Number,
    overallScore: Number,
    insights: [String],
    flags: [String],
    vectors: {
      skills: [Number],
      experience: [Number],
      education: [Number]
    }
  },
  applications: [{
    jobRequisitionId: { type: String, required: true },
    applicationDate: { type: Date, required: true },
    status: { type: String, required: true },
    source: { type: String, required: true }
  }]
}, {
  timestamps: true
});

// Create text indexes for search
candidateSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  currentTitle: 'text',
  currentCompany: 'text',
  'skills.name': 'text',
  'experience.company': 'text',
  'experience.title': 'text',
  'education.institution': 'text',
  'education.field': 'text',
  'resumeData.rawText': 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    email: 5,
    currentTitle: 8,
    currentCompany: 7,
    'skills.name': 6,
    'experience.company': 4,
    'experience.title': 5,
    'education.institution': 3,
    'education.field': 3,
    'resumeData.rawText': 1
  },
  name: 'candidate_text_search'
});

// Create indexes for common queries
candidateSchema.index({ 'applications.jobRequisitionId': 1 });
candidateSchema.index({ 'aiAnalysis.overallScore': -1 });
candidateSchema.index({ createdAt: -1 });
candidateSchema.index({ 'skills.name': 1 });

// Helper methods
candidateSchema.methods.getMatchScore = function(jobRequirements: any): number {
  // This is a simplified version - in production, this would use the AI service
  if (!this.aiAnalysis) return 0;
  return this.aiAnalysis.overallScore || 0;
};

// Create the model
const CandidateModel = mongoose.model<Candidate>('Candidate', candidateSchema);

export default CandidateModel;
export { Candidate, CandidateSkill, CandidateExperience, CandidateEducation };