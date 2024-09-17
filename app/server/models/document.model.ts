require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";

export interface Idoc extends Document {
    Transaction_ID: String;
    Sub_transaction_Type: String;
    Bill_Partner_Company_name: String;
    Bill_partner_company_code: String;
    Bill_Number: String;
    Bill_Account_Number: String;
    Bill_Due_Date: Date;
    Paid_Amount: Number;
    Paid_Date: Date;
    Paid_By_MSISDN: String;
    Transaction_Status: String;
    OM_Bill_Payment_Status: String;
}

const schema: Schema<Idoc> = new mongoose.Schema(
    {
        Transaction_ID: {
            type: String,
            required: true,
        },
        Sub_transaction_Type: {
            type: String,
            required: true,
        },
        Bill_Partner_Company_name: {
            type: String,
            required: true,
        },
        Bill_partner_company_code: {
            type: String,
            required: true,
        },
        Bill_Number: {
            type: String,
            required: true,
        },
        Bill_Account_Number: {
            type: String,
            required: true,
        },
        Bill_Due_Date: {
            type: Date,
            required: true,
        },
        Paid_Amount: {
            type: String,
            required: true,
        },
        Paid_Date: {
            type: Date,
            required: true,
        },
        Paid_By_MSISDN: {
            type: String,
            required: true,
        },
        Transaction_Status: {
            type: String,
            required: true,
        },
        OM_Bill_Payment_Status: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

const documentModel: Model<Idoc> = mongoose.model(
    "documents",
    schema
);

export default documentModel;
