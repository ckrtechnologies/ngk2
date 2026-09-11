import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

// Common Middlewares
import errorHandler from './common/middleware/error.middleware.js';

// Domain Routers
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import catalogRouter from './modules/catalog/catalog.routes.js';
import garageRouter from './modules/garage/garage.routes.js';
import enquiryRouter from './modules/enquiry/enquiry.routes.js';
import dealerRouter from './modules/dealer/dealer.routes.js';
import uploadRouter from './modules/upload/upload.routes.js';

// Dedicated Domain Boundaries
import adminRouter from './domains/admin/admin.routes.js';
import ngkRouter from './domains/ngk/ngk.routes.js';
import kybRouter from './domains/kyb/kyb.routes.js';

const app = express();

// Request logging in development
app.use(morgan('dev'));

// CORS & Body parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files
const uploadDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'NGK2 Backend API',
    version: '2.0.0',
    status: 'online',
    architecture: 'Domain-Driven Design (DDD)',
    domains: {
      admin: '/api/admin',
      ngk: '/api/ngk',
      kyb: '/api/kyb',
    },
    docs: '/api-docs',
  });
});

// ==============================================================================
// DOMAIN-DRIVEN ROUTES
// ==============================================================================

// Dedicated Domain Endpoints
app.use('/api/admin', adminRouter);
app.use('/api/ngk', ngkRouter);
app.use('/api/kyb', kybRouter);

// Core Modules & Shared Domains
app.use('/api/auth', authRouter);
app.use('/api/users', adminRouter); // Admin & client user operations
app.use('/api/users', userRouter);
app.use('/api/tecdoc', catalogRouter);
app.use('/api/garage', garageRouter);
app.use('/api/enquiries', enquiryRouter);
app.use('/api/dealers', dealerRouter);
app.use('/api/upload', uploadRouter);

// ==============================================================================
// BACKWARD COMPATIBILITY ALIASES (For existing mobile & admin paths)
// ==============================================================================
app.use('/api/user', authRouter);
app.use('/api/user', userRouter);
app.use('/api/user', garageRouter);
app.use('/api/enquiry', enquiryRouter);

// Universal TecDoc proxy routes for existing clients
app.post('/services/TecdocToCatDLB.jsonEndpoint', (req, res, next) => {
  req.url = '/services/TecdocToCatDLB.jsonEndpoint';
  catalogRouter(req, res, next);
});
app.post('/api/serviceJson', (req, res, next) => {
  req.url = '/serviceJson';
  catalogRouter(req, res, next);
});

// ==============================================================================
// CENTRALIZED ERROR HANDLING
// ==============================================================================
app.use(errorHandler);

export default app;
