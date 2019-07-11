# Circon

CircleCI Config generator

# Install

```
npm install --save circon
```

Or if you use Yarn:

```
yarn add circon
```

# tl;dr

```typescript
// prettier-ignore
const config = require('circon')

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

The output:

```yaml
version: 2
jobs:
  graphdoc:
    docker:
      - image: 'circleci/node:10.3.0'
        environment:
          TZ: /usr/share/zoneinfo/Asia/Tokyo
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
      - run: yarn graphdoc
  test:
    docker:
      - image: 'circleci/node:10.3.0'
        environment:
          TZ: /usr/share/zoneinfo/Asia/Tokyo
      - image: 'postgres'
        environment:
          TZ: /usr/share/zoneinfo/Africa/Abidjan
      - image: nats
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
  deploy:
    docker:
      - image: 'circleci/node:10.3.0'
        environment:
          TZ: /usr/share/zoneinfo/Asia/Tokyo
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
      - run: yarn deploy
  publish:
    docker:
      - image: 'circleci/node:10.3.0'
        environment:
          TZ: /usr/share/zoneinfo/Asia/Tokyo
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
      - run: yarn publish
workflows:
  version: 2
  master_jobs:
    jobs:
      - graphdoc
      - test:
          filters:
            branches:
              only:
                - develop
      - deploy:
          requires:
            - test
          filters:
            branches:
              only:
                - beta
                - master
      - publish:
          requires:
            - test
            - deploy
          filters:
            branches:
              only:
                - release
```

# TODO

- git tag
- CLI tool
- CircleCI conf
