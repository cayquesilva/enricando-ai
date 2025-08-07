# Enrica.AI - Gestão Financeira Inteligente

Uma plataforma completa de gestão financeira pessoal com inteligência artificial, desenvolvida com Next.js 14, TypeScript, Prisma e autenticação local.

## 🚀 Funcionalidades

### 🔐 Sistema de Autenticação Local
- **Registro e Login**: Sistema completo de autenticação com email/senha
- **Segurança**: Senhas criptografadas com bcrypt e JWT para sessões
- **Controle de Acesso**: Sistema de roles (usuário comum, premium, admin)
- **Sessões Seguras**: Cookies httpOnly com expiração automática

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
- **Exclusivo Premium**: Funcionalidade disponível apenas para usuários premium

### 👑 Sistema de Planos
- **Plano Gratuito**: Até 10 transações por mês
- **Plano Premium**: Transações ilimitadas + relatórios de IA
- **Controle Manual**: Administradores podem ativar/desativar planos premium
- **Sem Pagamentos**: Sistema simplificado sem integração de pagamento

### 🛡️ Painel Administrativo
- **Gestão de Usuários**: Visualizar todos os usuários cadastrados
- **Controle de Planos**: Ativar/desativar planos premium manualmente
- **Privilégios Admin**: Conceder/remover privilégios administrativos
- **Estatísticas**: Dashboard com métricas gerais do sistema
- **Segurança**: Acesso restrito apenas a administradores

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

### Autenticação e Segurança
- **JWT**: Tokens seguros para autenticação
- **bcryptjs**: Criptografia de senhas
- **Cookies httpOnly**: Armazenamento seguro de sessões
- **Middleware**: Proteção de rotas automática

### Integrações
- **OpenAI GPT-4**: Geração de relatórios inteligentes

### Ferramentas de Desenvolvimento
- **ESLint**: Linting de código
- **Prettier**: Formatação automática
- **Husky**: Git hooks para qualidade de código
- **Lint-staged**: Linting em arquivos staged
- **Docker**: Containerização do banco de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- Chave API OpenAI (para relatórios IA)

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

# JWT Secret (use uma chave forte em produção)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

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

### 5. Crie o primeiro usuário administrador
```bash
# Acesse o Prisma Studio
npx prisma studio

# Ou use o seed script (se disponível)
npx prisma db seed
```

### 6. Inicie o servidor de desenvolvimento
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
│   │   └── auth/                 # Actions de autenticação
│   ├── _components/              # Componentes reutilizáveis
│   │   └── ui/                   # Componentes de interface
│   ├── _constants/               # Constantes da aplicação
│   ├── _data/                    # Camada de dados
│   ├── _lib/                     # Utilitários e configurações
│   ├── _utils/                   # Funções utilitárias
│   ├── admin/                    # Painel administrativo
│   ├── api/                      # API Routes (se necessário)
│   ├── login/                    # Página de login/registro
│   ├── subscription/             # Páginas de assinatura
│   ├── transactions/             # Páginas de transações
│   ├── globals.css               # Estilos globais
│   └── layout.tsx                # Layout raiz
├── prisma/                       # Configuração do Prisma
│   ├── migrations/               # Migrações do banco
│   └── schema.prisma             # Schema do banco
├── public/                       # Arquivos estáticos
├── middleware.ts                 # Middleware de autenticação
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

## 👤 Primeiro Acesso

### Criando o Primeiro Administrador

1. **Registre-se normalmente** através da interface de login
2. **Acesse o banco de dados** via Prisma Studio:
   ```bash
   npx prisma studio
   ```
3. **Edite seu usuário** na tabela `users`:
   - Marque `isAdmin` como `true`
   - Marque `isPremium` como `true` (opcional)
4. **Faça logout e login novamente** para aplicar as mudanças

### Gerenciando Usuários

Como administrador, você pode:
- Acessar `/admin` para ver o painel administrativo
- Ativar/desativar planos premium de qualquer usuário
- Conceder/remover privilégios administrativos
- Visualizar estatísticas gerais do sistema

## 🔒 Segurança

### Autenticação
- **Senhas criptografadas** com bcrypt (salt rounds: 12)
- **JWT tokens** com expiração de 7 dias
- **Cookies httpOnly** para prevenir XSS
- **Middleware automático** para proteção de rotas

### Autorização
- **Isolamento de dados** por usuário
- **Verificação de propriedade** em todas as operações
- **Controle de acesso** baseado em roles
- **Validação robusta** com Zod

### Boas Práticas
- **Sanitização de entrada** em todos os endpoints
- **Rate limiting** (recomendado para produção)
- **HTTPS obrigatório** em produção
- **Logs de segurança** para auditoria

## 📊 Funcionalidades por Plano

### Plano Gratuito
- ✅ Até 10 transações por mês
- ✅ Dashboard básico
- ✅ Gráficos e relatórios visuais
- ✅ Categorização de transações
- ❌ Relatórios de IA

### Plano Premium
- ✅ Transações ilimitadas
- ✅ Todas as funcionalidades do plano gratuito
- ✅ Relatórios de IA personalizados
- ✅ Insights financeiros avançados
- ✅ Análise preditiva

### Administrador
- ✅ Todas as funcionalidades premium
- ✅ Painel administrativo
- ✅ Gestão de usuários
- ✅ Controle de planos
- ✅ Estatísticas do sistema

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Configure o banco PostgreSQL (Supabase, Railway, etc.)
4. Deploy automático a cada push

### Outras plataformas
- Railway
- Heroku
- DigitalOcean App Platform

### Configurações de Produção
```env
# Use uma chave JWT forte
JWT_SECRET="sua-chave-super-secreta-de-producao"

# Configure HTTPS
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Configure banco de produção
DATABASE_URL="postgresql://..."
```

## 📈 Monitoramento

### Logs de Sistema
- **Autenticação**: Login/logout de usuários
- **Transações**: Criação/edição/exclusão
- **Erros**: Captura automática de exceções
- **Performance**: Métricas de resposta

### Métricas Importantes
- Número total de usuários
- Usuários ativos mensalmente
- Transações por usuário
- Uso de relatórios IA
- Taxa de conversão para premium

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] **Sistema de notificações**: Alertas de gastos e lembretes
- [ ] **Metas financeiras**: Sistema de objetivos e acompanhamento
- [ ] **Categorias customizadas**: Criação de categorias personalizadas
- [ ] **Exportação de dados**: PDF, Excel, CSV
- [ ] **API pública**: Endpoints para integrações
- [ ] **App mobile**: React Native
- [ ] **Múltiplas moedas**: Suporte internacional
- [ ] **Análise preditiva**: IA para previsões financeiras

### Melhorias Técnicas
- [ ] **Rate limiting**: Proteção contra spam
- [ ] **Cache Redis**: Otimização de performance
- [ ] **Testes automatizados**: Cobertura completa
- [ ] **CI/CD**: Pipeline automatizado
- [ ] **Monitoring**: Observabilidade completa

## 📞 Suporte

- **Email**: suporte@enrica-ai.com
- **GitHub Issues**: [Reportar problemas](https://github.com/seu-usuario/enrica-ai/issues)
- **Documentação**: [Wiki do projeto](https://github.com/seu-usuario/enrica-ai/wiki)

---

Desenvolvido com ❤️ por [Seu Nome](https://github.com/seu-usuario)