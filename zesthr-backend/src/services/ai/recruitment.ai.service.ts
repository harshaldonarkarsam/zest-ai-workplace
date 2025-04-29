// src/services/ai/recruitment.ai.service.ts
import * as tf from '@tensorflow/tfjs-node';
import { HfInference } from '@huggingface/inference';
import { createClient } from '@pinecone-database/pinecone';
import { readFile } from 'fs/promises';
import * as path from 'path';
import CandidateModel, { Candidate } from '../../models/mongo/candidate.model';
import { JobRequisition } from '../../models/postgres/recruitment.model';
import pool from '../../config/postgres';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize Pinecone for vector database
const pinecone = createClient({
  apiKey: process.env.PINECONE_API_KEY || '',
  environment: process.env.PINECONE_ENVIRONMENT || ''
});

class RecruitmentAIService {
  private skillsEmbeddingModel: tf.LayersModel | null = null;
  private resumeParserModel: any = null;
  
  constructor() {
    this.initializeModels();
  }
  
  private async initializeModels() {
    try {
      // Load the skills embedding model
      this.skillsEmbeddingModel = await tf.loadLayersModel(
        `file://${path.join(__dirname, '../../../models/skills_embedding/model.json')}`
      );
      
      console.log('Skills embedding model loaded successfully');
    } catch (error) {
      console.error('Error loading skills embedding model:', error);
    }
  }
  
