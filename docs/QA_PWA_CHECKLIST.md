# Checklist de Validação Pré-Lançamento — SIGAFLO PWA

> Use este checklist antes de cada release público. Teste em **Android Chrome ≥ 110** e **iOS Safari ≥ 16.4** (mínimo absoluto: iOS 14, Android 8).

## 0. Pré-requisitos do ambiente

- [ ] Build de produção: `npm run build` sem erros nem warnings críticos
- [ ] Publicado em URL HTTPS (PWA exige HTTPS — `localhost` é exceção)
- [ ] Service Worker **NÃO** registado em `id-preview--*.lovable.app` ou dentro de iframe (verificar em DevTools → Application → Service Workers)
- [ ] Manifesto acessível em `/manifest.webmanifest` (HTTP 200, `Content-Type: application/manifest+json`)
- [ ] Ícones 192×192 e 512×512 servidos com 200 OK

## 1. Instalação (Add to Home Screen)

### Android Chrome
- [ ] Abrir URL pública → após ~30s de uso, banner "Instalar SIGAFLO" aparece
- [ ] Visitar `/instalar` → botão **"Instalar agora"** está visível e funcional
- [ ] Após instalar: ícone aparece no launcher com cor de tema correta (#0f766e)
- [ ] Abrir o app instalado: barra de endereço **não** aparece (modo standalone)
- [ ] `display-mode: standalone` ativo → banner não reaparece
- [ ] Splash screen mostra o nome "SIGAFLO" e ícone correto

### iOS Safari
- [ ] Visitar `/instalar` → instruções específicas iOS aparecem (Partilhar → Adicionar ao Ecrã Principal)
- [ ] Após "Adicionar ao Ecrã Principal": ícone aparece no springboard
- [ ] Abrir o app instalado: sem barra de endereço, status bar com tema correto
- [ ] `apple-mobile-web-app-capable=yes` reconhecido (sem moldura Safari)

### Desktop (Chrome/Edge)
- [ ] Ícone de instalação ⊕ visível na barra de endereço
- [ ] Após instalar: app abre em janela dedicada

## 2. Funcionamento Offline

> Antes de testar: faça login uma vez online para popular o cache do React Query.

### Modo "avião" — Android e iOS
- [ ] Ativar modo avião / desligar Wi-Fi
- [ ] **Banner vermelho de offline** aparece no rodapé
- [ ] Recarregar a página atual → continua a funcionar (servida do SW)
- [ ] Navegar para `/` → dashboard carrega (cache RQ)
- [ ] Navegar para `/agricultores` → lista anteriormente vista aparece
- [ ] Navegar para rota nunca visitada → cai em `/offline` ou mostra estado vazio coerente
- [ ] Visitar `/offline` → vê lista de rotas disponíveis offline e fila de sync
- [ ] Imagens já cacheadas continuam a aparecer; novas tentativas falham silenciosamente

### Formulários offline
- [ ] Criar novo agricultor offline → toast "Guardado offline — será sincronizado"
- [ ] Item aparece em `/sincronizacao` aba **Pendentes** com estado "Em fila"
- [ ] Editar agricultor existente offline → fila guarda também `baseRow` para 3-way merge
- [ ] Múltiplas mutações são preservadas (testar 5+ em sequência)
- [ ] Refresh do app offline → fila persiste (Dexie/IndexedDB)
- [ ] Fechar e reabrir app offline → fila persiste

## 3. Sincronização ao Reconectar

- [ ] Voltar online (desativar modo avião)
- [ ] Banner offline desaparece automaticamente
- [ ] Sync inicia em ≤3s sem ação do utilizador
- [ ] `/sincronizacao` mostra barra de progresso a aumentar
- [ ] Toast de sucesso indica nº de alterações sincronizadas
- [ ] Lista pendente fica vazia ao terminar
- [ ] Servidor reflete as mudanças (verificar via outro dispositivo/admin)
- [ ] `audit_log` regista as ações com `created_at` posterior à reconexão (não falsifica timestamp)

## 4. Conflitos

- [ ] Editar mesma linha em 2 dispositivos: A offline edita campo X, B online edita campo Y
- [ ] A reconecta → merge automático bem-sucedido (campos diferentes)
- [ ] Editar mesmo campo em ambos → conflito aparece em `/sincronizacao` aba **Conflitos**
- [ ] Botões "Manter local" / "Manter servidor" funcionam e limpam o conflito

## 5. Câmara e Captura (Android nativo)

- [ ] Primeiro toque em "Tirar Foto" pede permissão Android → "Permitir"
- [ ] Câmara nativa abre, captura funciona
- [ ] Crop dialog aparece com pré-visualização 3:4
- [ ] Foto é enviada para `farmer-photos` ao reconectar (se offline)
- [ ] Permissão negada → toast em pt-PT explica como reativar

## 6. Atualização do App (Auto-update do SW)

- [ ] Publicar nova versão
- [ ] App instalado detecta update em ≤1 min de uso
- [ ] Após reload, nova versão ativa (verificar via versão em `index.html`)
- [ ] Cache antigo é purgado (DevTools → Application → Cache Storage)

## 7. Performance & UX

- [ ] Lighthouse PWA score ≥ 90 (`npx lighthouse https://sigaflo.lovable.app --only-categories=pwa`)
- [ ] Lighthouse Performance ≥ 70 em 4G simulado
- [ ] Tempo até interatividade ≤ 5s em rede lenta
- [ ] Sem "flash of unstyled content"
- [ ] Animações fluidas em dispositivos low-end (Galaxy A10 / iPhone SE)

## 8. Segurança

- [ ] HTTPS válido (sem mixed content warnings)
- [ ] Tokens Supabase **anon key** apenas no client (nunca service_role)
- [ ] RLS ativa em todas as tabelas com dados sensíveis
- [ ] Mapbox token via edge function `get-mapbox-token` (nunca hardcoded)
- [ ] Cache do SW **não** guarda respostas com `Authorization` header em texto puro

## 9. Regressões a verificar

- [ ] Login funciona após instalação (cookies de sessão persistem)
- [ ] OAuth callback `/~oauth` não é interceptado pelo SW (denylist)
- [ ] QR codes públicos `/verificacao/:token` carregam mesmo em modo anónimo
- [ ] POS funciona online (compras, AgroPay, recibos)
- [ ] Mapbox carrega corretamente em todas as páginas com mapa

## 10. Feature Flags Recomendadas (manuais, em `localStorage`)

Abra DevTools → Application → Local Storage e ajuste:

| Chave | Valor | Efeito |
|---|---|---|
| `sigaflo:pwa-install-dismissed` | `0` ou remover | Reativa o banner de instalação |
| `sigaflo:debug-offline` | `"1"` | Força modo offline para testes (se implementado) |
| `sigaflo:sync-verbose` | `"1"` | Logs detalhados de sync no console |

---

## Comandos rápidos

```bash
# Build de produção
npm run build && npm run preview

# Lighthouse PWA
npx lighthouse https://sigaflo.lovable.app \
  --only-categories=pwa,performance \
  --form-factor=mobile \
  --view

# Auditoria de segurança
npm audit --production

# Limpar SW e cache num dispositivo de teste
# DevTools → Application → Storage → Clear site data
```

## Critério de Go/No-Go

**GO para produção:**
- ✅ Todas as secções 1–4 e 8 com 100% dos itens marcados
- ✅ Lighthouse PWA ≥ 90
- ✅ Testado em pelo menos 1 Android e 1 iOS físicos

**NO-GO se:**
- ❌ SW não regista em produção
- ❌ Mutações offline são perdidas
- ❌ Conflitos não são detetados
- ❌ Permissões nativas (câmara) falham silenciosamente
