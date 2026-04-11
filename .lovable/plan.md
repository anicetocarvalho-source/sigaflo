

# Plano: Relatório de Testes de Limites e Casos Extremos — SIGAFLO

## Objectivo
Gerar um documento PDF com os resultados detalhados da análise estática de todos os formulários do sistema, documentando como a plataforma reage a cada caso extremo.

## Metodologia
Análise estática dos 26 formulários com `zodResolver` e dos componentes de upload, cruzando esquemas Zod, limites em `constants.ts` e mensagens de erro em `errorMessages.ts`.

## Módulos a Documentar (por formulário)

### 1. Autenticação (`AuthPage`)
- Login: email vazio, formato inválido, password < 6 chars
- Registo: passwords não coincidem, nome < 2 chars, full_name obrigatório

### 2. Agricultores (`FarmerForm`)
- name obrigatório (min 3, max 100), farmer_type obrigatório (enum)
- bi_nif max 20, phone max 20, email validado, village max 100, address max 255
- latitude [-90,90], longitude [-180,180], áreas ≥ 0
- Campos familiares: household_members_count ≥ 0, spouse_name max 100

### 3. Produção (`ProductionForm`)
- farmer_id, crop_type, season obrigatórios (min 1)
- year [2000, currentYear+1], area/yield ≥ 0

### 4. Arroz (3 formulários)
- RiceProduction: province, year, season obrigatórios; áreas e produção ≥ 0
- RiceImport: month [1-12], volumes e preços ≥ 0, importer_name min 3
- RicePrice: recorded_date obrigatório, preços ≥ 0

### 5. Ocorrências (2 formulários)
- Climática: title min 5, description min 10, tipo obrigatório; affected_area sem max
- Fitossanitária: province obrigatória, tipo enum [pest, disease]

### 6. Florestal (2 formulários)
- LicenseForm: operator_id obrigatório, license_type enum; latitude/longitude sem limites (gap)
- LogForm: log_code, species obrigatórios, volume ≥ 0.01

### 7. Café (`CoffeeProductionForm`)
- farmer_id obrigatório, áreas > 0.01, harvest_year [2020-2030]

### 8. Incentivos (`ProgramForm`)
- code min 3, name min 5, budget ≥ 0, start_date obrigatória

### 9. Certificados (`certificateFormSchema`)
- farmer_id, type, year, season obrigatórios; crops array min 1

### 10. Utilizadores (`createUserFormSchema`)
- email, password min 6, full_name min 3

### 11. Upload de Ficheiros
- DocumentUpload: max 5MB, formatos JPG/PNG/WEBP/GIF/PDF, validação por extensão + MIME
- PhotoUpload: max 5MB, apenas imagens, validação idêntica

## Casos Extremos Transversais a Documentar

| Caso | Comportamento Esperado |
|------|----------------------|
| Campos obrigatórios em branco | Zod bloqueia submissão, mensagem em PT |
| Caracteres especiais (XSS `<script>`) | React escapa; Supabase parametriza |
| Números negativos | `.min(0)` rejeita com "O valor deve ser positivo" |
| Strings 500+ caracteres | `.max()` bloqueia (100, 255, 500, 2000 conforme campo) |
| Upload .exe/.zip | Rejeitado com toast "Formato não suportado" |
| Upload > 5MB | Rejeitado com toast indicando tamanho |
| SQL injection em campos texto | Parametrização do Supabase SDK impede |

## Problemas Identificados

1. **OccurrenceForm**: `affected_area_ha`, `affected_farmers_count`, `estimated_loss_aoa` — sem `.min(0)`, aceita negativos
2. **LicenseForm**: `latitude`/`longitude` sem limites [-90,90]/[-180,180]
3. **LicenseForm**: `concession_area_ha` sem `.min(0)`, aceita negativos
4. **LogForm**: `length_m`, `diameter_cm` sem `.min(0)`
5. **CoffeeProductionForm**: `altitude_m` sem limites, aceita negativos
6. **ProgramForm (rules)**: `rule_name` min 3 mas sem mensagem customizada em PT — usa default Zod em inglês
7. **SignupSchema**: `full_name` min apenas 2 (vs 3 no padrão centralizado)

## Entregável
Script Node.js gera `/mnt/documents/SIGAFLO_Teste_Limites_Extremos.pdf` com:
- Capa institucional
- Tabela por módulo: campo, regra, caso testado, resultado, severidade
- Secção de problemas encontrados com recomendações
- Resumo executivo

## Ficheiros do Projecto
Nenhum ficheiro será alterado. Apenas leitura + geração de artefacto.
