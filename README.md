# SaaS

## Pre-requisites

An initial infrastructure `cdk deploy` is required to get some global resources deployed.

```bash
cd infrastructure && npx cdk bootstrap
npm run cdk-init -w infrastructure
```

This will create the following resources:

| Resource    | Value | Description |
| ----------- | ----------- | ----- |
| IAM Role    | saas-github-oidc-provider-role | Assumed by GitHub Actions |
| ECR image   | `<AWS_ACCOUNT_ID>.dkr.ecr.eu-west-1.amazonaws.com/saas-base:latest` | Contains common CLI tools |

---

CLI tools include: `node`, `aws-cli`, `git`, `jq`

---

### GitHub

Add Repository Secrets:

| Variable        | Value |
| -----------     | ----- |
| SONAR_TOKEN     | `<TOKEN>` |
| AWS_ACCOUNT_ID  | `<AWS_ACCOUNT_ID>` |
| AWS_REGION      | `<AWS_REGION>` |

---

Create Environments with following variables:

#### dev
---
| Variable    | Value |
| ----------- | ----- |
| ENV         | `dev` |

---


### Settings

To keep consistent with AWS environment resource names and prefixes, use the following conventions:

| Type    | Value |
| ----------- | ----- |
| Parameter Store prefix | `/saas/dev/*` |
| ECR prefix | `saas-dev-*` |
