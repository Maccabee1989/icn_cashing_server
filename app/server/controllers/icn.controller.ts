require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import { sqlQuery } from "../config/request";
import { executeQuery, getConnection, releaseConnection } from "../utils/db.oracle";
import { isEmpty } from "../utils/formatter";
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import documentModel from "../models/document.model";

//---------------------------------------------------------
//              GET ICN CODE 
//---------------------------------------------------------
export const generationOfIntegrationFile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      // Fetch data from the database
      const documents = await documentModel.find();

      // Création du contenu du fichier CSV
      let csvContent = `File Generated on=${moment().format('ddd MMM DD HH:mm:ss Z YYYY')}\nData for Date=${moment().format('DD/MM/YYYY')}|5701473|640816|3\n`;
      csvContent += 'Transaction_ID|Sub_transaction_Type|Bill_Partner_Company_name|Bill_partner_company_code|Bill_Number|Bill_Account_Number|Bill_Due_Date|Paid_Amount|Paid_Date|Paid_By_MSISDN|Transaction_Status|OM_Bill_Payment_Status\n';

      documents.forEach((doc) => {
        csvContent += `${doc.Transaction_ID}|${doc.Sub_transaction_Type}|${doc.Bill_Partner_Company_name}|${doc.Bill_partner_company_code}|${doc.Bill_Number}|${doc.Bill_Account_Number}|${moment(doc.Bill_Due_Date).format('DD/MM/YYYY HH:mm:ss')}|${doc.Paid_Amount}|${moment(doc.Paid_Date).format('DD/MM/YYYY HH:mm:ss')}|${doc.Paid_By_MSISDN}|${doc.Transaction_Status}|${doc.OM_Bill_Payment_Status}\n`;
      });

      // Génération du nom de fichier
      const timestamp = moment().format('MMDDYYYYHHmmss');
      const fileName = `AES_${timestamp}_PAIDBILLS.csv`;

      // Génération du chemin du fichier
      const outputDir = path.join(__dirname, '../output');
      const filePath = path.join(outputDir, fileName);

      // Créer le répertoire 'output' s'il n'existe pas
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      // Écriture du fichier
      fs.writeFileSync(filePath, csvContent);


      // send the response
      return res.status(200).json({
        success: true,
        file: `CSV file generated at ${filePath}`
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);


//---------------------------------------------------------
//              GET ICN CODE 
//---------------------------------------------------------
export const getICNNextCode = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      // Fetch data from the database
      const result = await executeQuery(sqlQuery.icn_next_code);

      // send the response
      return res.status(200).json({
        success: true,
        icn_code: result.rows[0][0] ?? ""
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              GET ICN DEMATERIALIZE CODE 
//---------------------------------------------------------
export const getICNDematerializeCode = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      // Fetch data from the database
      const result = await executeQuery(sqlQuery.icn_next_dematerialisation_code);

      // send the response
      return res.status(200).json({
        success: true,
        dematerialisation: result.rows[0][0] ?? ""
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);


//---------------------------------------------------------
//              GET GROUPES
//---------------------------------------------------------
export const getICNGroupes = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      // Fetch data from the database
      const result = await executeQuery(sqlQuery.select_groupes);

      // send the response
      return res.status(200).json({
        success: true,
        groupes: result.rows
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              GET GROUPES
//---------------------------------------------------------
export const getICN = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { id: icn_number, type } = req.body
      // TODO :  Define the contraint due to the period 
      if (isEmpty(icn_number)) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }

      let query = "";
      let value: string[] = [];
      switch (type) {
        case "full":
          console.log("Full")
          query = sqlQuery.icn_fulldata
          value = [icn_number];
          break;
        case "light":
          console.log("Light")
          query = sqlQuery.icn_lightdata
          value = [icn_number, icn_number, icn_number];
          break;
        default:
          console.log("oTher")
          query = sqlQuery.icn_infos;
          value = [icn_number];
          break;
      }
      const result = await executeQuery(query, value);

      // send the response
      return res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);
