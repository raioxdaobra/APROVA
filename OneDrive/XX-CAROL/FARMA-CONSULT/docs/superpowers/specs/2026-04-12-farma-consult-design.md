# FARMA-CONSULT — Spec de Design

## Visão Geral

**FARMA-CONSULT** é uma plataforma web SaaS para acompanhamento farmacêutico clínico integrado. Permite que farmacêuticos realizem consultas clínicas, monitorem parâmetros de saúde, gerenciem interações medicamentosas, acompanhem calendário vacinal e gerem planos de cuidado — tudo em um prontuário eletrônico unificado.

### Problema
Farmacêuticos clínicos usam formulários em papel ou planilhas desconectadas para acompanhar pacientes. Não há cruzamento automático de dados, alertas de interações, nem visualização da evolução clínica ao longo do tempo.

### Solução
Sistema web multi-tenant que digitaliza o prontuário farmacêutico (baseado no modelo da Profa. Caroline — arquivo BASE.docx), adiciona inteligência clínica (alertas, gráficos, interações) e gera documentos prontos para impressão.

---

## Decisões Confirmadas

| Decisão | Escolha |
|---------|---------|
| Plataforma | Web responsiva (SaaS multi-tenant) |
| Stack frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Stack backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| Multi-tenancy | Row Level Security (RLS) no PostgreSQL via Supabase |
| OCR | Tesseract.js (client-side, custo zero) |
| Gráficos | Recharts |
| PDF | @react-pdf/renderer |
| Interações medicamentosas | Base JSON local (fontes públicas) |
| Calendário vacinal | Base JSON local (SBIm/PNI) |
| Autenticação | Supabase Auth (email/senha + magic link) |
| Papéis | admin, farmaceutico, estagiario, paciente |
| Orçamento | Custo zero/mínimo (free tiers) |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## Arquitetura

### Estrutura do Projeto

```
farma-consult/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Rotas públicas
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/              # Rotas autenticadas (farm/admin/estagiário)
│   │   │   ├── layout.tsx            # Sidebar + header + alertas
│   │   │   ├── patients/             # Lista e CRUD de pacientes
│   │   │   │   ├── page.tsx          # Lista de pacientes
│   │   │   │   ├── new/page.tsx      # Cadastro
│   │   │   │   └── [id]/            
│   │   │   │       ├── page.tsx      # Prontuário completo (abas)
│   │   │   │       ├── consultations/[consultationId]/page.tsx
│   │   │   │       ├── charts/page.tsx
│   │   │   │       ├── vaccines/page.tsx
│   │   │   │       └── care-plan/page.tsx
│   │   │   ├── alerts/page.tsx       # Painel de alertas
│   │   │   ├── reports/page.tsx      # Relatórios
│   │   │   └── admin/                # Configurações (só admin)
│   │   │       ├── users/page.tsx
│   │   │       ├── organization/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── (portal)/                 # Portal do paciente
│   │       ├── layout.tsx
│   │       ├── my-record/page.tsx    # Meu prontuário (leitura)
│   │       ├── my-vaccines/page.tsx
│   │       └── my-care-plan/page.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── forms/                    # Formulários do prontuário
│   │   ├── charts/                   # Componentes de gráficos
│   │   ├── alerts/                   # Componentes de alertas
│   │   ├── pdf/                      # Templates PDF
│   │   └── ocr/                      # Componentes de OCR
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase browser client
│   │   │   ├── server.ts             # Supabase server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── ocr/
│   │   │   ├── tesseract.ts          # Wrapper Tesseract.js
│   │   │   └── parsers.ts            # Regex parsers para medicamentos/exames
│   │   ├── clinical/
│   │   │   ├── alerts.ts             # Lógica de geração de alertas
│   │   │   ├── interactions.ts       # Busca de interações medicamentosas
│   │   │   ├── morisky.ts            # Cálculo Morisky Green
│   │   │   ├── imc.ts                # Cálculo IMC
│   │   │   └── vaccines.ts           # Lógica vacinal (SBIm/PNI)
│   │   ├── pdf/
│   │   │   └── templates.ts          # Geração de documentos PDF
│   │   └── utils.ts                  # Utilitários gerais
│   ├── hooks/
│   │   ├── use-alerts.ts
│   │   ├── use-patient.ts
│   │   └── use-organization.ts
│   ├── types/
│   │   ├── database.ts               # Types gerados do Supabase
│   │   ├── clinical.ts               # Types clínicos
│   │   └── forms.ts                  # Types de formulários
│   └── data/
│       ├── drug-interactions.json     # Base de interações medicamentosas
│       ├── vaccines-sbim.json         # Calendário SBIm
│       ├── vaccines-pni.json          # Calendário PNI
│       ├── reference-ranges.json      # Valores de referência clínicos
│       └── anamnesis-templates.json   # Templates de anamnese focada
├── supabase/
│   ├── migrations/                    # Migrations SQL
│   │   ├── 001_organizations.sql
│   │   ├── 002_profiles.sql
│   │   ├── 003_patients.sql
│   │   ├── 004_medical_records.sql
│   │   ├── 005_consultations.sql
│   │   ├── 006_medications.sql
│   │   ├── 007_morisky.sql
│   │   ├── 008_care_plans.sql
│   │   ├── 009_vaccines.sql
│   │   ├── 010_alerts.sql
│   │   └── 011_rls_policies.sql
│   └── seed.sql                       # Dados iniciais (interações, vacinas)
├── public/
│   └── images/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── .env.local.example
```

