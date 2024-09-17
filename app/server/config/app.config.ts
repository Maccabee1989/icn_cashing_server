require("dotenv").config();

export const appConfig = {
    activation_token_secret : process.env.ACTIVATION_TOKEN_SECRET || "0123456789",
    activation_token_expire : process.env.ACTIVATION_TOKEN_EXPIRE || "600",

    access_token_secret: process.env.ACCESS_TOKEN_SECRET || "",
    access_token_expire: process.env.ACCESS_TOKEN_EXPIRE || '300',  //by default 5min

    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || "",
    refresh_token_expire: process.env.REFRESH_TOKEN_EXPIRE || '1800', // by default 30 min

    redis_session_expire: process.env.REDIS_SESSION_EXPIRE || 604800, // by default 7day = 604800 seconde

    support_mail: process.env.SUPPORT_MAIL || "herve.ngando@eneo.cm",

    status : [
        'deleted', 
        "draft",
        "initiated",
        "validated",
        "rejected" , 
        "pending_commercial_input",
        "pending_finance_validation",
        "processing",
        "treated"   
    ]
}