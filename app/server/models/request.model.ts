require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISchemaModel extends Document {
  reference: string;
  status: string;
  name: string;
  amount: number;
  bank: mongoose.Schema.Types.ObjectId;
  payment_mode: mongoose.Schema.Types.ObjectId;
  payment_date: Date;
  userId: mongoose.Schema.Types.ObjectId;
  validator: mongoose.Schema.Types.ObjectId;
  validetedAt: Date;
  refusal: boolean;
  reason_for_refusal: string;
  assignTo: string;
  createdBy: string;
  modifiedBy: string;
  deleted: boolean;
  deletedBy: string;
  deletedAt: Date;
}

const recordSchema: Schema<ISchemaModel> = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: false,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users', // Référence au modèle 'userModel'
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'banks', // Référence au modèle 'bankModel'
      required: true,
    },
    payment_date: {
      type: Date,
      required: true,
    },
    payment_mode: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: 'payment_modes', // Référence au modèle 'payModeModel'
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "draft",
    },
    assignTo: {
      type: String,
      required: false,
    },
    validator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users', // Référence au modèle 'userModel'
      required: false,
    },
    validetedAt: {
      type: Date,
      required: false,
    },
    refusal: {
      type: Boolean,
      required: false,
      default: false,
    },
    reason_for_refusal: {
      type: String,
      required: false,
    },
    createdBy: {
      type: String,
      required: false,
    },
    modifiedBy: {
      type: String,
      required: false,
    },
    deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    deletedBy: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

// recordSchema.pre('findByIdAndUpdate', async function (next) {
//   // do stuff
  
//   next();
// });

const requestModel: Model<ISchemaModel> = mongoose.model("requests", recordSchema);

export default requestModel;

