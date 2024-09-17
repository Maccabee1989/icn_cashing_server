import express from "express";
import { registrationUser, activateUser, loginUser, logoutUser, updateAccessToken, getUserInfo, socialAuth, updateUserInfo, updateUserPassword, getAllUsers, updateUserRole, deleteUser } from "../controllers/user.controller";
import { authorizeRoles, isAuthentificated } from '../middleware/auth'

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);

userRouter.post('/activation', activateUser);

userRouter.post('/login', loginUser);

userRouter.post('/logout', isAuthentificated, logoutUser);

userRouter.get('/user/refresh', updateAccessToken);

userRouter.get('/user/me', isAuthentificated,authorizeRoles("user", "validator", "admin"), getUserInfo);

userRouter.put('/user/update', isAuthentificated, updateUserInfo);

userRouter.put('/user/update-password', isAuthentificated, updateUserPassword);

userRouter.put('/user/role', isAuthentificated,authorizeRoles("admin"), updateUserRole);

userRouter.delete('/user/:id', isAuthentificated,authorizeRoles("admin"), deleteUser);

userRouter.post('/social-auth', socialAuth);

userRouter.get('/users', isAuthentificated,authorizeRoles("admin"), getAllUsers);

export default userRouter;