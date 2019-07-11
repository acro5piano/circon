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

// prettier-ignore
config.docker('circleci/node:10.3.0').docker('postgres', {
  environment: {
    TZ: '/usr/share/zoneinfo/Africa/Abidjan',
  },
})

// prettier-ignore
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

// prettier-ignore
config
  .define('graphdoc')
  .usePackage('yarn')
  .tasks`
    yarn graphdoc
  `

// prettier-ignore
config
  .define('test')
  .usePackage('yarn')
  .branches('develop')
  .docker('nats')
  .tasks`
    yarn test
  `

// prettier-ignore
config
  .define('deploy')
  .usePackage('yarn')
  .branches('beta', 'master')
  .requires('test')
  .tasks`
    yarn deploy
  `

// prettier-ignore
config
  .define('publish')
  .usePackage('yarn')
  .branches('release')
  .requires('test', 'deploy')
  .tasks`
    yarn publish
  `

console.log(config.dump())
```

The output is too long to paste here. Please see https://github.com/acro5piano/circon/blob/master/src/index.test.ts

# Options

**`config.docker(name: string, config: any)`**

Define default docker container to run. If you set this option after `define`, containers will run only in the job.

**`config.usePackage(package: 'yarn' | 'npm')`**

Use specified package manager to install dependencies before tasks and save its cache.

**`config.branches(name: ...string[])`**

Run only if current branch is specified branches.

**`config.requires(name: ...string[])`**

Do not run job if specified job failed.

**`config.tasks(name: TemplateLiteralArray)`**

Run specified commands.

# CLI

Create a configuration file (say `circle.js`) like this:

```typescript
// circle.js

// prettier-ignore
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

```

```

# TODO

- [ ] `git tag` support
