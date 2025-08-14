import { StrictEncoder } from '../utils/strict-encoding.js';

export class BlindSeal {
  constructor(utxoRef, blinding = null) {
    this.validate(utxoRef, blinding);
    
    this.utxoRef = utxoRef;
    this.blinding = blinding || this.generateBlinding();
  }

  validate(utxoRef, blinding) {
    if (!utxoRef || typeof utxoRef !== 'string') {
      throw new Error('UTXO reference is required and must be a string');
    }
    
    const [txid, vout] = utxoRef.split(':');
    if (!txid || !vout) {
      throw new Error('UTXO reference must be in format "txid:vout"');
    }
    
    if (txid.length !== 64 || !/^[0-9a-fA-F]+$/i.test(txid)) {
      throw new Error('Invalid transaction ID format');
    }
    
    const voutNum = parseInt(vout);
    if (isNaN(voutNum) || voutNum < 0 || voutNum > 0xFFFFFFFF) {
      throw new Error('Invalid vout: must be a non-negative 32-bit integer');
    }
    
    if (blinding !== null && (typeof blinding !== 'string' || blinding.length !== 64)) {
      throw new Error('Blinding factor must be null or a 64-character hex string');
    }
  }

  generateBlinding() {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  encode() {
    return StrictEncoder.encode(this.utxoRef, 'UtxoRef') + this.blinding;
  }

  getTxId() {
    return this.utxoRef.split(':')[0];
  }

  getVout() {
    return parseInt(this.utxoRef.split(':')[1]);
  }

  toPlainObject() {
    return {
      utxoRef: this.utxoRef,
      blinding: this.blinding,
      method: 'opretFirst'
    };
  }

  toJSON() {
    return this.toPlainObject();
  }

  equals(other) {
    if (!(other instanceof BlindSeal)) {
      return false;
    }
    
    return this.utxoRef === other.utxoRef && this.blinding === other.blinding;
  }

  static fromPlainObject(obj) {
    return new BlindSeal(obj.utxoRef, obj.blinding);
  }

  static createFromUtxo(txid, vout, blinding = null) {
    const utxoRef = `${txid}:${vout}`;
    return new BlindSeal(utxoRef, blinding);
  }

  blind() {
    return new BlindSeal(this.utxoRef, this.generateBlinding());
  }
}