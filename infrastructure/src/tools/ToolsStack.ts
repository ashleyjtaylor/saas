import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'

import OIDCProvider from './constructs/oidc-provider'

export default class ToolsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const project = 'saas'

    new OIDCProvider(this, 'OIDCProvider', {
      project,
      roleName: 'saas-github-oidc-provider-role',
      githubRepo: 'ashleyjtaylor/saas'
    })
  }
}
