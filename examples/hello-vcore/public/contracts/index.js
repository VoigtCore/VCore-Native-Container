import { record, string, integer, enumeration, array, nullable, empty, timestamp, checked, reject } from './schema.js';
export { ContractError, checked } from './schema.js';
const id = string(128, '^[A-Za-z0-9][A-Za-z0-9_.:-]*$');
const hash = string(64, '^[a-f0-9]{64}$');
export const VERSION = '1.0.0';
export function semver(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) reject('SEMVER_REQUIRED');
  const parts = value.split('.').map(Number); if (parts.some(x => !Number.isSafeInteger(x))) reject('SEMVER_REQUIRED'); return parts;
}
// Explicit reader rule: same major, provider minor/patch >= required; no ranges/prereleases.
export function compatible(provided, required) {
  const p = semver(provided), r = semver(required);
  return p[0] === r[0] && (p[1] > r[1] || p[1] === r[1] && p[2] >= r[2]);
}
export const EventContract = record({ event_id: id, event_type: id, occurred_at: timestamp,
  session_id: id, application_reference: id, object_reference: id, source: id });
export const ResourceContract = record({ cpu_percent: integer(1,100), memory_mb: integer(32,4096), max_processes: integer(1,32), timeout_ms: integer(10,30000), max_events: integer(1,128), max_message_bytes: integer(1024,65536) });
export const IdentityContract = record({ instance_id: id, structural_identity_hash: hash, trajectory_id: nullable(id), revision: integer(1,2147483647), basis: enumeration('VCORE_CANONICAL_STRUCTURE','BLACKBOX_ACTIVITY_REFERENCE') });
export const HealthContract = record({ status: enumeration('READY','RUNNING','PAUSED','STOPPED','FAILED'), availability: enumeration('AVAILABLE','UNAVAILABLE'), detail: id });
export const EngineContract = record({ engine_id: id, version: string(32), contract: enumeration('trajectory.contract'), contract_version: string(32), capabilities: array(enumeration('trajectory.read','trajectory.ingest','trajectory.restore','trajectory.snapshot'),4), resources: ResourceContract });
export const ContainerContract = record({ manifest_version: enumeration(VERSION), name: id, version: string(32), engine: EngineContract, permissions: record({ network: enumeration('DENY_ALL'), filesystem: enumeration('APPCONTAINER_PRIVATE') }), environment: empty });
const nativeTrajectory = record({ trajectory_id: id, started_at: timestamp, ended_at: nullable(timestamp), event_count: integer(1,128), state: enumeration('OPEN','CLOSED'), source: enumeration('HUMAN_ACTIVITY_PIPELINE'), events: array(EventContract,128) });
export const TrajectoryView = record({ trajectories: array(nativeTrajectory,128), event_count: integer(0,128), nature: enumeration('ENGINE_REPORTED'), semantics: enumeration('BLACKBOX_HUMAN_ACTIVITY') });
export const TrajectorySnapshot = record({ contract: enumeration('trajectory.snapshot'), version: enumeration(VERSION), engine_id: enumeration('blackbox.human-activity.trajectory'), events: array(EventContract,128) });
export const TrajectoryContract = {
  id: 'trajectory.contract', version: VERSION,
  methods: {
    ingest: { capability: 'trajectory.ingest', input: record({ event: EventContract }), output: TrajectoryView },
    analyze: { capability: 'trajectory.read', input: empty, output: TrajectoryView },
    getTrajectory: { capability: 'trajectory.read', input: empty, output: TrajectoryView },
    getState: { capability: 'trajectory.read', input: empty, output: record({ event_count: integer(0,128), trajectory_count: integer(0,128), status: enumeration('READY','RUNNING','PAUSED','STOPPED','FAILED') }) },
    snapshot: { capability: 'trajectory.snapshot', input: empty, output: TrajectorySnapshot },
    restore: { capability: 'trajectory.restore', input: record({ snapshot: TrajectorySnapshot }), output: TrajectoryView },
  }
};
export const lifecycle = Object.freeze({ READY:['RUNNING','STOPPED','FAILED'], RUNNING:['PAUSED','STOPPED','FAILED'], PAUSED:['RUNNING','STOPPED','FAILED'], STOPPED:[], FAILED:[] });
export function transition(previous, next) { if (!lifecycle[previous]?.includes(next)) reject('LIFECYCLE_TRANSITION'); return next; }
export function validateEngine(value) {
  const e = checked(EngineContract,value); semver(e.version); semver(e.contract_version);
  if (!compatible(VERSION,e.contract_version)) reject('CONTRACT_INCOMPATIBLE');
  if (new Set(e.capabilities).size !== e.capabilities.length) reject('DUPLICATE_CAPABILITY'); return e;
}
export function validateContainer(value) { const c=checked(ContainerContract,value); semver(c.version); validateEngine(c.engine); return c; }
export function method(name) { if (!Object.hasOwn(TrajectoryContract.methods,name)) reject('METHOD_NOT_ALLOWED'); return TrajectoryContract.methods[name]; }
// Freeze descriptors recursively: a consumer cannot silently relax process-local contracts.
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
for (const schema of [EventContract,ResourceContract,IdentityContract,HealthContract,EngineContract,ContainerContract,TrajectoryContract]) freeze(schema);
