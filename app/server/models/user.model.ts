require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPassword, passwordPolicy } from "../utils/validator";
import { appConfig } from "../config/app.config";
import { expiredFormat } from "../utils/jwt";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    requests: Array<{ requestId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
    signAccessToken: () => string;
    signRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return isValidEmail(value);
            },
            message: "Please enter a valid email",
        },
        unique: true,
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
        // required: [true, "Please enter your password"],
        // validate: {
        //     validator: function (value: string) {
        //         return isValidPassword(value);
        //     },
        //     message: `Password Policy : ${passwordPolicy}`,
        // },
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    requests: [
        {
            requestId: String,
        }
    ],


}, { timestamps: true });

// Hash Password before saving
userSchema.pre('save', async function (next) {
    // do stuff
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Sign access token when login
userSchema.methods.signAccessToken =  function () {
    return jwt.sign({id: this._id} , appConfig.access_token_secret , { expiresIn: expiredFormat(appConfig.access_token_expire) } )
}

// Sign refresh token when login
userSchema.methods.signRefreshToken =  function () {
    return jwt.sign({id: this._id} , appConfig.refresh_token_secret, { expiresIn: expiredFormat(appConfig.refresh_token_expire) })
}

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

const userModel: Model<IUser> = mongoose.model("users", userSchema);

export default userModel;