import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { sha256, generateContractId, formatContractId, parseContractId } from '../../src/utils/hash.js';

describe('Hash Utils', () => {
  test('sha256 produces correct hash for hex strings', () => {
    const input = 'hello world';
    const inputHex = Buffer.from(input).toString('hex');
    const expected = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
    assert.equal(sha256(inputHex), expected);
  });

  test('sha256 works with Buffer input', () => {
    const input = Buffer.from('hello world');
    const expected = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
    assert.equal(sha256(input), expected);
  });

  test('sha256 throws on invalid input', () => {
    assert.throws(() => sha256(123), /Data must be a hex string or Buffer/);
    assert.throws(() => sha256({}), /Data must be a hex string or Buffer/);
  });

  test('generateContractId returns 64-character hex string', () => {
    const data = '074e494154434b520e4e49412061737365742066616d650002';
    const contractId = generateContractId(data);
    
    assert.equal(typeof contractId, 'string');
    assert.equal(contractId.length, 64);
    assert.match(contractId, /^[0-9a-f]+$/);
  });

  test('generateContractId is deterministic', () => {
    const data = '074e494154434b520e4e49412061737365742066616d650002';
    const id1 = generateContractId(data);
    const id2 = generateContractId(data);
    assert.equal(id1, id2);
  });

  test('formatContractId creates correct RGB format', () => {
    const contractId = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const formatted = formatContractId(contractId);
    const expected = 'rgb:abcdef12-34567890-abcdef12-34567890-abcdef12-34567890-abcdef12-34567890';
    assert.equal(formatted, expected);
  });

  test('formatContractId validates input', () => {
    assert.throws(() => formatContractId('invalid'), /ContractId must be a 64-character hex string/);
    assert.throws(() => formatContractId('abc'), /ContractId must be a 64-character hex string/);
    assert.throws(() => formatContractId(null), /ContractId must be a 64-character hex string/);
  });

  test('parseContractId reverses formatting correctly', () => {
    const formatted = 'rgb:abcdef12-34567890-abcdef12-34567890-abcdef12-34567890-abcdef12-34567890';
    const contractId = parseContractId(formatted);
    const expected = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    assert.equal(contractId, expected);
  });

  test('parseContractId validates input format', () => {
    assert.throws(() => parseContractId('invalid'), /Formatted ID must start with "rgb:"/);
    assert.throws(() => parseContractId('rgb:invalid'), /Invalid formatted ContractId structure/);
    assert.throws(() => parseContractId(null), /Formatted ID must be a string/);
  });

  test('formatContractId and parseContractId are inverse operations', () => {
    const original = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const formatted = formatContractId(original);
    const parsed = parseContractId(formatted);
    assert.equal(parsed, original);
  });
});