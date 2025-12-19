import { winston } from "@strapi/logger";

// Custom function levelFilter (ensure it's defined)
const levelFilter = (level: string) =>
    winston.format((info) => {
        return info.level === level ? info : false;
    })();

// Custom function prettyPrint (ensure it's defined)
const prettyPrint = (options: { timestamps: string }) =>
    winston.format.combine(
        winston.format.timestamp({ format: options.timestamps }),
        winston.format.json()
    );

export default {
    transports: [
        new winston.transports.Console({
            level: "http",
            format: winston.format.combine(
                levelFilter("http"),
                prettyPrint({ timestamps: "YYYY-MM-DD hh:mm:ss.SSS" })
            ),
        }),
    ],
};
