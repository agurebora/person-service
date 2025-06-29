# Person Service Microservice

This project implements the **Person Service** microservice using AWS CDK (TypeScript). The service exposes an API endpoint (`/person`) to create and list persons, stores person data in DynamoDB, and emits a person-created event to EventBridge. 

The architecture is fully serverless and easily deployable.

## Features

- API endpoint (`/person`) for creating and listing persons
- Stores person data (first name, last name, phone number, address) in DynamoDB
- Emits a person-created event to EventBridge
- Serverless, scalable, and infrastructure-as-code using AWS CDK
- All AWS resources are tagged

## Project Structure

- `lib/` — CDK stack definitions (DynamoDB, Lambda, API Gateway, EventBridge)
- `lambda/` — Lambda function code
- `test/` — Jest unit tests for CDK stacks
- `bin/` — CDK app entry point

## Prerequisites

- Node.js (v18 or later recommended)
- AWS CDK v2 (`npm install -g aws-cdk`)


## Install Dependencies

Install dependencies for the CDK project

```
npm install
```

Install dependencies for Lambda

```
cd ./lambda && npm install
```

## Run Tests

Tests to validate the CDK stacks:

```
npm test
```

## Configure your AWS environment

Configure your AWS credentials through environment variables 

```
export AWS_REGION=<your-preferred-region>
```
```
export AWS_ACCESS_KEY_ID=<your-access-key-id>
```
```
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

Before deploying for the first time, run:
Skip this step if you have already setup CDK with your account.

```
cdk bootstrap
```

## Deploy the Service

Deploy the CDK stacks to your AWS account/region:

```
cdk deploy --all
```

You can also deploy stacks individually

```
cdk deploy PersonDataStack
```
```
cdk deploy PersonBusinessLogicStack
```
```
cdk deploy PersonInterfaceStack
```

The API endpoint will be output after deployment. Use this endpoint to create and list persons in the next step.

## CURL request examples

Export PERSON_API_ENDPOINT value with the API endpoint provided by CDK: PersonInterfaceStack.HttpApiPersonUrl

```
export PERSON_API_ENDPOINT=<api-endpoint>
```
```
curl --location $PERSON_API_ENDPOINT
```
```
curl --location $PERSON_API_ENDPOINT \
--header 'Content-Type: application/json' \
--data '{
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+310000000",
    "address": {
        "street": "Street",
        "city": "City",
        "province": "Province",
        "zipcode": "1234",
        "country": "Country"
    }
}'
```


## Cleanup 

To remove all resources created by this project:

```
cdk destroy --all
```
