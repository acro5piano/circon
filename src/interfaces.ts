export interface Docker {
  image: string
  config?: object
}

export type PackageManager = 'yarn' | 'bundler' | 'npm'
