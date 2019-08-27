[![npm version](https://badge.fury.io/js/circon.svg)](https://badge.fury.io/js/circon)
[![CircleCI](https://circleci.com/gh/acro5piano/circon.svg?style=svg)](https://circleci.com/gh/acro5piano/circon)

# Circon

CircleCI Config generator

# Install

```
npm -g install circon
```

Or if you use Yarn:

```
yarn global add circon
```

# tl;dr

```typescript
const config = require('circon')

config
  .docker('circleci/node:10.3.0')
  .docker('postgres', {
    environment: {
      TZ: '/usr/share/zoneinfo/Africa/Abidjan',
    },
  })

config
  .define('test')
  .usePackage('yarn')
  .tasks`
    yarn test
  `

console.log(config.dump())
```

Outputs:

```yml
version: 2
jobs:
  test:
    docker:
      - image: 'circleci/node:10.3.0'
      - image: 'postgres'
        environment:
          TZ: /usr/share/zoneinfo/Africa/Abidjan
    working_directory: ~/repo
    steps:
      - checkout
      - restore_cache:
          keys:
            - 'v2-dependencies-{{ checksum "yarn.lock" }}'
            - v2-dependencies-
      - run: yarn install
      - save_cache:
          paths:
            - node_modules
          key: 'v2-dependencies-{{ checksum "yarn.lock" }}'
      - run: yarn test
workflows:
  version: 2
  master_jobs:
    jobs:
      - test
```

# Motivation

CircleCI is great, but if we have a lot of jobs & workflows, the configuration file become messy.

Although CircleCI can interpret YAML syntax like `<<: *defaults` or `- run: *setup_awscli`, still verbose.

**circon** comes in to address this issue. It reduces a lot of your YAML code! For example, let's say more complex configuration:

```typescript
const config = require('circon')

const installAwsCli = `
  mkdir ~/.aws
  echo '[default]' >> ~/.aws/credentials
  echo aws_access_key_id = $AWS_ACCESS_KEY_ID >> ~/.aws/credentials
  echo aws_secret_access_key = $AWS_SECRET_ACCESS_KEY >> ~/.aws/credentials
  echo region = ap-northeast-1 >> ~/.aws/credentials
`

config
  .docker('circleci/node:10.3.0', {
    environment: {
      TZ: '/usr/share/zoneinfo/Asia/Tokyo',
    },
  })
  .docker('postgres', {
    environment: {
      TZ: '/usr/share/zoneinfo/Africa/Abidjan',
    },
  })

config
  .define('graphdoc')
  .usePackage('yarn')
  .tasks`
    yarn graphdoc
  `

config
  .define('test')
  .usePackage('yarn')
  .branches('develop')
  .docker('nats')
  .tasks`
    yarn test
  `

config
  .define('deploy')
  .usePackage('yarn')
  .branches('beta', 'master')
  .requires('test')
  .tasks`
    ${installAwsCli}
    yarn deploy
  `

config
  .define('publish')
  .usePackage('yarn')
  .branches('release')
  .requires('test', 'deploy')
  .tasks`
    ${installAwsCli}
    yarn publish
  `

console.log(config.dump())
```

The output is too long to paste here. Please see https://github.com/acro5piano/circon/blob/master/src/__tests__/index.test.ts

# Options

**`config.docker(name: string, config: any)`**

Define default docker container to run. If you set this option after `define`, containers will run only in the job.

**`config.define(taskName: string)`**

Define a task.

**`config.usePackage(package: 'yarn' | 'npm')`**

Use specified package manager to install dependencies before tasks and save its cache.

**`config.branches(name: ...string[])`**

Run only if current branch is specified branches.

**`config.requires(name: ...string[])`**

Do not run job if specified job failed.

**`config.tasks(name: TemplateStringsArray)`**

Run specified commands.

# CLI

Create a configuration file (say `circle.js`) like this:

```typescript
// circle.js

config
  .define('test')
  .docker('circleci/node:10.3.0')
  .usePackage('yarn')
  .tasks`
    yarn test
  `

module.exports = config
```

Then run

```
circon circle.js
```

# TODO

- [ ] `git tag` support
