import {healthResult} from '../public/sdk/health.js';

// This engine reports only its own readiness, not the health of the host.
// Este motor informa somente seu próprio estado, não a saúde do computador.
export function main() { return healthResult('RUNNING', 'AVAILABLE', 'hello.vcore.ready'); }
