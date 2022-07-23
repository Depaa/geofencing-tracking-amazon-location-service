import { App, Environment, StackProps } from 'aws-cdk-lib';
import { getConfig } from './lib/common/build-config';
import { BuildConfig } from './lib/common/config.interface';
import { Tags } from 'aws-cdk-lib';

const app = new App();

const buildConfig: BuildConfig = getConfig(app);
Tags.of(app).add('Environment', buildConfig.environment);
Tags.of(app).add('Project', buildConfig.project);

const env: Environment = { account: buildConfig.account, region: buildConfig.region }
const stackId = `${buildConfig.environment}-${buildConfig.project}`;
const baseProps: StackProps = { env }

// const vpcStackId = `${stackId}-vpc`;
// const vpcStack = new VPCStack(app, vpcStackId, {
//   ...baseProps,
//   stackName: vpcStackId,
// }, buildConfig);


// const albStackId = `${stackId}-alb`;
// const albStack = new ALBStack(app, albStackId, {
//   ...baseProps,
//   stackName: albStackId,
//   vpc: vpcStack.vpc,
// }, buildConfig);