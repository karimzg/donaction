import { winston } from "@strapi/logger";

// Pretty print format with timestamps
const prettyPrint = (options: { timestamps: string }) =>
    winston.format.combine(
        winston.format.timestamp({ format: options.timestamps }),
        winston.format.json()
    );

export default {
    transports: [
        new winston.transports.Console({
            level: "http", // Shows: error, warn, info, http
            format: prettyPrint({ timestamps: "YYYY-MM-DD hh:mm:ss.SSS" }),
        }),
    ],
};