  /**
   * Parse a resume file and extract structured information
   */
  async parseResume(fileBuffer: Buffer, mimeType: string): Promise<any> {
    try {
      // In a production environment, this would use a specialized resume parsing service
      // For this implementation, we'll use a simple text extraction + Hugging Face model approach
      
      // Extract text from document based on mime type
      let text = '';
      
      if (mimeType === 'application/pdf') {
        // Simple PDF text extraction
        // In production, use a PDF parsing library like pdf-parse
        text = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E]/g, ' ');
      } else if (mimeType.includes('word') || mimeType.includes('docx')) {
        // In production, use a Word document parsing library
        text = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E]/g, ' ');
      } else {
        // Assume plain text
        text = fileBuffer.toString('utf-8');
      }
      
      // Use Hugging Face for named entity recognition to extract entities
      const entityRecognition = await hf.textClassification({
        model: 'dbmdz/bert-large-cased-finetuned-conll03-english',
        inputs: text.substring(0, 2000) // Limit text length to avoid token limits
      });
      
      // Use NLP model to extract skills
      const skillsExtraction = await hf.textGeneration({
        model: 'gpt2', // Would use a skills-specific model in production
        inputs: 'Extract skills from the following resume:\n\n' + text.substring(0, 1000),
        parameters: {
          max_new_tokens: 100,
          return_full_text: false
        }
      });
      
      // Process extraction results to structure the data
      const skills = skillsExtraction.generated_text
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      // Extract education and experience with simple pattern matching
      // In production, use more sophisticated NLP models
      const education = this.extractEducation(text);
      const experience = this.extractExperience(text);
      
      return {
        rawText: text,
        parsed: {
          skills,
          workExperience: experience,
          education,
          otherSections: {}
        },
        metaData: {
          parseDate: new Date(),
          parserVersion: '1.0.0',
          confidenceScore: 0.75 // Placeholder
        }
      };
      
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume');
    }
  }
  
  /**
   * Extract education information from resume text using pattern matching
   * This is a simplified version - in production, use a more robust NLP approach
   */
  private extractEducation(text: string): any[] {
    const education = [];
    const educationSection = text.match(/education(.*?)(?:experience|\n\n|$)/is);
    
    if (educationSection && educationSection[1]) {
      const sectionText = educationSection[1];
      
      // Simple pattern matching for education entries
      const degreePatterns = [
        /(\b(?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BA|MBA|MD|JD)\b[^,\n]*),?\s*(?:at|from)?\s*([^,\n]*),?\s*(?:in)?\s*([^,\n]*)/gi,
        /([^,\n]*University[^,\n]*|[^,\n]*College[^,\n]*),?\s*([^,\n]*),?\s*([^,\n]*)/gi
      ];
      
      for (const pattern of degreePatterns) {
        let match;
        while ((match = pattern.exec(sectionText)) !== null) {
          education.push({
            degree: match[1]?.trim(),
            institution: match[2]?.trim(),
            field: match[3]?.trim(),
            year: this.extractYear(sectionText.substring(match.index, match.index + 100))
          });
        }
      }
    }
    
    return education;
  }
  
  /**
   * Extract experience information from resume text using pattern matching
   * This is a simplified version - in production, use a more robust NLP approach
   */
  private extractExperience(text: string): any[] {
    const experience = [];
    const experienceSection = text.match(/experience(.*?)(?:education|\n\n|$)/is);
    
    if (experienceSection && experienceSection[1]) {
      const sectionText = experienceSection[1];
      
      // Simple pattern matching for job entries
      const jobPattern = /([^,\n]*?(?:Inc|LLC|Ltd|Corporation|Corp|Company|Co)\.?[^,\n]*|[^,\n]{5,50}),?\s*([^,\n]*?(?:Manager|Engineer|Developer|Analyst|Director|Assistant|Coordinator)[^,\n]*),?\s*(?:from|-)?\s*([^,\n]*)/gi;
      
      let match;
      while ((match = jobPattern.exec(sectionText)) !== null) {
        experience.push({
          company: match[1]?.trim(),
          title: match[2]?.trim(),
          duration: match[3]?.trim(),
          description: this.extractJobDescription(sectionText.substring(match.index, match.index + 300))
        });
      }
    }
    
    return experience;
  }
  
  /**
   * Extract a year from text
   */
  private extractYear(text: string): number | null {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }
  
  /**
   * Extract job description from text
   */
  private extractJobDescription(text: string): string {
    // Find the first bullet point or new paragraph after the job title and company
    const descStart = text.search(/•|\*|\n\s*-|\n\n/);
    if (descStart === -1) return '';
    
    // Extract text from that point until the next job entry or section
    const description = text.substring(descStart).split(/\n\n|\r\n\r\n/)[0];
    return description.trim();
  }
  
  /**
   * Match a candidate to a job requisition
   */
  async matchCandidateToJob(candidateId: string, jobId: number): Promise<any> {
    try {
      // Fetch candidate data
      const candidate = await CandidateModel.findOne({ candidateId });
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      
      // Fetch job requisition data
      const jobQuery = await pool.query(
        'SELECT * FROM recruitment.job_requisitions WHERE id = $1',
        [jobId]
      );
      
      if (jobQuery.rows.length === 0) {
        throw new Error('Job requisition not found');
      }
      
      const job = jobQuery.rows[0] as JobRequisition;
      
      // Extract job requirements
      const jobSkills = job.skills_required ? 
        (typeof job.skills_required === 'string' ? 
          JSON.parse(job.skills_required) : job.skills_required) : 
        { required: [], preferred: [] };
      
      // Extract candidate skills
      const candidateSkills = candidate.skills.map(s => s.name.toLowerCase());
      const candidateSkillsSet = new Set(candidateSkills);
      
      // Calculate simple skill match score
      const requiredSkills = jobSkills.required || [];
      const preferredSkills = jobSkills.preferred || [];
      
      const requiredMatches = requiredSkills.filter(
        (skill: string) => candidateSkillsSet.has(skill.toLowerCase())
      ).length;
      
      const preferredMatches = preferredSkills.filter(
        (skill: string) => candidateSkillsSet.has(skill.toLowerCase())
      ).length;
      
      // Calculate weighted score
      const requiredWeight = 0.7;
      const preferredWeight = 0.3;
      
      const requiredScore = requiredSkills.length > 0 ? 
        (requiredMatches / requiredSkills.length) * requiredWeight : 0;
        
      const preferredScore = preferredSkills.length > 0 ? 
        (preferredMatches / preferredSkills.length) * preferredWeight : 0;
      
      const skillMatchScore = requiredScore + preferredScore;
      
      // If we have the embedding model loaded, calculate semantic match as well
      let semanticScore = 0;
      if (this.skillsEmbeddingModel) {
        semanticScore = await this.calculateSemanticMatch(
          candidateSkills,
          [...requiredSkills, ...preferredSkills]
        );
      }
      
      // Experience relevance score (simplified)
      const experienceRelevance = this.calculateExperienceRelevance(
        candidate.experience,
        job.title,
        job.description
      );
      
      // Calculate overall score (weighted average)
      const overallScore = (
        skillMatchScore * 0.5 + 
        semanticScore * 0.3 + 
        experienceRelevance * 0.2
      );
      
      // Generate insights
      const insights = this.generateMatchInsights(
        candidate,
        job,
        {
          skillMatchScore,
          semanticScore,
          experienceRelevance,
          requiredMatches,
          preferredMatches
        }
      );
      
      // Generate flags for potential issues
      const flags = this.generateCandidateFlags(candidate, job);
      
      // Return the match analysis
      return {
        candidateId: candidate.candidateId,
        jobRequisitionId: job.id,
        skillMatch: parseFloat(skillMatchScore.toFixed(2)),
        experienceRelevance: parseFloat(experienceRelevance.toFixed(2)),
        semanticMatch: parseFloat(semanticScore.toFixed(2)),
        overallScore: parseFloat(overallScore.toFixed(2)),
        insights,
        flags,
        matchDetails: {
          requiredSkills: {
            total: requiredSkills.length,
            matched: requiredMatches,
            missing: requiredSkills.filter(
              (skill: string) => !candidateSkillsSet.has(skill.toLowerCase())
            )
          },
          preferredSkills: {
            total: preferredSkills.length,
            matched: preferredMatches,
            matching: preferredSkills.filter(
              (skill: string) => candidateSkillsSet.has(skill.toLowerCase())
            )
          }
        }
      };
      
    } catch (error) {
      console.error('Error matching candidate to job:', error);
      throw new Error('Failed to perform candidate matching');
    }
  }
  
  /**
   * Calculate semantic match between candidate skills and job skills
   * using embeddings model
   */
  private async calculateSemanticMatch(
    candidateSkills: string[],
    jobSkills: string[]
  ): Promise<number> {
    try {
      if (!this.skillsEmbeddingModel || candidateSkills.length === 0 || jobSkills.length === 0) {
        return 0;
      }
      
      // In a production environment, you would use pre-computed embeddings
      // stored in a vector database. This is a simplified approach.
      
      // Combine all skills into single text for embedding
      const candidateText = candidateSkills.join(', ');
      const jobText = jobSkills.join(', ');
      
      // Use Hugging Face embedding model
      const candidateEmbedding = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: candidateText
      });
      
      const jobEmbedding = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: jobText
      });
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(
        candidateEmbedding as number[],
        jobEmbedding as number[]
      );
      
      return similarity;
    } catch (error) {
      console.error('Error calculating semantic match:', error);
      return 0;
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Calculate experience relevance score based on job title and description
   */
  private calculateExperienceRelevance(
    experience: any[],
    jobTitle: string,
    jobDescription: string
  ): number {
    if (!experience || experience.length === 0) return 0;
    
    // Convert job title and description to lowercase for case-insensitive matching
    const jobTitleLower = jobTitle.toLowerCase();
    const jobDescLower = jobDescription.toLowerCase();
    
    // Extract key terms from job title and description
    const titleTerms = jobTitleLower.split(/\s+/).filter(t => t.length > 3);
    const descTerms = new Set(
      jobDescLower.split(/\s+/)
        .filter(t => t.length > 3)
        .slice(0, 50) // Limit to first 50 significant terms
    );
    
    let relevanceScore = 0;
    let bestExperienceScore = 0;
    
    // Analyze each experience entry
    for (const job of experience) {
      const titleLower = (job.title || '').toLowerCase();
      const descLower = (job.description || '').toLowerCase();
      
      // Title match - check if job titles are similar
      let titleMatchScore = 0;
      for (const term of titleTerms) {
        if (titleLower.includes(term)) {
          titleMatchScore += 1 / titleTerms.length;
        }
      }
      
      // Description match - check if keywords from job description appear
      let descMatchCount = 0;
      const descWords = descLower.split(/\s+/).filter(t => t.length > 3);
      
      for (const word of descWords) {
        if (descTerms.has(word)) {
          descMatchCount++;
        }
      }
      
      const descMatchScore = descWords.length > 0 ? 
        Math.min(descMatchCount / 10, 1) : 0; // Cap at 1.0, requiring 10 matching terms for max score
      
      // Combine scores for this experience entry
      const entryScore = (titleMatchScore * 0.6) + (descMatchScore * 0.4);
      
      // Keep track of best matching experience
      bestExperienceScore = Math.max(bestExperienceScore, entryScore);
    }
    
    // Overall relevance is primarily based on the best matching experience
    relevanceScore = bestExperienceScore;
    
    return relevanceScore;
  }
  
  /**
   * Generate insights based on the candidate-job match
   */
  private generateMatchInsights(
    candidate: Candidate,
    job: JobRequisition,
    scores: any
  ): string[] {
    const insights: string[] = [];
    
    // Skill match insights
    if (scores.skillMatchScore > 0.8) {
      insights.push(`Strong technical skills matching job requirements`);
    } else if (scores.skillMatchScore > 0.6) {
      insights.push(`Good skill match with the role requirements`);
    } else if (scores.skillMatchScore > 0.4) {
      insights.push(`Has some of the required skills, but may need training in others`);
    } else {
      insights.push(`Limited skill match with job requirements`);
    }
    
    // Missing critical skills
    if (scores.requiredMatches < scores.matchDetails?.requiredSkills.total) {
      const missingSkills = scores.matchDetails?.requiredSkills.missing;
      if (missingSkills && missingSkills.length > 0) {
        insights.push(`Missing critical skills: ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? '...' : ''}`);
      }
    }
    
    // Experience insights
    if (scores.experienceRelevance > 0.7) {
      insights.push(`Highly relevant work experience`);
    } else if (scores.experienceRelevance > 0.4) {
      insights.push(`Has related industry experience`);
    } else {
      insights.push(`Limited relevant experience for this position`);
    }
    
    // Education insights
    const education = candidate.education || [];
    if (education.length > 0) {
      // Check if education field is relevant to job
      // In production, use NLP similarity between fields of study and job requirements
      insights.push(`Educational background in ${education[0].field}`);
    }
    
    return insights;
  }
  
  /**
   * Generate flags for potential issues with a candidate
   */
  private generateCandidateFlags(candidate: Candidate, job: JobRequisition): string[] {
    const flags: string[] = [];
    
    // Check for employment gaps
    const experiences = [...(candidate.experience || [])].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    
    if (experiences.length >= 2) {
      for (let i = 0; i < experiences.length - 1; i++) {
        const current = experiences[i];
        const next = experiences[i + 1];
        
        if (current.endDate && next.endDate) {
          const gap = new Date(current.startDate).getTime() - new Date(next.endDate).getTime();
          const gapMonths = gap / (1000 * 60 * 60 * 24 * 30);
          
          if (gapMonths > 6) {
            flags.push(`Employment gap of ${Math.round(gapMonths)} months detected`);
            break; // Only flag one gap
          }
        }
      }
    }
    
    // Check for frequent job changes
    if (experiences.length >= 3) {
      let shortTermJobs = 0;
      
      for (const exp of experiences.slice(0, 3)) { // Check most recent 3
        if (exp.endDate && exp.startDate) {
          const duration = new Date(exp.endDate).getTime() - new Date(exp.startDate).getTime();
          const durationMonths = duration / (1000 * 60 * 60 * 24 * 30);
          
          if (durationMonths < 12) {
            shortTermJobs++;
          }
        }
      }
      
      if (shortTermJobs >= 2) {
        flags.push('Frequent job changes in recent history');
      }
    }
    
    // Flag if candidate has no experience
    if (!candidate.experience || candidate.experience.length === 0) {
      flags.push('No work experience listed');
    }
    
    // Flag if candidate has no education
    if (!candidate.education || candidate.education.length === 0) {
      flags.push('No education information provided');
    }
    
    return flags;
  }
  
  /**
   * Analyze interview feedback using sentiment analysis
   */
  async analyzeInterviewFeedback(feedback: string): Promise<any> {
    try {
      // Use Hugging Face sentiment analysis model
      const sentimentResult = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: feedback
      });
      
      // Extract key themes from feedback using text summarization
      const themesResult = await hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: `Extract key themes from this interview feedback: ${feedback}`,
        parameters: {
          max_length: 100,
          min_length: 30
        }
      });
      
      let sentiment = 'neutral';
      let score = 0.5;
      
      if (sentimentResult && Array.isArray(sentimentResult)) {
        const [result] = sentimentResult;
        if (result.label === 'POSITIVE') {
          sentiment = 'positive';
          score = result.score;
        } else if (result.label === 'NEGATIVE') {
          sentiment = 'negative';
          score = 1 - result.score;
        }
      }
      
      // Extract key themes
      const themes = themesResult.summary_text
        .split('.')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      return {
        sentiment,
        score: parseFloat(score.toFixed(2)),
        themes
      };
    } catch (error) {
      console.error('Error analyzing interview feedback:', error);
      return {
        sentiment: 'neutral',
        score: 0.5,
        themes: []
      };
    }
  }
  
  /**
   * Get top candidates for a job based on matching scores
   */
  async getTopCandidatesForJob(
    jobId: number,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Get all candidates who applied for this job
      const applications = await pool.query(
        `SELECT candidate_id FROM recruitment.job_applications
         WHERE job_requisition_id = $1`,
        [jobId]
      );
      
      const candidateIds = applications.rows.map(row => row.candidate_id);
      
      if (candidateIds.length === 0) {
        return [];
      }
      
      // Fetch candidates from MongoDB
      const candidates = await CandidateModel.find({
        candidateId: { $in: candidateIds }
      });
      
      if (candidates.length === 0) {
        return [];
      }
      
      // Get job requisition details
      const jobQuery = await pool.query(
        'SELECT * FROM recruitment.job_requisitions WHERE id = $1',
        [jobId]
      );
      
      if (jobQuery.rows.length === 0) {
        throw new Error('Job requisition not found');
      }
      
      const job = jobQuery.rows[0] as JobRequisition;
      
      // Match each candidate
      const matchResults = await Promise.all(
        candidates.map(candidate => this.matchCandidateToJob(candidate.candidateId, jobId))
      );
      
      // Sort by overall score and return top matches
      return matchResults
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);
      
    } catch (error) {
      console.error('Error getting top candidates:', error);
      throw new Error('Failed to retrieve top candidates');
    }
  }
}

export default new RecruitmentAIService();