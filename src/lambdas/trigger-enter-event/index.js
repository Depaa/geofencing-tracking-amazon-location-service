const SNS = require('aws-sdk/clients/sns');
const sns = new SNS();

exports.handler = async (event) => {
  console.log(event);

  const params = {
    Message: `Enjoy your ${event.detail.EventType} event`,
    Subject: event.detail.EventType === 'ENTER' ? 'Welcome to my blog' : 'See you soon',
    TopicArn: `arn:aws:sns:${process.env.REGION}:${process.env.ACCOUNT_ID}:${process.env.TOPIC_NAME}`,
  };

  const response = await sns.publish(params).promise();
  console.info(`Successfully sent message`);
  console.info(response);
};
