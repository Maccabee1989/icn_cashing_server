import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { create, read, getAll, update } from "../controllers/payMode.controller";


const payModeRouter = express.Router();

payModeRouter.get('/pay-modes',isAuthentificated,getAll);
payModeRouter.post('/pay-modes',isAuthentificated, create);
payModeRouter.get('/pay-modes/:id',isAuthentificated, read);
payModeRouter.put('/pay-modes/:id', isAuthentificated, update);
// payModeRouter.delete('/payModes/:id', isAuthentificated, deletion);
// payModeRouter.delete('/payModes-bulk', isAuthentificated, deletion);


export default payModeRouter; 