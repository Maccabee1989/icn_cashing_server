import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { appConfig } from "../config/app.config";
import { redis } from "../utils/redis";

// Authenticated User
export const  isAuthentificated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

        // const access_token = req.headers.authorization;
        const access_token = req.cookies.access_token;
        if (!access_token) {
            return next(new ErrorHandler( "Unauthorized: Please login to access this ressource", 401))
        }

        const decoded = jwt.verify(access_token,appConfig.access_token_secret as string) as JwtPayload;
        if (!decoded) {
            return next(new ErrorHandler( "Unauthorized: Access token is not valid", 401))
        }

        const user = await redis.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler( "Unauthorized: Please login to access this ressource", 401))
        }

        req.user = JSON.parse(user);

        next();

  
});

// Validate User Role
export const  authorizeRoles = (...roles: string[]) => { 
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler(`Forbidden: Role: ${req.user?.role} is not allowed to access this ressource`,403))
        }
        next();
    }
}