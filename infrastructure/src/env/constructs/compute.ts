import { Construct } from 'constructs'
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { StringListParameter, StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Cluster } from 'aws-cdk-lib/aws-ecs'
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2'

interface ComputeProps {
  env: string;
  project: string;
}

export class Compute extends Construct {
  constructor(scope: Construct, id: string, props: ComputeProps) {
    super(scope, id)

    const { env, project } = props

    /******************************
     * Vpc
     ******************************/
    const vpc = new Vpc(this, 'Vpc', {
      vpcName: `${project}-${env}-vpc`,
      maxAzs: 2,
      natGateways: 0
    })

    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc,
      securityGroupName: `${project}-${env}-security-group`,
      allowAllOutbound: true
    })

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80))
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443))

    /******************************
     * Cluster
     ******************************/
    const cluster = new Cluster(this, 'Cluster', {
      vpc,
      clusterName: `${project}-${env}-cluster`
    })

    /******************************
     * Load Balancer
     ******************************/
    const loadBalancer = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc,
      securityGroup,
      loadBalancerName: `${project}-${env}-load-balancer`,
      internetFacing: true
    })

    loadBalancer.addListener('HTTP', {
      port: 80,
      defaultAction: ListenerAction.redirect({ protocol:  ApplicationProtocol.HTTPS })
    })

    // const httpsListener = loadBalancer.addListener('HTTPS', {
    //   port: 443,
    //   protocol: ApplicationProtocol.HTTPS,
    //   defaultAction: ListenerAction.fixedResponse(503, {
    //     messageBody: '503 Service Unavailable'
    //   })
    // })

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

    new StringListParameter(this, 'PublicSubnetIds', {
      parameterName: `/${project}/${env}/publicSubnetIds`,
      stringListValue: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }).subnetIds
    })

    new StringParameter(this, 'SecurityGroupId', {
      parameterName: `/${project}/${env}/securityGroupId`,
      stringValue: securityGroup.securityGroupId
    })

    new StringParameter(this, 'ClusterArn', {
      parameterName: `/${project}/${env}/clusterArn`,
      stringValue: cluster.clusterArn
    })

    new StringParameter(this, 'ClusterName', {
      parameterName: `/${project}/${env}/clusterName`,
      stringValue: cluster.clusterName
    })

    // new StringParameter(this, 'LoadBalancerHttpsListenerArn', {
    //   parameterName: `/${project}/${env}/loadBalancerHttpsListenerArn`,
    //   stringValue: httpsListener.listenerArn
    // })
  }
}
