# hello-vcore

## Português

Este exemplo informa apenas que o próprio motor está pronto. Não mede a saúde do
computador. Edite `src/main.mjs`, execute `vcore test` e depois `vcore build`.
O build gera `dist/engine.vc` sem assinatura. Assinar exige sua própria chave de
publisher; executar exige confiança, política e admissão do operador.

Veja o [manual ilustrado](../../docs/manual.pt-BR.md) e o
[contrato público](../../docs/ENGINE-CONTRACT.md). Os testes locais executam seu
código como seu usuário; não demonstram isolamento do Native Container.

## English

This project contains your engine and public VCore contracts only.

Run `vcore test`, then `vcore package build`. Build regenerates the explicitly declared recipe file hashes; inspect the diff before publisher signing.

The unsigned artifact cannot run until an authorized publisher signs it and an operator admits its exact hash. Configure an operator endpoint, then use `vcore run hello-vcore@1.0.0`.

`src/main.mjs` returns HealthContract 1.0.0. The generated entrypoint receives Native Container IDs and emits a bounded public result in its private workspace. The broker and operator decide capabilities. No Core, authority, secret, network entitlement or production access is included.

Local tests run your own code on your development account; they are contract tests, not Native Container isolation.
