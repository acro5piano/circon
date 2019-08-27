import Job from './Job'
import { Docker, PackageManager } from './interfaces'
import { findPackage } from './packages'

const yaml = require('js-yaml')

export default class Configuration {
  jobs: Job[] = []
  dockers: Docker[] = []
  grouping = ''

  group(groupName: string, callback: () => void) {
    if (!groupName) {
      throw new Error(`please set valid group name. received: ${groupName}`)
    }
    this.grouping = groupName
    callback()
    this.grouping = ''
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
    this.lastJob().package = findPackage(pm)
    return this
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