### Multi-Tenancy via RLS

Toda tabela principal possui coluna `organization_id`. Políticas RLS garantem isolamento:

```sql
-- Exemplo: pacientes só visíveis para a organização do usuário
CREATE POLICY "patients_org_isolation" ON patients
  USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);
```

O `organization_id` é armazenado em `auth.users.app_metadata` no momento do registro e propagado via JWT.

### Papéis e Permissões

| Papel | Pacientes | Prontuário | Plano Cuidado | Alertas | Admin | Portal |
|-------|-----------|-----------|---------------|---------|-------|--------|
| **admin** | CRUD | CRUD | CRUD | Ver/Config | ✅ | — |
| **farmaceutico** | CRUD | CRUD | CRUD | Ver | — | — |
| **estagiario** | Ler | Ler/Criar* | Ler/Criar* | Ver | — | — |
| **paciente** | — | Ler (próprio) | Ler (próprio) | — | — | ✅ |

*Estagiário: registros criados ficam com flag `pending_approval = true` até um farmacêutico aprovar.

---

## Módulo 1: Gestão de Pacientes e Prontuário Eletrônico

### Tabelas

**patients**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | RLS |
| full_name | text | NOT NULL |
| date_of_birth | date | NOT NULL |
| address | text | |
| profession | text | |
| education_level | text | Enum: fundamental, medio, superior, pos |
| record_number | text | Nº prontuário externo |
| first_consultation_date | date | |
| created_by | uuid FK | profiles.id |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**medical_records**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| patient_id | uuid FK | |
| organization_id | uuid FK | RLS |
| hmp | text | Histórico médico pregresso |
| lifestyle | text | Alimentação, atividade, etilismo, tabagismo |
| complaints | text | Queixas gerais |
| self_medication_notes | text | Automedicação investigada |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**medications**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| patient_id | uuid FK | |
| organization_id | uuid FK | RLS |
| name | text | Nome do medicamento |
| dosage | text | Ex: "500mg" |
| route | text | Ex: "oral", "IV" |
| frequency | text | Ex: "12/12h" |
| is_self_medication | boolean | Flag automedicação |
| is_active | boolean | Ainda em uso? |
| prescribed_at | date | |
| discontinued_at | date | |
| notes | text | |
| source | text | Enum: manual, ocr |

**consultations**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| patient_id | uuid FK | |
| organization_id | uuid FK | RLS |
| consultation_number | int | 1ª, 2ª, 3ª... |
| date | date | |
| pharmacist_id | uuid FK | profiles.id |
| pending_approval | boolean | Para estagiários |
| notes | text | |

**clinical_parameters**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| consultation_id | uuid FK | |
| organization_id | uuid FK | RLS |
| parameter_name | text | Ex: "pa_systolic", "glucose" |
| parameter_value | decimal | Valor numérico |
| parameter_unit | text | Ex: "mmHg", "mg/dL" |
| is_custom | boolean | Campo flexível adicionado pelo farmacêutico |

**Parâmetros fixos (registrados automaticamente por consulta):**
- `pa_systolic` (mmHg)
- `pa_diastolic` (mmHg)
- `bpm` (bpm)
- `glucose` (mg/dL)
- `weight` (kg)
- `height` (m)
- `imc` (kg/m² — calculado: peso / altura²)

