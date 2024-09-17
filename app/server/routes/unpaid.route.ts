import express from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import {
    getUnpaidBills,
    getUnpaidBillsByContractNumber,
    getUnpaidBillsByInvoiceNumber,
    getUnpaidBillsByCustomerRegroupNumber,
    getUnpaidBillsByCustomerName,
    getUnpaidBillsOnList,
    getUnpaidBillsOnListWithAccount
} from "../controllers/unpaid.controller";

const unpaidRouter = express.Router();

unpaidRouter.get('/search-unpaid', isAuthentificated, getUnpaidBills);
unpaidRouter.get('/search-unpaid/by-contractNumber', isAuthentificated, getUnpaidBillsByContractNumber);
unpaidRouter.get('/search-unpaid/by-invoiceNumber', isAuthentificated, getUnpaidBillsByInvoiceNumber);
unpaidRouter.get('/search-unpaid/by-customerRegroupNumber', isAuthentificated, getUnpaidBillsByCustomerRegroupNumber);
unpaidRouter.get('/search-unpaid/by-customerName', isAuthentificated, getUnpaidBillsByCustomerName);
unpaidRouter.get('/search-unpaid/onList', isAuthentificated, getUnpaidBillsOnList);
unpaidRouter.get('/search-unpaid/onListWithAccount', isAuthentificated, getUnpaidBillsOnListWithAccount);

export default unpaidRouter; 