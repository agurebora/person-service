import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { applyTags } from './applyTags';


export interface PersonInterfaceStackInput {
    readonly lambda: lambda.Function;
}

export class PersonInterfaceStack extends Stack {
    // The constructor for the PersonInterfaceStack contains lambda
    // integration with API Gateway, allowing the Lambda function to be invoked
    // via HTTP requests through the API Gateway.
    constructor(scope: Construct, id: string, input: PersonInterfaceStackInput , props?: StackProps) {
        super(scope, id, props);

        // Create the API Gateway REST API
        const api = new apigateway.RestApi(this, 'PersonApi', {
            restApiName: 'Person Service API',
            description: 'This service serves person data.',
            deployOptions: {
                stageName: 'dev',
                tracingEnabled: true,
            },
        })

        // Apply tags to the API Gateway
        applyTags(api, props?.tags);

        // Example resource and method (replace with your actual resources/methods)
        const personApi = api.root.addResource('person');
        personApi.addMethod('GET', new apigateway.LambdaIntegration(input.lambda), {
            operationName: 'GetPerson',
        });
        // Add a POST method to create a new person
        personApi.addMethod('POST', new apigateway.LambdaIntegration(input.lambda), {
            operationName: 'CreatePerson',
        });

    }
}