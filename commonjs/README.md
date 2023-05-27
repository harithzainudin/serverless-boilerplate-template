# Common Template

This template is using commonjs module.

### Default plugins added

These are the list of default plugins added into this template because of how useful there are. You can remove it if you do not want it.

1. [serverless-plugin-include-dependencies](https://www.serverless.com/plugins/serverless-plugin-include-dependencies) - This is a Serverless plugin that should make your deployed functions smaller. It does this by excluding node_modules then individually adds each module file that your handler depends on.
2. [serverless-plugin-common-excludes](https://www.serverless.com/plugins/serverless-plugin-common-excludes) - This plugin adds some common unnecessary items (such as docs, test code, unused configuration files, etc.) to the package: exclude configuration of your Serverless project to make it smaller.
3. [serverless-prune-plugin](https://www.serverless.com/plugins/serverless-prune-plugin) - Following deployment, the Serverless Framework does not purge previous versions of functions from AWS, so the number of deployed versions can grow out of hand rather quickly. This plugin allows pruning of all but the most recent version(s) of managed functions from AWS.

### Extra plugins

You can install extra plugins if you wish additional plugins for your serverless project. These are the list of plugins that I think will be useful for a serverless project.

1. [serverless-deployment-bucket](https://www.serverless.com/plugins/serverless-deployment-bucket) - This plugin will create your custom deployment bucket if it doesn't exist, and optionally configure the deployment bucket to apply server-side encryption. If you have already created your own deployment bucket beforehand, then probably you do not need this plugin.
   - run `npm i serverless-deployment-bucket` or `serverless plugin install -n serverless deployment bucket`
   - If you run the second command in the first step, then you do not need to follow this second step, just proceed to third step. Add `serverless-deployment-bucket` under `plugins`
     ```
     plugins:
       - serverless-deployment-bucket
     ```
   - To use this plugin, inside your `serverless.yml`, under `provider` tag, add in as below
     ```
     provider:
       deploymentBucket:
         name: <put-your-own-bucket-name>
     ```
2. [serverless-webpack](https://www.serverless.com/plugins/serverless-webpack) - A Serverless Framework plugin to build your lambda functions with Webpack. This plugin is for you if you want to use the latest Javascript version with Babel; use custom resource loaders, optimize your packaged functions individually and much more!
   - run `npm i serverless-webpack`

[Go here](https://www.serverless.com/plugins) for more serverless plugin.
