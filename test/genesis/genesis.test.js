import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { Genesis } from '../../src/genesis/genesis.js';
import { AssetSpec } from '../../src/types/asset-spec.js';
import { ContractTerms } from '../../src/types/contract-terms.js';
import { Amount } from '../../src/types/amount.js';
import { Assignment } from '../../src/genesis/assignment.js';

describe('Genesis', () => {
  const validUtxo = '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:1';
  
  const validGenesis = {
    assetSpec: {
      ticker: 'NIATCKR',
      name: 'NIA asset name',
      precision: 0
    },
    contractTerms: 'NIA terms',
    issuedSupply: 666,
    assignments: []
  };

  test('creates valid Genesis instance', () => {
    const assignment = Assignment.createGenesis(validUtxo, 666);
    const genesis = new Genesis({
      ...validGenesis,
      assignments: [assignment]
    });
    
    assert.equal(genesis.assetSpec.ticker, 'NIATCKR');
    assert.equal(genesis.contractTerms.text, 'NIA terms');
    assert.equal(genesis.issuedSupply.toNumber(), 666);
    assert.equal(genesis.assignments.length, 1);
    assert.equal(genesis.schemaId, 'NonInflatableAsset');
    assert.equal(genesis.testnet, true);
  });

  test('validates required fields', () => {
    assert.throws(() => new Genesis({}), /Asset specification is required/);
    assert.throws(() => new Genesis({ assetSpec: validGenesis.assetSpec }), /Contract terms are required/);
    assert.throws(() => new Genesis({ 
      assetSpec: validGenesis.assetSpec,
      contractTerms: validGenesis.contractTerms
    }), /Issued supply is required/);
  });

  test('validates supply matches assignments', () => {
    const assignment = Assignment.createGenesis(validUtxo, 100);
    assert.throws(() => new Genesis({
      ...validGenesis,
      issuedSupply: 666,
      assignments: [assignment]
    }), /Total assigned supply \(100\) does not match issued supply \(666\)/);
  });

  test('encodes correctly', () => {
    const assignment = Assignment.createGenesis(validUtxo, 666);
    const genesis = new Genesis({
      ...validGenesis,
      assignments: [assignment]
    });
    
    const encoded = genesis.encode();
    assert.equal(typeof encoded, 'string');
    assert.equal(encoded.length > 100, true);
  });

  test('generates contract ID', () => {
    const assignment = Assignment.createGenesis(validUtxo, 666);
    const genesis = new Genesis({
      ...validGenesis,
      assignments: [assignment]
    });
    
    const contractId = genesis.generateContractId();
    const formattedId = genesis.getFormattedContractId();
    
    assert.equal(typeof contractId, 'string');
    assert.equal(contractId.length, 64);
    assert.equal(formattedId.startsWith('rgb:'), true);
  });

  test('toPlainObject works correctly', () => {
    const assignment = Assignment.createGenesis(validUtxo, 666);
    const genesis = new Genesis({
      ...validGenesis,
      assignments: [assignment]
    });
    
    const plain = genesis.toPlainObject();
    assert.equal(plain.schemaId, 'NonInflatableAsset');
    assert.equal(plain.testnet, true);
    assert.equal(typeof plain.timestamp, 'number');
    assert.equal(plain.assetSpec.ticker, 'NIATCKR');
    assert.equal(plain.contractTerms.text, 'NIA terms');
    assert.equal(plain.issuedSupply, 666);
    assert.equal(Array.isArray(plain.assignments), true);
  });

  test('addAssignment works correctly', () => {
    // Create a genesis with a zero-amount assignment
    const zeroUtxo = validUtxo.replace('1', '0');
    const zeroAssignment = Assignment.createGenesis(zeroUtxo, 1);
    const genesis = new Genesis({
      ...validGenesis,
      issuedSupply: 1,
      assignments: [zeroAssignment]
    });
    
    const assignment = genesis.addAssignment(validUtxo, 100);
    assert.equal(genesis.assignments.length, 2);
    assert.equal(genesis.issuedSupply.toNumber(), 101);
    assert.equal(assignment.getAmount().toNumber(), 100);
  });

  test('getter methods work correctly', () => {
    const assignment = Assignment.createGenesis(validUtxo, 666);
    const genesis = new Genesis({
      ...validGenesis,
      assignments: [assignment]
    });
    
    const assignments = genesis.getAssignments();
    assert.equal(assignments.length, 1);
    
    const foundAssignment = genesis.getAssignmentByUtxo(validUtxo);
    assert.equal(foundAssignment.getAmount().toNumber(), 666);
    
    const totalSupply = genesis.getTotalSupply();
    assert.equal(totalSupply.toNumber(), 666);
    
    const assetInfo = genesis.getAssetInfo();
    assert.equal(assetInfo.ticker, 'NIATCKR');
    assert.equal(assetInfo.totalSupply, 666);
    assert.equal(assetInfo.isNonInflatable, true);
  });

  test('createSimple factory method works correctly', () => {
    const genesis = Genesis.createSimple({
      ticker: 'TEST',
      name: 'Test Asset',
      precision: 8,
      terms: 'Test terms',
      supply: 1000,
      utxoRef: validUtxo
    });
    
    assert.equal(genesis.assetSpec.ticker, 'TEST');
    assert.equal(genesis.assetSpec.precision, 8);
    assert.equal(genesis.contractTerms.text, 'Test terms');
    assert.equal(genesis.issuedSupply.toNumber(), 1000);
    assert.equal(genesis.assignments.length, 1);
    assert.equal(genesis.assignments[0].getUtxoRef(), validUtxo);
  });

  test('fromPlainObject works correctly', () => {
    const assignment = Assignment.createGenesis(validUtxo, 666);
    const original = new Genesis({
      ...validGenesis,
      assignments: [assignment]
    });
    
    const plain = original.toPlainObject();
    const reconstructed = Genesis.fromPlainObject(plain);
    
    assert.equal(reconstructed.assetSpec.ticker, original.assetSpec.ticker);
    assert.equal(reconstructed.contractTerms.text, original.contractTerms.text);
    assert.equal(reconstructed.issuedSupply.toNumber(), original.issuedSupply.toNumber());
    assert.equal(reconstructed.assignments.length, original.assignments.length);
  });
});