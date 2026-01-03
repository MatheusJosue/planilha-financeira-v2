# Planilha Financeira - Documentação Completa

## Visão Geral

**Planilha Financeira** é um aplicativo de gerenciamento financeiro pessoal moderno e completo, construído com tecnologias de ponta. O sistema permite controle total das finanças através de um dashboard responsivo, gestão de transações, automação de transações recorrentes e análises avançadas com visualização de dados.

---

## Stack Tecnológico

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **UI/Estilização** | React Bootstrap 2.10, Tailwind CSS 4, React Icons 5.5 |
| **Gráficos** | Recharts 3.4, date-fns 4.1 |
| **Estado** | Zustand 5.0 |
| **Backend/DB** | Supabase 2.83 (PostgreSQL com RLS) |
| **Autenticação** | Supabase Auth |
| **PDF** | jsPDF 3.0, jspdf-autotable 5.0, @react-pdf/renderer 4.3 |
| **Interação** | @dnd-kit (drag-and-drop), SweetAlert2 11.26 |
| **Dev Tools** | ESLint 9, Babel Plugin React Compiler |

---

## Estrutura do Projeto

```
planilha-financeira/
├── app/                          # Páginas Next.js (App Router)
│   ├── auth/callback/            # OAuth callback (Supabase auth)
│   ├── configuracoes/            # Página de configurações
│   ├── login/                    # Login e autenticação
│   ├── transacoes/               # Gestão de transações
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Dashboard principal
│
├── components/                   # Componentes React (33 componentes)
│   ├── Charts/                   # Componentes de visualização
│   │   ├── BalanceOverTimeChart.tsx
│   │   ├── ExpensesByCategoryChart.tsx
│   │   ├── FutureProjectionChart.tsx
│   │   ├── IncomeVsExpenseChart.tsx
│   │   └── RecurringVsVariableChart.tsx
│   ├── ui/                       # Elementos de formulário reutilizáveis
│   │   ├── CurrencyInput.tsx
│   │   ├── DateInput.tsx
│   │   ├── FormField.tsx
│   │   └── SelectField.tsx
│   ├── CategoryPicker.tsx
│   ├── Charts.tsx
│   ├── ConfirmRecurringModal.tsx
│   ├── DashboardSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── FinancialReportPDF.tsx
│   ├── FinancialStats.tsx
│   ├── FloatingAddButton.tsx
│   ├── GradientCard.tsx
│   ├── LoadingScreen.tsx
│   ├── MonthSelector.tsx
│   ├── Navigation.tsx
│   ├── PageLayout.tsx
│   ├── PeriodSeparationSettings.tsx
│   ├── PreviousMonthTransactionList.tsx
│   ├── RecurringTransactionForm.tsx
│   ├── StoreInitializer.tsx
│   ├── SummaryCard.tsx
│   ├── SummaryCards.tsx
│   ├── ThemeProvider.tsx
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   └── UserSettingsProvider.tsx
│
├── store/                        # Gerenciamento de estado (Zustand)
│   └── financeStore.ts           # Store principal (1248 linhas)
│
├── types/                        # Definições de tipos TypeScript
│   └── index.ts
│
├── lib/                          # Utilitários e bibliotecas
│   ├── supabase-client.ts        # Cliente Supabase (browser)
│   ├── supabase-server.ts        # Cliente Supabase (server)
│   ├── supabase.ts               # Configuração base
│   └── sweetalert.ts             # Utilitários de alertas
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts                # Hook de autenticação
│   ├── useLocalStorage.ts        # Persistência local
│   └── useTheme.ts               # Gerenciamento de tema
│
├── utils/                        # Funções utilitárias
│   ├── dashboardConfigHelper.ts
│   ├── formatCurrency.ts
│   └── formatDate.ts
│
├── supabase/migrations/          # Migrações do banco de dados
├── styles/globals.css            # Estilos globais
├── middleware.ts                 # Middleware de autenticação
└── public/                       # Assets estáticos
```

---

