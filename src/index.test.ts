import config from '.'
const yaml = require('js-yaml')

test('dump', () => {
  config.docker('circleci/node:10.3.0', {
    environment: {
      TZ: '/usr/share/zoneinfo/Asia/Tokyo',
    },
  })

  // prettier-ignore
  config
    .define('deploy')
    .usePackage('yarn')
    .branch('develop', 'master')
    .tasks`
      yarn tsc
      yarn lint
      yarn deploy
    `

  expect(config.toConfig()).toEqual(yaml.safeLoad`
    version: 2
    jobs:
      deploy:
        docker:
          - image: 'circleci/node:10.3.0'
            environment:
              TZ: /usr/share/zoneinfo/Asia/Tokyo
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
          - run: yarn tsc
          - run: yarn lint
          - run: yarn deploy
    workflows:
      version: 2
      master_jobs:
        jobs:
          - deploy:
              filters:
                branches:
                  only:
                    - develop
                    - master
      `)
})
