import {expect} from 'chai';
import R from 'ramda';

import {byConfidence, renameSlugToValue} from '../src/transform-intents';

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
];

const expected = [
    {
        confidence: 1,
        value: 'one'
    },
    {
        confidence: 0.51,
        value: 'half_and_some'
    },
    {
        confidence: 0.5,
        value: 'half'
    },
    {
        confidence: 0,
        value: 'zero'
    }
];

describe('sort entities by confidence, and rename {slug} to {value}', () => {
    describe('', () => {
        it('slug is gone, value takes its place, sorted correctly', () => {
            const actual = R.compose(R.sort(byConfidence), R.map(renameSlugToValue))(fixture);
            expect(actual).to.deep.equal(expected);
        });
    });
});
