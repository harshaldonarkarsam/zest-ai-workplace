import { Router } from 'express';
import employeeRoutes from './employee.routes';
import recruitmentRoutes from './recruitment.routes';
import authRoutes from './auth.routes';

const router = Router();

// Health check endpoint (public)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/employees', employeeRoutes);
router.use('/api/recruitment', recruitmentRoutes);

export default router;