const { DynamoDBClient, ScanCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({});
const eventBridgeClient = new EventBridgeClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;

const validatePersonData = (data) => {
  if (!data.firstName || typeof data.firstName !== 'string') {
    throw new Error('firstName is required and must be a string');
  }
  if (!data.lastName || typeof data.lastName !== 'string') {
    throw new Error('lastName is required and must be a string');
  }
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    throw new Error('phoneNumber is required and must be a string');
  }
  if (!data.address || typeof data.address !== 'object' ) {
    throw new Error('address is required and must be an object');
  }
  return data;
};

exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));


    // Support REST API and HTTP API event structures
    const method = event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method);

    if (method === 'GET') {
      const command = new ScanCommand({ TableName: TABLE_NAME });
      const data = await dynamoClient.send(command);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.Items || []),
      };
    }

    if (method === 'POST' && event.body) {
      const item = JSON.parse(event.body);
      console.log('Parsed item from request body:', item);
      const validatedItem = validatePersonData(item);
      const dynamoItem = {
        personId: { S: uuidv4() },
        firstName: { S: validatedItem.firstName },
        lastName: { S: validatedItem.lastName },
        phoneNumber: { S: validatedItem.phoneNumber },
        address: { M: Object.fromEntries(Object.entries(validatedItem.address).map(([k, v]) => [k, { S: v }] )) },
      };
      const putCommand = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: dynamoItem,
      });
      await dynamoClient.send(putCommand);
      console.log('Item successfully created in DynamoDB:', dynamoItem);

      const eventCommand = new PutEventsCommand({
        Entries: [
          {
            Source: 'com.example.person',
            DetailType: 'PersonCreated',
            Detail: JSON.stringify(validatedItem),
            EventBusName: EVENT_BUS_NAME,
          },
        ],
      });
      await eventBridgeClient.send(eventCommand);
      console.log('Event successfully sent to EventBridge:', validatedItem);

      return {
        statusCode: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: 'Item created', id: dynamoItem.personId.S }),
      };
    }

    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: 'Unsupported method or missing payload' }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    };
  }
};
