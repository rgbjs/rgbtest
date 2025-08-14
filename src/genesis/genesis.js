import { AssetSpec } from '../types/asset-spec.js';
import { ContractTerms } from '../types/contract-terms.js';
import { Amount } from '../types/amount.js';
import { Assignment } from './assignment.js';
import { generateContractId, formatContractId } from '../utils/hash.js';

export class Genesis {
  constructor({ assetSpec, contractTerms, issuedSupply, assignments = [], timestamp = null, testnet = true }) {
    this.validate({ assetSpec, contractTerms, issuedSupply, assignments });
    
    this.assetSpec = assetSpec instanceof AssetSpec ? assetSpec : new AssetSpec(assetSpec);
    this.contractTerms = contractTerms instanceof ContractTerms ? contractTerms : new ContractTerms(contractTerms);
    this.issuedSupply = issuedSupply instanceof Amount ? issuedSupply : new Amount(issuedSupply);
    this.assignments = assignments.map(a => a instanceof Assignment ? a : Assignment.fromPlainObject(a));
    this.timestamp = timestamp || Math.floor(Date.now() / 1000);
    this.testnet = testnet;
    this.schemaId = 'NonInflatableAsset';
    this.issuer = 'anonymous';
    
    this.validateSupply();
  }

  validate({ assetSpec, contractTerms, issuedSupply, assignments }) {
    if (!assetSpec) {
      throw new Error('Asset specification is required');
    }
    
    if (!contractTerms) {
      throw new Error('Contract terms are required');
    }
    
    if (!issuedSupply) {
      throw new Error('Issued supply is required');
    }
    
    if (!Array.isArray(assignments)) {
      throw new Error('Assignments must be an array');
    }
  }

  validateSupply() {
    const totalAssigned = this.assignments.reduce((sum, assignment) => 
      sum.add(assignment.getAmount()), Amount.zero()
    );
    
    if (!totalAssigned.equals(this.issuedSupply)) {
      throw new Error(`Total assigned supply (${totalAssigned}) does not match issued supply (${this.issuedSupply})`);
    }
  }

  encode() {
    const specEncoded = this.assetSpec.encode();
    const termsEncoded = this.contractTerms.encode();
    const supplyEncoded = this.issuedSupply.encode();
    
    const assignmentsEncoded = this.assignments.map(a => a.encode()).join('');
    
    return specEncoded + termsEncoded + supplyEncoded + assignmentsEncoded;
  }

  generateContractId() {
    const encodedData = this.encode();
    return generateContractId(encodedData);
  }

  getFormattedContractId() {
    return formatContractId(this.generateContractId());
  }

  toPlainObject() {
    return {
      schemaId: this.schemaId,
      timestamp: this.timestamp,
      issuer: this.issuer,
      testnet: this.testnet,
      assetSpec: this.assetSpec.toPlainObject(),
      contractTerms: this.contractTerms.toPlainObject(),
      issuedSupply: this.issuedSupply.toNumber(),
      assignments: this.assignments.map(a => a.toPlainObject())
    };
  }

  toJSON() {
    return this.toPlainObject();
  }

  addAssignment(utxoRef, amount) {
    const assignment = Assignment.createGenesis(utxoRef, amount);
    this.assignments.push(assignment);
    this.issuedSupply = this.issuedSupply.add(new Amount(amount));
    this.validateSupply();
    return assignment;
  }

  getAssignments() {
    return [...this.assignments];
  }

  getAssignmentByUtxo(utxoRef) {
    return this.assignments.find(a => a.getUtxoRef() === utxoRef);
  }

  getTotalSupply() {
    return this.issuedSupply;
  }

  getAssetInfo() {
    return {
      ticker: this.assetSpec.ticker,
      name: this.assetSpec.name,
      precision: this.assetSpec.precision,
      totalSupply: this.issuedSupply.toNumber(),
      isNonInflatable: this.assetSpec.isNonInflatable()
    };
  }

  static createSimple({ ticker, name, precision = 0, terms, supply, utxoRef }) {
    const assetSpec = AssetSpec.createNonInflatable(ticker, name, precision);
    const contractTerms = new ContractTerms(terms);
    const issuedSupply = new Amount(supply);
    const assignment = Assignment.createGenesis(utxoRef, supply);
    
    return new Genesis({
      assetSpec,
      contractTerms,
      issuedSupply,
      assignments: [assignment]
    });
  }

  static fromPlainObject(obj) {
    return new Genesis({
      assetSpec: obj.assetSpec,
      contractTerms: obj.contractTerms.text,
      issuedSupply: obj.issuedSupply,
      assignments: obj.assignments,
      timestamp: obj.timestamp,
      testnet: obj.testnet
    });
  }
}