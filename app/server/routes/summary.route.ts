import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { analytics, summary } from "../controllers/summary.controller";


const summaryRouter = express.Router();

summaryRouter.get('/summary',isAuthentificated,summary);
summaryRouter.get('/summary-user',isAuthentificated,analytics);


export default summaryRouter; 