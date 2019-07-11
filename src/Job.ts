import { Docker, PackageManager } from './interfaces'

export default class Job {
  name = ''
  package: PackageManager | null = null
  dockers: Docker[] = []
  branches: string[] = []
  requires: string[] = []
  tasksLiteral = ''

  constructor(name: string) {
    this.name = name
  }

  toPackageManagerCommandsWithCache() {
    if (!this.package) {
      return []
    }
    switch (this.package) {
      case 'yarn':
        return [
          {
            restore_cache: {
              keys: ['v2-dependencies-{{ checksum "yarn.lock" }}', 'v2-dependencies-'],
            },
          },
          { run: 'yarn install' },
          {
            save_cache: {
              paths: ['node_modules'],
              key: 'v2-dependencies-{{ checksum "yarn.lock" }}',
            },
          },
        ]
      case 'npm':
        return [
          {
            restore_cache: {
              keys: ['v2-dependencies-{{ checksum "package-lock.json" }}', 'v2-dependencies-'],
            },
          },
          { run: 'npm install' },
          {
            save_cache: {
              paths: ['node_modules'],
              key: 'v2-dependencies-{{ checksum "package-lock.json" }}',
            },
          },
        ]
      default:
        throw new Error(`sorry, specified package manager ${this.package} is not implemented yet`)
    }
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
