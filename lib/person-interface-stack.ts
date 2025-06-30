import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { applyTags } from './applyTags';


export interface PersonInterfaceStackInput {
    readonly lambda: lambda.Function;
}

export class PersonInterfaceStack extends Stack {
    constructor(scope: Construct, id: string, input: PersonInterfaceStackInput , props?: StackProps) {
        super(scope, id, props);

        // Create the HTTP API with a default stage and autoDeploy enabled
        const httpApi = new apigatewayv2.HttpApi(this, 'PersonHttpApi', {
            apiName: 'Person Service HTTP API',
            description: 'Person service API',
            createDefaultStage: true,
        });

        // Apply tags to the HTTP API
        applyTags(httpApi, props?.tags);

        // Lambda integration for HTTP API
        const lambdaIntegration = new integrations.HttpLambdaIntegration(
            'PersonLambdaIntegration',
            input.lambda
        );

        // Add routes for GET and POST /person
        httpApi.addRoutes({
            path: '/person',
            methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.POST],
            integration: lambdaIntegration,
        });

        // Output the API Gateway default endpoint
        new CfnOutput(this, 'HttpApiUrl', {
            value: httpApi.apiEndpoint,
            description: 'The default endpoint for the Person Service HTTP API',
        });

        // Output the API Gateway default endpoint with /person path
        new CfnOutput(this, 'HttpApiPersonUrl', {
            value: `${httpApi.apiEndpoint}/person`,
            description: 'The endpoint for the Person Service HTTP API with /person path',
        }); 
    }
}