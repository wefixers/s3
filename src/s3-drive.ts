import type { GetObjectCommandOutput, HeadObjectCommandOutput, ListObjectsV2CommandOutput, S3ClientConfig } from '@aws-sdk/client-s3'
import { NoSuchKey, NotFound, S3Client } from '@aws-sdk/client-s3'

import { resolveURL } from 'ufo'

import type { BucketDestination, PutContentData, S3CopyOptions, S3DeleteOptions, S3ListOptions, S3Object, S3PaginateOptions, S3PutOptions } from './s3'
import { s3_copy, s3_delete, s3_get, s3_head, s3_list, s3_paginate, s3_put } from './s3'

import type { CreateS3TemporaryUrlOptions } from './s3-signed-url'
import { s3_temporarySignedUploadUrl, s3_temporarySignedUrl } from './s3-signed-url'

import type { DefaultExpiration } from './time'

export interface CreateTemporaryUrl extends Omit<CreateS3TemporaryUrlOptions, 's3' | 'bucket'> {
}

export interface CreateUploadTemporaryUrl extends Omit<CreateS3TemporaryUrlOptions, 's3' | 'bucket'> {
}

export interface ListOptions extends Omit<S3ListOptions, 's3' | 'bucket'> {
}

export interface AllOptions extends Omit<S3PaginateOptions, 's3' | 'bucket'> {
}

export interface CopyOptions extends Omit<S3CopyOptions, 's3' | 'bucket'> {
}

export interface PutOptions extends Omit<S3PutOptions, 's3' | 'bucket'> {
}

export interface DeleteOptions extends Omit<S3DeleteOptions, 's3' | 'bucket'> {
}

export interface S3DriveOptions {
  /**
   * The default bucket to use.
   */
  bucket: string

  /**
   * Set a custom domain that will be used when generating url.
   */
  publicUrl?: string
}

/**
 * Represents an S3 drive.
 */
export class S3Drive {
  /**
   * Initialize a new {@link S3Drive} instance.
   */
  constructor(public s3: S3Client, public config: S3DriveOptions) {}

  /**
   * Get the **HEAD** of a file without reading it, throw `NotFound` when the file do not exists.
   */
  head = (path: string): Promise<HeadObjectCommandOutput> => {
    return s3_head(path, {
      s3: this.s3,
      bucket: this.config.bucket,
    })
  }

  /**
   * Get the meta-data (HEAD) of a file without reading it, or `undefined` when the file do not exists.
   *
   * This method do not throw on missing files, refer to {@link head}.
   */
  meta = async (path: string): Promise<HeadObjectCommandOutput | undefined> => {
    try {
      return await s3_head(path, {
        s3: this.s3,
        bucket: this.config.bucket,
      })
    }
    catch (e) {
      if (e instanceof NotFound) {
        return undefined
      }

      throw e
    }
  }

  /**
   * Determine if a file or directory exists.
   */
  exists = async (path: string): Promise<boolean> => {
    return Boolean(await this.meta(path))
  }

  /**
   * Determine if a file or directory is missing.
   */
  missing = async (path: string): Promise<boolean> => {
    return !await this.exists(path)
  }

  /**
   * Get a file size, or `0` if the file do not exists.
   */
  size = async (path: string): Promise<number > => {
    return (await this.meta(path))?.ContentLength || 0
  }

  /**
   * Get a file's last modification {@link Date}, the date can be `0` (`1970-01-01T00:00:00.000Z`), if the file do not exists.
   */
  lastModified = async (path: string): Promise<Date> => {
    return new Date((await this.meta(path))?.LastModified?.getTime() || 0)
  }

  /**
   * Get a file mime-type (ContentType), or `null` if the file do not exists.
   */
  mimeType = async (path: string): Promise<string | null> => {
    return (await this.meta(path))?.ContentType ?? null
  }

  /**
   * Deletes a file, returns `true` if the file exists prior deletion, `false` if the file was already missing.
   *
   * ### Note
   * Due the way S3 works, this method need to check if the file exists **before** deletion.
   * If you do not care about the return value, use {@link erase}.
   */
  delete = async (path: string, options?: DeleteOptions): Promise<boolean> => {
    const exists = await this.exists(path)

    // in AWS S3, delete always succeed
    await s3_delete(path, {
      s3: this.s3,
      bucket: this.config.bucket,
      ...options,
    })

    return exists
  }

