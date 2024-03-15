import { Construct } from 'constructs'
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { StringListParameter, StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDriver } from 'aws-cdk-lib/aws-ecs'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Repository } from 'aws-cdk-lib/aws-ecr'
import { Duration } from 'aws-cdk-lib'
import {
  ApplicationListenerRule,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition
} from 'aws-cdk-lib/aws-elasticloadbalancingv2'

interface ComputeProps {
  env: string;
  project: string;
}

export default class Compute extends Construct {
  constructor(scope: Construct, id: string, props: ComputeProps) {
    super(scope, id)

    const { env, project } = props

    const dnsCertificate = Certificate.fromCertificateArn(this, 'Certificate',
      StringParameter.fromStringParameterName(this, 'CertificateArn', `/${project}/${env}/dnsCertificateArn`).stringValue
    )

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      zoneName: StringParameter.fromStringParameterName(this, 'HostedZoneName',`/${project}/${env}/hostedZoneName`).stringValue,
      hostedZoneId: StringParameter.fromStringParameterName(this, 'HostedZoneId',`/${project}/${env}/hostedZoneId`).stringValue
    })

    const vpc = new Vpc(this, 'Vpc', {
      vpcName: `${project}-${env}-vpc`,
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: `${project}-${env}-public-subnet`,
          subnetType: SubnetType.PUBLIC
        },
        {
          name: `${project}-${env}-private-subnet`,
          subnetType: SubnetType.PRIVATE_ISOLATED
        }
      ]
    })

    const loadBalancerSecurityGroup = new SecurityGroup(this, 'LoadBalancerSecurityGroup', {
      vpc,
      securityGroupName: `${project}-${env}-load-balancer-security-group`,
      allowAllOutbound: true
    })

    loadBalancerSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80))
    loadBalancerSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443))

    const ecsSecurityGroup = new SecurityGroup(this, 'EcsSecurityGroup', {
      vpc,
      description: 'Allow only traffic from the LB',
      allowAllOutbound: true
    })

    ecsSecurityGroup.addIngressRule(loadBalancerSecurityGroup, Port.tcp(80), 'Allow only from LoadBalancer')

    const cluster = new Cluster(this, 'Cluster', {
      vpc,
      clusterName: `${project}-${env}-cluster`
    })

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDefinition', {
      family: `${project}-${env}-task-definitions`,
      memoryLimitMiB: 512,
      cpu: 256
    })

    taskDefinition.addContainer('Container', {
      containerName: 'web',
      essential: true,
      image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'NginxRepository', 'nginx')),
      portMappings: [{
        containerPort: 80,
        hostPort: 80
      }],
      logging: LogDriver.awsLogs({
        streamPrefix: `${project}-${env}-web`
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost/ || exit 1'],
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        retries: 3
      }
    })

    const service = new FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      serviceName: `${project}-${env}-web-service`,
      assignPublicIp: true,
      desiredCount: 1,
      minHealthyPercent: 0,
      securityGroups: [ecsSecurityGroup]
    })

    const loadBalancer = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc,
      loadBalancerName: `${project}-${env}-load-balancer`,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      securityGroup: loadBalancerSecurityGroup,
      internetFacing: true
    })

    loadBalancer.addListener('HTTP', {
      port: 80,
      defaultAction: ListenerAction.redirect({ port: '443', protocol: ApplicationProtocol.HTTPS })
    })

    const httpsListener = loadBalancer.addListener('HTTPS', {
      port: 443,
      protocol: ApplicationProtocol.HTTPS,
      defaultAction: ListenerAction.fixedResponse(503, {
        messageBody: '503 Service Unavailable'
      }),
      certificates: [dnsCertificate]
    })

    new ApplicationListenerRule(this, 'ListenerRule', {
      priority: 9,
      listener: httpsListener,
      conditions: [ListenerCondition.pathPatterns(['/*'])],
      targetGroups: [
        new ApplicationTargetGroup(this, 'EcsTarget', {
          vpc,
          protocol: ApplicationProtocol.HTTP,
          targetGroupName: `${project}-${env}-web-target-group`,
          targets: [service]
        })
      ]
    })

    new ARecord(this, 'ARecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(loadBalancer))
    })

    /******************************
     * Parameter Store
     ******************************/
    new StringParameter(this, 'VpcId', {
      parameterName: `/${project}/${env}/vpcId`,
      stringValue: vpc.vpcId
    })

    new StringListParameter(this, 'AvailabilityZones', {
      parameterName: `/${project}/${env}/availabilityZones`,
      stringListValue: vpc.availabilityZones
    })

    new StringListParameter(this, 'PublicSubnets', {
      parameterName: `/${project}/${env}/publicSubnets`,
      stringListValue: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }).subnetIds
    })

    new StringParameter(this, 'ClusterArn', {
      parameterName: `/${project}/${env}/clusterArn`,
      stringValue: cluster.clusterArn
    })

    new StringParameter(this, 'ClusterName', {
      parameterName: `/${project}/${env}/clusterName`,
      stringValue: cluster.clusterName
    })

    new StringParameter(this, 'LoadBalancerSecurityGroupId', {
      parameterName: `/${project}/${env}/loadBalancerSecurityGroupId`,
      stringValue: loadBalancerSecurityGroup.securityGroupId
    })

    new StringParameter(this, 'LoadBalancerHttpsListenerArn', {
      parameterName: `/${project}/${env}/loadBalancerHttpsListenerArn`,
      stringValue: httpsListener.listenerArn
    })
  }
}
