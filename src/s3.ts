import type { SdkStream } from '@aws-sdk/types'

import type {
  CopyObjectCommandInput,
  CopyObjectCommandOutput,
  DeleteObjectCommandInput,
  DeleteObjectCommandOutput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  GetObjectOutput,
  HeadObjectCommandInput,
  HeadObjectCommandOutput,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3'

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3'

import { normalizeS3Path } from './utils'

type Maybe<T> = T | null | undefined

/**
 * The s3 Body interface.
 */
export type Body = SdkStream<GetObjectOutput['Body']>

/**
 * Utility function to read a stream into a {@link Buffer}.
 *
 * ### Note
 * You can always retrieve a {@link Uint8Array} with the native {@link SdkStream.transformToByteArray}:
 * ```ts
 * await Body.transformToByteArray()
 * ```
 */
export async function streamToBuffer(stream: Maybe<Body>): Promise<Buffer> {
  if (!stream) {
    throw new TypeError('Failed to transform the body stream into a buffer. The stream is missing or undefined.')
  }

  return Buffer.from(await stream.transformToByteArray())
}

/**
 * Utility function to read a stream into a `string`.
 *
 * ### Note
 * You can always retrieve a string with the native {@link SdkStream.transformToString}:
 * ```ts
 * await Body.transformToString(encoding)
 * ```
 */
export async function streamToString(stream: Maybe<Body>, encoding: BufferEncoding = 'utf8'): Promise<string> {
  if (!stream) {
    throw new TypeError('Failed to transform the body stream into a string. The stream is missing or undefined.')
  }

  return Buffer.from(await stream.transformToByteArray()).toString(encoding)
}

/**
 * _Be aware, you are allowed to overwrite `Bucket` and `Key` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface S3GetOptions extends Omit<GetObjectCommandInput, 'Bucket' | 'Key'> {
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
}

export function s3_get(path: string, options: S3GetOptions): Promise<GetObjectCommandOutput> {
  const { s3, bucket, ...commandOptions } = options

  return s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: normalizeS3Path(path),
      // we actually allow the user to overwrite Bucket and Key
      ...commandOptions,
    }),
  )
}

/**
 * _Be aware, you are allowed to overwrite `Bucket` and `Key` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface S3HeadOptions extends Omit<HeadObjectCommandInput, 'Bucket' | 'Key'> {
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
}

export function s3_head(path: string, options: S3GetOptions): Promise<HeadObjectCommandOutput> {
  const { s3, bucket, ...commandOptions } = options

  return s3.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: normalizeS3Path(path),
      // we actually allow the user to overwrite Bucket and Key
      ...commandOptions,
    }),
  )
}

/**
 * _Be aware, you are allowed to overwrite `Bucket`, `Key` and `Body` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface S3PutOptions extends Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'> {
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
}

export type PutContentData = PutObjectCommandInput['Body']

export function s3_put(path: string, contents: PutContentData, options: S3PutOptions): Promise<PutObjectCommandOutput> {
  const { s3, bucket, ...commandOptions } = options

  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: normalizeS3Path(path),
      Body: contents,
      // we actually allow the user to overwrite Bucket and Key
      ...commandOptions,
    }),
  )
}

/**
 * _Be aware, you are allowed to overwrite `Bucket` and `Key` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface S3ListOptions extends Omit<ListObjectsV2CommandInput, 'Bucket' | 'Key'> {
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
}

export function s3_list(options: S3ListOptions): Promise<ListObjectsV2CommandOutput> {
  const { s3, bucket, ...commandOptions } = options

  return s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      // we actually allow the user to overwrite Bucket and Key
      ...commandOptions,
    }),
  )
}

/**
 * _Be aware, you are allowed to overwrite `Bucket` and `Key` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface S3DeleteOptions extends Omit<DeleteObjectCommandInput, 'Bucket' | 'Key'> {
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
}

export function s3_delete(path: string, options: S3DeleteOptions): Promise<DeleteObjectCommandOutput> {
  const { s3, bucket, ...commandOptions } = options

  return s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: normalizeS3Path(path),
      // we actually allow the user to overwrite Bucket and Key
      ...commandOptions,
    }),
  )
}

/**
 * _Be aware, you are allowed to overwrite `Bucket`, `Key` and `CopySource` even if this interface omits them, avoid unintentionally overwriting them._
 */
export interface S3CopyOptions extends Omit<CopyObjectCommandInput, 'Bucket' | 'Key' | 'CopySource'> {
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
}

export interface BucketDestination {
  /**
   * The path.
   */
  path: string

  /**
   * The destination bucket name.
   *
   * _Alias of `Bucket`_
   */
  bucket: string
}

/**
 *
 * ### Example
 * In this example, copy in **the same `public` bucket**
 * ```ts
 * await copy('temp/upload.jpeg', 'user/avatar/image.jpeg', {
 *   s3: ...,
 *   bucket: 'public'
 * })
 * ```
 *
 * ### Example
 * In this example, copy **from bucket `private_uploads` to bucket `public`**
 * ```ts
 * const to = {
 *   path: 'user/avatar/image.jpeg',
 *   bucket: 'public'
 * }
 * await copy('temp/upload.jpeg', to, {
 *   s3: ...,
 *   bucket: 'private_uploads'
 * })
 * ```
 *
 * ### Note
 * The copy operation can be confusing, this method make the copy operation explicit, you copy the path to a destination,
 * that can be a string, or an object describing the destination bucket.
 *
 * The `options.bucket` refers the **SOURCE** bucket, this method is consistent with the rest of the library.
 */
export function s3_copy(from: string, to: string | BucketDestination, options: S3CopyOptions): Promise<CopyObjectCommandOutput> {
  const { s3, bucket, ...commandOptions } = options

  // we want to copy from the current bucket
  const CopySource = `${bucket}/${normalizeS3Path(from)}`

  // the destination bucket is explicit
  const Bucket = typeof to === 'string' ? bucket : to.bucket

  // the destination key is also explicit
  const Key = typeof to === 'string' ? normalizeS3Path(to) : normalizeS3Path(to.path)

  return s3.send(
    new CopyObjectCommand({
      CopySource,
      Bucket,
      Key,
      // we actually allow the user to overwrite Bucket and Key
      ...commandOptions,
    }),
  )
}
