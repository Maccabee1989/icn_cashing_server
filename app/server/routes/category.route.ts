import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { create, deletion, get, getAll, update } from "../controllers/category.controller";


const categoryRouter = express.Router();

categoryRouter.get('/categories',isAuthentificated,getAll);
categoryRouter.post('/categories',isAuthentificated, create);
categoryRouter.get('/categories/:id',isAuthentificated, get);
categoryRouter.put('/categories/:id', isAuthentificated, update);
categoryRouter.delete('/categories/:id', isAuthentificated, deletion);
categoryRouter.delete('/categories-bulk', isAuthentificated, deletion);


export default categoryRouter; 