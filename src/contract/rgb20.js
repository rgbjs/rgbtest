import { Genesis } from '../genesis/genesis.js';
import { AssetSpec } from '../types/asset-spec.js';
import { ContractTerms } from '../types/contract-terms.js';
import { Amount } from '../types/amount.js';
import { Assignment } from '../genesis/assignment.js';

export class RGB20Contract {
  constructor(genesis) {
    this.validateGenesis(genesis);
    this.genesis = genesis instanceof Genesis ? genesis : Genesis.fromPlainObject(genesis);
    this._contractId = null;
  }

  validateGenesis(genesis) {
    if (!genesis) {
      throw new Error('Genesis is required');
    }
  }

  getContractId() {
    if (!this._contractId) {
      this._contractId = this.genesis.generateContractId();
    }
    return this._contractId;
  }

  getFormattedContractId() {
    return this.genesis.getFormattedContractId();
  }

  getAssetInfo() {
    return this.genesis.getAssetInfo();
  }

  getTicker() {
    return this.genesis.assetSpec.ticker;
  }

  getName() {
    return this.genesis.assetSpec.name;
  }

  getPrecision() {
    return this.genesis.assetSpec.precision;
  }

  getTotalSupply() {
    return this.genesis.getTotalSupply();
  }

  getContractTerms() {
    return this.genesis.contractTerms.text;
  }

  isNonInflatable() {
    return this.genesis.assetSpec.isNonInflatable();
  }

  getGenesisAssignments() {
    return this.genesis.getAssignments().map(assignment => ({
      utxoRef: assignment.getUtxoRef(),
      amount: assignment.getAmount().toNumber(),
      atomicAmount: assignment.getAmount().toNumber(),
      decimalAmount: this.genesis.assetSpec.getDecimalAmount(assignment.getAmount().toNumber())
    }));
  }

  getOwnershipByUtxo(utxoRef) {
    const assignment = this.genesis.getAssignmentByUtxo(utxoRef);
    if (!assignment) {
      return null;
    }

    return {
      utxoRef: assignment.getUtxoRef(),
      amount: assignment.getAmount().toNumber(),
      atomicAmount: assignment.getAmount().toNumber(),
      decimalAmount: this.genesis.assetSpec.getDecimalAmount(assignment.getAmount().toNumber())
    };
  }

  validateTransfer(fromUtxo, amount, toUtxo) {
    const ownership = this.getOwnershipByUtxo(fromUtxo);
    if (!ownership) {
      throw new Error(`No tokens found at UTXO ${fromUtxo}`);
    }

    if (ownership.amount < amount) {
      throw new Error(`Insufficient balance: ${ownership.amount} < ${amount}`);
    }

    if (!toUtxo || typeof toUtxo !== 'string') {
      throw new Error('Destination UTXO is required');
    }

    return {
      valid: true,
      from: ownership,
      amount: amount,
      to: toUtxo
    };
  }

  toJSON() {
    return {
      contractId: this.getContractId(),
      formattedContractId: this.getFormattedContractId(),
      assetInfo: this.getAssetInfo(),
      contractTerms: this.getContractTerms(),
      genesis: this.genesis.toJSON()
    };
  }

  toString() {
    const info = this.getAssetInfo();
    return `RGB20Contract(${info.ticker}: ${info.name} - ${info.totalSupply} tokens)`;
  }

  static create({ ticker, name, precision = 0, terms, supply, utxoRef, testnet = true }) {
    const genesis = Genesis.createSimple({
      ticker,
      name,
      precision,
      terms,
      supply,
      utxoRef
    });

    return new RGB20Contract(genesis);
  }

  static fromGenesis(genesis) {
    return new RGB20Contract(genesis);
  }

  static fromJSON(obj) {
    return new RGB20Contract(obj.genesis);
  }

  // Utility method to create a contract matching your original HTML example
  static createNIAExample() {
    return RGB20Contract.create({
      ticker: 'NIATCKR',
      name: 'NIA asset name',
      precision: 0,
      terms: 'NIA terms',
      supply: 666,
      utxoRef: '22f0538e189f32922e55daf6fa0b7120bc01de8520a9a4c80655fdaf70272ac0:1'
    });
  }
}

export { Genesis, AssetSpec, ContractTerms, Amount, Assignment };