require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import mongoose from "mongoose";
import { redis } from "../utils/redis";
import settingModel from "../models/setting.model";
import userModel from "../models/user.model";
import { createSettingService, getAllSettingService, revalidateSettingService } from "../services/setting.service";


//-----------------------------------------------
//      GET All  
//-----------------------------------------------
export const getAll = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      getAllSettingService(res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              CREATE 
//---------------------------------------------------------
export const create = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      // get the user information
      const userJSON = await redis.get(req.user?._id);
      if (userJSON) {
        createSettingService(req.body, res, next);
      } else {
        const user = await userModel.findById(req.user?._id);
        if (!user) {
          return next(new ErrorHandler("Unauthorize ressource", 401));
        }
      }

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);


//---------------------------------------------------------
//              UPDATE 
//---------------------------------------------------------
export const update = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const requestId = req.params.id;
      let data;
      if (requestId) {
        await settingModel.findByIdAndUpdate(
          requestId,
          { $set: req.body },
          { new: false },
        );
      } else if (req.body.name) {
        await settingModel.findOneAndUpdate(
          { 'name': req.body.name },
          { $set: req.body },
          { new: false, runValidators: true }
        );
      }
      revalidateSettingService();

      return res.status(200).json({
        success: true,
        data,
      });


    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);
