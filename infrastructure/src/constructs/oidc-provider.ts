import { Construct } from 'constructs'
import { Aws, StackProps } from 'aws-cdk-lib'
import {
  Effect,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role,
  WebIdentityPrincipal
} from 'aws-cdk-lib/aws-iam'

export interface OIDCProviderProps extends StackProps {
  project: string;
  roleName: string;
  githubRepo: string;
}

export default class OIDCProvider extends Construct {
  constructor(scope: Construct, id: string, props: OIDCProviderProps) {
    super(scope, id)

    const { project, roleName, githubRepo } = props

    const provider = new OpenIdConnectProvider(this, 'OIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com']
    })

    new Role(this, 'OIDCProviderRole', {
      roleName,
      description: 'Allow GitHub actions to connect to AWS',
      assumedBy: new WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringLike: {
          ['token.actions.githubusercontent.com:sub']: `repo:${githubRepo}:*`
        },
        StringEquals: {
          ['token.actions.githubusercontent.com:aud']: 'sts.amazonaws.com'
        }
      }),
      inlinePolicies: {
        OIDCProviderRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              sid: 'CdkDeploymentPermissions',
              actions: ['sts:AssumeRole'],
              resources: ['arn:aws:iam::*:role/cdk-*'],
              effect: Effect.ALLOW
            }),
            new PolicyStatement({
              sid: 'CdkParameterStorePermissions',
              actions: ['ssm:GetParameter'],
              resources: [
                `arn:aws:ssm:${Aws.REGION}:*:parameter/${project}/*`
              ],
              effect: Effect.ALLOW
            }),
            new PolicyStatement({
              sid: 'CdkEcsPermissions',
              actions: ['ecs:*'],
              resources: ['*'],
              effect: Effect.ALLOW
            }),
            new PolicyStatement({
              sid: 'CdkEcrAuthPermissions',
              actions: ['ecr:GetAuthorizationToken'],
              resources: ['*'],
              effect: Effect.ALLOW
            }),
            new PolicyStatement({
              sid: 'CdkEcrPermissions',
              actions: [
                'ecr:DescribeImages',
                'ecr:DescribeRepositories',
                'ecr:CreateRepository',
                'ecr:CompleteLayerUpload',
                'ecr:UploadLayerPart',
                'ecr:InitiateLayerUpload',
                'ecr:BatchCheckLayerAvailability',
                'ecr:PutImage'
              ],
              resources: [`arn:aws:ecr:${Aws.REGION}:${Aws.ACCOUNT_ID}:repository/${project}-*`],
              effect: Effect.ALLOW
            })
          ]
        })
      }
    })
  }
}
