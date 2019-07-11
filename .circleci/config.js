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
