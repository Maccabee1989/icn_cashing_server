require("dotenv").config();
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import {
  isValidEmail,
  isValidPassword,
  passwordPolicy,
} from "../utils/validator";
import { appConfig } from "../config/app.config";
import {
  accessTokenOptions,
  expiredFormat,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import {
  getAllUsersService,
  getUserByIdService,
  updateUserRoleService,
} from "../services/user.service";
import mongoose from "mongoose";

const activation_token_secret = appConfig.activation_token_secret;
//-----------------------------------------------
//              Register User
//-----------------------------------------------
interface IRegistationRequest {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return next(
          new ErrorHandler("Please enter your name, email and password", 400)
        );
      }

      if (!isValidEmail(email)) {
        return next(new ErrorHandler("Invalid Email format", 400));
      }

      if (!isValidPassword(password)) {
        return next(
          new ErrorHandler(`Invalid Password : ${passwordPolicy}`, 400)
        );
      }

      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const user: IRegistationRequest = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      // activationCode
      const activationCode = activationToken.activationCode;
      // TTL of the activation token
      const activationCodeExpire = Math.floor(
        parseInt(appConfig.activation_token_expire) / 60
      );

      const data = {
        user: { name: user.name },
        activationCode,
        activationCodeExpire,
        supportmail: appConfig.support_mail
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation.mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Activation of your account",
          template: "activation.mail.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email : ${user.email} to activate your account`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// IActivationToken
interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    activation_token_secret as Secret,
    { expiresIn: expiredFormat(appConfig.activation_token_expire) }
  );

  return { token, activationCode };
};

//-----------------------------------------------
//               Activate User  /activate
//-----------------------------------------------

// IActivationRequest
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      if (activation_token === undefined || activation_code === undefined) {
        return next(
          new ErrorHandler(
            "Invalid request, please provide activation_code and activation_token",
            400
          )
        );
      }

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        activation_token_secret as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = newUser.user;

      const existUser = await userModel.findOne({ email });
      if (existUser) {
        return next(new ErrorHandler("Email already exist", 400));
      }
      const user = await userModel.create({ name, email, password });

      res.status(201).json({
        success: true,
        message: `Your account is activate`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//-----------------------------------------------
//               Login User  /login
//-----------------------------------------------

// ILoginRequest
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter Email and Password", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 400));
      }

      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 400));
      }

      // When every thing is ok send Token to user
      // TODO : enregistrer la date de connection dans l historique des connection
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//-----------------------------------------------
//               Logout User /logout
//-----------------------------------------------

export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      // Delete in redis the user_id
      const userId = req.user?._id || "";
      redis.del(userId);

      // TODO : enregistrer la date de deconnection
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//-----------------------------------------------
//              Update User Access Token /user/refresh
//-----------------------------------------------

export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const refresh_token = req.headers.refresh_token;
      const refresh_token = req.cookies.refresh_token as string;

      const message = "Could not refresh token , please login for access this ressource.";
      if (!refresh_token) {
        return next(new ErrorHandler(message, 400));
      }

      const decoded = jwt.verify(
        refresh_token,
        appConfig.refresh_token_secret as string
      ) as JwtPayload;
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }

      const session = await redis.get(decoded.id);
      if (!session) {
        return next(new ErrorHandler(message, 400));
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        appConfig.access_token_secret,
        { expiresIn: expiredFormat(appConfig.access_token_expire) }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        appConfig.refresh_token_secret,
        { expiresIn: expiredFormat(appConfig.refresh_token_expire) }
      );

      // Add User in the request to user it in any request
      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      //Update redis session
      redis.set(user._id, JSON.stringify(user), "EX", appConfig.redis_session_expire);

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//-----------------------------------------------
//       Get All Users  -- only for admin users
//-----------------------------------------------
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//-----------------------------------------------
//              Get User /user/me
//-----------------------------------------------

