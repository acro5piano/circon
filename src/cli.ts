#!/usr/bin/env node

import path from 'path'
import config from '.'

// prettier-ignore
;(global as any).config = config

const target = path.join(process.cwd(), process.argv[2])

console.log(require(target).dump())
