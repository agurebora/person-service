import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class PersonInterfaceStack extends cdk.Stack {
    // The constructor for the PersonInterfaceStack contains lambda
    // integration with API Gateway, allowing the Lambda function to be invoked
    // via HTTP requests through the API Gateway.
    constructor(scope: Construct, id: string, lambda: lambda.Function , props?: cdk.StackProps) {
        super(scope, id, props);

        const personLambda = lambda;

        // Create the API Gateway REST API
        const api = new apigateway.RestApi(this, 'PersonApi', {
            restApiName: 'Person Service API',
            description: 'API Gateway for Person Service',
            deployOptions: {
                stageName: 'prod',
            },
        });

        // Example resource and method (replace with your actual resources/methods)
        const persons = api.root.addResource('persons');
        persons.addMethod('GET', new apigateway.LambdaIntegration(personLambda));
        persons.addMethod('POST', new apigateway.LambdaIntegration(personLambda));
    }
}