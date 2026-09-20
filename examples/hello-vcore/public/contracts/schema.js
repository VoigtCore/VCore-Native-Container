// Public, dependency-free validation vocabulary. No proprietary imports or execution.
export class ContractError extends Error {
  constructor(code, field = '$') { super(code); this.name = 'ContractError'; this.code = code; this.field = field; this.status = 400; }
}
export const reject = (code, field) => { throw new ContractError(code, field); };
export const string = (maxLength = 120, pattern) => ({ type: 'string', minLength: 1, maxLength, ...(pattern ? { pattern } : {}) });
export const integer = (minimum, maximum) => ({ type: 'integer', minimum, maximum });
export const enumeration = (...values) => ({ enum: values });
export const array = (items, maxItems = 256) => ({ type: 'array', items, maxItems });
export const nullable = (schema) => ({ anyOf: [schema, { type: 'null' }] });
export const record = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
export const empty = record({});
export const timestamp = string(24, '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$');

// Accept JSON data only, including when called in-process. Reject accessors before reading.
export function jsonData(value, depth = 0, seen = new Set(), budget = { nodes: 0 }) {
  if (++budget.nodes > 100000 || depth > 24) reject('DATA_LIMIT');
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (!value || typeof value !== 'object' || seen.has(value)) reject('JSON_DATA_REQUIRED');
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) reject('PLAIN_OBJECT_REQUIRED');
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    if (typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key)) reject('FORBIDDEN_KEY');
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor.enumerable || !('value' in descriptor)) reject('DATA_PROPERTY_REQUIRED');
    jsonData(descriptor.value, depth + 1, seen, budget);
  }
  if (Array.isArray(value) && Object.keys(value).length !== value.length) reject('DENSE_ARRAY_REQUIRED');
  seen.delete(value);
}

export function validate(schema, value, field = '$') {
  if (schema.anyOf) {
    for (const option of schema.anyOf) { try { validate(option, value, field); return value; } catch (e) { if (!(e instanceof ContractError)) throw e; } }
    reject('SCHEMA_UNION', field);
  }
  if (schema.enum) { if (!schema.enum.includes(value)) reject('SCHEMA_ENUM', field); return value; }
  if (schema.type === 'null') { if (value !== null) reject('SCHEMA_NULL', field); }
  else if (schema.type === 'string') {
    if (typeof value !== 'string' || value.length < schema.minLength || value.length > schema.maxLength || /[\x00-\x1f]/.test(value) || schema.pattern && !new RegExp(schema.pattern).test(value)) reject('SCHEMA_STRING', field);
    if (schema === timestamp && (!Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value)) reject('SCHEMA_TIMESTAMP', field);
  } else if (schema.type === 'integer') {
    if (!Number.isSafeInteger(value) || value < schema.minimum || value > schema.maximum) reject('SCHEMA_INTEGER', field);
  } else if (schema.type === 'boolean') { if (typeof value !== 'boolean') reject('SCHEMA_BOOLEAN', field); }
  else if (schema.type === 'array') {
    if (!Array.isArray(value) || value.length > schema.maxItems) reject('SCHEMA_ARRAY', field);
    value.forEach((v, i) => validate(schema.items, v, `${field}[${i}]`));
  } else if (schema.type === 'object') {
    if (!value || Object.getPrototypeOf(value) !== Object.prototype) reject('SCHEMA_OBJECT', field);
    for (const key of Object.keys(value)) if (!Object.hasOwn(schema.properties, key)) reject('UNKNOWN_FIELD', `${field}.${key}`);
    for (const key of schema.required) if (!Object.hasOwn(value, key)) reject('REQUIRED_FIELD', `${field}.${key}`);
    for (const key of Object.keys(value)) validate(schema.properties[key], value[key], `${field}.${key}`);
  } else reject('SCHEMA_UNSUPPORTED', field);
  return value;
}
export function checked(schema, value, maxBytes = 65536) {
  jsonData(value);
  if (new TextEncoder().encode(JSON.stringify(value)).length > maxBytes) reject('MESSAGE_SIZE_LIMIT');
  validate(schema, value);
  return structuredClone(value);
}
