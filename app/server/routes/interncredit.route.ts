import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import {
    getICNNextCode,
    getICNDematerializeCode,
    getICNGroupes,
    getICN,
    generationOfIntegrationFile
} from "../controllers/icn.controller";


const interncreditRouter = express.Router();

interncreditRouter.get('/icn/next-code', isAuthentificated, getICNNextCode);
interncreditRouter.get('/icn/next-dematerialization', isAuthentificated, getICNDematerializeCode);
interncreditRouter.get('/icn/groupes', isAuthentificated, getICNGroupes);
interncreditRouter.get('/icn', isAuthentificated, getICN);
interncreditRouter.get('/icn/documents', isAuthentificated, generationOfIntegrationFile);


export default interncreditRouter; 