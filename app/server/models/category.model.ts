require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface ICategory extends Document {
  name: string;
}

const categorySchema: Schema<ICategory> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const categoryModel: Model<ICategory> = mongoose.model("category", categorySchema);

export default categoryModel;
