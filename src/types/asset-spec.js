import { StrictEncoder } from '../utils/strict-encoding.js';

export class AssetSpec {
  constructor({ ticker, name, precision = 0, details = 2 }) {
    this.validate({ ticker, name, precision, details });
    
    this.ticker = ticker;
    this.name = name;
    this.precision = precision;
    this.details = details;
  }

  validate({ ticker, name, precision, details }) {
    if (!ticker || typeof ticker !== 'string') {
      throw new Error('Ticker is required and must be a string');
    }
    
    if (ticker.length > 16) {
      throw new Error('Ticker must be 16 characters or less');
    }
    
    if (!/^[A-Z0-9]+$/.test(ticker)) {
      throw new Error('Ticker must contain only uppercase letters and numbers');
    }
    
    if (!name || typeof name !== 'string') {
      throw new Error('Name is required and must be a string');
    }
    
    if (name.length > 256) {
      throw new Error('Name must be 256 characters or less');
    }
    
    if (typeof precision !== 'number' || precision < 0 || precision > 18) {
      throw new Error('Precision must be a number between 0 and 18');
    }
    
    if (!Number.isInteger(precision)) {
      throw new Error('Precision must be an integer');
    }
    
    if (typeof details !== 'number' || details < 0 || details > 255) {
      throw new Error('Details must be a number between 0 and 255');
    }
  }

  encode() {
    return StrictEncoder.encode(this.toPlainObject(), 'AssetSpec');
  }

  toPlainObject() {
    return {
      ticker: this.ticker,
      name: this.name,
      precision: this.precision,
      details: this.details
    };
  }

  toJSON() {
    return this.toPlainObject();
  }

  equals(other) {
    if (!(other instanceof AssetSpec)) {
      return false;
    }
    
    return this.ticker === other.ticker &&
           this.name === other.name &&
           this.precision === other.precision &&
           this.details === other.details;
  }

  static fromPlainObject(obj) {
    return new AssetSpec(obj);
  }

  static createNonInflatable(ticker, name, precision = 0) {
    return new AssetSpec({
      ticker,
      name,
      precision,
      details: 2
    });
  }

  static createInflatable(ticker, name, precision = 0) {
    return new AssetSpec({
      ticker,
      name,
      precision,
      details: 1
    });
  }

  isNonInflatable() {
    return this.details === 2;
  }

  isInflatable() {
    return this.details === 1;
  }

  getDecimalAmount(atomicAmount) {
    if (typeof atomicAmount !== 'number' || atomicAmount < 0) {
      throw new Error('Atomic amount must be a non-negative number');
    }
    
    return atomicAmount / Math.pow(10, this.precision);
  }

  getAtomicAmount(decimalAmount) {
    if (typeof decimalAmount !== 'number' || decimalAmount < 0) {
      throw new Error('Decimal amount must be a non-negative number');
    }
    
    const atomicAmount = Math.round(decimalAmount * Math.pow(10, this.precision));
    
    if (!Number.isInteger(atomicAmount)) {
      throw new Error('Resulting atomic amount is not an integer');
    }
    
    return atomicAmount;
  }
}