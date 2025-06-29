import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as aws_dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { applyTags } from './applyTags';


export class PersonDataStack extends Stack {
  public readonly tableName: string;
  public readonly tableArn: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB table for storing person data
    const personTable = new aws_dynamodb.Table(this, 'PersonTable', {
      partitionKey: { name: 'personId', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'lastName', type: aws_dynamodb.AttributeType.STRING },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Apply tags from props to the table
    applyTags(personTable, props?.tags);

    this.tableName = personTable.tableName;
    this.tableArn = personTable.tableArn;
  }
}
