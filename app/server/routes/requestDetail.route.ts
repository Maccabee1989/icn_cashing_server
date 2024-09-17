import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import {
    readAll,
    create,
    update,
    softDelete,
    fulldelete,
    bulkCreate,
    bulkUpdate,
    bulkSolftDelete, 
} from "../controllers/requestDetail.controller";


const requestDetailRouter = express.Router();

requestDetailRouter.get('/request-details/:id', isAuthentificated, readAll);
requestDetailRouter.post('/request-details-bulk/:id', isAuthentificated, authorizeRoles("user","admin"), bulkCreate); 
requestDetailRouter.put('/request-details-bulk/:id', isAuthentificated, authorizeRoles("user","admin"), bulkUpdate);


requestDetailRouter.post('/request-details/:id', isAuthentificated, create);
requestDetailRouter.delete('/request-details', isAuthentificated, fulldelete);


export default requestDetailRouter; 