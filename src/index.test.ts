import config from '.'
const yaml = require('js-yaml')

test('dump', () => {
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
    .define('test')
    .usePackage('yarn')
    .branch('develop')
    .tasks`
      yarn test
    `

  // prettier-ignore
  config
    .define('deploy')
    .usePackage('yarn')
    .branch('beta', 'master')
    .tasks`
      yarn deploy
    `

  expect(config.toConfig()).toEqual(yaml.safeLoad`
    version: 2
    jobs:
      test:
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
    workflows:
      version: 2
      master_jobs:
        jobs:
          - test:
              filters:
                branches:
                  only:
                    - develop
          - deploy:
              filters:
                branches:
                  only:
                    - beta
                    - master
      `)
})
