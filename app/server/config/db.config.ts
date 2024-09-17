require("dotenv").config();

const {
    NODE_ENV,
    DATABASE_EXTERNAL_SERVICE_NAME,
    DATABASE_EXTERNAL_USERNAME,
    DATABASE_EXTERNAL_PASSWORD,
    DATABASE_EXTERNAL_HOSTNAME,
    DATABASE_EXTERNAL_PORT,

    DATABASE_DEFAULT_HOSTNAME,
    DATABASE_DEFAULT_PORT,
    DATABASE_DEFAULT_DB,
    DATABASE_DEFAULT_USERNAME,
    DATABASE_DEFAULT_PASSWORD,

    DATABASE_DEVELOPMENT_HOSTNAME,
    DATABASE_DEVELOPMENT_PORT,
    DATABASE_DEVELOPMENT_DB,
    DATABASE_DEVELOPMENT_USERNAME,
    DATABASE_DEVELOPMENT_PASSWORD,
    
    DATABASE_TESTING_HOSTNAME,
    DATABASE_TESTING_PORT,
    DATABASE_TESTING_DB,
    DATABASE_TESTING_USERNAME,
    DATABASE_TESTING_PASSWORD,
} = process.env;


/*----------------------------------------------------
          Default Database configuration
----------------------------------------------------*/

export function database_default_url() : string {
    switch (NODE_ENV) {
        case "production":
            return `mongodb://${DATABASE_DEFAULT_USERNAME}:${DATABASE_DEFAULT_PASSWORD}@${DATABASE_DEFAULT_HOSTNAME}:${DATABASE_DEFAULT_PORT}/${DATABASE_DEFAULT_DB}?authSource=admin`;
            break;
        case "development":
            return `mongodb://${DATABASE_DEVELOPMENT_HOSTNAME}:${DATABASE_DEVELOPMENT_PORT}/${DATABASE_DEVELOPMENT_DB}?authSource=admin`;
            break;
        case "testing":
            return `mongodb://${DATABASE_TESTING_USERNAME}:${DATABASE_TESTING_PASSWORD}@${DATABASE_TESTING_HOSTNAME}:${DATABASE_TESTING_PORT}/${DATABASE_TESTING_DB}?authSource=admin`;
            break;
        default:
            return `mongodb://localhost:27017/icncashing`;
            break;
    }
} 


/*----------------------------------------------------
          External Database configuration
----------------------------------------------------*/

const service: string = DATABASE_EXTERNAL_SERVICE_NAME || "";
const host: string = DATABASE_EXTERNAL_HOSTNAME || "";
const port: string = DATABASE_EXTERNAL_PORT || "";
const user: string = DATABASE_EXTERNAL_USERNAME || "";
const password: string = DATABASE_EXTERNAL_PASSWORD || "";

const connectString: string = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${service})))`;

// Connection information for the Oracle database
export const dbConfig = {
    user: user,
    password: password,
    connectString: connectString
};

// Pool Connection information for the Oracle database
export const pooldbConfig = {
    user: user,
    password: password,
    connectString: connectString,
    poolMax: 10, // Maximum number of connections in the pool
    poolMin: 0, // Minimum number of connections in the pool
    poolIncrement: 1, // Number of connections to add when expanding the pool
    poolTimeout: 60 // Number of seconds of inactivity before a connection is closed
};