  /**
   * Deletes a file.
   */
  erase = async (path: string, options?: DeleteOptions): Promise<void> => {
    await s3_delete(path, {
      s3: this.s3,
      bucket: this.config.bucket,
      ...options,
    })
  }

  /**
   * Move a file.
   *
   * ### Note
   * Due the way S3 works, the source (from) file needs to be deleted after the copy operation
   * the delete operation might fail for any reason, thus leaving the source file intact.
   *
   * It is suggested to use this method when you have a way to clean up files, a LifeCycle policy a cron job, or similar.
   */
  move = async (from: string, to: string | BucketDestination): Promise<boolean> => {
    await s3_copy(from, to, {
      s3: this.s3,
      bucket: this.config.bucket,
    })

    // in s3 there is no move command
    await s3_delete(from, {
      s3: this.s3,
      bucket: this.config.bucket,
    })

    return true
  }

  /**
   * Copy a file.
   */
  copy = async (from: string, to: string | BucketDestination, options?: CopyOptions): Promise<boolean> => {
    await s3_copy(from, to, {
      s3: this.s3,
      bucket: this.config.bucket,
      ...options,
    })

    return true
  }

  /**
   * Get the content of a file, or `undefined` when the file do not exists.
   */
  get = async (path: string): Promise<GetObjectCommandOutput | undefined> => {
    try {
      return await s3_get(path, {
        s3: this.s3,
        bucket: this.config.bucket,
      })
    }
    catch (e) {
      if (e instanceof NoSuchKey) {
        return undefined
      }

      throw e
    }
  }

  /**
   * Write the contents of a file, returns the {@link head} of the file.
   */
  put = async (path: string, contents: PutContentData, options?: PutOptions): Promise<HeadObjectCommandOutput > => {
    await s3_put(path, contents, {
      s3: this.s3,
      bucket: this.config.bucket,
      ...options,
    })

    return this.head(path)
  }

  list = (options?: ListOptions): Promise<ListObjectsV2CommandOutput> => {
    return s3_list({
      s3: this.s3,
      bucket: this.config.bucket,
      ...options,
    })
  }

  async* all(options?: AllOptions): AsyncGenerator<S3Object, void, unknown> {
    for await (const response of s3_paginate({
      s3: this.s3,
      bucket:
      this.config.bucket,
      ...options,
    })) {
      const objects = response.Contents ?? []
      for (const object of objects) {
        yield object
      }
    }
  }

  /**
   * Get a file url string.
   */
  url = (path: string): Promise<string> => {
    const base = this.config.publicUrl || `https://${this.config.bucket}.s3.amazonaws.com`

    // this is intentional, the base URL need to be calculated using await s3.config.region()
    return Promise.resolve(resolveURL(base, path))
  }

  /**
   * Create a temporary singed URL with a default expiration time of `3600 seconds` (`60 minutes`).
   */
  temporaryUrl = (path: string, expiration?: DefaultExpiration, options?: CreateTemporaryUrl): Promise<string> => {
    return s3_temporarySignedUrl(path, expiration, {
      s3: this.s3,
      bucket: this.config.bucket,
      ...options,
    })
  }

  /**
   * Create a temporary singed upload URL with a default expiration time of `3600 seconds` (`60 minutes`).
   */
  temporaryUploadUrl = (path: string, expiration?: DefaultExpiration, options?: CreateUploadTemporaryUrl): Promise<string> => {
    return s3_temporarySignedUploadUrl(path, expiration, {
      s3: this.s3,
      bucket: this.config.bucket,
      ...options,
    })
  }
}

/**
 * Create a new {@link S3Drive}.
 *
 * ### Note
 * If you want so save and retrieve a custom {@link S3DriveOptions}, use the {@link S3Drive} constructor.
 */
export function s3({ bucket, publicUrl, ...config }: S3ClientConfig & S3DriveOptions) {
  return new S3Drive(new S3Client(config), { bucket, publicUrl })
}
