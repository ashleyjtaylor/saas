#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import ToolsStack from '../src/ToolsStack'

const app = new cdk.App()

new ToolsStack(app, 'ToolsStack', {
  env: {
    region: process.env.AWS_REGION,
    account: process.env.AWS_ACCOUNT_ID
  }
})

app.synth()
