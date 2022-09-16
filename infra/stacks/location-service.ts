import { App, CustomResource, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { CfnGeofenceCollection, CfnTracker, CfnTrackerConsumer } from 'aws-cdk-lib/aws-location';
import { BuildConfig } from '../lib/common/config.interface';
import { name } from '../lib/common/utils';
import { Provider } from 'aws-cdk-lib/custom-resources'
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class LocationServiceStack extends Stack {
  private readonly geofenceCollection: CfnGeofenceCollection;
  private readonly tracker: CfnTracker;
  private readonly lambdaFunction: Function;

  constructor(scope: App, id: string, props: StackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    this.geofenceCollection = this.createGeofencesCollection(name(`${id}-geofence-collection`));
    this.tracker = this.createTracker(name(`${id}-tracker`));
    this.linkTrackerConsumer(name(`${id}-consumer`));

    this.lambdaFunction = this.createLambdaFunction(name(`${id}-custom-geofence-resource`), buildConfig.account, buildConfig.region);
    this.createLambdaPermission(buildConfig.account, buildConfig.region);
    this.createCustomResource(name(`${id}-geofence`));
  }

  private createGeofencesCollection(name: string): CfnGeofenceCollection {
    return new CfnGeofenceCollection(this, name, {
      collectionName: `${name}`,
      description: 'Geofence collection for test',
      // kmsKeyId: 'kmsKeyId',  
    });
  }

  private createTracker(name: string): CfnTracker {
    return new CfnTracker(this, name, {
      trackerName: `${name}`,
      description: 'Geofence collection for test',
      positionFiltering: 'AccuracyBased'
    });
  }

  private linkTrackerConsumer(name: string): CfnTrackerConsumer {
    return new CfnTrackerConsumer(this, name, {
      consumerArn: this.geofenceCollection.attrArn,
      trackerName: this.tracker.trackerName
    })
  }

  private createLambdaFunction(name: string, account: string, region: string): Function {
    return new Function(this, name, {
      functionName: `${name}`,
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      code: Code.fromAsset(path.join(__dirname, '../lambdas/create-geofence')),
      handler: 'index.handler',
      environment: {
        REGION: region,
        ACCOUNT_ID: account,
        COLLECTION_NAME: this.geofenceCollection.collectionName,
        GEOFENCE_ID: name,
      }
    });
  }

  private createLambdaPermission(account: string, region: string): void {
    const putGeofencePermission = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'geo:putGeofence',
        'geo:BatchDeleteGeofence'
      ],
      resources: [
        `arn:aws:geo:${region}:${account}:geofence-collection/${this.geofenceCollection.collectionName}`
      ]
    });
    this.lambdaFunction.addToRolePolicy(putGeofencePermission);
  }

  private createCustomResource(name: string): CustomResource {
    const customResourceProvider = new Provider(this, `${name}-provider`, {
      onEventHandler: this.lambdaFunction,
    });

    return new CustomResource(this, name, {
      serviceToken: customResourceProvider.serviceToken,
    });
  }

}