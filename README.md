# 💰 Planilha Financeira

> Aplicativo de controle financeiro pessoal com dashboard, transações recorrentes automáticas e relatórios em PDF.

🔗 **Demo:** https://planilha-v2.vercel.app

## ✨ Funcionalidades

- **Dashboard** com saldo, receitas e despesas em tempo real
- **Gestão de transações** com categorias
- **Transações recorrentes** geradas automaticamente
- **5 gráficos de análise:** saldo ao longo do tempo, despesas por categoria, receitas x despesas, recorrentes x variáveis e projeção futura
- **Exportação para PDF** com tabelas
- **Login** com Supabase Auth e dados isolados por usuário via Row Level Security (RLS)

## 🛠️ Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | Next.js · React · TypeScript |
| Estado | Zustand |
| UI | React Bootstrap · Tailwind CSS · React Icons · SweetAlert2 |
| Gráficos | Recharts · date-fns |
| Back-end / Banco | Supabase (PostgreSQL com RLS) |
| PDF | jsPDF · jspdf-autotable |

## 🧠 Decisões técnicas

- **Zustand** para o estado global, por ser mais leve e com menos código repetitivo que Redux.
- **RLS no PostgreSQL** para garantir no próprio banco que cada usuário só acessa os próprios dados.
- **App Router do Next.js** com middleware de autenticação protegendo as rotas.

## ▶️ Como rodar

```bash
npm install
npm run dev
```

Crie um `.env.local` com as chaves do seu projeto Supabase (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

Desenvolvido por [Matheus Cerqueira](https://www.linkedin.com/in/matheusxaviercerqueira/)
