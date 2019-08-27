import config from '..'
const yaml = require('js-yaml')

it('dumps correctly', () => {
  // prettier-ignore
  config
    .docker('circleci/node:10.3.0')
    .docker('postgres', {
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

  expect(config.toConfig()).toEqual(yaml.safeLoad`
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
      `)
})
