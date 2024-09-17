import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

export const ErrorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong mongodb Id error
    if (err.name === "CastError") {
        const message = `Ressource not found, Invalid: ${err.path}`
        err = new ErrorHandler(message, 404);
    }

    // mongoose duplicate key error
    if (err.code === "11000") {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.code === "JsonWebTokenError") {
        const message = `Json Web Token is invalid , Try again`
        err = new ErrorHandler(message, 400);
    }

    // Expire JWT error
    if (err.code === "TokenExpiredError") {
        const message = `Json Web Token is expired , Try again`
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })

}