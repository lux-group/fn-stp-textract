# Straight Through Processing (STP) Textract Processor

[![CircleCI](https://circleci.com/gh/brandsExclusive/fn-stp-textract.svg?style=svg)](https://circleci.com/gh/brandsExclusive/fn-stp-textract)

Lambda function that reacts to new objects in an S3 mail data structure (see https://github.com/brandsExclusive/fn-stp-process-inbox/), email data is processed with AWS Textract PDF, if matching rules on originating organisation (i.e. email sender) and attchement file type are met.

## Configuration

The function is fired by an S3 action whenever a new `*_meta.json` file signals a new email has been pre-processed by the `fn-stp-process-inbox` lambda function.

See config files in `./deploy` folder for lambda naming, S3 inbox and S3 output bucket names.

The `ORIGINATORS` environment variable determines domains for which emails will be accepted for processing (comma separated). After each domain a regex express to filter required files to extact is specified in curly braces.

e.g. the following will Textract any PDF files sent from `gmail.com`, but only PDF files with the word `INVOICE` in them from `luxuryescapes.com`
```
gmail.com{.*(PDF|pdf)},luxuryescapes.com{.*INVOICE.*(PDF|pdf)}`
```

## Deployment

To deploy run the following JOBS on jenkins

TODO: configure jenkins

* [TEST](https://jenkins.luxgroup.com/job/release-test-stp-process-inbox-fn/)

* [PRODUCTION](https://jenkins.luxgroup.com/job/release-prod-stp-process-inbox-fn/)

To deploy locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ yarn deploy-test
```

PRODUCTION

```
$ FN_ORIGINATORS=gmail.com{.*(PDF|pdf)},luxuryescapes.com{.*INVOICE.*(PDF|pdf)} yarn deploy-production
```

## Logs

To tail logs locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ yarn logs-test
```

PRODUCTION

```
$ yarn logs-production
```

## Maintainers

* [Justin Hopkins](https://github.com/innomatics)

## Collaborators

* TBA
