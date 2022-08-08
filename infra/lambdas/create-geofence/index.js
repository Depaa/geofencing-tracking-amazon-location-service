const LocationService = require('aws-sdk/clients/location');
const response = require('cfn-response');
const fs = require('fs/promises');

const locationService = new LocationService();

exports.handler = async (event, context) => {
  try {
    const geojson = JSON.parse(await fs.readFile('./polygon.geojson', 'utf8'));

    const params = {
      CollectionName: process.env.COLLECTION_NAME,
      GeofenceId: process.env.GEOFENCE_ID,
      Geometry: {
        Polygon: geojson.features[0].geometry.coordinates,
      },
    };

    switch (event.RequestType) {
      case 'Create':
        await createResource(event, context, params);
        break;
      case 'Delete':
        await deleteResource(event, context, params);
        break;
      default:
        throw new Error('Event not handled');
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      response.send(event, context, 'FAILED', { message: error.message });
    } else {
      response.send(event, context, 'FAILED', error);
    }
  }
};

const createResource = async (event, context, params) => {
  const result = await locationService.putGeofence(params).promise();
  console.info(result);

  response.send(event, context, 'SUCCESS', {
    GeofenceId: result.GeofenceId,
  });
};

const deleteResource = async (event, context, params) => {
  const result = await locationService
    .batchDeleteGeofence({
      CollectionName: params.CollectionName,
      GeofenceIds: [params.GeofenceId],
    })
    .promise();
  console.info(result);

  response.send(event, context, 'SUCCESS', {});
};
