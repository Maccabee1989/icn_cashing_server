require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IInternCreditRequest extends Document {
  request: mongoose.Schema.Types.ObjectId;
  contract: string;
  invoice: string;
  name: string;
  amountUnpaid: number;
  amountTopaid: number;
  selected: boolean;
}

const internCreditRequestSchema: Schema<IInternCreditRequest> = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'requests', // Référence au modèle 'requestModel'
      required: true,
    },
    contract: {
      type: String,
      required: true,
    },
    invoice: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amountUnpaid: {
      type: Number,
      required: true,
    },
    amountTopaid: {
      type: Number,
      required: true,
    },
    selected: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  { timestamps: true }
);

const requestDetailModel: Model<IInternCreditRequest> = mongoose.model("requests_details", internCreditRequestSchema);

export default requestDetailModel;
