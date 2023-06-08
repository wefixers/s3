# S3 Drive

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Wrap common s3 functionality!

This library provide a way to work within a single bucket easily by linking together an s3 instance and a bucket name into a single class.

As with any wrapper, you lose some functionality, however you can always access the s3 instance and any custom configuration, the library re-export all the internal methods with the prefix `s3_` so you can use them at will.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [Install](#install)
- [Usage](#usage)
  - [Configure using S3Client](#configure-using-s3client)

> This package is ESM only!

> This package is for Node 18 and above only!

## Install
```sh
pnpm i @fixers/s3
```

```sh
npm install @fixers/s3
```

## Usage

The easiest way is to use the S3Drive.

```ts
import { s3 } from '@fixers/s3'

const drive = s3({
  publicUrl: 'https//domain/',
  bucket: 'bucket-name',

  // common s3 properties
  region: 'auto',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
})

await drive.get('file.txt')
```

### Configure using S3Client

If you prefer to configure s3 by yourself:

```ts
import { S3Client } from '@aws-sdk/client-s3'
import { S3Drive } from '@fixers/s3'

const s3 = new S3Client({ })
const drive = new S3Drive(s3, {
  bucket: 'bucket-name',
})
```


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@fixers/s3/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@fixers/s3

[npm-downloads-src]: https://img.shields.io/npm/dm/@fixers/s3.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@fixers/s3

[license-src]: https://img.shields.io/npm/l/@fixers/s3.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@fixers/s3