## Modelos de Dados (Database Schema)

### 1. transactions
Armazena todas as transações financeiras do usuário.

```typescript
{
  id: string                    // UUID, chave primária
  user_id: string               // FK para auth.users
  description: string           // Descrição da transação
  type: 'income' | 'expense'    // Tipo: receita ou despesa
  category: string              // Categoria
  value: number                 // Valor em moeda
  date: string                  // Data (YYYY-MM-DD)
  month: string                 // Mês para indexação (YYYY-MM)
  recurring_id?: string         // Link para recurring_transactions
  is_paid?: boolean             // Status de pagamento
  current_installment?: number  // Parcela atual
  total_installments?: number   // Total de parcelas
}
```

### 2. recurring_transactions
Define regras para transações recorrentes.

```typescript
{
  id: string                    // UUID, chave primária
  user_id: string               // FK para auth.users
  description: string           // Descrição
  type: 'income' | 'expense'    // Tipo
  category: string              // Categoria
  value: number                 // Valor
  recurrence_type: 'fixed' | 'installment' | 'variable' | 'variable_by_income'
  start_date: string            // Data de início
  end_date?: string             // Data de fim (opcional)
  day_of_month: number          // Dia do mês (1-31)
  total_installments?: number   // Total de parcelas
  current_installment?: number  // Parcela atual
  is_active: boolean            // Status ativo
  selected_income_id?: string   // Para tipo variable_by_income
  created_at: string            // Timestamp de criação
}
```

### 3. categories
Categorias personalizadas do usuário.

```typescript
{
  id?: string                   // UUID
  name: string                  // Nome único por usuário
  user_id: string               // FK para auth.users
  max_percentage?: number       // Limite em percentual
  max_value?: number            // Limite em valor absoluto
  created_at?: string           // Timestamp
}
```

### 4. user_settings
Configurações personalizadas do usuário.

```typescript
{
  user_id: string               // Chave primária
  period_separation_enabled: boolean
  period_1_end: number          // Dia de fim do período 1
  period_2_start: number        // Dia de início do período 2
  dashboard_config: {
    balance: boolean
    monthlyIncome: boolean
    monthlyExpense: boolean
    periodCards: boolean
    charts: boolean
    recentTransactions: boolean
    expensesByCategory: boolean
    incomeVsExpense: boolean
    recurringVsVariable: boolean
    futureProjection: boolean
    financialStats: boolean
  }
}
```

### 5. hidden_categories
Categorias padrão ocultadas pelo usuário.

```typescript
{
  category_name: string
  user_id: string
}
```

---

## Funcionalidades Principais

### 1. Gestão de Transações

- **Adicionar, editar e excluir** receitas e despesas
- **Categorização** com 14 categorias padrão + personalizadas
- **Marcar como pago/não pago**
- **Reordenação via drag-and-drop** na lista de transações
- **Busca e filtro** de transações
- **Duplicação** de transações para entrada rápida

### 2. Transações Recorrentes

O sistema suporta 4 tipos de recorrência:

| Tipo | Descrição |
|------|-----------|
| **Fixa** | Mesmo valor todo mês |
| **Parcelada** | Valor fixo dividido em X parcelas |
| **Variável** | Valor muda mensalmente |
| **Variável por Renda** | Baseada em % da renda mensal |

**Funcionalidades:**
- Geração automática de previsões para os próximos 12 meses
- Confirmação manual de previsões para torná-las transações reais
- Edição ou desativação de regras recorrentes
- Intervalo de datas (início e fim opcional)
- Rastreamento de parcelas (atual/total)

### 3. Dashboard Financeiro

**Visualizações disponíveis:**
- Cartões de resumo (saldo, receitas, despesas)
- Gráfico de pizza: Despesas por categoria
- Gráfico de barras: Receitas vs Despesas (histórico de 3 meses)
- Gráfico de pizza: Despesas fixas vs variáveis
- Gráfico de linha: Projeção futura do saldo
- Estatísticas financeiras (maior receita/despesa, médias, top categoria)

