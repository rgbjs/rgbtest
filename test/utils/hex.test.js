import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  stringToHex,
  hexToString,
  numberToLittleEndianHex,
  littleEndianHexToNumber,
  validateHex
} from '../../src/utils/hex.js';

describe('Hex Utils', () => {
  test('stringToHex converts ASCII strings correctly', () => {
    assert.equal(stringToHex('NIATCKR'), '4e494154434b52');
    assert.equal(stringToHex('NIA asset name'), '4e4941206173736574206e616d65');
    assert.equal(stringToHex(''), '');
  });

  test('stringToHex throws on non-string input', () => {
    assert.throws(() => stringToHex(123), /Input must be a string/);
    assert.throws(() => stringToHex(null), /Input must be a string/);
  });

  test('hexToString converts hex back to ASCII correctly', () => {
    assert.equal(hexToString('4e494154434b52'), 'NIATCKR');
    assert.equal(hexToString('4e4941206173736574206e616d65'), 'NIA asset name');
    assert.equal(hexToString(''), '');
  });

  test('hexToString throws on invalid hex', () => {
    assert.throws(() => hexToString('invalid'), /Input must be a valid hex string/);
    assert.throws(() => hexToString('abc'), /Input must be a valid hex string/);
  });

  test('numberToLittleEndianHex converts numbers correctly', () => {
    assert.equal(numberToLittleEndianHex(666), '9a02000000000000');
    assert.equal(numberToLittleEndianHex(0), '0000000000000000');
    assert.equal(numberToLittleEndianHex(255), 'ff00000000000000');
  });

  test('numberToLittleEndianHex supports custom byte length', () => {
    assert.equal(numberToLittleEndianHex(666, 2), '9a02');
    assert.equal(numberToLittleEndianHex(666, 4), '9a020000');
  });

  test('numberToLittleEndianHex throws on invalid input', () => {
    assert.throws(() => numberToLittleEndianHex(-1), /Input must be a non-negative number/);
    assert.throws(() => numberToLittleEndianHex('666'), /Input must be a non-negative number/);
  });

  test('littleEndianHexToNumber converts back correctly', () => {
    assert.equal(littleEndianHexToNumber('9a02000000000000'), 666);
    assert.equal(littleEndianHexToNumber('0000000000000000'), 0);
    assert.equal(littleEndianHexToNumber('ff00000000000000'), 255);
  });

  test('validateHex validates hex strings correctly', () => {
    assert.equal(validateHex('4e494154434b52'), true);
    assert.equal(validateHex(''), true);
    assert.equal(validateHex('abc'), false);
    assert.equal(validateHex('xyz'), false);
    assert.equal(validateHex('123'), false);
    assert.equal(validateHex(123), false);
  });
});