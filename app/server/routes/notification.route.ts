import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { getAllNotifications, getUserNotification, updateNotification } from "../controllers/notification.controller";


const notificationRouter = express.Router();

notificationRouter.get('/notifications', isAuthentificated,authorizeRoles('admin'), getAllNotifications);

notificationRouter.get('user/notifications/', isAuthentificated, getUserNotification);

notificationRouter.put('/notifications/:id', isAuthentificated, updateNotification);


export default notificationRouter; 