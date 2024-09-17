require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import requestModel from "../models/request.model";
import moment from "moment";
import { eachDayOfInterval, differenceInDays, format, isSameDay, subDays } from "date-fns";

export const summary = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from: fromDate, to: toDate } = req.query;

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const from = fromDate ? moment(fromDate.toString(), 'YYYY-MM-DD').toDate() : defaultFrom;
      const to = toDate ? moment(toDate.toString(), 'YYYY-MM-DD').toDate() : defaultTo;

      //Get the number of full days between the end and start dates.
      const periodLenght = differenceInDays(to, from) + 1;

      //Last period date for data comparaison with current date 
      const lastPeriodFrom = subDays(from, periodLenght);
      const lastPeriodTo = subDays(to, periodLenght);

      const currentPeriod = await fetchSummaryData(from, to);
      const lastPeriod = await fetchSummaryData(from, to);


      return res.status(200).json({
        success: true,
        data: {
          days: currentPeriod.days,
          transactions: {
            nber : currentPeriod.transactions,
            amount: currentPeriod.amountByStatus,
          } ,
          categories: {
            nber : currentPeriod.categories,
            amount: currentPeriod.categories_amount,
          }, 
          days_last: currentPeriod.days,
          transactions_last:{
            nber : lastPeriod.transactions,
            amount: lastPeriod.amountByStatus,
          },
          categories_last: {
            nber : lastPeriod.categories,
            amount: lastPeriod.categories_amount,
          }, 
        }

      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

async function fetchSummaryData(from: Date, to: Date) {
  // Récupération du nombre de requêtes par statut
  const countByStatus = await requestModel.aggregate([
    { $match: { payment_date: { $gte: from, $lte: to } } },
    { $group: { _id: '$status', count: { $count: {} }} }
  ]);
  const transactions = countByStatus.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
 
  const totalCount = countByStatus.reduce((acc, curr) => acc + curr.count, 0);

  const statusPercentages = countByStatus.map(item => ({
    status: item._id,
    percentage: (item.count / totalCount) * 100
  }));

  // Récupération du nombre total de requêtes
  const totalRequestCount = await requestModel.countDocuments({ payment_date: { $gte: from, $lte: to } });


  // Récupération du montant des requêtes par statut
  const sumAmountByStatus = await requestModel.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: '$status', totalAmount: { $sum: '$amount' } } }
  ]);

  const amountByStatus = sumAmountByStatus.reduce((acc, curr) => {
    acc[curr._id] = curr.totalAmount;
    return acc;
  }, {});
  console.log("amountByStatus",amountByStatus)
  //formatage pour l'api  
  const categories = countByStatus.map(categorie => {
    return {
      name: categorie._id,
      value: categorie.count,
    }
  });
  //formatage pour l'api
  const categories_amount = sumAmountByStatus.map(categorie => {
    return {
      name: categorie._id,
      value: categorie.totalAmount,
    }
  });


  // Récupération des 10 principaux demandeurs de requêtes par statut
  const topRequestersByStatus = await requestModel.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: { status: '$status', userId: '$userId' }, count: { $count: {} } } },
    { $sort: { count: -1 } },
    { $group: { _id: '$_id.status', topRequesters: { $push: { userId: '$_id.userId', count: '$count' } } } },
    { $project: { _id: 0, status: '$_id', topRequesters: { $slice: ['$topRequesters', 10] } } }
  ]);

  const activeDays = await requestModel.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", }, }, count: { $sum: 1 },  totalAmount: { $sum: '$amount' }  }, },
    { $sort: { _id: 1, }, },
  ]);


  const days = fillMissingDays(activeDays, from, to);
  return {
    categories,
    categories_amount,
    transactions,
    totalRequestCount,
    amountByStatus,
    topRequestersByStatus,
    days
  }

}

export const analytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      // const from = new Date(req.body.from);
      // const to = new Date(req.body.to);
      const from = moment(req.body.from, 'DD/MM/YYYY').toDate();
      const to = moment(req.body.to, 'DD/MM/YYYY').toDate();
      const userId = req.user?._id;


      // Récupération du nombre de requêtes par statut
      const requestCountByStatus = await requestModel.aggregate([
        { $match: { payment_date: { $gte: from, $lte: to }, userId } },
        { $group: { _id: '$status', count: { $count: {} } } }
      ]);
      console.log("Voici",res.cookie)

      // Récupération du nombre total de requêtes
      const totalRequestCount = await requestModel.countDocuments({ payment_date: { $gte: from, $lte: to }, userId });

      // Récupération du montant des requêtes par statut
      const amountByStatus = await requestModel.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to }, userId } },
        { $group: { _id: '$status', totalAmount: { $sum: '$amount' } } }
      ]);

      // Récupération des 10 principaux demandeurs de requêtes par statut
      const topRequestersByStatus = await requestModel.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to }, userId } },
        { $group: { _id: { status: '$status', userId: '$userId' }, count: { $count: {} } } },
        { $sort: { count: -1 } },
        { $group: { _id: '$_id.status', topRequesters: { $push: { userId: '$_id.userId', count: '$count' } } } },
        { $project: { _id: 0, status: '$_id', topRequesters: { $slice: ['$topRequesters', 10] } } }
      ]);

      return res.status(200).json({
        success: true,
        data: {
          requestCountByStatus,
          totalRequestCount,
          amountByStatus,
          topRequestersByStatus
        }
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }

);


function calculatePercentageChange(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;

};



function fillMissingDays(
  activeDays: { _id: string; count: number ,totalAmount: number }[],
  startDate: Date,
  endDate: Date
): { date: Date; number: number }[] {
  if (activeDays.length === 0) return [];
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const transactionsByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d._id, day));
    if (found) {
      return {
        date: day,
        number: found.count,
        amount: found.totalAmount,
      };
    } else {
      return {
        date: day,
        number: 0,
        amount: 0
      };
    }
  });

  return transactionsByDay;
}