import { run } from '.'
// prettier-ignore

test('hoge', () => {
  expect(run()).toEqual({})
})

// job
//   .define('deploy_payment_web')
//   .tasks`
//     yarn apollo-codegen:production
//     yarn tsc
//     yarn lint
//     cp packages/nupp1-payment-api/{.env.ci,.env}
//     yarn workspace @nupp1/payment-api knex migrate:latest
//     yarn test:all:serial --coverage
//   `
//   .branch('develop', 'master')
