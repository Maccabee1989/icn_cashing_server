require("dotenv").config();


export function mailConfig(): any {
    switch (process.env.SMTP_SERVICE) {
        case "outlook":
            return {
                service: process.env.SMTP_SERVICE,
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                tls: {
                    ciphers: process.env.SMTP_CIPHERS || "SSLv3",
                    rejectUnauthorized: false,
                },
                auth: {
                    user: process.env.SMTP_MAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            };
            break;
        case "gmail":
            return {
                service: process.env.SMTP_SERVICE,
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: true,
                auth: {
                    user: process.env.SMTP_MAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            };
            break;
        default:
            return {
                service: process.env.SMTP_SERVICE || "gmail",
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: true,
                auth: {
                    user: process.env.SMTP_MAIL || "epohherve63@gmail.com",
                    pass: process.env.SMTP_PASSWORD || "",
                },
            };
            break;
    }
} 