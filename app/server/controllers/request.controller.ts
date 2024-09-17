require("dotenv").config();

import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { appConfig } from "../config/app.config";
import { redis } from "../utils/redis";
import { getCurrentMonthYear, parseDMY } from "../utils/formatter";
import ErrorHandler from "../utils/errorHandler";
import userModel from "../models/user.model";
import bankModel from "../models/bank.model";
import payModeModel from "../models/payMode.model";
import requestModel from "../models/request.model";
import referenceModel from "../models/reference.model";

/*
 * readAll, is an asynchronous function
 * that retrieves all records from a database and populates
 * the associated data for the bank and payment_mode fields
 * RMQ : if the user is an administrator it will also show the soft delete ressources
 */
export const readAll = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const soft = req.user?.role !== "admin" ? { deleted: false } : {};

      // Extracting the status filter from the request query
      const { status } = req.query;
      if (status && !appConfig.status.includes(status as string)) {
        return next(new ErrorHandler('Invalid status filter', 400));
      }

      // Build the query object
      const query: any = { ...soft };
      if (status) {
        query.status = { $in: ['initiated', 'validated'] }; // Add the status filter
      }
      if (req.user?.role == "validator" && !status ) {
        query.status = { $in: ['initiated'] }; // Add the status filter
      }
     

      const datas = await requestModel
        .find(query)
        .populate({
          path: "bank",
          select: "name _id",
          model: bankModel,
        })
        .populate({
          path: "payment_mode",
          select: "name _id",
          model: payModeModel,
        })
        .sort({ createdAt: -1 });

      const result = datas.map((item) => ({
        ...item["_doc"],
        bank: item.bank ? item.bank?.name : null,
        payment_mode: item.payment_mode ? item.payment_mode?.name : null,
      }));

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/*
 * bulkCreate is an asynchronous function that creates records in the database.
 * It first retrieves the user information from the database, and then creates records with the provided data,
 * including the payment date, the name of the user who created the record, and the user's ID.
 * If the user is not found, it returns an error with a 401 (Unauthorized) status code.
 */
