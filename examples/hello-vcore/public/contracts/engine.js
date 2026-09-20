// Public engine output contract; authorization and identity remain host decisions.
import { record, string, integer, enumeration, timestamp, checked } from './schema.js';
import { HealthContract } from './index.js';
export const ENGINE_CONTRACT_VERSION = '1.0.0';
const uuid = string(36, '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$');
export const EngineContextContract = record({schema:enumeration('vcore.engine.context/1'),container_id:uuid,run_id:uuid,pid:integer(1,4294967295)});
export const EngineResultContract = record({health:HealthContract,pid:integer(1,4294967295),container_id:uuid,run_id:uuid,observed_at:timestamp});
export const validateEngineContext = value => checked(EngineContextContract,value,4096);
export const validateEngineResult = value => checked(EngineResultContract,value,32768);
