// Public SDK, dependency only on public contracts. No host/Core access.
import { checked, HealthContract } from '../contracts/index.js';
export function healthResult(status, availability, detail) {
  return checked(HealthContract,{status,availability,detail});
}
