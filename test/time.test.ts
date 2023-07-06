import { expect, it } from 'vitest'

import { epoch } from '../src'

it('is creates public url', async () => {
  expect(() => epoch(0)).toThrowError('Invalid timestamp')

  expect(epoch(2000000000000).valueOf()).toBe(new Date('2033-05-18T03:33:20.000Z').valueOf())
  expect(epoch(2000000000000 * 1000).valueOf()).toBe(new Date('2033-05-18T03:33:20.000Z').valueOf())
  expect(epoch(2000000000000 / 1000).valueOf()).toBe(new Date('2033-05-18T03:33:20.000Z').valueOf())
})
