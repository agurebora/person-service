import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

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
        });

        // Model for the API Gateway
        const personModel = new apigateway.Model(this, 'PersonModel', {
            restApi: api,
            contentType: 'application/json',
            modelName: 'Person',
            schema: {
                type: apigateway.JsonSchemaType.OBJECT,
                properties: {
                    firstName: { type: apigateway.JsonSchemaType.STRING },
                    lastName: { type: apigateway.JsonSchemaType.STRING },
                    phoneNumber: { type: apigateway.JsonSchemaType.STRING },
                    address: {
                        type: apigateway.JsonSchemaType.OBJECT,
                        properties: {
                            street: { type: apigateway.JsonSchemaType.STRING },
                            city: { type: apigateway.JsonSchemaType.STRING },
                            province: { type: apigateway.JsonSchemaType.STRING },
                            zipCode: { type: apigateway.JsonSchemaType.STRING },
                            country: { type: apigateway.JsonSchemaType.STRING },
                        },
                        required: ['street', 'city', 'province', 'zipCode', 'country'],
                    },
                },
                required: ['firstName', 'lastName', 'phoneNumber', 'address'],
            },
        });

        // Example resource and method (replace with your actual resources/methods)
        const personApi = api.root.addResource('person');
        personApi.addMethod('GET', new apigateway.LambdaIntegration(input.lambda), {
            operationName: 'GetPerson',
            methodResponses: [
                {
                    statusCode: '200',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL,
                    },
                },
                {
                    statusCode: '400',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL
                    },
                },
                {
                    statusCode: '500',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL
                    },
                },
            ],
        });
        // Add a POST method to create a new person
        personApi.addMethod('POST', new apigateway.LambdaIntegration(input.lambda), {
            operationName: 'CreatePerson',
            requestModels: {
                'application/json': personModel,
            },
            methodResponses: [
                {
                    statusCode: '200',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL
                    },
                },
                {
                    statusCode: '400',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL
                    },
                },
                {
                    statusCode: '500',
                    responseModels: {
                        'application/json': apigateway.Model.EMPTY_MODEL
                    },
                },
            ],
        });

    }
}