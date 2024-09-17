require("dotenv").config();

import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { sqlQuery } from "../config/request";
import { isEmpty } from "../utils/formatter";
import ErrorHandler from "../utils/errorHandler";
import { executeQuery, getConnection, releaseConnection } from "../utils/db.oracle";
import { format } from "date-fns";


//---------------------------------------------------------
//              get all Unpaid Bills Using Query Parameters
//---------------------------------------------------------
export const getUnpaidBills = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      // Get Query Parameters
      const { by: searchBy, type } = req.query;
      const searchType: string = type?.toString() ?? "one";
      // check user information
      const authorizeSearchBy: string[] = ["invoice", "contract", "regroup", "customer"];
      const authorizeType: string[] = ["many", "one"];
      const orderBy: string[] = ["asc", "desc"];
      const limit: string[] = ["10", "50", "100"];
      if (isEmpty(searchBy)) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }
      if (searchBy) {
        if (!authorizeSearchBy.includes(searchBy.toString())) {
          return next(new ErrorHandler("Invalid parameters", 400));
        }
        if (!authorizeType.includes(searchType.toString())) {
          return next(new ErrorHandler("Invalid parameters", 400));
        }
      }

      switch (searchBy) {
        case "invoice":
          getUnpaidBillsByInvoiceNumber(req, res, next);
          break;
        case "contract":
          getUnpaidBillsByContractNumber(req, res, next);
          break;
        case "regroup":
          getUnpaidBillsByCustomerRegroupNumber(req, res, next);
          break;
        case "customer":
          getUnpaidBillsByCustomerName(req, res, next);
          break;
        default:
          return res.status(200).json({
            success: true,
            bills: []
          });
          break;
      }


    } catch (error: any) {
      console.error('Internal error:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  }

);


//---------------------------------------------------------
//              get all Unpaid Bills By Invoice Number 
//---------------------------------------------------------
export const getUnpaidBillsByInvoiceNumber = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    let connection;
    try {
      // Get Invoice Number from the query params 
      const { value: invoice_number } = req.query;

      // Fetch data from the database
      connection = await getConnection();
      const result = await connection.execute(sqlQuery.unpaid_bills_by_invoice_number, [invoice_number]);

      // send the response
      res.status(200).json({
        success: true,
        bills: result.rows
      });
    } catch (error: any) {
      // Catch the error and return and error response
      console.error('Internal error:', error);
      return next(new ErrorHandler(error.message, 500));
      //res.status(500).json({ error: 'Erreur interne du serveur' });
    } finally {
      // close the connection to the database
      if (connection) {
        await releaseConnection(connection);
      }
    }
  }

);


//---------------------------------------------------------
//              get all Unpaid Bills By Contract Number 
//---------------------------------------------------------
export const getUnpaidBillsByContractNumber = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      // Get date param from query parameters
      const { value: contract_number, from: FromDate, to: ToDate } = req.query;

      // TODO :  Define the contraint due to the period 
      if (isEmpty(contract_number) || isEmpty(FromDate) || isEmpty(ToDate)) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }
      if (!FromDate || !ToDate) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }

      // Fetch data from the database
      const result = await executeQuery(
        sqlQuery.unpaid_bills_by_contract_number,
        [
          contract_number,
          format(FromDate.toString(), "dd/MM/yyyy"),
          format(ToDate.toString(), "dd/MM/yyyy")
        ]
      );

      // send the response
      return res.status(200).json({
        success: true,
        bills: result.rows
      });

    } catch (error: any) {
      // Catch the error and return and error response
      console.error('Internal error:', error);
      return next(new ErrorHandler(error.message, 500));
      //res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }

);





//---------------------------------------------------------
//              get all Unpaid Bills By CustomerRegroup Number 
//---------------------------------------------------------
export const getUnpaidBillsByCustomerRegroupNumber = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { value, from: FromDate, to: ToDate } = req.query;
      // TODO :  Define the contraint due to the period 
      if (isEmpty(value) || isEmpty(FromDate) || isEmpty(ToDate)) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }
      if (!FromDate || !ToDate) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }

      // Fetch data from the database
      const result = await executeQuery(
        sqlQuery.unpaid_bills_by_customer_regroup_number,
        [
          value,
          format(FromDate.toString(), "dd/MM/yyyy"),
          format(ToDate.toString(), "dd/MM/yyyy")
        ]
      );

      return res.status(200).json({
        success: true,
        bills: result.rows
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              get all Unpaid Bills By Customer Name
//---------------------------------------------------------
export const getUnpaidBillsByCustomerName = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { value, from: FromDate, to: ToDate } = req.query;

      // TODO :  Define the contraint due to params
      if (isEmpty(value) || isEmpty(FromDate) || isEmpty(ToDate)) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }

      if (!FromDate || !ToDate) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }

      // Fetch data from the database
      const result = await executeQuery(
        sqlQuery.unpaid_bills_by_customer_name,
        [
          value,
          format(FromDate.toString(), "dd/MM/yyyy"),
          format(ToDate.toString(), "dd/MM/yyyy")
        ]
      );
      return res.status(200).json({
        success: true,
        bills: result.rows
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

//---------------------------------------------------------
//              get all Unpaid Bills On List
//---------------------------------------------------------
export const getUnpaidBillsOnList = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      console.log("getUnpaidBillsOnList")
      // Fetch data from the database
      const result = await executeQuery(sqlQuery.unpaid_bills_on_list, []);

      return res.status(200).json({
        success: true,
        bills: result.rows
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);


//---------------------------------------------------------
//              get all Unpaid Bills On List With Account
//---------------------------------------------------------
export const getUnpaidBillsOnListWithAccount = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { value, from: FromDate, to: ToDate } = req.body;

      // TODO :  Define the contraint due to the period 
      if (isEmpty(value) || isEmpty(FromDate) || isEmpty(ToDate)) {
        return next(new ErrorHandler("Invalid parameters", 400));
      }
      // Fetch data from the database
      const result = await executeQuery(sqlQuery.unpaid_bills_on_list_with_account, [value, FromDate, ToDate]);

      return res.status(200).json({
        success: true,
        bills: result.rows
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);
