#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'

import ToolsStack from '../src/tools/ToolsStack'

import DevDnsStack from '../src/env/DevDnsStack'
import DevStack from '../src/env/DevStack'

const app = new cdk.App()

new ToolsStack(app, 'ToolsStack', {
  env: {
    region: process.env.AWS_REGION,
    account: process.env.AWS_ACCOUNT_ID
  }
})

new DevDnsStack(app, 'DevDnsStack', {
  env: {
    region: process.env.AWS_REGION,
    account: process.env.AWS_ACCOUNT_ID
  }
})

new DevStack(app, 'DevStack', {
  env: {
    region: process.env.AWS_REGION,
    account: process.env.AWS_ACCOUNT_ID
  }
})

app.synth()
