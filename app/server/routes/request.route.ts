import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import {
    readAll,
    read,
    create,
    update,
    softDelete,
    fulldelete,
    bulkCreate,
    bulkSolftDelete, 
} from "../controllers/request.controller";


const requestRouter = express.Router();

requestRouter.get('/requests', isAuthentificated, readAll);
requestRouter.post('/requests', isAuthentificated, authorizeRoles("user"), create);
requestRouter.get('/requests/:id', isAuthentificated, read);
requestRouter.put('/requests/:id', isAuthentificated, authorizeRoles("user","validador","admin"), update);
requestRouter.delete('/requests/:id', isAuthentificated, authorizeRoles("user"), softDelete);
+
requestRouter.post('/requests-bulk', isAuthentificated, authorizeRoles("user","admin"), bulkCreate);
requestRouter.delete('/requests-full/:id', isAuthentificated, authorizeRoles("admin"),fulldelete);
requestRouter.delete('/requests-bulk', isAuthentificated,authorizeRoles("admin"), bulkSolftDelete); //TODO


export default requestRouter; 