### Morisky Green Adaptada

**morisky_assessments**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| consultation_id | uuid FK | |
| patient_id | uuid FK | |
| organization_id | uuid FK | RLS |
| q1_forgot | boolean | Esqueceu de tomar? |
| q2_careless_time | boolean | Descuidado com horários? |
| q3_felt_better | boolean | Parou por se sentir melhor? |
| q4_felt_worse | boolean | Parou por se sentir pior? |
| q5_informed | boolean | NULL se q1-q4 todos false |
| q6_forgot_refill | boolean | NULL se q1-q4 todos false |
| score | int | 0-4 (calculado automaticamente) |
| adherence_level | text | "baixa" (0-1), "media" (2-3), "alta" (4) |

**Lógica de cálculo:**
```typescript
function calculateMorisky(q1: boolean, q2: boolean, q3: boolean, q4: boolean): {
  score: number;
  level: 'baixa' | 'media' | 'alta';
  showExtraQuestions: boolean;
} {
  // "Não" = 1 ponto, "Sim" = 0 pontos
  const score = [q1, q2, q3, q4].filter(q => q === false).length;
  const level = score <= 1 ? 'baixa' : score <= 3 ? 'media' : 'alta';
  const showExtraQuestions = [q1, q2, q3, q4].some(q => q === true);
  return { score, level, showExtraQuestions };
}
```

### OCR de Prescrições e Exames

**Fluxo:**
1. Farmacêutico clica em "Importar prescrição" ou "Importar exame"
2. Upload de imagem (JPEG/PNG) via input file
3. Imagem é pré-processada no canvas: grayscale + threshold para binarização
4. Tesseract.js processa a imagem e retorna texto bruto
5. Parsers regex extraem:
   - **Prescrições:** nome do medicamento, dosagem, via, frequência
   - **Exames:** nome do exame, valor, unidade
6. Resultados exibidos em tabela editável para revisão
7. Farmacêutico confirma → dados salvos nas respectivas tabelas

**Parsers (exemplos de regex):**
```typescript
// Medicamento: "Losartana 50mg - 1x/dia - Via oral"
const medicationRegex = /([A-Za-zÀ-ú\s]+)\s+(\d+\s*(?:mg|mcg|ml|g|UI))\s*[-–]\s*(\d+x\/dia|\d+\/\d+h)\s*[-–]?\s*(via\s+\w+)?/gi;

// Exame: "Glicemia: 98 mg/dL" ou "HbA1c: 6.5%"
const examRegex = /([A-Za-zÀ-ú\s\d]+):\s*([\d.,]+)\s*(mg\/dL|%|mmol\/L|U\/L|g\/dL)?/gi;
```

---

## Módulo 2: Monitoramento e Gráficos

### Gráficos de Evolução (Recharts)

**Tipos de visualização:**
- Gráfico de linha: evolução de um parâmetro ao longo das consultas
- Gráfico multi-linha: sobreposição de parâmetros (ex: PA sistólica + diastólica)
- Área de referência: faixas normais renderizadas como `<ReferenceArea>` (ex: PA 120/80 como zona verde)
- Tooltip interativo: ao passar o mouse, mostra data da consulta + valor + variação

**Valores de referência (configuráveis via `reference-ranges.json`):**
```json
{
  "pa_systolic": { "min": 90, "max": 120, "alert_high": 140, "critical_high": 180, "unit": "mmHg" },
  "pa_diastolic": { "min": 60, "max": 80, "alert_high": 90, "critical_high": 110, "unit": "mmHg" },
  "glucose": { "min": 70, "max": 99, "alert_high": 126, "critical_high": 200, "unit": "mg/dL" },
  "bpm": { "min": 60, "max": 100, "alert_high": 120, "critical_high": 150, "unit": "bpm" },
  "imc": { "min": 18.5, "max": 24.9, "alert_high": 30, "critical_high": 40, "unit": "kg/m²" }
}
```

### Relatórios

Relatório PDF sumarizado com:
- Dados do paciente + organização
- Tabela de parâmetros por consulta
- Gráficos exportados via `html2canvas` → inseridos no PDF
- Score Morisky da última consulta
- Alertas ativos
- Plano de cuidado vigente

---

## Módulo 3: Alertas Inteligentes

### Tabela

