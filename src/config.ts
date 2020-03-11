export const ENVIRONMENT = process.env.NODE_ENV || "test";

export const PRODUCTION = ENVIRONMENT === "production";

export const APP_NAME = process.env.APP_NAME || "test-fn-stp-textract";

export const DEBUG = process.env.DEBUG === "true";

export const DATA_S3_BUCKET_NAME = process.env.DATA_S3_BUCKET_NAME || "";

export const WHITELIST_ORIGINATORS = process.env.WHITELIST_ORIGINATORS || "";

export const WHITELIST_REGEX = process.env.WHITELIST_REGEX || "(INVOICE)";

export const SNS_CHANNEL = process.env.SNS_CHANNEL || "";

export const SNS_ROLE_ARN = process.env.SNS_ROLE_ARN || "";
