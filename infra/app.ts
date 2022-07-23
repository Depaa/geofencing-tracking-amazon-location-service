import { App, Environment, StackProps } from 'aws-cdk-lib';
import { getConfig } from './lib/common/build-config';
import { BuildConfig } from './lib/common/config.interface';
import { Tags } from 'aws-cdk-lib';
import { LocationServiceStack } from './stacks/location-service';
import { NotificationStack } from './stacks/notification-target';

const app = new App();

const buildConfig: BuildConfig = getConfig(app);
Tags.of(app).add('Environment', buildConfig.environment);
Tags.of(app).add('Project', buildConfig.project);

const env: Environment = { account: buildConfig.account, region: buildConfig.region }
const stackId = `${buildConfig.environment}-${buildConfig.project}`;
const baseProps: StackProps = { env }

const locationServiceStackId = `${stackId}-ls`;
const locationServiceStack = new LocationServiceStack(app, locationServiceStackId, {
  ...baseProps,
  stackName: locationServiceStackId,
}, buildConfig);

const eventbridgeStackId = `${stackId}-event`;
const eventbridgeStack = new NotificationStack(app, eventbridgeStackId, {
  ...baseProps,
  stackName: eventbridgeStackId,
}, buildConfig);