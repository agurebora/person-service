import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PersonDataStack } from '../lib/person-data-stack';
import { PersonBusinessLogicStack } from '../lib/person-business-logic-stack';
import { PersonInterfaceStack } from '../lib/person-interface-stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';

describe('Person Service CDK Stacks', () => {
  test('DynamoDB Table Created with correct schema', () => {
    const app = new cdk.App();
    const stack = new PersonDataStack(app, 'TestPersonDataStack');
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'personId', KeyType: 'HASH' },
        { AttributeName: 'lastName', KeyType: 'RANGE' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });
  });

  test('Lambda Function Created with correct environment variables', () => {
    const app = new cdk.App();
    const stack = new PersonBusinessLogicStack(app, 'TestPersonBusinessLogicStack', {
      personTableName: 'TestTable',
      personTableArn: 'arn:aws:dynamodb:us-east-1:123456789012:table/TestTable',
      eventBusName: 'TestEventBus',
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'person-lambda.handler',
      Runtime: 'nodejs22.x',
      Environment: {
        Variables: {
          TABLE_NAME: 'TestTable',
          EVENT_BUS_NAME: 'TestEventBus'
        }
      }
    });
  });

  test('API Gateway Created with /person resource and methods', () => {
    const app = new cdk.App();
    // Create a stack for the dummy lambda
    const lambdaStack = new cdk.Stack(app, 'LambdaStack');
    const dummyLambda = new lambda.Function(lambdaStack, 'DummyLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromInline('exports.handler = async () => {};'),
      handler: 'index.handler',
    });
    const stack = new PersonInterfaceStack(app, 'TestPersonInterfaceStack', { lambda: dummyLambda });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'person'
    });
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST'
    });
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET'
    });
  });
});


