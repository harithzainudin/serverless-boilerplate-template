# Common Template

This template is using commonjs module.

### Default plugins added

These are the list of default plugins added into this template because of how useful there are. You can remove it if you do not want it.

1. [serverless-plugin-include-dependencies](https://www.serverless.com/plugins/serverless-plugin-include-dependencies) - This is a Serverless plugin that should make your deployed functions smaller. It does this by excluding node_modules then individually adds each module file that your handler depends on.
2. [serverless-plugin-common-excludes](https://www.serverless.com/plugins/serverless-plugin-common-excludes) - This plugin adds some common unnecessary items (such as docs, test code, unused configuration files, etc.) to the package: exclude configuration of your Serverless project to make it smaller.
3. [serverless-prune-plugin](https://www.serverless.com/plugins/serverless-prune-plugin) - Following deployment, the Serverless Framework does not purge previous versions of functions from AWS, so the number of deployed versions can grow out of hand rather quickly. This plugin allows pruning of all but the most recent version(s) of managed functions from AWS.

### Extra plugins

You can install extra plugins if you wish additional plugins for your serverless project. These are the list of plugins that I think the most useful for a serverless project.

1. [serverless-deployment-bucket](https://www.serverless.com/plugins/serverless-deployment-bucket) - This plugin will create your custom deployment bucket if it doesn't exist, and optionally configure the deployment bucket to apply server-side encryption. If you have already craeted your own deployment bucket beforehand, then probably you do not need this plugin.
    - To use this plugin, inside your `serverless.yml`, under `provider` tag, add in as below
    ```
    provider:
        deploymentBucket:
            name: <put-your-own-bucket-name>
    ```

[Go here](https://www.serverless.com/plugins) for more serverless plugin.
