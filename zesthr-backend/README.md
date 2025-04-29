# ZestHR Backend

This is the backend service for the ZestHR AI-powered Human Resources Management System.

## Architecture Overview

ZestHR backend is built using a modern, scalable architecture designed to support AI-enhanced HR operations. It uses multiple databases optimized for different data types and access patterns.

### Key Features

- **AI-Powered Recruitment**: Resume parsing, candidate matching, and interview sentiment analysis
- **Employee Management**: Comprehensive employee lifecycle management
- **Multi-database Architecture**: PostgreSQL, MongoDB, Redis, and Elasticsearch for different data needs
- **Scalable API**: RESTful API design with comprehensive role-based access control
- **File Storage**: S3-compatible storage for documents and files

## Tech Stack

- **Node.js** with **Express**: Server framework
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Primary relational database for structured HR data
- **MongoDB**: Document database for unstructured data (resumes, documents)
- **Redis**: Caching and real-time features
- **Elasticsearch**: Search functionality
- **TensorFlow.js**: Machine learning for AI features
- **Hugging Face**: NLP capabilities for text analysis
- **AWS S3**: File storage (or any S3-compatible storage)

## Project Structure

```
zesthr-backend/
├── src/
│   ├── config/           # Database and service configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   │   ├── postgres/     # PostgreSQL models 
│   │   ├── mongo/        # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   ├── ai/           # AI service integrations
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express application setup
│   └── index.ts          # Entry point
├── docs/                 # API documentation
├── dist/                 # Compiled JavaScript (build output)
├── models/               # AI model files
├── tests/                # Test files
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- MongoDB 6.x or higher
- Redis 6.x or higher
- Elasticsearch 8.x (optional for full-text search)
- S3-compatible object storage

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. Set up databases:
   - Create PostgreSQL database and schemas (see database setup section)
   - Ensure MongoDB, Redis, and Elasticsearch are running
5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Setup

### PostgreSQL Setup

1. Create the database:
   ```sql
   CREATE DATABASE zesthr;
   ```

2. Create schemas:
   ```sql
   \c zesthr
   
   -- Create schemas
   CREATE SCHEMA org;           -- Organization structure
   CREATE SCHEMA employee;      -- Employee data
   CREATE SCHEMA recruitment;   -- Recruitment
   CREATE SCHEMA performance;   -- Performance management
   CREATE SCHEMA compensation;  -- Compensation and benefits
   CREATE SCHEMA attendance;    -- Time and attendance
   CREATE SCHEMA learning;      -- Learning and development
   CREATE SCHEMA analytics;     -- Analytics and reporting
   CREATE SCHEMA auth;          -- Authentication and users
   ```

3. Run migrations:
   ```bash
   npm run migrate
   ```

### MongoDB Setup

No specific setup needed beyond having MongoDB running. Collections will be created automatically by the application.

## API Documentation

API documentation is available via Swagger UI at `http://localhost:3000/api-docs` when the server is running.

### Key Endpoints

- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `GET /api/recruitment/jobs` - List job requisitions
- `POST /api/recruitment/jobs/:id/apply` - Apply for a job (candidate submission)
- `GET /api/recruitment/analytics` - Get recruitment analytics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| POSTGRES_HOST | PostgreSQL host | localhost |
| POSTGRES_PORT | PostgreSQL port | 5432 |
| POSTGRES_USER | PostgreSQL username | postgres |
| POSTGRES_PASSWORD | PostgreSQL password | - |
| POSTGRES_DB | PostgreSQL database name | zesthr |
| MONGODB_URI | MongoDB connection URI | mongodb://localhost:27017/zesthr |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| ELASTICSEARCH_HOST | Elasticsearch host | localhost |
| ELASTICSEARCH_PORT | Elasticsearch port | 9200 |
| JWT_SECRET | Secret for JWT tokens | - |
| JWT_EXPIRATION | JWT token expiration time | 30d |
| STORAGE_ACCESS_KEY | S3 storage access key | - |
| STORAGE_SECRET_KEY | S3 storage secret key | - |
| STORAGE_BUCKET | S3 storage bucket name | zesthr-files |
| STORAGE_REGION | S3 storage region | us-west-2 |
| HUGGINGFACE_API_KEY | Hugging Face API key | - |
| PINECONE_API_KEY | Pinecone API key (for vector DB) | - |
| PINECONE_ENVIRONMENT | Pinecone environment | - |

## Authentication

The API uses JWT tokens for authentication. To obtain a token, use the `/api/auth/login` endpoint.

### Roles

The system supports multiple roles with different access levels:
- `HR_ADMIN`: Full access to HR functions
- `HR_SPECIALIST`: Access to most HR functions
- `RECRUITER`: Access to recruitment functions
- `HIRING_MANAGER`: Access to recruitment and team management
- `MANAGER`: Access to team management
- `EMPLOYEE`: Limited access to personal information
- `INTERVIEWER`: Access to interview scheduling and feedback
- `EXECUTIVE`: Access to analytics and reporting

## AI Models

The system uses several AI models:
- **Resume Parser**: Extracts structured information from resumes
- **Candidate Matcher**: Matches candidates to job requisitions
- **Sentiment Analyzer**: Analyzes interview feedback sentiment
- **Skills Embedding Model**: Provides semantic understanding of skills

Model files should be placed in the `models/` directory.

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm start
```

## Contributing

1. Follow the coding style defined in ESLint configuration
2. Write tests for new features
3. Update documentation for API changes
4. Use pull requests for changes

## License

Copyright © 2025 ZestHR