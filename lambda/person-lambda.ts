import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({});
const eventBridgeClient = new EventBridgeClient({});

interface PersonData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
}

const validatePersonData = (data: any): PersonData => {
  if (!data.firstName || typeof data.firstName !== 'string') {
    throw new Error('firstName is required and must be a string');
  }
  if (!data.lastName || typeof data.lastName !== 'string') {
    throw new Error('lastName is required and must be a string');
  }
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    throw new Error('phoneNumber is required and must be a string');
  }
  if (!data.address || typeof data.address !== 'object') {
    throw new Error('address is required and must be an object');
  }
  
  const address = data.address;
  if (!address.street || !address.city || !address.province || !address.zipCode || !address.country) {
    throw new Error('All address fields (street, city, province, zipCode, country) are required');
  }

  return data as PersonData;
};

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const personData = validatePersonData(JSON.parse(event.body));
    const personId = uuidv4();
    const timestamp = new Date().toISOString();

    // Save to DynamoDB Table
    const putItemCommand = new PutItemCommand({
      TableName: process.env.PERSON_TABLE_NAME,
      Item: {
        personId: { S: personId },
        firstName: { S: personData.firstName },
        lastName: { S: personData.lastName },
        phoneNumber: { S: personData.phoneNumber },
        address: {
          M: {
            street: { S: personData.address.street },
            city: { S: personData.address.city },
            province: { S: personData.address.province },
            zipCode: { S: personData.address.zipCode },
            country: { S: personData.address.country }
          }
        },
        createdAt: { S: timestamp },
        updatedAt: { S: timestamp }
      }
    });

    await dynamoClient.send(putItemCommand);

    // Publish event to EventBridge
    const eventDetail = {
      personId,
      firstName: personData.firstName,
      lastName: personData.lastName,
      phoneNumber: personData.phoneNumber,
      address: personData.address,
      createdAt: timestamp
    };

    const putEventsCommand = new PutEventsCommand({
      Entries: [
        {
          Source: 'person-service',
          DetailType: 'Person Created',
          Detail: JSON.stringify(eventDetail),
          EventBusName: process.env.EVENT_BUS_NAME
        }
      ]
    });

    await eventBridgeClient.send(putEventsCommand);

    console.log(`Person created successfully with ID: ${personId}`);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Person created successfully',
        ...eventDetail
      })
    };

  } catch (error) {
    console.error('Error creating person:', error);

    return {
      statusCode: error.message.includes('required') ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
};
