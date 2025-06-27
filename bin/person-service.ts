#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PersonBusinessLogicStack } from '../lib/person-business-logic-stack';
import { PersonDataStack } from '../lib/person-data-stack';
import { PersonInterfaceStack } from '../lib/person-interface-stack';

const stackProps: cdk.StackProps = {
  tags: {
    service: 'PersonService',
    env: 'dev',
  },
};

const app = new cdk.App();
// Create the data stack first to ensure the DynamoDB table is available
const dataStack = new PersonDataStack(app, 'PersonDataStack', stackProps);
// Create the business logic stack, passing the DynamoDB table name from the data stack
const businessLogicStack = new PersonBusinessLogicStack(app, 'PersonBusinessLogicStack', dataStack.tableName, stackProps);
// Create the interface stack, which will use the Lambda function created in the business logic stack
new PersonInterfaceStack(app, 'PersonInterfaceStack', businessLogicStack.lambda, stackProps);