**alerts**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| patient_id | uuid FK | |
| consultation_id | uuid FK | Nullable |
| organization_id | uuid FK | RLS |
| type | text | Enum: parameter, adherence, interaction, effectiveness, safety, custom |
| severity | text | Enum: critical, moderate, info |
| title | text | Ex: "PA elevada" |
| message | text | Ex: "PA sistólica 160mmHg, considerar encaminhamento" |
| suggestion | text | Direcionamento clínico |
| is_dismissed | boolean | Farmacêutico dispensou o alerta |
| dismissed_by | uuid FK | |
| created_at | timestamptz | |

### Gatilhos de Alerta

Alertas são gerados **no momento do salvamento** de dados clínicos via funções TypeScript (não triggers de BD — mantém lógica no frontend para custo zero):

```typescript
// Executa após salvar parâmetros clínicos
async function generateAlerts(consultation: Consultation, params: ClinicalParameter[], medications: Medication[]): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  // 1. Parâmetros fora da faixa
  alerts.push(...checkParameterRanges(params));
  
  // 2. Interações medicamentosas
  alerts.push(...checkDrugInteractions(medications));
  
  // 3. Baixa adesão (se Morisky preenchido)
  alerts.push(...checkAdherence(consultation));
  
  // 4. Efetividade (comparar com consultas anteriores)
  alerts.push(...await checkEffectiveness(consultation, params));
  
  return alerts;
}
```

### Interações Medicamentosas

Base JSON embarcada com estrutura:
```json
{
  "interactions": [
    {
      "drug_a": "omeprazol",
      "drug_b": "clopidogrel",
      "severity": "critical",
      "description": "Omeprazol reduz a eficácia do clopidogrel por inibição do CYP2C19",
      "suggestion": "Considerar substituição por pantoprazol",
      "source": "DrugBank / Anvisa"
    }
  ]
}
```

**Busca:** Normaliza nomes (lowercase, remove acentos) → busca cruzada O(n²) para cada par de medicamentos ativos do paciente. Com base típica de ~500 interações e pacientes com ~5-10 medicamentos, performance é instantânea.

### Exibição de Alertas

- **Durante preenchimento:** Toast/banner no topo do formulário, cor por severidade
- **Painel do paciente:** Sidebar com lista de alertas ativos + histórico
- **Dashboard:** Card com contagem de alertas por severidade na tela inicial

---

## Módulo 4: Calendário Vacinal

### Tabelas

**vaccines**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| patient_id | uuid FK | |
| organization_id | uuid FK | RLS |
| vaccine_name | text | Ex: "Influenza" |
| dose_number | int | 1ª, 2ª, reforço |
| administered_date | date | |
| lot_number | text | |
| administered_by | uuid FK | profiles.id |
| notes | text | |

### Lógica Vacinal

Base JSON com calendário SBIm/PNI:
```json
{
  "vaccines": [
    {
      "name": "Hepatite B",
      "doses": 3,
      "schedule": [
        { "dose": 1, "age_months": 0 },
        { "dose": 2, "age_months": 1 },
        { "dose": 3, "age_months": 6 }
      ],
      "adult_schedule": "3 doses (0, 1, 6 meses) se não vacinado",
      "special_conditions": ["diabetes", "imunossupressao"],
      "contraindications": [],
      "source": "SBIm 2024"
    }
  ]
}
```

**Cálculo:**
1. A partir da DN → calcula idade em anos/meses
2. Cruza com vacinas recomendadas para a faixa etária
3. Subtrai vacinas já administradas (registradas)
4. Cruza com condições especiais do prontuário
5. Resultado: lista de vacinas pendentes com status (⏳ pendente, ⚠️ atrasada)

### Interface

Tabela com colunas:
| Vacina | Doses | Status | Próxima Dose | Ação |
|--------|-------|--------|-------------|------|
| Hepatite B | 2/3 | ⏳ Pendente | 3ª dose | [Registrar] |
| Influenza | 0/1 | ⚠️ Atrasada | Anual | [Registrar] |
| dTpa | 1/1 | ✅ Completa | — | — |

---

## Módulo 5: Anamnese Focada (Problemas Autolimitados)

### Tabela

**focused_anamnesis**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| consultation_id | uuid FK | |
| patient_id | uuid FK | |
| organization_id | uuid FK | RLS |
| condition_type | text | Ex: "cefaleia", "gripe", "diarreia" |
| template_version | text | |
| responses | jsonb | Respostas estruturadas do wizard |
| skipped | boolean | Farmacêutico pulou a anamnese |
| created_at | timestamptz | |

