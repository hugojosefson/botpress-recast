/* eslint-env mocha */
import {expect} from 'chai'
import R from 'ramda'

import {byConfidence} from '../src/transform-intents'

const fixture = [
  {
    confidence: 0,
    slug: 'zero'
  },
  {
    confidence: 1,
    slug: 'one'
  },
  {
    confidence: 0.5,
    slug: 'half'
  },
  {
    confidence: 0.51,
    slug: 'half_and_some'
  }
]

const expected = [
  {
    confidence: 1,
    slug: 'one'
  },
  {
    confidence: 0.51,
    slug: 'half_and_some'
  },
  {
    confidence: 0.5,
    slug: 'half'
  },
  {
    confidence: 0,
    slug: 'zero'
  }
]

describe('sort entities by confidence', () => {
  it('numeric', () => {
    const actual = R.sort(byConfidence, fixture)
    expect(actual).to.deep.equal(expected)
  })
  it('number as string', () => {
    const stringify = R.map(({confidence, slug}) => ({confidence: '' + confidence, slug}))
    const actual = R.sort(byConfidence, stringify(fixture))
    expect(actual).to.deep.equal(stringify(expected))
  })
})
