import { S3, Textract } from "aws-sdk";
import {
  DATA_S3_BUCKET_NAME,
  SNS_CHANNEL,
  SNS_ROLE_ARN,
  WHITELIST_ORIGINATORS,
  WHITELIST_REGEX
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

export const handler = async (event: S3Event): Promise<string> => {
  // console.log(JSON.stringify(event, null, 2));

  // Check originator whitelist
  const originatorRegex = /([a-z\.]+)\//;
  const metaDataS3Key = event.Records[0].s3.object.key;
  const originatorMatch = metaDataS3Key.match(originatorRegex);

  let metaData;

  if (originatorMatch?.length !== 2) {
    return "Error: Could not determine OriginatorOrg from email data.";
  }
  const originator = originatorMatch[1];

  const whitelist: string[] = WHITELIST_ORIGINATORS.split(",");
  if (!whitelist.some(w => originator === w)) {
    return `Info: OriginatorOrg: ${originator} is not whitelisted.`;
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

  const fileNameRegex = new RegExp(WHITELIST_REGEX);
  const attachments = metaData.attachments.filter((a: Attachment) =>
    a.filename.match(fileNameRegex)
  );

  if (!attachments.length) {
    return `Error: attachments for ${metaDataS3Key} are not whitelisted.`;
  }
  console.log(JSON.stringify(attachments, null, 2));

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
        console.log(JSON.stringify(textractReponse, null, 2));
      })
    );
  } catch (err) {
    console.log(err);
    return err;
  }

  return "Finished processing.";
};