export const bulkCreate = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate that the request body is an array
      const requests = req.body;

      if (!Array.isArray(requests) || requests.length === 0) {
        return next(new ErrorHandler("Request body must be a non-empty array", 400));
      }

      // get the user information
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      const payMode = await payModeModel.findOne();
      if (!payMode) {
        return next(new ErrorHandler("Payment mode not found", 400));
      }

      const validRequests = [];
      // Validate each request
      for (const requestData of requests) {

        const { name, amount, bank, payment_date } = requestData;
        console.log("requestData", requestData)
        // Validate required fields for each request
        if (!name || !amount || !bank || !payment_date) {
          return next(new ErrorHandler("All fields (payment_date, name, amount, bank) are required for each request", 400));
        }

        // Generate a unique reference if it's not provided
        const uniqueReference = await genereteICNRef(parseDMY(payment_date));

        validRequests.push({
          reference: uniqueReference,
          name,
          amount,
          bank,
          payment_date: parseDMY(payment_date),
          payment_mode: payMode?._id,
          createdBy: user._id,
          modifiedBy: user._id,
          userId: user._id,
        });

      }

      // Insert all valid requests into the database
      const createdRequests = await requestModel.insertMany(validRequests);

      res.status(201).json({
        success: true,
        data: createdRequests,
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
      // Validate required fields
      const { name, amount, bank, payment_mode, payment_date, ...rest } = req.body;

      if (!name) {
        return next(new ErrorHandler("Name is required", 400));
      }
      if (!amount) {
        return next(new ErrorHandler("Amount is required", 400));
      }
      if (!bank) {
        return next(new ErrorHandler("Bank is required", 400));
      }
      if (!payment_mode) {
        return next(new ErrorHandler("Bank is required", 400));
      }
      if (!payment_date) {
        return next(new ErrorHandler("Payment date is required", 400));
      }

      // get the user information
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      const data = {
        ...req.body,
        payment_date: parseDMY(req.body.payment_date),
        createdBy: user._id,
        modifiedBy: user._id,
        userId: user._id,
      };

      const request = await requestModel.create(data);

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
 * read, is an asynchronous function
 * that retrieves a speficic records from a database
 * without the associated
 */
export const read = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.params.id;

      // check if the provided courseId is valid
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return next(new ErrorHandler("Invalid record id", 400));
      }

      //check if the provided id is in the cache
      // const isCachedExist = await redis.get(requestId);
      // if (isCachedExist) {
      //   const data = JSON.parse(isCachedExist);
      //   return res.status(200).json({
      //     success: true,
      //     data,
      //   });
      // } else {
      const data = await requestModel
        .findById(requestId)
        .select("-_id -__v")
        .populate({
          path: "bank",
          select: "name _id",
          model: bankModel,
        })
        .populate({
          path: "payment_mode",
          select: "name _id",
          model: payModeModel,
        })
        ;

      // Put into Redis for caching futur purpose
      // await redis.set(
      //   requestId,
      //   JSON.stringify(data),
      //   "EX",
      //   appConfig.redis_session_expire
      // );

      return res.status(200).json({
        success: true,
        data,
      });
      //}
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

      // Check body request param for Security purpose
      if (
        req.body.userId ||
        req.body.assignTo ||
        req.body.createdAt ||
        req.body.createdBy ||
        req.body.createdBy ||
        req.body.modifiedBy ||
        req.body.deleted ||
        req.body.deletedBy ||
        req.body.deletedAt
      ) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      // get the user information
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return next(new ErrorHandler("Unauthorize ressource", 401));
      }

      let data = {
        ...req.body,
        modifiedBy: user._id,
      };
      if (req.body.payment_date) {
        data = {
          ...data,
          payment_date: new Date(req.body.payment_date),
        };
      }
      // For publish the request
      if (req.body.status === appConfig.status[2]) {

        const request = await requestModel
          .findById(requestId)
          .select("reference payment_date");

        if (!request?.reference && request?.payment_date) {
          data = {
            ...data,
            reference: await genereteICNRef(request.payment_date)
          };
        }

      }
      // For validation
      if (req.body.status === appConfig.status[3]) {
        data = {
          ...data,
          validator: user._id,
          validetedAt: new Date()
        };
      }
      // For Reject
      if (req.body.status === appConfig.status[4]) {
        data = {
          ...data,
          validator: user._id,
          validetedAt: new Date(),
          refusal: true,
        };
      }

      const result = await requestModel.findByIdAndUpdate(
        requestId,
        { $set: data },
        { new: true }
      );

      // // Put into Redis for caching futur purpose
      // await redis.set(
      //   requestId,
      //   JSON.stringify(result),
      //   "EX",
      //   appConfig.redis_session_expire
      // );

      return res.status(200).json({
        success: true,
        message: "Resource updated successfully",
        data: result,
      });
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

/*
 * fulldelete, is an asynchronous function
 * that delete a specific record in the database
 */
export const fulldelete = CatchAsyncError(
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


/**
 * The function `generateICNRef` generates a new reference based on the current date and the last
 * reference in the database collection.
 * @param {Date} date - The `genereteICNRef` function is designed to generate a new reference based on
 * the provided date. It retrieves the last reference from a database collection, extracts the sequence
 * number from it, increments the sequence number, and creates a new reference using the current month
 * and year along with the updated sequence
 * @returns The `genereteICNRef` function returns a new ICN reference number that is generated based on
 * the current date and the last reference number stored in the database. The function first retrieves
 * the last reference number from the database, then calculates a new reference number by incrementing
 * the sequence number part of the last reference number. If there is no last reference number found,
 * it generates a new reference number
 */
async function genereteICNRef(date: Date) {
  try {
    // Get last reference in the references database collection
    const lastReference = await referenceModel.findOne({}, {}, { sort: { '_id': -1 } });

    let newReference;
    if (lastReference) {
      // Extraction du numéro de séquence à partir de la dernière référence
      const lastSequenceNumber = parseInt(lastReference.reference.slice(4));
      newReference = `${getCurrentMonthYear(date.toDateString())}${String(lastSequenceNumber + 1).padStart(6, '0')}`;
    } else {
      // Première référence
      newReference = `${getCurrentMonthYear(date.toDateString())}000001`;
    }
    // Création d'un nouveau document dans la collection des références
    await referenceModel.create({ reference: newReference });

    return newReference;

  } catch (error) {
    throw new Error("An error occurred while genereting ICNRef");
  }


}