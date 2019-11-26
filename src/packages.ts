export abstract class Package {
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
  installCommand = 'yarn install'
  path = 'node_modules'
  lockFile = 'yarn.lock'
}

export class NPMPackage extends Package {
  installCommand = 'npm ci'
  path = 'node_modules'
  lockFile = 'package-lock.json'
}

export class BundlerPackage extends Package {
  installCommand = 'bundle install --path vendor/bundle'
  path = 'vendor'
  lockFile = 'Gemfile.lock'
}

export function findPackage(pm: string) {
  switch (pm) {
    case 'yarn':
      return new YarnPackage()
    case 'npm':
      return new NPMPackage()
    case 'bundler':
      return new BundlerPackage()
    default:
      throw new Error(`sorry, specified package manager ${pm} is not implemented yet`)
  }
}
