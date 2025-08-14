import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { AssetSpec } from '../../src/types/asset-spec.js';

describe('AssetSpec', () => {
  const validSpec = {
    ticker: 'NIATCKR',
    name: 'NIA asset name',
    precision: 0
  };

  test('creates valid AssetSpec instance', () => {
    const spec = new AssetSpec(validSpec);
    assert.equal(spec.ticker, 'NIATCKR');
    assert.equal(spec.name, 'NIA asset name');
    assert.equal(spec.precision, 0);
    assert.equal(spec.details, 2);
  });

  test('validates ticker requirements', () => {
    assert.throws(() => new AssetSpec({ ...validSpec, ticker: '' }), /Ticker is required/);
    assert.throws(() => new AssetSpec({ ...validSpec, ticker: null }), /Ticker is required/);
    assert.throws(() => new AssetSpec({ ...validSpec, ticker: 'abcdefghijklmnopqr' }), /Ticker must be 16 characters or less/);
    assert.throws(() => new AssetSpec({ ...validSpec, ticker: 'lower' }), /Ticker must contain only uppercase letters and numbers/);
    assert.throws(() => new AssetSpec({ ...validSpec, ticker: 'TEST!' }), /Ticker must contain only uppercase letters and numbers/);
  });

  test('validates name requirements', () => {
    assert.throws(() => new AssetSpec({ ...validSpec, name: '' }), /Name is required/);
    assert.throws(() => new AssetSpec({ ...validSpec, name: null }), /Name is required/);
    assert.throws(() => new AssetSpec({ ...validSpec, name: 'x'.repeat(257) }), /Name must be 256 characters or less/);
  });

  test('validates precision requirements', () => {
    assert.throws(() => new AssetSpec({ ...validSpec, precision: -1 }), /Precision must be a number between 0 and 18/);
    assert.throws(() => new AssetSpec({ ...validSpec, precision: 19 }), /Precision must be a number between 0 and 18/);
    assert.throws(() => new AssetSpec({ ...validSpec, precision: 1.5 }), /Precision must be an integer/);
    assert.throws(() => new AssetSpec({ ...validSpec, precision: '8' }), /Precision must be a number between 0 and 18/);
  });

  test('validates details requirements', () => {
    assert.throws(() => new AssetSpec({ ...validSpec, details: -1 }), /Details must be a number between 0 and 255/);
    assert.throws(() => new AssetSpec({ ...validSpec, details: 256 }), /Details must be a number between 0 and 255/);
  });

  test('encodes correctly', () => {
    const spec = new AssetSpec(validSpec);
    const encoded = spec.encode();
    const expected = '074e494154434b520e4e4941206173736574206e616d650002';
    assert.equal(encoded, expected);
  });

  test('converts to plain object', () => {
    const spec = new AssetSpec(validSpec);
    const plain = spec.toPlainObject();
    assert.deepEqual(plain, {
      ticker: 'NIATCKR',
      name: 'NIA asset name',
      precision: 0,
      details: 2
    });
  });

  test('converts to JSON', () => {
    const spec = new AssetSpec(validSpec);
    const json = JSON.stringify(spec);
    assert.equal(json, '{"ticker":"NIATCKR","name":"NIA asset name","precision":0,"details":2}');
  });

  test('compares equality correctly', () => {
    const spec1 = new AssetSpec(validSpec);
    const spec2 = new AssetSpec(validSpec);
    const spec3 = new AssetSpec({ ...validSpec, ticker: 'OTHER' });
    
    assert.equal(spec1.equals(spec2), true);
    assert.equal(spec1.equals(spec3), false);
    assert.equal(spec1.equals({}), false);
  });

  test('creates from plain object', () => {
    const spec = AssetSpec.fromPlainObject(validSpec);
    assert.equal(spec.ticker, 'NIATCKR');
    assert.equal(spec.name, 'NIA asset name');
  });

  test('factory methods work correctly', () => {
    const nonInflatable = AssetSpec.createNonInflatable('TEST', 'Test Asset', 8);
    const inflatable = AssetSpec.createInflatable('TEST2', 'Test Asset 2', 8);
    
    assert.equal(nonInflatable.details, 2);
    assert.equal(nonInflatable.isNonInflatable(), true);
    assert.equal(nonInflatable.isInflatable(), false);
    
    assert.equal(inflatable.details, 1);
    assert.equal(inflatable.isInflatable(), true);
    assert.equal(inflatable.isNonInflatable(), false);
  });

  test('amount conversion works correctly', () => {
    const spec = new AssetSpec({ ...validSpec, precision: 8 });
    
    assert.equal(spec.getDecimalAmount(100000000), 1);
    assert.equal(spec.getDecimalAmount(50000000), 0.5);
    
    assert.equal(spec.getAtomicAmount(1), 100000000);
    assert.equal(spec.getAtomicAmount(0.5), 50000000);
  });

  test('amount conversion validates input', () => {
    const spec = new AssetSpec({ ...validSpec, precision: 8 });
    
    assert.throws(() => spec.getDecimalAmount(-1), /Atomic amount must be a non-negative number/);
    assert.throws(() => spec.getDecimalAmount('100'), /Atomic amount must be a non-negative number/);
    
    assert.throws(() => spec.getAtomicAmount(-1), /Decimal amount must be a non-negative number/);
    assert.throws(() => spec.getAtomicAmount('0.5'), /Decimal amount must be a non-negative number/);
  });

  test('precision 0 amounts work correctly', () => {
    const spec = new AssetSpec(validSpec);
    
    assert.equal(spec.getDecimalAmount(666), 666);
    assert.equal(spec.getAtomicAmount(666), 666);
  });
});