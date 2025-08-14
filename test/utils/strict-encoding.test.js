import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { StrictEncoder } from '../../src/utils/strict-encoding.js';

describe('StrictEncoder', () => {
  test('encodeString works correctly', () => {
    const encoder = new StrictEncoder();
    assert.equal(encoder.encodeString('NIATCKR'), '074e494154434b52');
    assert.equal(encoder.encodeString('NIA asset name'), '0e4e4941206173736574206e616d65');
    assert.equal(encoder.encodeString(''), '00');
  });

  test('encodeAssetSpec produces correct output', () => {
    const encoder = new StrictEncoder();
    const assetSpec = {
      ticker: 'NIATCKR',
      name: 'NIA asset name',
      precision: 0
    };
    
    const expected = '074e494154434b520e4e4941206173736574206e616d650002';
    assert.equal(encoder.encodeAssetSpec(assetSpec), expected);
  });

  test('encodeAssetSpec validates input', () => {
    const encoder = new StrictEncoder();
    
    assert.throws(() => encoder.encodeAssetSpec({}), /AssetSpec requires ticker and name/);
    assert.throws(() => encoder.encodeAssetSpec({ ticker: 'ABC' }), /AssetSpec requires ticker and name/);
    assert.throws(() => encoder.encodeAssetSpec({ 
      ticker: 'ABC', 
      name: 'Test', 
      precision: -1 
    }), /Precision must be between 0 and 18/);
    assert.throws(() => encoder.encodeAssetSpec({ 
      ticker: 'ABC', 
      name: 'Test', 
      precision: 19 
    }), /Precision must be between 0 and 18/);
  });

  test('encodeContractTerms works correctly', () => {
    const encoder = new StrictEncoder();
    assert.equal(encoder.encodeContractTerms('NIA terms'), '094e4941207465726d7300');
  });

  test('encodeAmount works correctly', () => {
    const encoder = new StrictEncoder();
    assert.equal(encoder.encodeAmount(666), '9a02000000000000');
    assert.equal(encoder.encodeAmount(0), '0000000000000000');
  });

  test('encodeAmount validates input', () => {
    const encoder = new StrictEncoder();
    assert.throws(() => encoder.encodeAmount(-1), /Amount must be a non-negative number/);
    assert.throws(() => encoder.encodeAmount('666'), /Amount must be a non-negative number/);
  });

  test('encodeUtxoRef works correctly', () => {
    const encoder = new StrictEncoder();
    const utxo = '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:1';
    const expected = '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac000000001';
    assert.equal(encoder.encodeUtxoRef(utxo), expected);
  });

  test('encodeUtxoRef validates input', () => {
    const encoder = new StrictEncoder();
    
    assert.throws(() => encoder.encodeUtxoRef('invalid'), /UTXO reference must be in format "txid:vout"/);
    assert.throws(() => encoder.encodeUtxoRef('abc:1'), /Invalid transaction ID format/);
    assert.throws(() => encoder.encodeUtxoRef('22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:abc'), /Invalid vout format/);
  });

  test('static encode method works for all types', () => {
    const assetSpec = { ticker: 'TEST', name: 'Test Asset', precision: 2 };
    assert.equal(
      StrictEncoder.encode(assetSpec, 'AssetSpec'),
      '04544553540a546573742041737365740202'
    );
    
    assert.equal(
      StrictEncoder.encode('Test terms', 'ContractTerms'),
      '0a54657374207465726d7300'
    );
    
    assert.equal(
      StrictEncoder.encode(100, 'Amount'),
      '6400000000000000'
    );
  });

  test('static encode throws on unknown type', () => {
    assert.throws(() => StrictEncoder.encode({}, 'Unknown'), /Unknown encoding type: Unknown/);
  });
});