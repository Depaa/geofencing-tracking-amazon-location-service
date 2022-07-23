import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LambdaFunction} from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';
import { Rule } from 'aws-cdk-lib/aws-events';
import { BuildConfig } from '../lib/common/config.interface';
import { name } from '../lib/common/utils';



export class NotificationStack extends Stack {
  private readonly eventRule: Rule;
  private readonly lambdaFunction: Function;

  constructor(scope: App, id: string, props: StackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    this.lambdaFunction = this.createLambdaFunction(name(`${id}-enter-trigger`));
    this.eventRule = this.createEventRule(name(`${id}-enter-rule`));
    this.createLambdaPermission(buildConfig.account, buildConfig.region);
  }

  private createEventRule(name: string): Rule {
    return new Rule(this, name, {
      ruleName: `${name}`,
      description: 'Rule triggered when enter event',
      eventPattern: {
        source: ['aws.geo'],
        detailType: ['Location Geofence Event'],
        detail: {
          EventType: ['ENTER']
        }
      },
      targets: [ new LambdaFunction(this.lambdaFunction) ]
    });
  }

  private createLambdaFunction(name: string): Function {
    return new Function(this, name, {
      functionName: `${name}`,
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      code: Code.fromAsset(path.join(__dirname, '../../src/lambdas/trigger-enter-event')),
      handler: 'index.handler'
    });
  }

  private createLambdaPermission(account: string, region: string): void {
    // const putLogPermission = new PolicyStatement({
    //   effect: Effect.ALLOW,
    //   actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
    //   resources: [`arn:aws:logs:${region}:${account}:log-group:/aws/events/*:*`]
    // });
    const sendNotificationPermission = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['sns:Publish'],
      resources: [`arn:aws:sns:${region}:${account}:*`]
    });

    this.lambdaFunction.role?.attachInlinePolicy(
      new Policy(this, 'send-sns-notification', {
        statements: [
          sendNotificationPermission
        ]
      })
    )
  }
}