### Templates de Anamnese (JSON)

```json
{
  "cefaleia": {
    "label": "Cefaleia",
    "trigger_keywords": ["dor de cabeça", "cefaleia", "enxaqueca"],
    "questions": [
      { "id": "onset", "text": "Quando começou a dor?", "type": "select", "options": ["Hoje", "Há 1-3 dias", "Há mais de 3 dias", "Recorrente"] },
      { "id": "location", "text": "Localização da dor?", "type": "multiselect", "options": ["Frontal", "Temporal", "Occipital", "Difusa"] },
      { "id": "intensity", "text": "Intensidade (0-10)?", "type": "slider", "min": 0, "max": 10 },
      { "id": "associated", "text": "Sintomas associados?", "type": "multiselect", "options": ["Náusea", "Fotofobia", "Febre", "Rigidez nucal"] },
      { "id": "red_flags", "text": "Sinais de alerta?", "type": "multiselect", "options": ["Pior dor da vida", "Início súbito", "Febre alta", "Alteração visual"] }
    ],
    "red_flag_alert": "Presença de sinais de alerta — considerar encaminhamento urgente"
  }
}
```

### Fluxo

1. Farmacêutico registra queixa no campo de texto livre
2. Sistema detecta keywords → sugere: "Queixa compatível com **cefaleia**. Deseja preencher anamnese focada?"
3. Se aceitar → wizard com perguntas específicas
4. Se recusar → `skipped = true`, fluxo continua normalmente
5. Se red flags detectadas → alerta automático gerado

---

## Módulo 6: Plano de Cuidado

### Tabela

**care_plans**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| consultation_id | uuid FK | |
| patient_id | uuid FK | |
| organization_id | uuid FK | RLS |
| non_pharmacological | jsonb | MEV: array de medidas |
| pharmacological | jsonb | Ajustes de medicação |
| exam_requests | jsonb | Exames solicitados |
| referrals | jsonb | Encaminhamentos |
| home_monitoring | jsonb | PA, glicemia domiciliar |
| glycemic_diary | boolean | Ativar diário glicêmico? |
| return_date | date | Agendamento de retorno |
| notes | text | |
| created_by | uuid FK | |
| approved_by | uuid FK | Null se estagiário pendente |

### Documentos PDF

Templates gerados via `@react-pdf/renderer`:

1. **Orientação MEV** — cabeçalho institucional + medidas não farmacológicas personalizadas + espaço para assinatura
2. **Solicitação de Exames** — lista de exames com justificativa + dados do paciente + carimbo
3. **Encaminhamento** — dados do paciente + motivo + profissional destino
4. **Diário Glicêmico** — tabela em branco para 30 dias (café, almoço, jantar, dormir)
5. **Monitorização Residencial PA** — tabela em branco para registro domiciliar + instruções
6. **Relatório de Acompanhamento** — resumo completo com gráficos

Cada template inclui:
- Logo da organização (configurável)
- Dados do farmacêutico responsável
- Data
- Campos preenchidos automaticamente com dados do paciente
- Espaço para carimbo e assinatura
- Rodapé com identificação da organização

---

## Portal do Paciente

Área restrita onde o paciente (logado) pode:
- **Ver** seu prontuário (somente leitura)
- **Ver** vacinas administradas e pendentes
- **Ver** plano de cuidado ativo
- **Ver** gráficos de evolução dos seus parâmetros
- **NÃO pode** editar nenhum dado

Acesso via convite do farmacêutico (email com magic link do Supabase Auth).

---

## Tabelas de Suporte

**profiles** (extends auth.users do Supabase)
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | Mesmo ID do auth.users |
| organization_id | uuid FK | |
| role | text | Enum: admin, farmaceutico, estagiario, paciente |
| full_name | text | |
| crf_number | text | Registro no CRF (farmacêuticos) |
| patient_id | uuid FK | Nullable — link para patients (se role=paciente) |
| created_at | timestamptz | |

**organizations**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| name | text | Nome da instituição |
| cnpj | text | |
| address | text | |
| phone | text | |
| logo_url | text | URL no Supabase Storage |
| created_at | timestamptz | |

