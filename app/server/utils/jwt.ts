require("dotenv").config();
import { IUser } from "../models/user.model";
import { Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { redis } from "./redis";
import { appConfig } from "../config/app.config";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

//parse environnement variables to integrate with fallback values
const accessTokenExpire = parseInt(appConfig.access_token_expire, 10);
const refreshTokenExpire = parseInt(appConfig.refresh_token_expire, 10);

// Options for cookies 
// The is a issue with timezone we add 1h (3600) from universal time
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + (3600 + accessTokenExpire) * 1000 ),
    maxAge: (3600 + accessTokenExpire) * 1000 ,
    httpOnly: true,
    sameSite: 'lax',
}

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + (3600 + refreshTokenExpire) * 1000 ),
    maxAge: (3600 + refreshTokenExpire) * 1000,
    httpOnly: true,
    sameSite: 'lax',
}


export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken =  user.signAccessToken();
    const refreshToken = user.signRefreshToken();

    //Upload session to redis
    redis.set(user._id,JSON.stringify(user) as any,"EX",appConfig.redis_session_expire) 


    // Only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }
    
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
        refreshToken
    });
}

export const expiredFormat = (token_expire_in_second: string) => {
    const expire = Math.floor(parseInt(token_expire_in_second)/60);
    return `${expire}m`
}

export const expiredFormatD = (token_expire_in_day: string) => {
    return `${token_expire_in_day}d`
}

