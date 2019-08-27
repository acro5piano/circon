import { PackageManager } from './interfaces'

export abstract class Package {
  name!: PackageManager
  installCommand!: string
  path!: string
  lockFile!: string

  toCommands() {
    return [
      {
        restore_cache: {
          keys: [`v2-dependencies-{{ checksum "${this.lockFile}" }}`, 'v2-dependencies-'],
        },
      },
      { run: this.installCommand },
      {
        save_cache: {
          paths: [this.path],
          key: `v2-dependencies-{{ checksum "${this.lockFile}" }}`,
        },
      },
    ]
  }
}

export class YarnPackage extends Package {
  name = 'yarn' as const
  installCommand = 'yarn install'
  path = 'node_modules'
  lockFile = 'yarn.lock'
}

export class NPMPackage extends Package {
  name = 'npm' as const
  installCommand = 'npm ci'
  path = 'node_modules'
  lockFile = 'package-lock.json'
}

export class BundlerPackage extends Package {
  name = 'bundler' as const
  installCommand = 'bundle install --path vendor/bundle'
  path = 'vendor'
  lockFile = 'Gemfile.lock'
}