export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const user = getUserByIdService(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//-----------------------------------------------
//              Update User /user
//-----------------------------------------------

interface IUpdateUserRequest {
  email?: string;
  name?: string;
  avatar?: string;
}

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, avatar } = req.body as IUpdateUserRequest;

      const userId = req.user?._id;

      const user = await userModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("Invalid User", 400));
      }

      // Change User email
      if (email && user) {
        if (!isValidEmail(email)) {
          return next(new ErrorHandler("Invalid Email format", 400));
        }

        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already exist", 400));
        }

        user.email = email;
      }

      // Change User name
      if (name && user) {
        const isNameExist = await userModel.findOne({ name });
        if (isNameExist) {
          return next(new ErrorHandler("Name already exist use", 400));
        }
        user.name = name;
      }

      // TODO: Change User profile picture
      // Change User profile picture
      // if (avatar && user) {
      //   if (user?.avatar?.public_id) {
      //     // delete the old image
      //     await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
      //   }
      //   const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      //     folder: "avatars",
      //     width: 150,
      //   });
      //   user.avatar = {
      //     public_id: myCloud.public_id,
      //     url: myCloud.secure_url,
      //   };
      // }

      // Save changes
      await user?.save();
      //Update redis session
      redis.set(userId, JSON.stringify(user) as any,"EX",appConfig.redis_session_expire);

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//-----------------------------------------------
//              Update User Password /user/update-password
//-----------------------------------------------

interface IUpdateUserPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const updateUserPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } =
        req.body as IUpdateUserPasswordRequest;
      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please enter old and new password", 400));
      }

      if (!isValidPassword(newPassword)) {
        return next(
          new ErrorHandler(
            `New password does not respect our Security Password Policy: ${passwordPolicy}`,
            400
          )
        );
      }

      const userId = req.user?._id;
      const user = await userModel.findById(userId).select("+password");
      if (user?.password === undefined) {
        return next(
          new ErrorHandler(
            "You use Social Authentification, please you can't Update your password",
            400
          )
        );
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password", 400));
      }

      user.password = newPassword;

      // Save changes
      await user.save();
      //Update redis session
      redis.set(userId, JSON.stringify(user),'EX',appConfig.redis_session_expire);

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//---------------------------------------------------------------------
//              Update User role /user/role -- only for admin users
//---------------------------------------------------------------------

interface IUpdateUserRoleRequest {
  userId: string;
  role: string;
}

export const updateUserRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("first update user role");
    try {
      const { userId, role } = req.body as IUpdateUserRoleRequest;
      if (!userId || !role) {
        return next(
          new ErrorHandler(
            "Invalid data provided please ckeck the documentation",
            400
          )
        );
      }
      // check if the provided contentId is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorHandler("Invalid userId id", 400));
      }
      const validRoles: string[] = ["admin", "teacher", "user"];
      if (!validRoles.includes(role)) {
        return next(new ErrorHandler("Invalid 'role'", 400));
      }

      const user = await userModel.findById(userId);
  
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      updateUserRoleService(res, userId, role);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//-----------------------------------------------
//              Delete User -- only for admin users
//-----------------------------------------------
export const deleteUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // check if the provided userId is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid userId id", 400));
      }
      const user = await userModel.findById(id);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      await user.deleteOne({ _id: id });
      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//-----------------------------------------------
//       Social Authentification  /social-auth
//-----------------------------------------------

interface ISocialAuthRequest {
  email: string;
  name: string;
  avatar: string;
}

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialAuthRequest;

      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({ email, name, avatar });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//-----------------------------------------------
//       LDAP Authentification  /social-auth
//-----------------------------------------------
// TODO ldap multi organisation
interface ILDAPAuthRequest {
  email: string;
  password: string;
}

export const lDAPAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILDAPAuthRequest;

      const user = await userModel.findOne({ email });
      if (!user) {
        // TODO
      } else {
        // TODO
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
