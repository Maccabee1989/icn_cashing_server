require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import mongoose from "mongoose";
import { redis } from "../utils/redis";
import bankModel from "../models/bank.model";
import userModel from "../models/user.model";
import { createBankService, getAllBankService, revalidateBankService } from "../services/bank.service";


//-----------------------------------------------
//      GET All  
//-----------------------------------------------
export const getAll = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      getAllBankService(res, next);
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
        createBankService(req.body, res, next);
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

//-----------------------------------------------
//      READ
//-----------------------------------------------
export const read = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const requestId = req.params.id;
      getAllBankService(res, next);
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
      let data;
      const requestId = req.params.id;
      if (requestId) {
        data = await bankModel.findByIdAndUpdate(
          requestId,
          { $set: req.body },
          { new: false },
        );
      } else if (req.body.name) {
        data = await bankModel.findOneAndUpdate(
          { 'name': req.body.name },
          { $set: req.body },
          { new: false, runValidators: true }
        );
      }
      await redis.set(data?._id, JSON.stringify(data));
      revalidateBankService();

      return res.status(200).json({
        success: true,
        data,
      });


    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);


//-----------------------------------------------
//      DELETE
//-----------------------------------------------
export const deleteOne = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const requestId = req.params.id;
      getAllBankService(res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

