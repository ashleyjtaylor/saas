import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'

import Compute from './constructs/compute'

export default class DevStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    new Compute(this, 'Compute', {
      project: 'saas',
      env: 'dev'
    })
  }
}
