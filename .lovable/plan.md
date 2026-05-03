## Redesign do Cartão SIGAFLO — alinhamento com mockup oficial

Reescrever o template do cartão (`src/lib/cardTemplate.ts`), o preview 3D (`FarmerCard.tsx`) e o renderizador em lote (`cardBatchExport.ts`) para reproduzir fielmente o mockup fornecido, omitindo as áreas marcadas a vermelho.

### Áreas a REMOVER (marcadas a vermelho no mockup)
- Texto "MINAGRIF" sob o brasão (manter apenas "República de Angola / Ministério da Agricultura e Florestas").
- Bloco lateral "Cultura Principal / Área Produtiva" na frente.
- Os dois selos institucionais em baixo no verso ("Sistema Integrado de Gestão Agro Florestal" e "Governo Digital / Inovação e Serviço ao Cidadão").

### FRENTE — novo layout

```text
┌───────────────────────────────────────────────────────────────┐
│ [brasão] REPÚBLICA DE ANGOLA   [logo SIGAFLO grande]   ┌────┐ │
│          Ministério da Agric.   SISTEMA INTEGRADO DE    │mapa│ │
│          e Florestas            GESTÃO AGRO FLORESTAL   │ AO │ │
│                                                          └────┘ │
│            ┌───── faixa verde ─────┐         GOVERNO DE       │
│            │ CARTÃO DE IDENTIFICAÇÃO DO AGRICULTOR │ ANGOLA   │
│            └───────────────────────┘                          │
│ ┌──────┐  NOME COMPLETO          📍 PROVÍNCIA                 │
│ │      │  JOÃO MANUEL KALUNGA       BENGUELA                  │
│ │ FOTO │                                                       │
│ │      │  ID SIGAFLO             🏛 MUNICÍPIO                  │
│ │      │  AO-SIGAF-00012345         BAÍA FUNDA                │
│ └──────┘                                                       │
│           TIPO DE PRODUTOR       👥 COMUNA      ▣ QR          │
│           PEQUENO PRODUTOR          CAIMBAMBO   VERIFIQUE A    │
│                                                  AUTENTICIDADE │
│ ═══════════════════ paisagem rural verde ════════════════════ │
│  ⊙ PRODUZIR  🌳 PRESERVAR  📈 DESENVOLVER  👥 INCLUIR         │
└───────────────────────────────────────────────────────────────┘
```

Detalhes:
- **Header branco** com brasão de Angola (asset existente ou placeholder), logo SIGAFLO em verde + tagline "SISTEMA INTEGRADO DE GESTÃO AGRO FLORESTAL", mapa de Angola à direita com tag "GOVERNO DE ANGOLA" sobre faixa verde-escuro recortada.
- **Faixa verde central** com texto "CARTÃO DE IDENTIFICAÇÃO DO AGRICULTOR".
- **Corpo em 3 colunas**:
  - Coluna 1 (foto + paisagem rural ao fundo).
  - Coluna 2 (Nome, ID SIGAFLO, Tipo de produtor) com labels uppercase pequenas em cinza e valores em peso forte.
  - Coluna 3 (Província / Município / Comuna) com pequenos ícones a verde.
- **QR code** integrado à direita (≥ 20 mm) com texto vertical "VERIFIQUE A AUTENTICIDADE DESTE CARTÃO".
- **Rodapé verde** com paisagem rural ilustrada + 4 pilares: Produzir · Preservar · Desenvolver · Incluir (com mini-ícones).
- Remover elementos do design anterior: chip PVC simulado, marca-d'água "SIGAFLO" diagonal, badge biometria.

### VERSO — novo layout

```text
┌──────────────────┬──────────────────────────────────┐
│  📅 DATA EMISSÃO │   CÓDIGO DE BARRAS               │
│  20/05/2025      │   ▮▮▮▮▮▮ Code128 ▮▮▮▮▮▮          │
│                  │   AO-SIGAF-00012345              │
│  📅 VALIDADE     │                                  │
│  20/05/2030      │   📡 NFC                         │
│                  │   Aproxime para verificar        │
│  ✓ ESTADO        │                                  │
│  ATIVO           │   ┌────────────────────────────┐ │
│                  │   │ 🎧 LINHA DE APOIO SIGAFLO  │ │
│  ─signature─     │   │ 923 123 456 │ apoio@...    │ │
│  MINAGRIF        │   │ www.sigaflo.gov.ao         │ │
│  AUT. EMISSORA   │   └────────────────────────────┘ │
└──────────────────┴──────────────────────────────────┘
```

- **Painel esquerdo verde-escuro** (~38% largura) com Data Emissão, Validade, Estado do Registo, "assinatura" + "AUTORIDADE EMISSORA" (texto institucional, sem logos).
- **Painel direito branco** com:
  - Código de barras Code128 (jsbarcode existente) + ID legível.
  - Bloco NFC com ícone (texto "Aproxime para verificar").
  - Caixa "Linha de apoio SIGAFLO" com telefone/email/site.
  - Pequena nota legal: "Este cartão é pessoal e intransmissível. O uso indevido implica sanções nos termos da lei."
- **Remover** os dois selos (zonas marcadas a vermelho).
- Folhagem decorativa muito subtil (≤ 5% opacidade) no fundo verde.

### Tokens / paleta
Manter os tokens `--card-sigaflo-*` já existentes; ajustar:
- Verde escuro do painel verso: `#0c3d1a`.
- Verde médio header/badges: `#1f6b34`.
- Verde claro de fundo das caixas (linha apoio, nota legal): `#f0f7f1`.
- Texto principal: `#1a2030`. Labels: `#6b7280`.

### Assets necessários
- `src/assets/brasao-angola.png` — brasão da República (gerado/placeholder SVG com escudo simplificado).
- `src/assets/sigaflo-logo.svg` — logo SIGAFLO (composição de árvore/folhas em verde com tagline).
- `src/assets/mapa-angola.svg` — silhueta do mapa para o badge "Governo de Angola".
- `src/assets/paisagem-rural.svg` — ilustração leve da paisagem para rodapé da frente.

Estes assets serão gerados via `imagegen` (transparent PNG) com prompts específicos, ou desenhados directamente em SVG inline para manter print-ready / vetorial. Decisão: **inline SVG** (vetorial, sem dependências externas, escalável a 300 DPI sem perda).

### Ficheiros a actualizar

- `src/lib/cardTemplate.ts` — reescrever `renderCardFrontHtml` e `renderCardBackHtml` com a nova estrutura HTML/CSS e SVGs inline.
- `src/components/farmers/FarmerCard.tsx` — sem mudanças estruturais, apenas usa o novo template (preview 3D já consome o template).
- `src/lib/cardBatchExport.ts` — reescrever `drawCardFront` e `drawCardBack` em jsPDF (vector primitives) para reproduzir o mesmo layout, garantindo que a exportação em lote permanece print-ready.

### Validação final
- QR ≥ 20 mm e código de barras legíveis após render @300 DPI.
- Nada das 3 zonas marcadas a vermelho aparece.
- Preview 3D digital idêntico ao PDF gerado (single + batch).
- Margem de segurança de 3 mm respeitada em ambos os lados.
- Contraste WCAG AA em todos os textos.