**Configuração:**
- Mostrar/ocultar gráficos individuais
- Mostrar/ocultar cartões de resumo
- Configuração persistida nas preferências do usuário

### 4. Navegação por Mês

- Navegar entre diferentes meses
- Criar novos meses com opção de copiar transações do mês anterior
- Rastrear meses vazios
- Visualizar dados históricos
- Troca de meses sem perda de contexto

### 5. Sistema de Categorias

**Categorias padrão (14):**
- 🍔 Alimentação
- 🚗 Transporte
- 🏠 Moradia
- ⚡ Utilidades
- 🎬 Entretenimento
- 🏥 Saúde
- 📚 Educação
- 👔 Vestuário
- 💰 Investimentos
- 💳 Cartão de Crédito
- 🎁 Presentes
- ✈️ Viagens
- 💼 Trabalho
- 📦 Outros

**Funcionalidades:**
- Criar categorias personalizadas
- Ocultar categorias padrão
- Definir limites de gastos por categoria (% ou valor absoluto)
- Relatórios baseados em categoria

### 6. Separação por Período

- Dividir o mês em 2 períodos (ex: dias 1-15 e 16-31)
- Limites de período configuráveis
- Cartões de resumo separados por período
- Ideal para orçamento baseado em data de pagamento

### 7. Import/Export de Dados

- Exportar dados para formato JSON
- Importar transações e categorias de JSON
- Funcionalidade de importação em massa

### 8. Autenticação

- Integração com Supabase Auth
- Registro e login com email/senha
- Recuperação de senha
- Gerenciamento de sessão com middleware
- Login persistente entre sessões

### 9. Relatórios PDF

- Gerar relatórios financeiros em PDF
- Conteúdo do relatório personalizável
- Usa jsPDF e @react-pdf/renderer

### 10. Suporte a Temas

- Tema claro e escuro
- Preferência de tema persistente
- Gerenciamento de tema via contexto

---

## Gerenciamento de Estado (Zustand Store)

O arquivo `store/financeStore.ts` (1248 linhas) é o coração do gerenciamento de estado.

### Propriedades do Estado

```typescript
interface FinanceStore {
  transactions: Transaction[]
  categories: string[]
  categoryLimits: Record<string, { maxPercentage?: number; maxValue?: number }>
  hiddenDefaultCategories: string[]
  isLoaded: boolean
  currentMonth: string
  monthsData: Record<string, MonthData>
  recurringTransactions: RecurringTransaction[]
  excludedPredictedIds: string[]
  showMonthPicker: boolean
}
```

### Principais Ações

| Método | Descrição |
|--------|-----------|
| `loadFromSupabase()` | Carrega transações do banco de dados |
| `setCurrentMonth()` | Muda para um mês diferente |
| `createNewMonth()` | Cria novo mês, opcionalmente copiando do anterior |
| `addTransaction()` | Adiciona nova transação |
| `updateTransaction()` | Atualiza transação existente |
| `deleteTransaction()` | Exclui ou oculta transação prevista |
| `convertPredictedToReal()` | Converte transação prevista em real |
| `addRecurringTransaction()` | Cria regra de transação recorrente |
| `generatePredictedTransactions()` | Gera transações previstas para 12 meses |
| `addCategory()` | Cria categoria personalizada |
| `importData()` | Importa transações e categorias em massa |
| `clearAllData()` | Reseta todos os dados do usuário |

---

## Componentes de Interface

