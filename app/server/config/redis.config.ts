require("dotenv").config();

const {
    NODE_ENV,
    REDIS_HOSTNAME,
    REDIS_PORT,
    REDIS_PASSWORD,

    REDIS_DEVELOPMENT_HOSTNAME,
    REDIS_DEVELOPMENT_PORT,
    REDIS_DEVELOPMENT_PASSWORD,

    REDIS_TESTING_HOSTNAME,
    REDIS_TESTING_PORT,
    REDIS_TESTING_PASSWORD,
} = process.env;

export function redisConfig(): any {
    switch (NODE_ENV) {
        case "production":
            return {
                host: REDIS_HOSTNAME, 
                port: parseInt(REDIS_PORT || "6379"), 
                password: REDIS_PASSWORD
            };
            break;
        case "development":
            return {
                host: REDIS_DEVELOPMENT_HOSTNAME || "localhost",
                port: parseInt(REDIS_DEVELOPMENT_PORT || "6379"),
                // password: REDIS_DEVELOPMENT_PASSWORD
            };
            break;
        case "testing":
            return {
                host: REDIS_TESTING_HOSTNAME || "localhost",
                port: parseInt(REDIS_TESTING_PORT || "6379"),
                // password: REDIS_TESTING_PASSWORD
            };
            break;
        default:
            return {
                host: "localhost",
                port: "6379"
            };
            break;
    }
} 