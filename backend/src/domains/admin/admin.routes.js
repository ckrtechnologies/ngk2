import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  readNotifications,
  getEnquiries,
  updateEnquiryStatus,
  addEnquiryMessage,
  getDealers,
  getDashboardStats,
} from './admin.controller.js';
import { optionalAuth, verifyToken } from '../../common/middleware/auth.middleware.js';

const adminRouter = Router();

// Dashboard Analytics
adminRouter.get('/stats', optionalAuth, getDashboardStats);

// Users Management
adminRouter.get('/users', optionalAuth, getUsers);
adminRouter.get('/users/:id', optionalAuth, getUserById);
adminRouter.get('/user/:id', optionalAuth, getUserById);
adminRouter.put('/updateUser/:id', optionalAuth, updateUser);
adminRouter.put('/users/:id', optionalAuth, updateUser);
adminRouter.delete('/deleteUser/:id', optionalAuth, deleteUser);
adminRouter.delete('/users/:id', optionalAuth, deleteUser);
adminRouter.put('/readNotifications/:id', optionalAuth, readNotifications);

// Enquiries Management
adminRouter.get('/enquiries', optionalAuth, getEnquiries);
adminRouter.post('/enquiries/updateStatus', optionalAuth, updateEnquiryStatus);
adminRouter.put('/enquiries/updateStatus/:id', optionalAuth, updateEnquiryStatus);
adminRouter.post('/enquiries/addMessage', optionalAuth, addEnquiryMessage);

// Dealers Management
adminRouter.get('/dealers', optionalAuth, getDealers);

export default adminRouter;
