import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { ContractTerms } from '../../src/types/contract-terms.js';

describe('ContractTerms', () => {
  const validTerms = 'NIA terms and conditions';

  test('creates valid ContractTerms instance', () => {
    const terms = new ContractTerms(validTerms);
    assert.equal(terms.text, validTerms);
    assert.equal(terms.media, null);
  });

  test('creates ContractTerms with media', () => {
    const mediaRef = 'ipfs://QmHash123';
    const terms = new ContractTerms(validTerms, mediaRef);
    assert.equal(terms.text, validTerms);
    assert.equal(terms.media, mediaRef);
  });

  test('validates terms requirements', () => {
    assert.throws(() => new ContractTerms(''), /Contract terms text is required/);
    assert.throws(() => new ContractTerms(null), /Contract terms text is required/);
    assert.throws(() => new ContractTerms(123), /Contract terms text is required/);
    assert.throws(() => new ContractTerms('x'.repeat(65537)), /Contract terms must be 65536 characters or less/);
  });

  test('validates media requirements', () => {
    assert.throws(() => new ContractTerms(validTerms, 123), /Media reference must be a string or null/);
    assert.throws(() => new ContractTerms(validTerms, 'x'.repeat(257)), /Media reference must be 256 characters or less/);
  });

  test('encodes correctly', () => {
    const terms = new ContractTerms('NIA terms');
    const encoded = terms.encode();
    const expected = '094e4941207465726d7300';
    assert.equal(encoded, expected);
  });

  test('converts to plain object', () => {
    const terms = new ContractTerms(validTerms, 'media-ref');
    const plain = terms.toPlainObject();
    assert.deepEqual(plain, {
      text: validTerms,
      media: 'media-ref'
    });
  });

  test('converts to JSON', () => {
    const terms = new ContractTerms(validTerms);
    const json = JSON.stringify(terms);
    assert.equal(json, `{"text":"${validTerms}","media":null}`);
  });

  test('compares equality correctly', () => {
    const terms1 = new ContractTerms(validTerms);
    const terms2 = new ContractTerms(validTerms);
    const terms3 = new ContractTerms('different terms');
    
    assert.equal(terms1.equals(terms2), true);
    assert.equal(terms1.equals(terms3), false);
    assert.equal(terms1.equals({}), false);
  });

  test('creates from plain object', () => {
    const obj = { text: validTerms, media: 'media-ref' };
    const terms = ContractTerms.fromPlainObject(obj);
    assert.equal(terms.text, validTerms);
    assert.equal(terms.media, 'media-ref');
  });

  test('factory methods work correctly', () => {
    const simple = ContractTerms.createSimple(validTerms);
    const withMedia = ContractTerms.createWithMedia(validTerms, 'media-ref');
    
    assert.equal(simple.media, null);
    assert.equal(withMedia.media, 'media-ref');
  });

  test('hasMedia works correctly', () => {
    const simple = new ContractTerms(validTerms);
    const withMedia = new ContractTerms(validTerms, 'media-ref');
    const withEmptyMedia = new ContractTerms(validTerms, '');
    
    assert.equal(simple.hasMedia(), false);
    assert.equal(withMedia.hasMedia(), true);
    assert.equal(withEmptyMedia.hasMedia(), false);
  });

  test('getWordCount works correctly', () => {
    const terms = new ContractTerms('hello world test');
    assert.equal(terms.getWordCount(), 3);
    
    const singleWord = new ContractTerms('hello');
    assert.equal(singleWord.getWordCount(), 1);
  });

  test('getCharacterCount works correctly', () => {
    const terms = new ContractTerms('hello');
    assert.equal(terms.getCharacterCount(), 5);
  });

  test('preview works correctly', () => {
    const shortTerms = new ContractTerms('short');
    assert.equal(shortTerms.preview(10), 'short');
    
    const longTerms = new ContractTerms('this is a very long text that should be truncated');
    const preview = longTerms.preview(20);
    assert.equal(preview.length, 20);
    assert.equal(preview.endsWith('...'), true);
  });
});