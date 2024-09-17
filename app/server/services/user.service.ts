import { Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/errorHandler";

// get user by id
export const getUserByIdService = async (id: string, res: Response) => {
  const userJSON = await redis.get(id);
  if (userJSON) {
    const user = JSON.parse(userJSON);
    res.status(200).json({
      success: true,
      user: user,
    });
  }
};

// get all users
export const getAllUsersService = async (res: Response) => {
  //   const usersJSON = await redis.get("allusers");
  //   if (usersJSON) {
  //     const users = JSON.parse(usersJSON);
  //     res.status(200).json({
  //       success: true,
  //       users,
  //     });
  //   } else {
  //     const users = await userModel.find().sort({ createdAt: -1 });
  //     await redis.set("allusers", JSON.stringify(users));
  //     res.status(200).json({
  //       success: true,
  //       users,
  //     });
  //   }
  const users = await userModel.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    users,
  });
};


// update user role
export const updateUserRoleService = async (res: Response, userId: string, role: string) => {

  const user = await userModel.findByIdAndUpdate(userId, { role }, { new: true });

  res.status(201).json({
    success: true,
    user: user,
  });
};