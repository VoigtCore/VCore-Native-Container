// Public guest SDK. No authority, package decryption, private database or host imports.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateEngineContext, validateEngineResult } from '../contracts/engine.js';
import { checked, HealthContract } from '../contracts/index.js';
export { ContractClient, VERSION, compatible, ContractError } from './index.js';
export { healthResult } from './health.js';
export { ENGINE_CONTRACT_VERSION, EngineContextContract, EngineResultContract } from '../contracts/engine.js';

export function engineContext() {
  return Object.freeze(validateEngineContext({schema:'vcore.engine.context/1',container_id:process.env.VCORE_CONTAINER_ID,
    run_id:process.env.VCORE_RUN_ID,pid:process.pid}));
}
export function emitResult(health) {
  const context=engineContext(),workspace=process.env.VCORE_WORKSPACE;
  if(typeof workspace!=='string'||!path.isAbsolute(workspace))throw Object.assign(new Error('WORKSPACE_REQUIRED'),{code:'WORKSPACE_REQUIRED'});
  const info=fs.lstatSync(workspace);
  if(!info.isDirectory()||info.isSymbolicLink())throw Object.assign(new Error('WORKSPACE_INVALID'),{code:'WORKSPACE_INVALID'});
  const result=validateEngineResult({health:checked(HealthContract,health),container_id:context.container_id,
    run_id:context.run_id,pid:context.pid,observed_at:new Date().toISOString()});
  const filename=path.join(workspace,'engine-result.json');
  if(fs.existsSync(filename)){const stat=fs.lstatSync(filename);if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1)throw Object.assign(new Error('RESULT_PATH_DENIED'),{code:'RESULT_PATH_DENIED'});}
  // Atomic replacement supports restart without ever opening the previous result.
  const pending=path.join(workspace,`engine-result-${crypto.randomUUID()}.pending`);
  fs.writeFileSync(pending,JSON.stringify(result),{flag:'wx',mode:0o600});
  try{fs.renameSync(pending,filename);}catch(error){try{fs.unlinkSync(pending);}catch{}throw error;}
  return result;
}
