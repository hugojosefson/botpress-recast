import R from 'ramda';

export const byConfidence = R.descend(R.prop('confidence'));

/**
 * Creates a new object with the own properties of the provided object, but the
 * keys renamed according to the keysMap object as `{oldKey: newKey}`.
 * When some key is not found in the keysMap, then it's passed as-is.
 *
 * Keep in mind that in the case of keys conflict is behaviour undefined and
 * the result may vary between various JS engines!
 *
 * Source: https://github.com/ramda/ramda/wiki/Cookbook#rename-keys-of-an-object
 *
 * @sig {a: b} -> {a: *} -> {b: *}
 */
const renameKeys = R.curry((keysMap, obj) =>
    R.reduce((acc, key) => R.assoc(keysMap[key] || key, obj[key], acc), {}, R.keys(obj))
);

export const renameSlugToValue = renameKeys({slug: 'value'});
