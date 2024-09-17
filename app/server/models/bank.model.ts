require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IBank extends Document {
  name: string;
}

const schema: Schema<IBank> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const bankModel: Model<IBank> = mongoose.model("banks", schema);

export default bankModel;
