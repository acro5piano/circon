import config from '..'
const yaml = require('js-yaml')

test('dumps group', () => {
  config.docker('mysql:8', {
    environment: {
      TZ: '/usr/share/zoneinfo/Asia/Tokyo',
    },
  })

  config.group('nodejs', () => {
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
  })

  // prettier-ignore
  config
    .define('test')
    .docker('circleci/ruby:2.5.0')
    .usePackage('bundler')
    .tasks`
        bundle exec rails test
      `

  expect(config.toConfig()).toEqual(yaml.safeLoad`
    version: 2
    jobs:
      publish:
        docker:
          - image: 'mysql:8'
            environment:
              TZ: /usr/share/zoneinfo/Asia/Tokyo
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
      test:
        docker:
          - image: 'mysql:8'
            environment:
              TZ: /usr/share/zoneinfo/Asia/Tokyo
          - image: 'circleci/ruby:2.5.0'
        working_directory: ~/repo
        steps:
          - checkout
          - restore_cache:
              keys:
                - 'v2-dependencies-{{ checksum "Gemfile.lock" }}'
                - v2-dependencies-
          - run: bundle install --path vendor/bundle
          - save_cache:
              paths:
                - vendor
              key: 'v2-dependencies-{{ checksum "Gemfile.lock" }}'
          - run: bundle exec rails test
    workflows:
      version: 2
      master_jobs:
        jobs:
          - publish
          - test
  `)
})
