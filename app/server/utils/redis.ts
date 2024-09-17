import Redis from "ioredis"
import { redisConfig } from "../config/redis.config";
require("dotenv").config();

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected from host ${process.env.REDIS_URL}`)
        return process.env.REDIS_URL;
    }
    throw new Error("Redis connection failed");   
}

console.log("Check redis configuration")
export const redis = new Redis(redisConfig());
