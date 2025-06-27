import { Duration, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as aws_dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class PersonDataStack extends Stack {
  public readonly tableName: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB table for storing person data
    const personTable = new aws_dynamodb.Table(this, 'PersonTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'lastName', type: aws_dynamodb.AttributeType.STRING },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });


    this.tableName = personTable.tableName;


  }
}
