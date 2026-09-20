# VCore Native Container
## Experimental Edition For Engines VCore

**[Português](README.pt-BR.md) · [English](README.md)**

A practical starting point for developing, inspecting and packaging VCore engines.
**VCore Engine Studio** is the visual workspace. **VCore Engine Development Platform**
provides the same operations through text commands. **Native Container** is the
separately provisioned execution boundary controlled by the operator.

![Real Studio screenshot with the included hello-vcore demonstration package](docs/images/studio-package.png)

### Start here

- **[Download the experimental Windows edition](https://github.com/VoigtCore/VCore-Native-Container/releases/tag/v0.1.0-experimental)**
- **[Step-by-step illustrated guide — English](docs/manual.en.md)**
- **[Manual ilustrado — Português](docs/manual.pt-BR.md)**
- [Ready-to-inspect demonstration .vc](packages/hello-vcore-1.0.0-demo-signed.vc)
- [Example engine source](examples/hello-vcore) · [Engine contract](docs/ENGINE-CONTRACT.md)

### What you can do

Open a project, test it, build a `.vc`, inspect packages, verify signatures and sign
with a publisher key you are authorized to use. After operator admission, use Run,
Stop, Status, Logs and History. Replay reads the existing execution history; it
does not rerun work.

```text
Your engine → Tests → .vc package → Signature → Operator admission
                                                   ↓
                                            Native Container
                                                   ↓
                                        Execution and history
```

**This public download does not install or include the private operator runtime.**
Local development and inspection work without it. Running an engine in Native
Container requires a separately provisioned operator endpoint, credentials, policy,
publisher trust and package admission. Importing a package never grants permission.

### Included versions and current status

| Component | Version / status |
|---|---|
| Engine Studio | 0.1.0-experimental, Windows x64 |
| Engine Development Platform | 0.2.0-experimental |
| Public SDK / engine contract | 1.0.0 |
| Example engine | hello-vcore 1.0.0, Windows x64, Node 24.13.1 pinned by hash |
| Production readiness | NOT_READY |

The Windows ZIP includes Node.js and its license notices. It requires .NET Framework
4.x for Studio. Linux uses the separate text-command tooling; this Studio GUI is
not a Linux application. This release does not claim Linux native acceptance.

Four existing Studio acceptance tests passed, including real Native execution with
a separately provisioned operator and denial after revocation. The included example
passes its contract test and signature verification. Clean-machine installation,
Windows service installation/reboot and load stability still need validation.
Two timeouts in the earlier broad Platform regression remain recorded; isolated
rechecks passed. No claim of production readiness is made.

### Public boundary

No private Core, commercial Pulse source, databases, root keys, admission authority
or operator credentials are included. The demo signature is a **disposable example
publisher**, not official publisher trust. Only its public key is published.

The EXE is **not Authenticode signed**. Use [SHA256SUMS](SHA256SUMS) and obtain the
download from this repository. Checksums verify bytes, not an independent publisher
identity. Public visibility does not make this an open-source license:
see [LICENSE](LICENSE) and [security scope](SECURITY.md).

[VoigtCore website](https://www.voigtcore.com.br/) · [GitHub](https://github.com/VoigtCore)
