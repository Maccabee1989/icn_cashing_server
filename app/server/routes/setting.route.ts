import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { getAll, create, update } from "../controllers/setting.controller";


const settingRouter = express.Router();

settingRouter.get('/settings',isAuthentificated,getAll);
settingRouter.post('/settings', isAuthentificated, create);
settingRouter.put('/settings/:id', isAuthentificated, update);

export default settingRouter; 