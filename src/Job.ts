import { Docker } from './interfaces'
import { Package } from './packages'

export default class Job {
  name = ''
  package: Package | null = null
  dockers: Docker[] = []
  branches: string[] = []
  requires: string[] = []
  tasksLiteral = ''
  groupName = ''

  constructor(name: string, groupName = '') {
    this.name = name
    this.groupName = groupName
  }

  toPackageManagerCommandsWithCache() {
    if (!this.package) {
      return []
    }
    return this.package.toCommands()
  }

  toConfig() {
    return {
      working_directory: '~/repo',
      steps: [
        'checkout',
        ...this.toPackageManagerCommandsWithCache(),
        ...this.tasksLiteral
          .split('\n')
          .filter(t => Boolean(t.match(/[a-z]/)))
          .map(t => ({
            run: t.trim(),
          })),
      ],
    }
  }

  toWorkflowConfig() {
    if (this.branches.length === 0 && this.requires.length === 0) {
      return this.name
    }

    const filterConfig =
      this.branches.length === 0
        ? {}
        : {
            filters: {
              branches: {
                only: this.branches,
              },
            },
          }

    const requiresConfig =
      this.requires.length === 0
        ? {}
        : {
            requires: this.requires,
          }

    return {
      [this.name]: {
        ...requiresConfig,
        ...filterConfig,
      },
    }
  }
}
