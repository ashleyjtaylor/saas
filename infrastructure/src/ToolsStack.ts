import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'

import OIDCProvider from './constructs/oidc-provider'

export default class ToolsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    new OIDCProvider(this, 'OIDCProvider', {
      project: 'saas',
      issuer: 'token.actions.githubusercontent.com',
      roleName: 'saas-github-oidc-provider-role',
      githubRepo: 'ashleyjtaylor/saas'
    })
  }
}
