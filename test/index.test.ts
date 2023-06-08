import jimp from 'jimp'
import { NotFound } from '@aws-sdk/client-s3'

import { expect, it } from 'vitest'
import { nanoid } from 'nanoid'

import { s3 } from '../src/s3-drive'

// @ts-expect-error, i am too lazy to fix this
const PUBLIC_BUCKET = import.meta.env.VITE_AWS_BUCKET

const drive = s3({
  publicUrl: 'http://about',
  bucket: PUBLIC_BUCKET,

  region: 'auto',
  // @ts-expect-error, i am too lazy to fix this
  endpoint: import.meta.env.VITE_AWS_ENDPOINT,
  credentials: {
    // @ts-expect-error, i am too lazy to fix this
    accessKeyId: import.meta.env.VITE_AWS_ID,
    // @ts-expect-error, i am too lazy to fix this
    secretAccessKey: import.meta.env.VITE_AWS_SECRET,
  },
})

it('is creates public url', async () => {
  await expect(drive.url('file.txt')).resolves.toBe('http://about/file.txt')
  await expect(drive.url('/file.txt')).resolves.toBe('http://about/file.txt')
  await expect(drive.url('///file.txt')).resolves.toBe('http://about/file.txt')
})

it('get a object', async () => {
  const objectList = await drive.list({
    MaxKeys: 100,
  })

  const key = objectList.Contents.find(x => x.Key.endsWith('.jpg')).Key

  const object = await drive.get(key)

  const buffer = Buffer.from(await object.Body.transformToByteArray())
  const image = await jimp.read(buffer)
  const data = await image.cover(500, 500).getBufferAsync('image/jpeg')

  expect(data).toBeInstanceOf(Buffer)
  expect(data.length).toBeGreaterThan(50)
})

it('get head a object', async () => {
  await expect(drive.exists('NON EXISTING ID')).resolves.toBe(false)
  await expect(drive.missing('NON EXISTING ID')).resolves.toBe(true)
})

it('delete a object', async () => {
  const key = `tmp/${nanoid()}`
  const putOperation = await drive.put(key, 'text')
  expect(await (await drive.get(key)).Body.transformToString()).toBe('text')

  await drive.delete(key)

  expect(putOperation).toBeTypeOf('object')
})

it('copy a object', async () => {
  const key = `tmp/${nanoid()}`
  await drive.put(key, 'text')
  await expect(drive.head(key)).resolves.toBeTypeOf('object')

  const destinationKey = `tmp/${nanoid()}`
  const copyOperation = await drive.copy(key, destinationKey)
  await expect(drive.head(destinationKey)).resolves.toBeTypeOf('object')

  await drive.delete(key)
  await expect(drive.head(key)).rejects.toBeInstanceOf(NotFound)
  await expect(drive.get(key)).resolves.toBe(undefined)

  expect(copyOperation).toBe(true)

  const headOperation = await drive.head(destinationKey)
  await drive.delete(destinationKey)

  expect(headOperation).toBeTypeOf('object')
})
