import config from '..'
const yaml = require('js-yaml')

test('dumps group', () => {
  config.docker('circleci/node:10.3.0', {
    environment: {
      TZ: '/usr/share/zoneinfo/Asia/Tokyo',
    },
  })

  // prettier-ignore
  config
    .define('publish')
    .usePackage('yarn')
    .tasks`
      yarn publish
    `

  expect(config.toConfig()).toEqual(yaml.safeLoad`
    version: 2
    jobs:
      publish:
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
          - run: yarn publish
    workflows:
      version: 2
      master_jobs:
        jobs:
          - publish
  `)
})
