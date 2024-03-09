# SaaS

## Prerequisites

An initial infrastructure `cdk deploy` is required to get the OIDC IAM role deployed.

```bash
cd infrastructure && npx cdk bootstrap
npm run cdk-init -w infrastructure
```

### Settings

  - OIDC role name
    - `saas-github-oidc-provider-role`
  - Parameter Store prefix
    - `/saas/dev/*`
  - ECR prefix
    - `saas-dev-*`

### GitHub

  - Add Environment - `dev` 
    - `ENV` - `dev` (variable)
  
  - Add Repository Secret
    - `SONAR_TOKEN`
    - `AWS_ACCOUNT_ID`
    - `AWS_REGION`
