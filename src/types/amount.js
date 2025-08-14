import { StrictEncoder } from '../utils/strict-encoding.js';

export class Amount {
  constructor(value) {
    this.validate(value);
    this.value = value;
  }

  validate(value) {
    if (typeof value !== 'number' || value < 0) {
      throw new Error('Amount must be a non-negative number');
    }
    
    if (!Number.isInteger(value)) {
      throw new Error('Amount must be an integer (atomic units)');
    }
    
    if (value > Number.MAX_SAFE_INTEGER) {
      throw new Error('Amount exceeds maximum safe integer');
    }
  }

  encode() {
    return StrictEncoder.encode(this.value, 'Amount');
  }

  toNumber() {
    return this.value;
  }

  equals(other) {
    if (!(other instanceof Amount)) {
      return false;
    }
    
    return this.value === other.value;
  }

  add(other) {
    if (!(other instanceof Amount)) {
      throw new Error('Can only add Amount instances');
    }
    
    const result = this.value + other.value;
    if (result > Number.MAX_SAFE_INTEGER) {
      throw new Error('Addition would exceed maximum safe integer');
    }
    
    return new Amount(result);
  }

  subtract(other) {
    if (!(other instanceof Amount)) {
      throw new Error('Can only subtract Amount instances');
    }
    
    if (this.value < other.value) {
      throw new Error('Cannot subtract larger amount from smaller amount');
    }
    
    return new Amount(this.value - other.value);
  }

  multiply(factor) {
    if (typeof factor !== 'number' || factor < 0) {
      throw new Error('Multiplication factor must be a non-negative number');
    }
    
    const result = Math.floor(this.value * factor);
    if (result > Number.MAX_SAFE_INTEGER) {
      throw new Error('Multiplication would exceed maximum safe integer');
    }
    
    return new Amount(result);
  }

  divide(divisor) {
    if (typeof divisor !== 'number' || divisor <= 0) {
      throw new Error('Division divisor must be a positive number');
    }
    
    return new Amount(Math.floor(this.value / divisor));
  }

  isZero() {
    return this.value === 0;
  }

  isPositive() {
    return this.value > 0;
  }

  greaterThan(other) {
    if (!(other instanceof Amount)) {
      throw new Error('Can only compare with Amount instances');
    }
    
    return this.value > other.value;
  }

  lessThan(other) {
    if (!(other instanceof Amount)) {
      throw new Error('Can only compare with Amount instances');
    }
    
    return this.value < other.value;
  }

  greaterThanOrEqual(other) {
    if (!(other instanceof Amount)) {
      throw new Error('Can only compare with Amount instances');
    }
    
    return this.value >= other.value;
  }

  lessThanOrEqual(other) {
    if (!(other instanceof Amount)) {
      throw new Error('Can only compare with Amount instances');
    }
    
    return this.value <= other.value;
  }

  toString() {
    return this.value.toString();
  }

  toJSON() {
    return this.value;
  }

  static fromNumber(value) {
    return new Amount(value);
  }

  static zero() {
    return new Amount(0);
  }

  static max(...amounts) {
    if (amounts.length === 0) {
      throw new Error('Must provide at least one amount');
    }
    
    return amounts.reduce((max, current) => 
      current.greaterThan(max) ? current : max
    );
  }

  static min(...amounts) {
    if (amounts.length === 0) {
      throw new Error('Must provide at least one amount');
    }
    
    return amounts.reduce((min, current) => 
      current.lessThan(min) ? current : min
    );
  }

  static sum(...amounts) {
    return amounts.reduce((sum, current) => sum.add(current), Amount.zero());
  }
}