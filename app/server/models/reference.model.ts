require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";

export interface Ireference extends Document {
  reference: string;
}

const referenceSchema : Schema<Ireference> = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true
    },
  },
  { timestamps: true }
);

const referenceModel: Model<Ireference> = mongoose.model("references", referenceSchema);

export default referenceModel;
