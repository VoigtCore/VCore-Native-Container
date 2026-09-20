// PUBLIC: transport injection only. Never imports core, adapters, OS backend or product engines.
import { VERSION, checked, method, validateEngine, transition } from '../contracts/index.js';
import { reject } from '../contracts/schema.js';
export { VERSION, compatible, validateEngine, validateContainer, ContractError } from '../contracts/index.js';

export class ContractClient {
  #state = 'READY'; #busy = false;
  constructor(descriptor, transport) {
    this.descriptor = validateEngine(descriptor);
    if (!transport || typeof transport.call !== 'function' || typeof transport.close !== 'function') reject('TRANSPORT_REQUIRED');
    this.transport = transport;
  }
  get status() { return this.#state; }
  start() { this.#state = transition(this.#state,'RUNNING'); }
  // Admission gating only, NOT OS process suspension. Native runtime pause remains unsupported.
  pause() { if (this.#busy) reject('ENGINE_BUSY'); this.#state=transition(this.#state,'PAUSED'); }
  resume() { this.#state=transition(this.#state,'RUNNING'); }
  async call(name, input = {}) {
    if (this.#state !== 'RUNNING') reject('ENGINE_NOT_RUNNING');
    if (this.#busy) reject('ENGINE_BUSY');
    const spec=method(name), policy=this.descriptor.resources;
    if (!this.descriptor.capabilities.includes(spec.capability)) reject('CAPABILITY_DENIED');
    const payload=checked(spec.input,input,policy.max_message_bytes);
    this.#busy=true; let timer;
    try {
      const timeout = new Promise((_,fail) => { timer=setTimeout(() => fail(Object.assign(new Error('CONTRACT_TIMEOUT'),{code:'CONTRACT_TIMEOUT'})),policy.timeout_ms); });
      const response=await Promise.race([Promise.resolve().then(() => this.transport.call(name,payload)),timeout]);
      return checked(spec.output,response,policy.max_message_bytes);
    } catch (error) {
      // Timeout/output/transport failures poison the instance. Do not reuse uncertain state.
      this.#state='FAILED'; await Promise.resolve().then(()=>this.transport.close()).catch(() => {}); throw error;
    } finally { clearTimeout(timer); this.#busy=false; }
  }
  async stop() { if(this.#state==='STOPPED') return; await this.transport.close(); this.#state='STOPPED'; }
}
