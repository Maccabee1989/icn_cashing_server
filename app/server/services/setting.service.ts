import { Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/errorHandler";
import settingModel from "../models/setting.model";


const redis_allrecord_name = "allsettings";

export const revalidateSettingService = async () => {
  const settings = await settingModel.find().sort({ createdAt: -1 });
  await redis.set(redis_allrecord_name, JSON.stringify(settings));
}

// get all setting
export const getAllSettingService = async (res: Response, next: NextFunction) => {
  try {
    const redis_data = await redis.get(redis_allrecord_name);
    if (redis_data) {
      const data = JSON.parse(redis_data);
      res.status(200).json({
        success: true,
        data,
      });
    } else {
      const data = await settingModel.find().sort({ createdAt: -1 });
      await redis.set(redis_allrecord_name, JSON.stringify(data));
      res.status(200).json({
        success: true,
        data,
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};


// get setting by id
export const createSettingService = async (body: any, res: Response, next: NextFunction) => {
  try {
    // search if the name already exists
    const isAlready = await settingModel.findOne({ 'name': body.name });
    if (isAlready) {
      return next(new ErrorHandler("Duplicate setting name", 400));
    } else {
      const data = await settingModel.create(body);
      revalidateSettingService();

      res.status(201).json({
        success: true,
        data
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};


// get setting by id
export const getSettingByIdService = async (id: string, next: NextFunction) => {
  try {
    const setting = await redis.get(id);
    if (setting) {
      const data = JSON.parse(setting);
      return data;
    } else {
      const data = await settingModel.find().sort({ createdAt: -1 });

      // await redis.set(data, JSON.stringify(data));
      // return data;
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
