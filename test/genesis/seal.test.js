import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { BlindSeal } from '../../src/genesis/seal.js';

describe('BlindSeal', () => {
  const validUtxo = '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:1';
  const validBlinding = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  test('creates valid BlindSeal instance', () => {
    const seal = new BlindSeal(validUtxo);
    assert.equal(seal.utxoRef, validUtxo);
    assert.equal(typeof seal.blinding, 'string');
    assert.equal(seal.blinding.length, 64);
  });

  test('creates BlindSeal with custom blinding', () => {
    const seal = new BlindSeal(validUtxo, validBlinding);
    assert.equal(seal.utxoRef, validUtxo);
    assert.equal(seal.blinding, validBlinding);
  });

  test('validates UTXO reference format', () => {
    assert.throws(() => new BlindSeal(''), /UTXO reference is required/);
    assert.throws(() => new BlindSeal(null), /UTXO reference is required/);
    assert.throws(() => new BlindSeal('invalid'), /UTXO reference must be in format "txid:vout"/);
    assert.throws(() => new BlindSeal('abc:1'), /Invalid transaction ID format/);
    assert.throws(() => new BlindSeal('22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:abc'), /Invalid vout/);
    assert.throws(() => new BlindSeal('22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:-1'), /Invalid vout/);
  });

  test('validates blinding factor format', () => {
    assert.throws(() => new BlindSeal(validUtxo, 'invalid'), /Blinding factor must be null or a 64-character hex string/);
    assert.throws(() => new BlindSeal(validUtxo, 'abc'), /Blinding factor must be null or a 64-character hex string/);
  });

  test('generates random blinding factors', () => {
    const seal1 = new BlindSeal(validUtxo);
    const seal2 = new BlindSeal(validUtxo);
    assert.notEqual(seal1.blinding, seal2.blinding);
  });

  test('encodes correctly', () => {
    const seal = new BlindSeal(validUtxo, validBlinding);
    const encoded = seal.encode();
    assert.equal(typeof encoded, 'string');
    assert.equal(encoded.length > 64, true);
    assert.equal(encoded.endsWith(validBlinding), true);
  });

  test('getTxId works correctly', () => {
    const seal = new BlindSeal(validUtxo);
    const txid = seal.getTxId();
    assert.equal(txid, '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0');
  });

  test('getVout works correctly', () => {
    const seal = new BlindSeal(validUtxo);
    const vout = seal.getVout();
    assert.equal(vout, 1);
  });

  test('toPlainObject works correctly', () => {
    const seal = new BlindSeal(validUtxo, validBlinding);
    const plain = seal.toPlainObject();
    assert.deepEqual(plain, {
      utxoRef: validUtxo,
      blinding: validBlinding,
      method: 'opretFirst'
    });
  });

  test('equals works correctly', () => {
    const seal1 = new BlindSeal(validUtxo, validBlinding);
    const seal2 = new BlindSeal(validUtxo, validBlinding);
    const seal3 = new BlindSeal(validUtxo, 'different' + validBlinding.slice(9));
    
    assert.equal(seal1.equals(seal2), true);
    assert.equal(seal1.equals(seal3), false);
    assert.equal(seal1.equals({}), false);
  });

  test('fromPlainObject works correctly', () => {
    const obj = {
      utxoRef: validUtxo,
      blinding: validBlinding
    };
    const seal = BlindSeal.fromPlainObject(obj);
    assert.equal(seal.utxoRef, validUtxo);
    assert.equal(seal.blinding, validBlinding);
  });

  test('createFromUtxo works correctly', () => {
    const txid = '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0';
    const vout = 1;
    const seal = BlindSeal.createFromUtxo(txid, vout, validBlinding);
    assert.equal(seal.utxoRef, `${txid}:${vout}`);
    assert.equal(seal.blinding, validBlinding);
  });

  test('blind creates new instance with different blinding', () => {
    const seal1 = new BlindSeal(validUtxo, validBlinding);
    const seal2 = seal1.blind();
    
    assert.equal(seal1.utxoRef, seal2.utxoRef);
    assert.notEqual(seal1.blinding, seal2.blinding);
  });
});