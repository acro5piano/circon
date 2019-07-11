import Job from './Job'
import { Docker, PackageManager } from './interfaces'

const yaml = require('js-yaml')

export default class Configuration {
  jobs: Job[] = []
  dockers: Docker[] = []

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

  tasks(...literal: TemplateStringsArray[]) {
    this.lastJob().tasksLiteral = literal[0]
    return this
  }

  usePackage(pm: PackageManager) {
    this.lastJob().package = pm
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
    })
  }
}
