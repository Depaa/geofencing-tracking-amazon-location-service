const { LocationClient, BatchUpdateDevicePositionCommand } = require('@aws-sdk/client-location');
const { positionOut: P_OUT, positionIn: P_IN } = require('./polygon.json');

const client = new LocationClient({ region: 'eu-central-1' });

const TRACKER_NAME = 'dev-geofencing-tracking-blog-ls-tracker';
const COUNT_AFTER_CONSECUTIVE_OUT = 10;

const handler = async () => {
  try {
    for (let index = 1; index <= 100; index++) {
      const command = new BatchUpdateDevicePositionCommand({
        TrackerName: TRACKER_NAME,
        Updates: [
          {
            DeviceId: 'test-device',
            Position: index % COUNT_AFTER_CONSECUTIVE_OUT ? P_OUT : P_IN,
            SampleTime: new Date(),
          }
        ]
      })
      await client.send(command);
      console.log(`#${index} - ${index % COUNT_AFTER_CONSECUTIVE_OUT ? 'P_OUT' : 'P_IN'}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error(error);
  }
};

handler();