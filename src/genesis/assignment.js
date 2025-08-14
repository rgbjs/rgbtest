import { BlindSeal } from './seal.js';
import { Amount } from '../types/amount.js';

export class FungibleState {
  constructor(amount, tag = null, blinding = null) {
    this.validate(amount);
    
    this.amount = amount instanceof Amount ? amount : new Amount(amount);
    this.tag = tag || this.generateTag();
    this.blinding = blinding || this.generateBlinding();
  }

  validate(amount) {
    if (!(amount instanceof Amount) && (typeof amount !== 'number' || amount < 0)) {
      throw new Error('Amount must be an Amount instance or non-negative number');
    }
  }

  generateTag() {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  generateBlinding() {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  toPlainObject() {
    return {
      value: this.amount.toNumber(),
      tag: this.tag,
      blinding: this.blinding
    };
  }

  toJSON() {
    return this.toPlainObject();
  }

  equals(other) {
    if (!(other instanceof FungibleState)) {
      return false;
    }
    
    return this.amount.equals(other.amount) && 
           this.tag === other.tag && 
           this.blinding === other.blinding;
  }

  static fromPlainObject(obj) {
    return new FungibleState(obj.value, obj.tag, obj.blinding);
  }
}

export class Assignment {
  constructor(seal, state, assignmentType = 4000) {
    this.validate(seal, state);
    
    this.seal = seal instanceof BlindSeal ? seal : new BlindSeal(seal);
    this.state = state instanceof FungibleState ? state : new FungibleState(state);
    this.assignmentType = assignmentType;
  }

  validate(seal, state) {
    if (!seal) {
      throw new Error('Seal is required');
    }
    
    if (!state) {
      throw new Error('State is required');
    }
    
    if (typeof seal === 'string') {
      const [txid, vout] = seal.split(':');
      if (!txid || !vout) {
        throw new Error('Seal UTXO reference must be in format "txid:vout"');
      }
    }
  }

  encode() {
    const sealEncoded = this.seal.encode();
    const stateEncoded = this.state.amount.encode();
    const typeHex = this.assignmentType.toString(16).padStart(4, '0');
    
    return typeHex + sealEncoded + stateEncoded + this.state.tag + this.state.blinding;
  }

  toPlainObject() {
    return {
      assignmentType: this.assignmentType,
      seal: this.seal.toPlainObject(),
      state: this.state.toPlainObject()
    };
  }

  toJSON() {
    return this.toPlainObject();
  }

  equals(other) {
    if (!(other instanceof Assignment)) {
      return false;
    }
    
    return this.seal.equals(other.seal) && 
           this.state.equals(other.state) && 
           this.assignmentType === other.assignmentType;
  }

  static fromPlainObject(obj) {
    const seal = BlindSeal.fromPlainObject(obj.seal);
    const state = FungibleState.fromPlainObject(obj.state);
    return new Assignment(seal, state, obj.assignmentType);
  }

  static createGenesis(utxoRef, amount) {
    const seal = new BlindSeal(utxoRef);
    const state = new FungibleState(amount);
    return new Assignment(seal, state, 4000);
  }

  getAmount() {
    return this.state.amount;
  }

  getUtxoRef() {
    return this.seal.utxoRef;
  }

  getSealBlinding() {
    return this.seal.blinding;
  }

  getStateBlinding() {
    return this.state.blinding;
  }
}