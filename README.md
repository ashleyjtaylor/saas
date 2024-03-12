# SaaS

![CI](https://github.com/ashleyjtaylor/saas/actions/workflows/ci.yml/badge.svg)
![Infrastructure](https://github.com/ashleyjtaylor/saas/actions/workflows/deploy-cdk-env.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ashleyjtaylor_saas&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ashleyjtaylor_saas)

## Pre-requisites

An initial infrastructure `cdk deploy` is required to get some global resources deployed.

```bash
cd infrastructure && npx cdk bootstrap
npm run cdk-init -w infrastructure
```

This will create the following resources:

| Resource    | Value | Description |
| ----------- | ----------- | ----- |
| IAM Role    | `saas-github-oidc-provider-role` | Assumed by GitHub Actions |
| ECR image   | `<AWS_ACCOUNT_ID>.dkr.ecr.eu-west-1.amazonaws.com/saas-base:latest` | Contains CLI tools: `node`, `aws-cli`, `git`, `jq` |
---

## Workflows

1. `ci.yml` - runs code checks and deploys any CDK tool changes (`deploy-cdk-tools.yml`)
2. `deploy-cdk-env.yml` - once CI is complete and merged in, deploys any `dev` CDK infrastrucutre changes

## GitHub

**Repository variables**

  - BASE_IMAGE_NAME - `saas-base`
  - AWS_ACCOUNT_ID
  - AWS_REGION


**Repository secrets**
  - SONAR_TOKEN


**Environments**

  - `dev`
    - NODE_ENV - `dev`


---


## AWS

To keep consistent with environment resource names and prefixes, use the following conventions:

- Parameter Store prefix - `/saas/dev/*`
- AWS resource names prefix - `saas-dev-*`
