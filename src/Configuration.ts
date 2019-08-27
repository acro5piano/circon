import Job from './Job'
import { Docker, PackageManager } from './interfaces'
import { BundlerPackage, NPMPackage, YarnPackage } from './packages'

const yaml = require('js-yaml')

export default class Configuration {
  jobs: Job[] = []
  dockers: Docker[] = []
  grouping = false

  group(callback: () => void) {
    this.grouping = true
    callback()
    this.grouping = false
  }

  docker(image: string, config: object | undefined = {}) {
    const dockerConfig = {
      image,
      ...config,
    }
    if (this.jobs.length > 0) {
      this.lastJob().dockers.push(dockerConfig)
    } else {
      this.dockers.push(dockerConfig)
    }
    return this
  }

  define(name: string) {
    this.jobs.push(new Job(name))
    return this
  }

  lastJob() {
    return this.jobs.slice(-1)[0]
  }

  branches(...branches: string[]) {
    this.lastJob().branches = branches
    return this
  }

  requires(...jobNames: string[]) {
    this.lastJob().requires = jobNames
    return this
  }

  tasks(literals: TemplateStringsArray, ...placeholders: string[]) {
    let result = ''

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i]
      result += placeholders[i]
    }

    // add the last literal
    result += literals[literals.length - 1]

    this.lastJob().tasksLiteral = result
    return this
  }

  usePackage(pm: PackageManager) {
    switch (pm) {
      case 'yarn':
        this.lastJob().package = new YarnPackage()
        return this
      case 'npm':
        this.lastJob().package = new NPMPackage()
        return this
      case 'bundler':
        this.lastJob().package = new BundlerPackage()
        return this
      default:
        throw new Error(`sorry, specified package manager ${pm} is not implemented yet`)
    }
  }

  toConfig() {
    return {
      version: 2,
      jobs: this.jobs.reduce(
        (jobs, job) => ({
          ...jobs,
          [job.name]: {
            docker: [...this.dockers, ...job.dockers],
            ...job.toConfig(),
          },
        }),
        {},
      ),
      workflows: {
        version: 2,
        master_jobs: {
          jobs: this.jobs.map(j => j.toWorkflowConfig()),
        },
      },
    }
  }

  dump() {
    return yaml.safeDump(this.toConfig(), {
      noRefs: true,
      noCompatMode: true,
      lineWidth: 200,
    })
  }
}