**audit_logs**
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | |
| user_id | uuid FK | Quem realizou a ação |
| action | text | Enum: create, read, update, delete |
| table_name | text | Tabela afetada |
| record_id | uuid | ID do registro afetado |
| old_data | jsonb | Dados antes da alteração |
| new_data | jsonb | Dados após alteração |
| ip_address | text | |
| created_at | timestamptz | |

---

## Segurança e LGPD

- **Autenticação:** Supabase Auth (email/senha, magic link). HTTPS obrigatório.
- **Autorização:** RLS no banco (isolamento por organização) + middleware Next.js (verificação de papel)
- **Criptografia:** Em trânsito (TLS via Vercel/Supabase) + em repouso (Supabase encrypts at rest)
- **LGPD:**
  - Consentimento: paciente deve consentir antes do cadastro (checkbox obrigatório)
  - Acesso: paciente pode visualizar seus dados pelo portal
  - Exclusão: admin pode excluir dados do paciente (soft delete com anonimização)
  - Logs: tabela `audit_logs` registra quem acessou/editou dados de pacientes
- **Auditoria:** Toda operação CRUD em dados de pacientes gera log em `audit_logs`

---

## Fases de Implementação

Embora todos os módulos sejam entregues, a implementação segue ordem de dependência:

### Fase 1 — Fundação (Semana 1-2)
- Setup Next.js + Supabase + Tailwind + shadcn/ui
- Migrations de banco (todas as tabelas)
- RLS policies
- Auth + papéis (admin, farmacêutico, estagiário, paciente)
- Layout base (sidebar, header, routing)

### Fase 2 — Prontuário Core (Semana 3-4)
- CRUD de pacientes
- Prontuário eletrônico (abas: dados, HMP, medicamentos, estilo de vida)
- Morisky Green com cálculo automático
- Consultas + parâmetros clínicos (fixos + flexíveis)
- IMC auto-calculado

### Fase 3 — OCR + Medicamentos (Semana 5)
- Upload de imagens
- Integração Tesseract.js
- Parsers de prescrição e exames
- Interface de revisão/confirmação

### Fase 4 — Gráficos + Relatórios (Semana 5-6)
- Gráficos Recharts por parâmetro
- Linhas de referência
- Comparação multi-parâmetro
- Exportação PDF de relatórios

### Fase 5 — Alertas (Semana 6-7)
- Base de interações medicamentosas (JSON)
- Motor de alertas (parâmetros, adesão, interações, efetividade)
- UI de alertas (toasts, painel, dashboard)
- Configuração de gatilhos pelo admin

### Fase 6 — Vacinas + Anamnese (Semana 7-8)
- Base vacinal SBIm/PNI (JSON)
- Cálculo de vacinas pendentes
- Registro de vacinas
- Templates de anamnese focada
- Detecção de keywords + wizard
- Red flags

### Fase 7 — Plano de Cuidado + PDFs (Semana 8-9)
- Formulário do plano de cuidado
- Templates PDF para cada documento
- Geração e download de PDFs
- Portal do paciente (leitura)

### Fase 8 — Polish + LGPD (Semana 9-10)
- Audit logs
- Consentimento LGPD
- Soft delete + anonimização
- Aprovação de estagiários
- Responsividade mobile
- Testes end-to-end

---

## Verificação / Teste

1. **Setup:** `npm run dev` → acessar localhost:3000 → login funciona
2. **Multi-tenancy:** Criar 2 organizações → dados isolados entre elas
3. **Prontuário:** Cadastrar paciente → preencher todas as abas → dados salvos corretamente
4. **Morisky:** Responder perguntas → score calculado → perguntas extras aparecem condicionalmente
5. **OCR:** Upload de imagem de prescrição → texto extraído → revisão → salvo como medicamento
6. **Gráficos:** Criar 3+ consultas → gráficos mostram evolução correta
7. **Alertas:** Registrar PA > 140 → alerta aparece automaticamente
8. **Interações:** Adicionar Omeprazol + Clopidogrel → alerta de interação
9. **Vacinas:** Paciente adulto sem Hepatite B → sistema sugere vacinação
10. **Anamnese:** Registrar queixa "dor de cabeça" → wizard de cefaleia oferecido
11. **Plano:** Gerar plano → baixar PDF → documento formatado corretamente
12. **Portal paciente:** Login como paciente → vê apenas seus dados (leitura)
13. **Estagiário:** Login como estagiário → registros marcados como pendentes
14. **LGPD:** Excluir paciente → dados anonimizados → audit log gerado
