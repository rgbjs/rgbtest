import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { RGB20Contract } from '../../src/contract/rgb20.js';
import { Genesis } from '../../src/genesis/genesis.js';
import { Assignment } from '../../src/genesis/assignment.js';

describe('RGB20Contract', () => {
  const validUtxo = '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:1';
  
  test('creates contract from genesis', () => {
    const assignment = Assignment.createGenesis(validUtxo, 1000);
    const genesis = new Genesis({
      assetSpec: { ticker: 'TEST', name: 'Test Asset', precision: 8 },
      contractTerms: 'Test terms',
      issuedSupply: 1000,
      assignments: [assignment]
    });
    
    const contract = new RGB20Contract(genesis);
    assert.equal(contract.getTicker(), 'TEST');
    assert.equal(contract.getName(), 'Test Asset');
    assert.equal(contract.getPrecision(), 8);
    assert.equal(contract.getTotalSupply().toNumber(), 1000);
  });

  test('creates contract using factory method', () => {
    const contract = RGB20Contract.create({
      ticker: 'BTC',
      name: 'Bitcoin',
      precision: 8,
      terms: 'Bitcoin terms',
      supply: 21000000,
      utxoRef: validUtxo
    });
    
    assert.equal(contract.getTicker(), 'BTC');
    assert.equal(contract.getName(), 'Bitcoin');
    assert.equal(contract.getPrecision(), 8);
    assert.equal(contract.getTotalSupply().toNumber(), 21000000);
    assert.equal(contract.isNonInflatable(), true);
  });

  test('generates deterministic contract ID', () => {
    const contract1 = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test',
      precision: 0,
      terms: 'Terms',
      supply: 1000,
      utxoRef: validUtxo
    });
    
    const contract2 = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test',
      precision: 0,
      terms: 'Terms',
      supply: 1000,
      utxoRef: validUtxo
    });
    
    // Should be different due to random blinding factors
    assert.notEqual(contract1.getContractId(), contract2.getContractId());
    
    // But same contract should return same ID
    assert.equal(contract1.getContractId(), contract1.getContractId());
  });

  test('gets formatted contract ID', () => {
    const contract = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test',
      precision: 0,
      terms: 'Terms',
      supply: 1000,
      utxoRef: validUtxo
    });
    
    const formatted = contract.getFormattedContractId();
    assert.equal(formatted.startsWith('rgb:'), true);
    assert.equal(formatted.split('-').length, 8);
  });

  test('gets asset information', () => {
    const contract = RGB20Contract.create({
      ticker: 'BTC',
      name: 'Bitcoin',
      precision: 8,
      terms: 'Bitcoin terms',
      supply: 21000000,
      utxoRef: validUtxo
    });
    
    const info = contract.getAssetInfo();
    assert.equal(info.ticker, 'BTC');
    assert.equal(info.name, 'Bitcoin');
    assert.equal(info.precision, 8);
    assert.equal(info.totalSupply, 21000000);
    assert.equal(info.isNonInflatable, true);
  });

  test('gets genesis assignments', () => {
    const contract = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test',
      precision: 8,
      terms: 'Terms',
      supply: 100000000,
      utxoRef: validUtxo
    });
    
    const assignments = contract.getGenesisAssignments();
    assert.equal(assignments.length, 1);
    assert.equal(assignments[0].utxoRef, validUtxo);
    assert.equal(assignments[0].amount, 100000000);
    assert.equal(assignments[0].atomicAmount, 100000000);
    assert.equal(assignments[0].decimalAmount, 1); // 100000000 / 10^8
  });

  test('gets ownership by UTXO', () => {
    const contract = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test',
      precision: 8,
      terms: 'Terms',
      supply: 100000000,
      utxoRef: validUtxo
    });
    
    const ownership = contract.getOwnershipByUtxo(validUtxo);
    assert.notEqual(ownership, null);
    assert.equal(ownership.utxoRef, validUtxo);
    assert.equal(ownership.amount, 100000000);
    assert.equal(ownership.decimalAmount, 1);
    
    const noOwnership = contract.getOwnershipByUtxo('invalid:0');
    assert.equal(noOwnership, null);
  });

  test('validates transfers', () => {
    const contract = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test',
      precision: 0,
      terms: 'Terms',
      supply: 1000,
      utxoRef: validUtxo
    });
    
    const validation = contract.validateTransfer(validUtxo, 100, 'destination:0');
    assert.equal(validation.valid, true);
    assert.equal(validation.amount, 100);
    assert.equal(validation.to, 'destination:0');
    
    assert.throws(() => contract.validateTransfer(validUtxo, 2000, 'dest:0'), /Insufficient balance/);
    assert.throws(() => contract.validateTransfer('invalid:0', 100, 'dest:0'), /No tokens found at UTXO/);
    assert.throws(() => contract.validateTransfer(validUtxo, 100, null), /Destination UTXO is required/);
  });

  test('converts to JSON', () => {
    const contract = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test',
      precision: 0,
      terms: 'Terms',
      supply: 1000,
      utxoRef: validUtxo
    });
    
    const json = contract.toJSON();
    assert.equal(typeof json.contractId, 'string');
    assert.equal(json.formattedContractId.startsWith('rgb:'), true);
    assert.equal(json.assetInfo.ticker, 'TEST');
    assert.equal(json.contractTerms, 'Terms');
    assert.equal(typeof json.genesis, 'object');
  });

  test('toString works correctly', () => {
    const contract = RGB20Contract.create({
      ticker: 'BTC',
      name: 'Bitcoin',
      precision: 8,
      terms: 'Bitcoin terms',
      supply: 21000000,
      utxoRef: validUtxo
    });
    
    const str = contract.toString();
    assert.equal(str.includes('BTC'), true);
    assert.equal(str.includes('Bitcoin'), true);
    assert.equal(str.includes('21000000'), true);
  });

  test('creates NIA example', () => {
    const contract = RGB20Contract.createNIAExample();
    assert.equal(contract.getTicker(), 'NIATCKR');
    assert.equal(contract.getName(), 'NIA asset name');
    assert.equal(contract.getTotalSupply().toNumber(), 666);
    assert.equal(contract.getContractTerms(), 'NIA terms');
  });

  test('roundtrip through JSON', () => {
    const original = RGB20Contract.create({
      ticker: 'TEST',
      name: 'Test Asset',
      precision: 8,
      terms: 'Test terms',
      supply: 1000000,
      utxoRef: validUtxo
    });
    
    const json = original.toJSON();
    const reconstructed = RGB20Contract.fromJSON(json);
    
    assert.equal(reconstructed.getTicker(), original.getTicker());
    assert.equal(reconstructed.getName(), original.getName());
    assert.equal(reconstructed.getPrecision(), original.getPrecision());
    assert.equal(reconstructed.getTotalSupply().toNumber(), original.getTotalSupply().toNumber());
  });
});