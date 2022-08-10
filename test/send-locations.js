const Location = require('aws-sdk/clients/location');
const positions = require('./polygon.json');

const locationService = new Location({ region: 'eu-central-1' });

const COLLECTION_NAME = 'dev-geofencing-tracking-test-ls-geofence-collection';
const POSITION_OUT = positions.positionOut;
const POSITION_IN = positions.positionIn;
const COUNT_AFTER_CONSECUTIVE_OUT = 10;

const handler = async () => {
  try {
    for (let index = 1; index <= 100; index++) {
      await locationService
        .batchEvaluateGeofences({
          CollectionName: COLLECTION_NAME,
          DevicePositionUpdates: [
            {
              DeviceId: 'test-device',
              Position: index % COUNT_AFTER_CONSECUTIVE_OUT ? POSITION_OUT : POSITION_IN,
              SampleTime: new Date(),
            },
          ],
        })
        .promise();
      console.log(`#${index} - ${index % COUNT_AFTER_CONSECUTIVE_OUT ? 'POSITION_OUT' : 'POSITION_IN'}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error(error);
  }
};

handler();
