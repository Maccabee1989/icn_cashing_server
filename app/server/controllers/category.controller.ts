require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import { isEmpty, parseDMY } from "../utils/formatter";
import requestModel from "../models/request.model";
import mongoose from "mongoose";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";
import { appConfig } from "../config/app.config";
import categoryModel from "../models/category.model";


//-----------------------------------------------
//      GET All REQUESTS 
//-----------------------------------------------
export const getAll = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const data = await categoryModel.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        data,
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              CREATE REQUEST
//---------------------------------------------------------
export const create = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const data = {
        ...req.body
      };

      const category = await categoryModel.create(data);

      res.status(201).json({
        success: true,
        data:category
      });


    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              READ REQUEST 
//---------------------------------------------------------
export const get = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const requestId = req.params.id;

      const isCachedExist = await redis.get(requestId);
      if (isCachedExist) {
        const request = JSON.parse(isCachedExist);
        return res.status(200).json({
          success: true,
          request,
        });
      } else {
        const request = await requestModel
          .findById(requestId)
          .select(
            '-_id -userId'
          );

        // Put into Redis for caching futur purpose
        await redis.set(requestId, JSON.stringify(request),'EX',appConfig.redis_session_expire);

        return res.status(200).json({
          success: true,
          request,
        });
      }

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);



//---------------------------------------------------------
//              UPDATE REQUEST
//---------------------------------------------------------
export const update = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const data = req.body;

      const requestId = req.params.id;
      const request = await requestModel.findByIdAndUpdate(
        requestId,
        { $set: data },
        { new: true }
      );
      // TODO update redis courseId and allCourses
      return res.status(200).json({
        success: true,
        request,
      });


    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              DELETE REQUEST
//---------------------------------------------------------
export const deletion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { id } = req.params;
      // check if the provided courseId is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid category id", 400));
      }
      const category = await categoryModel.findById(id);
      if (!category) {
        return next(new ErrorHandler("Category not found", 404));
      }
      await category.deleteOne({ _id: id })
      await redis.del(id)

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);