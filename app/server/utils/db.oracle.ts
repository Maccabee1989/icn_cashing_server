require("dotenv").config();

import { dbConfig } from "../config/db.config";
import ErrorHandler from "./errorHandler";

var oracledb = require('oracledb');

// Function to establish a connection to the database
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('Erreur lors de la connexion à la base de données:', err);
    throw err;
  }
}

// Function to close the database connection
async function releaseConnection(connection: any) {
  try {
    await connection.close();
  } catch (err) {
    console.error('Erreur lors de la fermeture de la connexion:', err);
    throw err;
  }
}

// Function to runQuery (execute Query) in the database
const executeQuery = async (query: string, values: any[] = []) => {
    let connection;
    try {
      // Fetch data from the database
      connection = await getConnection();
      const result = await connection.execute(query, values);
      return result;

    } catch (error: any) {
      // Catch the error and return and error response
      console.error('Internal error:', error);
      return new ErrorHandler(error.message, 500);
    } finally {
      // close the connection to the database
      if (connection) {
        await releaseConnection(connection);
      }
    }
}

export { getConnection, releaseConnection , executeQuery };