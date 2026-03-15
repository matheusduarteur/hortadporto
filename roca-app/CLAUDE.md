# Roça App – Instruções para o Claude Code

Você está trabalhando em um projeto chamado **Roça App**, um sistema simples de gestão rural.

## Visão geral

O objetivo do Roça App é permitir que um pequeno produtor rural registre:

- Produção: ovos (galinhas), leite (vacas), tilápia (piscicultura), horta
- Vendas: feira, clientes, produtos
- Despesas: custos gerais, ração, insumos, etc.
- Resultado financeiro básico: receita – despesas

O foco é **simplicidade** e **uso no dia a dia**, com telas bem claras e funcionais.

## Tecnologias principais

- **Next.js** com App Router
- **TypeScript** obrigatório
- **Tailwind CSS** para estilos
- **Supabase** como banco de dados (PostgreSQL)

Já existe um cliente Supabase pronto em:

- `lib/supabaseClient.ts`

Use sempre esse cliente. **Não recrie a conexão**.

As variáveis de ambiente estão em `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Esquema de banco de dados (Supabase)

As tabelas abaixo já existem e não devem ser alteradas estruturalmente:

### 1. Galinhas / Ovos — `egg_records`

Campos:

- `id` (uuid, PK)
- `created_at` (timestamp)
- `date` (date, not null)
- `coop_name` (text)
- `quantity` (integer, not null)
- `feed_kg` (numeric)
- `feed_cost` (numeric)
- `notes` (text)

### 2. Vacas / Leite — `milk_records`

- `id` (uuid, PK)
- `created_at` (timestamp)
- `date` (date, not null)
- `animal_name` (text)
- `liters` (numeric, not null)
- `feed_kg` (numeric)
- `feed_cost` (numeric)
- `extra_cost` (numeric)
- `notes` (text)

### 3. Tilápia — `fish_records`

- `id` (uuid, PK)
- `created_at` (timestamp)
- `date` (date, not null)
- `tank_name` (text)
- `feed_kg` (numeric)
- `feed_cost` (numeric)
- `mortality` (integer)
- `notes` (text)

### 4. Horta — `garden_records`

- `id` (uuid, PK)
- `created_at` (timestamp)
- `date` (date, not null)
- `bed_name` (text)
- `culture` (text)
- `input_used` (text)
- `input_cost` (numeric)
- `harvest_kg` (numeric)
- `notes` (text)

### 5. Vendas — `sales`

- `id` (uuid, PK)
- `created_at` (timestamp)
- `date` (date, not null)
- `product` (text, not null)
- `quantity` (numeric, not null)
- `unit` (text)
- `unit_price` (numeric, not null)
- `total` (numeric, gerado como `quantity * unit_price`)
- `customer` (text)
- `notes` (text)

### 6. Despesas — `expenses`

- `id` (uuid, PK)
- `created_at` (timestamp)
- `date` (date, not null)
- `category` (text)
- `description` (text)
- `amount` (numeric, not null)
- `related_to` (text)
- `notes` (text)

**IMPORTANTE:**  
Não mude o schema dessas tabelas pelo código sem necessidade. Use-as como estão.

## Estrutura de rotas desejada

Criar/usar páginas em:

- `/` – Dashboard
- `/galinhas` – Registros de ovos
- `/vacas` – Registros de leite
- `/tilapia` – Registros de piscicultura
- `/horta` – Registros de horta
- `/vendas` – Vendas / feira
- `/despesas` – Despesas gerais
- `/relatorios` – Resumo financeiro

## Comportamento desejado das páginas

### Dashboard (`/`)

- Mostrar resumo do **mês atual**:
  - total de ovos (somar `quantity` em `egg_records`)
  - total de litros de leite (somar `liters` em `milk_records`)
  - total de vendas (somar `total` em `sales`)
  - total de despesas (somar `amount` em `expenses`)
  - resultado: receita – despesas

### Páginas de cadastro/listagem

Para cada módulo (`/galinhas`, `/vacas`, `/tilapia`, `/horta`, `/vendas`, `/despesas`):

- Ter um formulário de cadastro simple e funcional.
- Salvar dados diretamente nas tabelas correspondentes.
- Listar registros recentes em uma tabela, com opção de excluir.
- Validar minimamente campos obrigatórios.
- Interfaces simples, sem over‑engineering.

### Relatórios (`/relatorios`)

- Resumo de receita, despesas e resultado por período (começar com mês atual).
- Opcional: agrupar despesas por categoria.

## Estilo e UX

- Tema com **cores terrosas** (verde escuro, marrom, bege).
- Interface limpa, voltada para uso cotidiano, inclusive em celular (responsivo).
- Não precisa de gráficos complexos inicialmente; prioridade é clareza dos números.

## Padrões de código

- Sempre usar TypeScript.
- Usar Tailwind para estilização.
- Separar componentes reutilizáveis quando fizer sentido.
- Tratar erros de Supabase com mensagens simples para o usuário e logs no console.
- Código organizado, fácil de entender, porque o projeto será evoluído depois.
