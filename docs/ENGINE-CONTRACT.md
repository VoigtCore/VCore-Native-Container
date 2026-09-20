# Public engine contract / Contrato público

**Version / versão: 1.0.0.** The example uses the existing health contract.
O exemplo usa o contrato de estado existente; não cria um protocolo novo.

| Item | English | Português |
|---|---|---|
| Input | Host supplies schema, container_id, run_id and pid. | O host fornece schema, container_id, run_id e pid. |
| Output | health result plus the same run context and observed_at. | Resultado de estado com o mesmo contexto e observed_at. |
| Lifecycle | Host starts and bounds the process; stop/timeout belongs to runtime. | O host inicia e limita o processo; parada/timeout pertencem ao runtime. |
| Identity | Assigned and checked by host, never chosen as an authority by engine. | Atribuída e conferida pelo host; o motor não escolhe sua autoridade. |
| Capability | Example requests health.read; requested does not mean granted. | Exemplo solicita health.read; solicitar não significa receber autorização. |
| Network | DENY_ALL in the example recipe. | DENY_ALL na receita do exemplo. |
| Limits | 512 MiB, 20% CPU, one process, 10-second runtime timeout. | 512 MiB, 20% CPU, um processo, timeout de execução de 10 segundos. |
| Errors | Invalid results fail contract validation; never fabricate host data. | Resultados inválidos falham na validação; não inventar dados do host. |
| History | Original host journal; no new engine authority or parallel journal. | Journal original do host; sem nova autoridade ou journal paralelo. |
| Compatibility | Windows x64, pinned Node 24.13.1 binary. | Windows x64, binário Node 24.13.1 fixado por hash. |

Read the public schemas under `examples/hello-vcore/public/contracts` and SDK under
`examples/hello-vcore/public/sdk`. The minimal example does not demonstrate broker
sensor requests, persistent storage, arbitrary network access or cryptographic key
release. Those require supported contracts and explicit operator authorization.

Consulte os schemas e o SDK públicos nas mesmas pastas. O exemplo mínimo não demonstra
sensores via broker, persistência, rede arbitrária ou liberação de chave. Essas funções
dependem de contratos suportados e autorização explícita do operador.
