import { SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';

export interface BuildConfig {
  readonly account: string;
  readonly region: string;
  readonly environment: string;
  readonly project: string;
  readonly version: string;
  readonly build: string;
  readonly stacks: BuildStaks;
}

export interface BuildStaks {
  readonly notification: BuildNotificationStack;
}

export interface BuildNotificationStack {
  readonly endpoints: EndpointObject[];
}

export interface EndpointObject {
  readonly endpoint: string;
  readonly protocol: SubscriptionProtocol;
}
