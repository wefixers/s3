import type { GetObjectCommandInput, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import type { RequestPresigningArguments } from '@aws-sdk/types'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import type { DefaultExpiration } from './time'
import { expirationIn } from './time'

import { normalizeS3Path } from './utils'

/**
 * _Be aware, you are allowed to overwrite `Bucket` and `Key` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface CreateS3TemporaryUrlOptions extends Omit<GetObjectCommandInput, 'Bucket' | 'Key'> {
  /**
   * The {@link S3Client}.
   */
  s3: S3Client

  /**
   * The bucket name containing the object.
   *
   * _Alias of `Bucket`_
   */
  bucket: string

  /**
   * Sets the `Content-Disposition` header of the response
   *
   * _Alias of `ResponseContentDisposition`_
   */
  contentDisposition?: string

  /**
   * Set a the signature options.
   *
   * _Be aware, you are allowed to overwrite `expiresIn`, avoid unintentionally overwriting it._
   */
  signature?: RequestPresigningArguments
}

/**
 * Create a temporary singed URL with a default expiration time of `3600 seconds` (`60 minutes`).
 */
export async function s3_temporarySignedUrl(path: string, expiration: DefaultExpiration, options: CreateS3TemporaryUrlOptions): Promise<string> {
  const { s3, bucket, contentDisposition, signature, ...getObjectCommandOptions } = options

  const Key = normalizeS3Path(path)
  const expiresIn = expirationIn(expiration || 3600) // 60 minutes

  const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: bucket,
    Key,
    ResponseContentDisposition: contentDisposition,
    ...getObjectCommandOptions,
  }), {
    expiresIn,
    ...signature,
  })

  return signedUrl
}

/**
 * _Be aware, you are allowed to overwrite `Bucket` and `Key` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface CreateS3TemporaryUploadUrlOptions extends Omit<PutObjectCommandInput, 'Bucket' | 'Key'> {
  /**
   * The {@link S3Client}.
   */
  s3: S3Client

  /**
   * The bucket name containing the object.
   *
   * _Alias of `Bucket`_
   */
  bucket: string

  /**
   * The exact number of bytes expected to be uploaded.
   *
   * _Alias of `Bucket`_
   */
  contentLength?: number

  /**
   * The exact content type expected to be uploaded.
   *
   * _Alias of `ContentType`_
   */
  contentType?: string

  /**
   * Set a the signature options.
   *
   * _Be aware, you are allowed to overwrite `expiresIn`, avoid unintentionally overwriting it._
   */
  signature?: RequestPresigningArguments
}

/**
 * Create a temporary singed upload URL with a default expiration time of `3600 seconds` (`60 minutes`).
 */
export async function s3_temporarySignedUploadUrl(path: string, expiration: DefaultExpiration, options: CreateS3TemporaryUploadUrlOptions): Promise<string> {
  const { s3, bucket, contentLength, contentType, signature, ...putObjectCommandOptions } = options

  const Key = normalizeS3Path(path)
  const expiresIn = expirationIn(expiration || 3600) // 60 minutes

  const signedUrl = await getSignedUrl(s3, new PutObjectCommand({
    Bucket: bucket,
    Key,
    ContentLength: contentLength,
    ContentType: contentType,
    ...putObjectCommandOptions,
  }), {
    expiresIn,
    ...signature,
  })

  return signedUrl
}
