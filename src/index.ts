import { S3, Textract } from "aws-sdk";
import {
  DATA_S3_BUCKET_NAME,
  SNS_CHANNEL,
  SNS_ROLE_ARN,
  ORIGINATORS
} from "./config";

const s3 = new S3();
const textract = new Textract();
import { S3Event } from "aws-lambda";

interface Attachment {
  contentType: string;
  contentDisposition: string;
  filename: string;
  size: string;
  s3key: string;
}
interface MetaData {
  date: string;
  subject: string;
  from: string;
  text: string;
  textAsHtml: string;
  attachments: Attachment[];
}
interface RegexMap {
  [key: string]: RegExp;
}

export const handler = async (event: S3Event): Promise<string> => {
  // console.log(JSON.stringify(event, null, 2));

  // Check originator whitelist
  const originatorRegex = /([a-z\.]+)\//;
  const metaDataS3Key = event.Records[0].s3.object.key;
  const originatorMatch = metaDataS3Key.match(originatorRegex);

  let metaData;
  let err = "";

  if (originatorMatch?.length !== 2) {
    return "Error: Could not determine originator from email data.";
  }
  const originator = originatorMatch[1];

  // ORGINATORS is a comma-delimited list of domains{regex file filter}
  // e.g.: acme.com{.*INVOICE*.\.PDF};gmail.com{.*}
  const whitelist = ORIGINATORS.split(",");
  const allowedOriginators: string[] = [];
  const regexMap: RegexMap = {};
  whitelist.forEach(w => {
    const match = w.match(/(.*){(.*)}/);
    if (match?.length !== 3) {
      err = `Invalid whitelist entry in ORIGINATORS: ${w}`;
      console.log(err);
      return err;
    }
    const allowedOriginator = match[1];
    const regex = match[2];
    allowedOriginators.push(allowedOriginator);
    regexMap[allowedOriginator] = new RegExp(regex);
  });

  if (!allowedOriginators.some(w => originator === w)) {
    err = `Warning: OriginatorOrg: ${originator} is not whitelisted.`;
    console.log(err);
    return err;
  }

  console.log(
    `Getting metadata file: ${metaDataS3Key} from ${DATA_S3_BUCKET_NAME} for ${originator}`
  );
  try {
    const metaDataS3Response = await s3
      .getObject({ Bucket: DATA_S3_BUCKET_NAME, Key: metaDataS3Key })
      .promise();

    metaData = JSON.parse(metaDataS3Response.Body?.toString() || "");
  } catch (err) {
    console.log(err);
    return err;
  }

  const fileNameRegex = regexMap[originator];
  const attachments = metaData.attachments.filter((a: Attachment) =>
    a.filename.match(fileNameRegex)
  );

  if (!attachments.length) {
    err = `Warning : No attachments for ${originator} are whitelisted.`;
    console.log(err);
    return err;
  }
  console.log(`Found ${attachments.length} attachment(s) to process...`);

  // Send PDF to Textract and enqueue meta data
  try {
    await Promise.all(
      attachments.map(async (a: Attachment) => {
        const params: Textract.StartDocumentAnalysisRequest = {
          DocumentLocation: {
            S3Object: {
              Bucket: DATA_S3_BUCKET_NAME,
              Name: a.s3key
            }
          },
          FeatureTypes: ["TABLES", "FORMS"],
          JobTag: originator,
          NotificationChannel: {
            RoleArn: SNS_ROLE_ARN,
            SNSTopicArn: SNS_CHANNEL
          }
        };
        const textractReponse = await textract
          .startDocumentAnalysis(params)
          .promise();
        console.log(
          `'${a.filename}' sent to Textract. JobId: ${textractReponse.JobId}`
        );
      })
    );
  } catch (err) {
    console.log(err);
    return err;
  }

  return "Finished processing.";
};
