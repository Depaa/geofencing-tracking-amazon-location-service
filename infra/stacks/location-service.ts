import { App, Stack, StackProps } from 'aws-cdk-lib';
import { CfnGeofenceCollection, CfnTracker, CfnTrackerConsumer } from 'aws-cdk-lib/aws-location';
import { BuildConfig } from '../lib/common/config.interface';
import { name } from '../lib/common/utils';


export class LocationServiceStack extends Stack {
  private readonly geofenceCollection: CfnGeofenceCollection;
  private readonly tracker: CfnTracker;
  private readonly trackerConsumer: CfnTrackerConsumer;

  constructor(scope: App, id: string, props: StackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    this.geofenceCollection = this.createGeofencesCollection(name(`${id}-geofence`));
    this.tracker = this.createTracker(name(`${id}-tracker`));
    this.trackerConsumer = this.linkTrackerConsumer(name(`${id}-consumer`));
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

  private linkTrackerConsumer(name: string) : CfnTrackerConsumer {
    return new CfnTrackerConsumer(this, name, {
      consumerArn: this.geofenceCollection.attrArn,
      trackerName: this.tracker.trackerName
    })
  }
}