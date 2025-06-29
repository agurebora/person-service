import { Duration, Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { applyTags } from './applyTags';


export interface PersonBusinessLogicStackInput {
  readonly personTableName: string;
  readonly personTableArn: string;
  readonly eventBusName: string;
}

export class PersonBusinessLogicStack extends Stack {
  public readonly lambda: lambda.Function;
  eventBusName: string;

  constructor(scope: Construct, id: string, input: PersonBusinessLogicStackInput, props?: StackProps) {
    super(scope, id, props);

    this.eventBusName = 'PersonEventBus';

    // Create a Lambda function with tags
    const personLambda = new lambda.Function(this, 'PersonLambda', {
      runtime: lambda.Runtime.NODEJS_22_X, 
      code: lambda.Code.fromAsset('lambda'),
      handler: 'person-lambda.handler',
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: input.personTableName,
        EVENT_BUS_NAME: input.eventBusName 
      },
    });

    // Store the Lambda function in a class property for later use
    this.lambda = personLambda;
    
    // Apply tags to the Lambda function
    applyTags(personLambda, props?.tags);

    // Create EventBridge resources that the Lambda function will publish to
    const eventBus = new events.EventBus(this, 'PersonEventBus', {
      eventBusName: input.eventBusName,
    });

    // Grant the Lambda function permissions to put events to the EventBridge bus
    eventBus.grantPutEventsTo(personLambda);
    
    // Grant the Lambda function permissions to access the DynamoDB table
    personLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan', 'dynamodb:UpdateItem'],
      resources: [input.personTableArn],
    }));
  }
}
