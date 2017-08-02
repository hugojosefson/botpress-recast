import {expect} from 'chai';

import {renameSlugToValue} from '../src/transform-intents';

const fixture = {
        confidence: 1,
        slug: 'one'
    };

const expected = {
    confidence: 1,
    value: 'one'
};

describe('rename {slug} to {value}', () => {
    it('slug is gone, value takes its place', () => {
        const actual = renameSlugToValue(fixture);
        expect(actual).to.deep.equal(expected);
    });
});
