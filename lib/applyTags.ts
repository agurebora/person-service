import { Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export function applyTags(resource: Construct, tags?: { [key: string]: string }) {
  if (tags) {
    for (const [key, value] of Object.entries(tags)) {
      Tags.of(resource).add(key, value);
    }
  }
}