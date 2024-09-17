require("dotenv").config();

import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { appConfig } from "../config/app.config";
import { redis } from "../utils/redis";
import { parseDMY } from "../utils/formatter";
import ErrorHandler from "../utils/errorHandler";
import userModel from "../models/user.model";
import requestModel from "../models/request.model";
import requestDetailModel from "../models/requestDetail.model";


export const readAll = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.params.id;

      // check if the provided ressource id is valid
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return next(new ErrorHandler("Invalid ressource id", 400));
      }

      const datas = await requestDetailModel
        .find({ request: requestId })
        // .populate({
        //   path: "request",
        //   select: "reference _id",
        //   model: requestModel,
        // })
        .sort({ createdAt: -1 });

      // const result = datas.map((item) => ({
      //   ...item["_doc"],
      //   reference: item.reference ? item.reference?.reference : null,
      // }));

      return res.status(200).json({
        success: true,
        data: datas,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


export const bulkCreate = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.params.id;

      // check if the provided ressource id is valid
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return next(new ErrorHandler("Invalid ressource id", 400));
      }

      // check if the user id is valid
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      //TODO: check if the user is the assignee of the record

      let data = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        return next(new ErrorHandler("Invalid params format", 400));
      }

      data = data.map((item: any) => ({
        ...item,
        amountTopaid: item.amountUnpaid ?? 0,
        request: requestId
      }));

      await requestDetailModel.insertMany(data);

      res.status(201).json({
        success: true,
        message: "Bulk request details created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


export const bulkUpdate = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.params.id;

      // check if the provided ressource id is valid
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return next(new ErrorHandler("Invalid ressource id", 400));
      }

      // check if the user id is valid
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      let data = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        return next(new ErrorHandler("Invalid params format", 400));
      }

      // // Vérifier le format des mises à jour
      // for (const row of data) {
      //   if (!row.hasOwnProperty('_id') || typeof row._id !== 'string'
      //     || !row.hasOwnProperty('selected') || typeof row.selected !== 'boolean'
      //     || !row.hasOwnProperty('amountTopaid') || typeof row.amountTopaid !== 'number') {
      //     return res.status(400).json({ error: 'Invalid update format' });
      //   }
      // }
       // Data needed to be an array of objects
      // updateOne: {
      //   filter: { _id: row._id },
      //   update: {
      //     selected: row.selected,
      //     amountTopaid: row.amountTopaid,
      //   },
      // },

      await requestDetailModel.bulkWrite(data);

      res.status(200).json({
        success: true,
        message: "successfully Bulk updated request details",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


export const fulldelete = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      // check if the provided courseId is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid request id", 400));
      }
      const requestDetail = await requestDetailModel.findById(id);
      if (!requestDetail) {
        return next(new ErrorHandler("Request not found", 404));
      }
      await requestDetailModel.deleteOne({ _id: id });

      return res.status(200).json({
        success: true,
        message: "RequestDetail deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


/*
 * create is an asynchronous function that creates a record in the database.
 * It first retrieves the user information from the database, and then creates records with the provided data,
 * including the payment date, the name of the user who created the record, and the user's ID.
 * If the user is not found, it returns an error with a 401 (Unauthorized) status code.
 */
export const create = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.params.id;

      // check if the provided ressource id is valid
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return next(new ErrorHandler("Invalid ressource id", 400));
      }

      // check if the user id is valid
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      //TODO: check if the user is the assignee of the record

      const data = { ...req.body }

      const request = await requestDetailModel.create(data);

      res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/*
 * update, is an asynchronous function
 * that update a speficic record with the provided information
 */
export const update = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.params.id;

      // check if the provided ressource id is valid
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return next(new ErrorHandler("Invalid ressource id", 400));
      }


      // get the user information
      const user = await userModel.find(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      // let data = {
      //   ...req.body,
      //   modifiedBy: user._id,
      // };
      // if (req.body.payment_date) {
      //   //TODO
      //   console.log("TODO fix issue in edit request feature")
      //   data = {
      //     ...data,
      //     payment_date: parseDMY(req.body.payment_date),
      //   };
      // }
      // // For validation
      // if (req.body.status === appConfig.status[3]) {
      //   data = {
      //     ...data,
      //     validator: user._id,
      //     validetedAt: new Date()
      //   };
      // }
      // // For Reject
      // if (req.body.status === appConfig.status[4]) {
      //   data = {
      //     ...data,
      //     validator: user._id,
      //     validetedAt: new Date(),
      //     refusal: true,
      //   };
      // }

      // const result = await requestModel.findByIdAndUpdate(
      //   requestId,
      //   { $set: data },
      //   { new: true }
      // );

      // // // Put into Redis for caching futur purpose
      // // await redis.set(
      // //   requestId,
      // //   JSON.stringify(result),
      // //   "EX",
      // //   appConfig.redis_session_expire
      // // );

      // return res.status(200).json({
      //   success: true,
      //   message: "Resource updated successfully",
      //   data: result,
      // });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/*
 * softDelete, is an asynchronous function
 * that update a specicif record to a deleted status 
 * so simple user can not see them again
 */
export const softDelete = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // check if the provided courseId is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid ressource id", 400));
      }
      const request = await requestModel.findById(id);
      if (!request) {
        return next(new ErrorHandler("ressource not found", 404));
      }
      // get the user information
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      await requestModel.findByIdAndUpdate(
        id,
        {
          $set: {
            deleted: true,
            deletedBy: user._id,
            deletedAt: new Date(),
          },
        },
        { new: true }
      );
      await redis.del(id);

      return res.status(200).json({
        success: true,
        message: "Request soft deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


//---------------------------------------------------------
//            SOFT BULK DELETE REQUEST
//---------------------------------------------------------
export const bulkSolftDelete = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // check if the provided courseId is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid request id", 400));
      }
      const request = await requestModel.findById(id);
      if (!request) {
        return next(new ErrorHandler("Request not found", 404));
      }
      await request.deleteOne({ _id: id });
      await redis.del(id);

      return res.status(200).json({
        success: true,
        message: "Request deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
