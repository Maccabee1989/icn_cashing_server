require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IPayMode extends Document {
  name: string;
}

const schema: Schema<IPayMode> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const payModeModel: Model<IPayMode> = mongoose.model("payment_modes", schema);

export default payModeModel;
