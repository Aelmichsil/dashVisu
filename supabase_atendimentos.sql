-- ============================================================
-- Dashboard de Atendimentos — Schema Supabase
-- Revisado: colunas faltantes adicionadas, índices de performance,
-- policy de UPDATE incluída.
-- ============================================================

-- Necessaria para gerar UUID automaticamente em novos registros.
create extension if not exists pgcrypto;

-- Tabela principal consumida pelo dashboard para registros manuais e importados.
create table if not exists public.dashboard_atendimentos (
    id               uuid        primary key default gen_random_uuid(),
    mes              text        not null,
    quantidade       numeric     not null default 0,
    usuario_abertura text,
    usuario          text,
    resolucao        text,
    tipo_atendimento text,
    data_abertura    text,
    data_fechamento  text,
    motivo_fechamento text,
    -- Colunas que estavam no código JS mas faltavam no schema:
    cidade           text,
    bairro           text,
    numero_plano     text,
    nome_cliente     text,
    codigo_cliente   text,
    usuario_fechamento text,
    tipo_registro    text        not null check (tipo_registro in ('manual', 'importado')),
    created_at       timestamptz not null default now()
);

-- Garante que colunas novas existam mesmo em instalações anteriores.
alter table public.dashboard_atendimentos add column if not exists tipo_atendimento   text;
alter table public.dashboard_atendimentos add column if not exists data_abertura       text;
alter table public.dashboard_atendimentos add column if not exists data_fechamento     text;
alter table public.dashboard_atendimentos add column if not exists motivo_fechamento   text;
alter table public.dashboard_atendimentos add column if not exists cidade              text;
alter table public.dashboard_atendimentos add column if not exists bairro              text;
alter table public.dashboard_atendimentos add column if not exists numero_plano        text;
alter table public.dashboard_atendimentos add column if not exists nome_cliente        text;
alter table public.dashboard_atendimentos add column if not exists codigo_cliente      text;
alter table public.dashboard_atendimentos add column if not exists usuario_fechamento  text;

-- ============================================================
-- Índices para melhorar performance nas queries mais comuns
-- ============================================================

-- Filtragem por tipo (manual x importado) — usada em todas as sincronizações
create index if not exists idx_dashboard_tipo_registro
    on public.dashboard_atendimentos (tipo_registro);

-- Ordenação por data de criação — usada no carregamento inicial
create index if not exists idx_dashboard_created_at
    on public.dashboard_atendimentos (created_at);

-- Filtragem por mês — usada nos filtros do dashboard
create index if not exists idx_dashboard_mes
    on public.dashboard_atendimentos (mes);

-- Filtragem por cidade
create index if not exists idx_dashboard_cidade
    on public.dashboard_atendimentos (cidade);

-- ============================================================
-- Row Level Security
-- As policies abaixo estao abertas (using/check true) para facilitar uso interno.
-- Em ambiente externo/publico, restrinja por usuario/autenticacao.
-- ============================================================

alter table public.dashboard_atendimentos enable row level security;

-- SELECT: qualquer um pode ler
drop policy if exists "dashboard_atendimentos_select_all" on public.dashboard_atendimentos;
create policy "dashboard_atendimentos_select_all"
    on public.dashboard_atendimentos
    for select
    using (true);

-- INSERT: qualquer um pode inserir
drop policy if exists "dashboard_atendimentos_insert_all" on public.dashboard_atendimentos;
create policy "dashboard_atendimentos_insert_all"
    on public.dashboard_atendimentos
    for insert
    with check (true);

-- UPDATE: qualquer um pode atualizar (necessário para upsert futuro)
drop policy if exists "dashboard_atendimentos_update_all" on public.dashboard_atendimentos;
create policy "dashboard_atendimentos_update_all"
    on public.dashboard_atendimentos
    for update
    using (true)
    with check (true);

-- DELETE: qualquer um pode deletar
drop policy if exists "dashboard_atendimentos_delete_all" on public.dashboard_atendimentos;
create policy "dashboard_atendimentos_delete_all"
    on public.dashboard_atendimentos
    for delete
    using (true);
