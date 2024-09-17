require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  status: string;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
    
  },
  { timestamps: true }
);

const notificationModel: Model<INotification> = mongoose.model("notifications", notificationSchema);

export default notificationModel;
