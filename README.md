# Straight Through Processing (STP) Textract Processor

[![CircleCI](https://circleci.com/gh/brandsExclusive/fn-stp-textract.svg?style=svg)](https://circleci.com/gh/brandsExclusive/fn-stp-textract)

Lambda function that reacts to new objects in an S3 mail data structure (see https://github.com/brandsExclusive/fn-stp-process-inbox/), email data is processed with AWS Textract PDF, if matching rules on originating organisation (i.e. email sender) and attchement file type are met.

## Configuration

The function is fired by an S3 action whenever a new `*_meta.json` file signals a new email has been pre-processed by the `fn-stp-process-inbox` lambda function.

See config files in `./deploy` folder for lambda naming, S3 inbox and S3 output bucket names.

The `WHITELIST_ORIGINATORS` environment variable determines domains for which emails will be accepted for processing (comma separated)

The `WHITELIST_REGEX` environment variable determines which file attachment is to be accepted for processing.

## Deployment

To deploy run the following JOBS on jenkins

TODO: configure jenkins

* [TEST](https://jenkins.luxgroup.com/job/release-test-stp-process-inbox-fn/)

* [PRODUCTION](https://jenkins.luxgroup.com/job/release-prod-stp-process-inbox-fn/)

To deploy locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ WHITELIST_ORIGINATORS=supplies@acme.test yarn deploy-test
```

PRODUCTION

```
$ WHITELIST_ORIGINATORS=supplies@acme.test yarn deploy-production
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
