import pino from "pino";

// pino's worker-thread-based `transport` option can't resolve its worker
// module inside Next.js's bundled server output. Using pino-pretty as a
// plain synchronous stream instead avoids that entirely.
const logger =
    process.env.NODE_ENV === "development"
        ? pino(
              { level: process.env.LOG_LEVEL || "info" },
              require("pino-pretty")({
                  colorize: true,
                  translateTime: "SYS:standard",
                  ignore: "pid,hostname",
              })
          )
        : pino({ level: process.env.LOG_LEVEL || "info" });

export default logger;
