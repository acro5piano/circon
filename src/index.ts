const yaml = require('js-yaml')

export function run() {
  return {}
}

interface Docker {
  image: string
  config?: object
}

type PackageManager = 'yarn' | 'bundler' | 'npm'

class Job {
  package: PackageManager | null = null
  dockers: Docker[] = []
  name = ''
  branches: string[] = []
  tasksLiteral!: TemplateStringsArray

  docker(image: string, config: object | undefined) {
    this.dockers.push({
      image,
      ...config,
    })
    return this
  }

  define(name: string) {
    this.name = name
    return this
  }

  branch(...branches: string[]) {
    this.branches = branches
    return this
  }

  tasks(...literal: TemplateStringsArray[]) {
    this.tasksLiteral = literal[0]
    return this
  }

  usePackage(pm: PackageManager) {
    this.package = pm
    return this
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
    }
    return []
  }

  toConfig() {
    return {
      version: 2,
      jobs: {
        deploy: {
          docker: this.dockers,
          working_directory: '~/repo',
          steps: [
            'checkout',
            ...this.toPackageManagerCommandsWithCache(),
            ...this.tasksLiteral
              .toString()
              .split('\n')
              .filter(t => Boolean(t.match(/[a-z]/)))
              .map(t => ({
                run: t.trim(),
              })),
          ],
        },
      },
      workflows: {
        version: 2,
        master_jobs: {
          jobs: [
            {
              [this.name]: {
                filters: {
                  branches: {
                    only: this.branches,
                  },
                },
              },
            },
          ],
        },
      },
    }
  }

  dump() {
    return yaml.safeDump(this.toConfig(), {
      noRefs: true,
      noCompatMode: true,
    })
  }
}

export default new Job()
