# Enrica.AI - Gestão Financeira Inteligente

Uma plataforma completa de gestão financeira pessoal com inteligência artificial, desenvolvida com Next.js 14, TypeScript, Prisma e integração com Stripe para pagamentos.

## 🚀 Funcionalidades

### 📊 Dashboard Inteligente
- **Visão geral financeira**: Saldo atual, receitas, despesas e investimentos
- **Gráficos interativos**: Visualização de dados com gráficos de pizza e barras
- **Análise por categorias**: Distribuição de gastos por categoria
- **Filtros por período**: Visualização por mês e ano específicos
- **Últimas transações**: Histórico das movimentações mais recentes

### 💰 Gestão de Transações
- **CRUD completo**: Criar, visualizar, editar e excluir transações
- **Tipos de transação**: Receitas, despesas e investimentos
- **Categorização inteligente**: Múltiplas categorias para organização
- **Métodos de pagamento**: Suporte a diversos meios (cartão, PIX, dinheiro, etc.)
- **Parcelamento**: Controle de transações parceladas (até 42x)
- **Validação robusta**: Validação de dados com Zod

### 🤖 Relatórios com IA
- **Análise inteligente**: Relatórios personalizados gerados por IA (OpenAI GPT-4)
- **Insights financeiros**: Dicas e orientações para melhorar a vida financeira
- **Análise de padrões**: Identificação de tendências de gastos
- **Recomendações personalizadas**: Sugestões baseadas no perfil financeiro

### 💳 Sistema de Assinaturas
- **Plano Gratuito**: Até 10 transações por mês
- **Plano Premium**: Transações ilimitadas + relatórios de IA
- **Integração Stripe**: Pagamentos seguros e recorrentes
- **Webhooks**: Sincronização automática de status de pagamento

### 🔐 Autenticação e Segurança
- **Clerk Authentication**: Sistema robusto de autenticação
- **Proteção de rotas**: Middleware de segurança
- **Validação de dados**: Sanitização e validação em todas as operações
- **Autorização por usuário**: Isolamento completo de dados entre usuários

### 📱 Interface Responsiva
- **Design moderno**: Interface limpa e intuitiva
- **Mobile-first**: Totalmente responsivo para todos os dispositivos
- **Tema escuro**: Interface otimizada para uso noturno
- **Componentes reutilizáveis**: Baseado em shadcn/ui e Radix UI

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização utilitária e responsiva
- **shadcn/ui**: Componentes de interface modernos
- **Radix UI**: Componentes acessíveis e customizáveis
- **Recharts**: Gráficos interativos e responsivos
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas TypeScript-first

### Backend
- **Next.js API Routes**: Endpoints serverless
- **Prisma ORM**: Mapeamento objeto-relacional type-safe
- **PostgreSQL**: Banco de dados relacional robusto
- **Server Actions**: Ações do servidor Next.js 14

### Integrações
- **Clerk**: Autenticação e gerenciamento de usuários
- **Stripe**: Processamento de pagamentos e assinaturas
- **OpenAI GPT-4**: Geração de relatórios inteligentes
- **Webhooks**: Sincronização em tempo real

### Ferramentas de Desenvolvimento
- **ESLint**: Linting de código
- **Prettier**: Formatação automática
- **Husky**: Git hooks para qualidade de código
- **Lint-staged**: Linting em arquivos staged
- **Docker**: Containerização do banco de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- Conta Clerk
- Conta Stripe
- Chave API OpenAI

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/enrica-ai.git
cd enrica-ai
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/enrica-ai"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PLAN_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o banco de dados
```bash
# Inicie o PostgreSQL com Docker
docker-compose up -d

# Execute as migrações
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📁 Estrutura do Projeto

```
enrica-ai/
├── app/                          # App Router do Next.js 14
│   ├── (home)/                   # Grupo de rotas do dashboard
│   │   ├── _actions/             # Server Actions
│   │   ├── _components/          # Componentes específicos
│   │   └── page.tsx              # Página do dashboard
│   ├── _actions/                 # Actions globais
│   ├── _components/              # Componentes reutilizáveis
│   │   └── ui/                   # Componentes de interface
│   ├── _constants/               # Constantes da aplicação
│   ├── _data/                    # Camada de dados
│   ├── _lib/                     # Utilitários e configurações
│   ├── _utils/                   # Funções utilitárias
│   ├── api/                      # API Routes
│   │   └── webhooks/             # Webhooks do Stripe
│   ├── login/                    # Página de login
│   ├── subscription/             # Páginas de assinatura
│   ├── transactions/             # Páginas de transações
│   ├── globals.css               # Estilos globais
│   └── layout.tsx                # Layout raiz
├── prisma/                       # Configuração do Prisma
│   ├── migrations/               # Migrações do banco
│   └── schema.prisma             # Schema do banco
├── public/                       # Arquivos estáticos
└── components.json               # Configuração shadcn/ui
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linting

# Banco de dados
npx prisma studio    # Interface visual do banco
npx prisma migrate   # Executa migrações
npx prisma generate  # Gera cliente Prisma

# Git hooks
npm run prepare      # Configura Husky
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras plataformas
- Railway
- Heroku
- DigitalOcean App Platform

## 🔒 Segurança

- **Autenticação robusta**: Clerk com múltiplos provedores
- **Autorização por usuário**: Isolamento completo de dados
- **Validação de entrada**: Zod em todas as operações
- **Sanitização**: Prevenção contra XSS e SQL injection
- **HTTPS obrigatório**: Comunicação segura
- **Webhooks seguros**: Verificação de assinatura Stripe

## 📊 Monitoramento

- **Error Boundaries**: Captura de erros React
- **Logging estruturado**: Console logs organizados
- **Webhook monitoring**: Logs de eventos Stripe
- **Performance**: Otimizações Next.js 14

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@enrica-ai.com
- **Discord**: [Servidor da comunidade](https://discord.gg/enrica-ai)
- **Documentação**: [docs.enrica-ai.com](https://docs.enrica-ai.com)

## 🎯 Roadmap

- [ ] **Metas financeiras**: Sistema de objetivos e acompanhamento
- [ ] **Categorias customizadas**: Criação de categorias personalizadas
- [ ] **Exportação de dados**: PDF, Excel, CSV
- [ ] **Notificações**: Alertas de gastos e lembretes
- [ ] **API pública**: Endpoints para integrações
- [ ] **App mobile**: React Native
- [ ] **Múltiplas moedas**: Suporte internacional
- [ ] **Análise preditiva**: IA para previsões financeiras

---

Desenvolvido com ❤️ por [Seu Nome](https://github.com/seu-usuario)