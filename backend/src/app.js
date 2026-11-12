import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './middlewares/error-handler.js';
import authRoutes from './modules/auth/auth.routes.js';
import grievanceRoutes from './modules/grievances/grievance.routes.js';
import { clientOrigin } from './config/env.js';
import departmentRoutes from './modules/departments/department.routes.js';
import contactRoutes from './modules/contact-enquiries/contact.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import citizenFeedbackRoutes from './modules/citizen-feedback/feedback.routes.js';
import grievanceHistoryRoutes from './modules/grievance-history/grievance-history.routes.js';
import departmentAssignmentRoutes from './modules/department-assignments/department-assignment.routes.js';
import attachmentRoutes from './modules/attachments/attachment.routes.js';
import actionTakenReportRoutes from './modules/action-taken-reports/action-taken-report.routes.js';
import grievanceRemarkRoutes from './modules/grievance-remarks/grievance-remark.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import requireDatabase from './middlewares/require-database.js';

const app = express();

app.use(cors({
  origin: "https://cm-s-public-grievance-redressal-por-ruby.vercel.app",
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-Portal-Role']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/health', healthRoutes);

app.use('/api/health', healthRoutes);
app.use('/api', requireDatabase);

app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/contact-enquiries', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/citizen-feedback', citizenFeedbackRoutes);
app.use('/api/grievance-history', grievanceHistoryRoutes);
app.use('/api/department-assignments', departmentAssignmentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/action-taken-reports', actionTakenReportRoutes);
app.use('/api/grievance-remarks', grievanceRemarkRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