### Páginas

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/` | Visão geral financeira com gráficos e resumos |
| Transações | `/transacoes` | CRUD de transações e gestão de recorrências |
| Configurações | `/configuracoes` | Categorias, períodos e preferências |
| Login | `/login` | Autenticação de usuários |

### Componentes de Gráficos

- **ExpensesByCategoryChart** - Pizza de despesas por categoria
- **IncomeVsExpenseChart** - Barras comparando receitas vs despesas
- **RecurringVsVariableChart** - Pizza de despesas fixas vs variáveis
- **FutureProjectionChart** - Linha projetando saldo futuro
- **BalanceOverTimeChart** - Histórico de saldo

### Componentes de Formulário

- **TransactionForm** - Adicionar/editar transações
- **RecurringTransactionForm** - Configurar transações recorrentes
- **ConfirmRecurringModal** - Converter previsão em transação real
- **CategoryPicker** - Seleção de categoria com autocomplete

### Componentes de Layout

- **Navigation** - Navbar superior com toggle de tema
- **MonthSelector** - Navegação e criação de meses
- **PageLayout** - Wrapper padrão de página
- **FloatingAddButton** - Botão de ação flutuante (FAB)

---

## Fluxo de Dados

```
┌─────────────────┐
│  Input Usuário  │
│  (Componente)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TransactionForm │
│ ou outro Form   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Zustand Store  │
│    Actions      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Client │
│ (insert/update) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│  (com RLS)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dados Retornados│
│   ao Store      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ React Re-render │
│   Componentes   │
└─────────────────┘
```

---

## Funções Utilitárias

### Formatação de Moeda (`utils/formatCurrency.ts`)

```typescript
formatCurrency(value)       // Formata número como BRL
parseCurrency(value)        // Parse de string de moeda
formatCurrencyInput(value)  // Formata para exibição em inputs
```

### Formatação de Data (`utils/formatDate.ts`)

```typescript
getTodayISO()              // Data de hoje em formato ISO
formatMonth()              // Formata mês para exibição
formatDate()               // Formata data com opções
calculateNextMonth()       // Calcula próximo/anterior mês
```

### Alertas (`lib/sweetalert.ts`)

```typescript
showSuccess()      // Alerta de sucesso
showError()        // Alerta de erro
showWarning()      // Alerta de aviso
showConfirm()      // Diálogo de confirmação
showSuccessToast() // Toast de sucesso
showErrorToast()   // Toast de erro
```

---

## Segurança

- **Row-Level Security (RLS)** no Supabase - todas as tabelas filtram por user_id
- **Middleware de Autenticação** - valida tokens em todas as rotas protegidas
- **Variáveis de Ambiente** - URL e chaves do Supabase em .env
- **Persistência de Sessão** - gerenciamento seguro via Supabase
- **Recuperação de Senha** - integrado via Supabase Auth

---

## Custom Hooks

### useAuth
Gerencia estado de autenticação.
```typescript
const { user, loading, signOut } = useAuth()
```

### useTheme
Gerencia preferência de tema.
```typescript
const { theme, toggleTheme } = useTheme()
```

### useLocalStorage
Hook genérico para localStorage.
```typescript
const [value, setValue] = useLocalStorage('key', defaultValue)
```

---

## Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| Componentes React | 33 |
| Páginas/Rotas | 4 |
| Custom Hooks | 3 |
| Componentes de Gráfico | 5 |
| Linhas no Store Principal | 1248 |
| Migrações de DB | 3 |

---

## Commits Recentes

```
44ade1e - ajustes
f7d5928 - fix listagem de despesas
5a29fa8 - feat: implement dynamic month loading based on user settings
453f4dd - feat: add recurring transaction options with dynamic fields
97a4896 - feat: enhance recurring transactions section
```

---

## Conclusão

**Planilha Financeira** é uma aplicação bem arquitetada que demonstra:

1. **Frontend Moderno** - Next.js 16, React 19, TypeScript
2. **Gerenciamento de Estado Limpo** - Zustand com persistência
3. **Backend Robusto** - Supabase com PostgreSQL e RLS
4. **Visualizações Ricas** - Múltiplas implementações com Recharts
5. **Recursos Avançados** - Transações recorrentes, previsões, separação por período
6. **Boa UX** - Design responsivo, drag-drop, animações suaves
7. **Localização** - Locale pt-BR em todo o sistema

O código demonstra práticas profissionais incluindo type safety, composição de componentes, otimização de performance e separação de responsabilidades.
