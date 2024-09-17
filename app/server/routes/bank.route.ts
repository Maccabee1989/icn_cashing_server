import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { create, read, getAll, update } from "../controllers/bank.controller";


const bankRouter = express.Router();

bankRouter.get('/banks',isAuthentificated,getAll);
bankRouter.post('/banks',isAuthentificated, create);
bankRouter.get('/banks/:id',isAuthentificated, read);
bankRouter.put('/banks/:id', isAuthentificated, update);
// bankRouter.delete('/banks/:id', isAuthentificated, deletion);
// bankRouter.delete('/banks-bulk', isAuthentificated, deletion);


export default bankRouter; 