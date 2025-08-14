import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { FungibleState, Assignment } from '../../src/genesis/assignment.js';
import { BlindSeal } from '../../src/genesis/seal.js';
import { Amount } from '../../src/types/amount.js';

describe('FungibleState', () => {
  test('creates valid FungibleState instance', () => {
    const state = new FungibleState(100);
    assert.equal(state.amount.toNumber(), 100);
    assert.equal(typeof state.tag, 'string');
    assert.equal(state.tag.length, 32);
    assert.equal(typeof state.blinding, 'string');
    assert.equal(state.blinding.length, 64);
  });

  test('accepts Amount instance', () => {
    const amount = new Amount(200);
    const state = new FungibleState(amount);
    assert.equal(state.amount.toNumber(), 200);
  });

  test('validates amount', () => {
    assert.throws(() => new FungibleState(-1), /Amount must be an Amount instance or non-negative number/);
    assert.throws(() => new FungibleState('invalid'), /Amount must be an Amount instance or non-negative number/);
  });

  test('generates random tags and blinding', () => {
    const state1 = new FungibleState(100);
    const state2 = new FungibleState(100);
    assert.notEqual(state1.tag, state2.tag);
    assert.notEqual(state1.blinding, state2.blinding);
  });

  test('toPlainObject works correctly', () => {
    const state = new FungibleState(100, 'tag123', 'blinding456');
    const plain = state.toPlainObject();
    assert.deepEqual(plain, {
      value: 100,
      tag: 'tag123',
      blinding: 'blinding456'
    });
  });

  test('equals works correctly', () => {
    const state1 = new FungibleState(100, 'tag', 'blinding');
    const state2 = new FungibleState(100, 'tag', 'blinding');
    const state3 = new FungibleState(200, 'tag', 'blinding');
    
    assert.equal(state1.equals(state2), true);
    assert.equal(state1.equals(state3), false);
    assert.equal(state1.equals({}), false);
  });

  test('fromPlainObject works correctly', () => {
    const obj = { value: 100, tag: 'tag', blinding: 'blinding' };
    const state = FungibleState.fromPlainObject(obj);
    assert.equal(state.amount.toNumber(), 100);
    assert.equal(state.tag, 'tag');
    assert.equal(state.blinding, 'blinding');
  });
});

describe('Assignment', () => {
  const validUtxo = '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:1';
  const validBlinding = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  test('creates valid Assignment instance', () => {
    const seal = new BlindSeal(validUtxo, validBlinding);
    const state = new FungibleState(100);
    const assignment = new Assignment(seal, state);
    
    assert.equal(assignment.seal.utxoRef, validUtxo);
    assert.equal(assignment.state.amount.toNumber(), 100);
    assert.equal(assignment.assignmentType, 4000);
  });

  test('creates Assignment from string and number', () => {
    const assignment = new Assignment(validUtxo, 100);
    assert.equal(assignment.seal.utxoRef, validUtxo);
    assert.equal(assignment.state.amount.toNumber(), 100);
  });

  test('validates seal and state', () => {
    assert.throws(() => new Assignment(null, 100), /Seal is required/);
    assert.throws(() => new Assignment(validUtxo, null), /State is required/);
    assert.throws(() => new Assignment('invalid', 100), /Seal UTXO reference must be in format "txid:vout"/);
  });

  test('encodes correctly', () => {
    const assignment = new Assignment(validUtxo, 100);
    const encoded = assignment.encode();
    assert.equal(typeof encoded, 'string');
    assert.equal(encoded.startsWith('0fa0'), true); // 4000 in hex = 0fa0
  });

  test('toPlainObject works correctly', () => {
    const assignment = new Assignment(validUtxo, 100);
    const plain = assignment.toPlainObject();
    
    assert.equal(plain.assignmentType, 4000);
    assert.equal(typeof plain.seal, 'object');
    assert.equal(typeof plain.state, 'object');
    assert.equal(plain.seal.utxoRef, validUtxo);
    assert.equal(plain.state.value, 100);
  });

  test('equals works correctly', () => {
    const assignment1 = new Assignment(validUtxo, 100);
    const assignment2 = new Assignment(validUtxo, 100);
    
    // They won't be equal due to random blinding factors
    assert.equal(assignment1.equals(assignment2), false);
    assert.equal(assignment1.equals({}), false);
  });

  test('createGenesis works correctly', () => {
    const assignment = Assignment.createGenesis(validUtxo, 100);
    assert.equal(assignment.getUtxoRef(), validUtxo);
    assert.equal(assignment.getAmount().toNumber(), 100);
    assert.equal(assignment.assignmentType, 4000);
  });

  test('getter methods work correctly', () => {
    const assignment = new Assignment(validUtxo, 100);
    
    assert.equal(assignment.getAmount().toNumber(), 100);
    assert.equal(assignment.getUtxoRef(), validUtxo);
    assert.equal(typeof assignment.getSealBlinding(), 'string');
    assert.equal(typeof assignment.getStateBlinding(), 'string');
  });

  test('fromPlainObject works correctly', () => {
    const plain = {
      assignmentType: 4000,
      seal: { utxoRef: validUtxo, blinding: validBlinding },
      state: { value: 100, tag: 'tag', blinding: 'blinding' }
    };
    
    const assignment = Assignment.fromPlainObject(plain);
    assert.equal(assignment.getUtxoRef(), validUtxo);
    assert.equal(assignment.getAmount().toNumber(), 100);
  });
});