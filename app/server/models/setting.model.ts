require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface Ischema extends Document {
  name: string;
  description?: string;
  value: string;
  status?: string;
}

const schema: Schema<Ischema> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: false,
    },
    value: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
      default: "active",
    },
    
  },
  { timestamps: true }
);

const settingModel: Model<Ischema> = mongoose.model("settings", schema);

export default settingModel;
