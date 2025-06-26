import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

export class PersonBusinessLogicStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a Lambda function
    const personLambda = new lambda.Function(this, 'PersonLambda', {
      runtime: lambda.Runtime.NODEJS_22_X, 
      code: lambda.Code.fromAsset('lambda'),
      handler: 'person.handler',
      timeout: Duration.seconds(30),
      environment: {
        PERSON_TABLE_NAME: "PersonTable", // Example environment variable for DynamoDB table
        EVENT_BUS_NAME: 'PersonEventBus',
        ENV: 'production', // Example environment variable
      },
    });

    // Create EventBridge resources that the Lambda function will publish to
    const eventBus = new events.EventBus(this, 'PersonEventBus', {
      eventBusName: 'PersonEventBus',
    });
  }
}
