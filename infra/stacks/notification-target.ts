import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import { Topic, Subscription, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';
import { Rule } from 'aws-cdk-lib/aws-events';
import { BuildConfig, EndpointObject } from '../lib/common/config.interface';
import { name } from '../lib/common/utils';

export class NotificationStack extends Stack {
  private readonly lambdaFunction: Function;
  private readonly snsTopic: Topic;

  constructor(scope: App, id: string, props: StackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    this.snsTopic = this.createSNSTopic(name(`${id}-notification-topic`));
    this.lambdaFunction = this.createLambdaFunction(name(`${id}-enter-trigger`), buildConfig.account, buildConfig.region);
    this.createEventRule(name(`${id}-enter-rule`));
    this.createLambdaPermission(buildConfig.account, buildConfig.region);

    const endpoints = buildConfig.stacks.notification.endpoints;
    endpoints.forEach((endpoint, index) => {
      this.subscribeToSNSTopic(name(`${id}-notification-endpoint-${index}`), endpoint);
    })
  }

  private createEventRule(name: string): Rule {
    return new Rule(this, name, {
      ruleName: `${name}`,
      description: 'Rule triggered when enter event',
      eventPattern: {
        source: ['aws.geo'],
        detailType: ['Location Geofence Event'],
        detail: {
          EventType: ['ENTER', 'EXIT']
        }
      },
      targets: [
        new LambdaFunction(this.lambdaFunction)
      ]
    });
  }

  private createLambdaFunction(name: string, account: string, region: string): Function {
    return new Function(this, name, {
      functionName: `${name}`,
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      code: Code.fromAsset(path.join(__dirname, '../../src/lambdas/trigger-enter-event')),
      handler: 'index.handler',
      environment: {
        REGION: region,
        ACCOUNT_ID: account,
        TOPIC_NAME: this.snsTopic.topicName
      }
    });
  }

  private createLambdaPermission(account: string, region: string): void {
    const sendNotificationPermission = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['sns:Publish'],
      resources: [`arn:aws:sns:${region}:${account}:${this.snsTopic.topicName}`]
    });
    this.lambdaFunction.addToRolePolicy(sendNotificationPermission);
  }

  private createSNSTopic(name: string): Topic {
    return new Topic(this, name, {
      topicName: `${name}`,
    });
  }

  private subscribeToSNSTopic(name: string, endpoint: EndpointObject): void {
    new Subscription(this, name, {
      topic: this.snsTopic,
      ...endpoint
    });
  }
}