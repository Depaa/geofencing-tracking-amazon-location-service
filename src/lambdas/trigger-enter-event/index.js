const SNS = require('aws-sdk/clients/sns');
const sns = new SNS();

exports.handler = async (event) => {
  console.debug(event);

  const params = {
    Message: JSON.stringify({
      sms: `Enjoy your ${event.detail.EventType} event`,
      email: `Enjoy your ${event.detail.EventType} event`,
      default: `Enjoy your ${event.detail.EventType} event`,
    }),
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: 'BlogTest' }, //Disadvantages: Support and requirements for sender ID authentication aren't consistent across all countries or regions. Several major markets (including Canada, China, and the United States) don't support sender ID. In some areas, you must have your sender IDs pre-approved by a regulatory agency before you can use them.
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
    },
    Subject: event.detail.EventType === 'ENTER' ? 'Welcome to my blog' : 'See you soon',
    TopicArn: `arn:aws:sns:${process.env.REGION}:${process.env.ACCOUNT_ID}:${process.env.TOPIC_NAME}`,
    MessageStructure: 'json',
  };

  const response = await sns.publish(params).promise();
  console.info(`Successfully sent message ${response.MessageId}`);
  console.debug(response);
};
