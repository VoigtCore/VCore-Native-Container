import test from 'node:test';
import assert from 'node:assert/strict';
import {main} from '../src/main.mjs';
import {checked,HealthContract} from '../public/contracts/index.js';
test('engine implements the public health result contract',async()=>{const value=await main();assert.deepEqual(checked(HealthContract,value),value);});
