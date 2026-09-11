import userService from '../../modules/user/user.service.js';
import enquiryService from '../../modules/enquiry/enquiry.service.js';
import dealerService from '../../modules/dealer/dealer.service.js';
import { sendSuccess, sendError } from '../../common/utils/response.js';

// --- Users Management ---
export const getUsers = async (req, res) => {
  try {
    const role = req.query.role;
    const users = await userService.getAllUsers(role);
    return sendSuccess(res, { users }, 'Users found', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id || req.user?.id;
    const user = await userService.getUserById(id);
    return sendSuccess(res, { user: [user] }, 'User found', 200);
  } catch (error) {
    return sendError(res, error.message, 404, error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id || req.user?.id;
    const updated = await userService.updateUser(id, req.body);
    const userArray = Array.isArray(updated) ? updated : [updated];
    return sendSuccess(res, { user: userArray }, 'User updated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    return sendSuccess(res, null, 'User deleted successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const readNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = req.body?.notificationId || req.query?.notificationId || null;
    const notifications = await userService.readNotifications(id, notificationId);
    return sendSuccess(res, { notifications }, 'Notifications updated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

// --- Enquiries Management ---
export const getEnquiries = async (req, res) => {
  try {
    const { userId } = req.query;
    const enquiries = await enquiryService.getEnquiries(userId || null);
    return sendSuccess(res, { enquiries }, 'Enquiries fetched successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const { enquiryId, status, note, notes, responderName, role } = req.body;
    const id = enquiryId || req.params.id;
    const updated = await enquiryService.updateStatus(id, { status, note, notes, responderName, role });
    return sendSuccess(res, { enquiry: updated }, 'Enquiry status updated', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const addEnquiryMessage = async (req, res) => {
  try {
    const { enquiryId, message, text, senderId, senderName, role } = req.body;
    const id = enquiryId || req.params.id;
    const added = await enquiryService.addMessage(id, { text: text || message, senderId, senderName, role });
    return sendSuccess(res, { enquiry: added }, 'Message added to enquiry', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

// --- Dealers Management ---
export const getDealers = async (req, res) => {
  try {
    const { brand, region, province, search } = req.query;
    const dealers = await dealerService.getDealers({ brand, region, province, search });
    return sendSuccess(res, { dealers, count: dealers.length }, 'Dealers retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

// --- Admin Overview Stats ---
export const getDashboardStats = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    const enquiries = await enquiryService.getEnquiries(null);
    const dealers = await dealerService.getDealers({});

    const stats = {
      totalUsers: users.length,
      pendingApprovals: users.filter((u) => u.approval_status === 'pending_approval' || u.is_approved === false).length,
      resellers: users.filter((u) => (u.role || '').toLowerCase() === 'reseller').length,
      distributors: users.filter((u) => (u.role || '').toLowerCase() === 'distributor').length,
      totalEnquiries: enquiries.length,
      openEnquiries: enquiries.filter((e) => e.status !== 'resolved' && e.status !== 'closed' && e.status !== 'Resolved').length,
      totalDealers: dealers.length,
    };

    return sendSuccess(res, { stats }, 'Dashboard stats retrieved', 200);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
