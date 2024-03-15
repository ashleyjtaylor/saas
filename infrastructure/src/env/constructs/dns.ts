import { Construct } from 'constructs'
import { HostedZone, NsRecord, PublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

interface DnsProps {
  env: string;
  project: string;
  domain: string;
  rootDomain: string;
}

export default class Dns extends Construct {
  constructor(scope: Construct, id: string, props: DnsProps) {
    super(scope, id)

    const { project, env, rootDomain, domain } = props

    const rootHostedZone = HostedZone.fromLookup(this, 'RootHostedZone', {
      domainName: rootDomain
    })

    const hostedZone = new PublicHostedZone(this, 'HostedZone', {
      zoneName: domain
    })

    const certificate = new Certificate(this, 'Certificate', {
      domainName: domain,
      certificateName: domain,
      validation: CertificateValidation.fromDns(hostedZone)
    })

    if (rootDomain) {
      new NsRecord(this, 'NSRecord', {
        zone: rootHostedZone,
        recordName: domain,
        values: hostedZone.hostedZoneNameServers || []
      })
    }

    new StringParameter(this, 'CertificateArn', {
      parameterName: `/${project}/${env}/dnsCertificateArn`,
      stringValue: certificate.certificateArn
    })

    new StringParameter(this, 'HostedZoneId', {
      parameterName: `/${project}/${env}/hostedZoneId`,
      stringValue: hostedZone.hostedZoneId
    })

    new StringParameter(this, 'HostedZoneName', {
      parameterName: `/${project}/${env}/hostedZoneName`,
      stringValue: hostedZone.zoneName
    })
  }
}
