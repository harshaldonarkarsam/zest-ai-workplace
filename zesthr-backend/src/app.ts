// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import morgan from 'morgan';

// Database connections
import pool from './config/postgres';
import connectMongoDB from './config/mongodb';
import { connectRedis } from './config/redis';
import { checkElasticsearchConnection } from './config/elasticsearch';

// Routes
import routes from './routes';

// Load environment variables
config();

// Initialize express app
const app: Application = express();

// Connect to databases
const initializeDatabases = async () => {
  try {
    await connectMongoDB();
    await connectRedis();
    await checkElasticsearchConnection();
    console.log('All database connections established successfully');
  } catch (error) {
    console.error('Error connecting to databases:', error);
    process.exit(1);
  }
};

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('Swagger documentation not available:', error);
}

// Routes
app.use(routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize databases
initializeDatabases().catch(console.error);

export default app;