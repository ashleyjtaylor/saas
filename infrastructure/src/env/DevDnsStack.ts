import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'

import Dns from './constructs/dns'

export default class DevDnsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    new Dns(this, 'Dns', {
      project: 'saas',
      env: 'dev',
      domain: 'dev.doculink.co',
      rootDomain: 'doculink.co'
    })
  }
}
