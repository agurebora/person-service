#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PersonBusinessLogicStack } from '../lib/person-business-logic-stack';

const app = new cdk.App();
new PersonBusinessLogicStack(app, 'PersonBusinessLogicStack');
