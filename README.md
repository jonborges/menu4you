# 🍽️ MenuQ - Sistema de Cardápio Digital 
LINK DO SITE(ON): https://menu4you-murex.vercel.app/

Sistema completo de cardápio digital para restaurantes com QR Code, pedidos online e gerenciamento de mesas.

## 📋 Sobre o Projeto

MenuQ é uma plataforma web que permite restaurantes criarem cardápios digitais acessíveis via QR Code. Clientes podem escanear o código na mesa, visualizar o cardápio com fotos, fazer pedidos e o restaurante recebe tudo em tempo real no dashboard.

### ✨ Funcionalidades Principais

- 🏪 **Gestão de Restaurantes**: Cadastro completo com capa personalizável
- 📱 **QR Codes por Mesa**: Gere códigos únicos para cada mesa do restaurante
- 🍕 **Cardápio Digital**: Organize pratos por categorias com imagens automáticas
- 🛒 **Carrinho Flutuante**: Interface intuitiva para pedidos nas mesas
- 📊 **Dashboard em Tempo Real**: Acompanhe pedidos por mesa instantaneamente
- ⭐ **Destaques**: Marque até 5 pratos como "Em Alta"
- 👥 **Gestão de Equipe**: Cadastre funcionários com avatares personalizados
- 🎨 **Sistema de Imagens Pré-definidas**: Imagens automáticas por categoria

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 17** com Spring Boot 3.2.12
- **Spring Data JPA** para persistência
- **MySQL** como banco de dados
- **Spring Web** para APIs REST
- **Maven** para gerenciamento de dependências
- **DiceBear API** para geração de avatares

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler
- **React Router** para navegação
- **CSS Modules** para estilização
- **Context API** para gerenciamento de estado
- **Lucide React** para ícones

## 🚀 Como Executar

### Pré-requisitos

- Java 17 ou superior
- Node.js 18 ou superior
- MySQL 8.0 ou superior
- Maven 3.6 ou superior

### 📦 Executar Localmente

Veja o guia completo em [COMO EXECUTAR LOCALMENTE](#executar-localmente).

### ☁️ Deploy em Produção

**Quer fazer deploy gratuito?** Siga o guia completo: **[DEPLOY.md](DEPLOY.md)**

- Backend: Railway (gratuito)
- Frontend: Vercel (gratuito)
- Banco: Railway MySQL (gratuito)

---

## 💻 Executar Localmente

### 1️⃣ Configurar o Banco de Dados

```sql
CREATE DATABASE MenuQ;
CREATE USER 'menuq_user'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON MenuQ.* TO 'menuq_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2️⃣ Configurar o Backend

1. Navegue até a pasta do backend:
```bash
cd backend/backend
```

2. Configure o arquivo `src/main/resources/application.properties`:
```properties
spring.application.name=backend
spring.datasource.url=jdbc:mysql://localhost:3306/MenuQ
spring.datasource.username=menuq_user
spring.datasource.password=sua_senha
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Profile dev desabilita rate limiting
spring.profiles.active=dev
```

3. Execute o backend:
```bash
mvn spring-boot:run
```

O backend estará disponível em `http://localhost:8080`

### 3️⃣ Configurar o Frontend

1. Navegue até a pasta do frontend:
```bash
cd frontend/menuQfront
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o frontend:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
MenuQ/
├── backend/
│   └── backend/
│       ├── src/
│       │   └── main/
│       │       ├── java/menu/q/backend/
│       │       │   ├── controller/     # Controllers REST
│       │       │   ├── service/        # Lógica de negócio
│       │       │   ├── repository/     # Acesso a dados
│       │       │   ├── model/          # Entidades JPA
│       │       │   ├── dto/            # Data Transfer Objects
│       │       │   ├── mapper/         # Mapeamento categoria→imagem
│       │       │   ├── validator/      # Validação de imagens
│       │       │   └── config/         # Configurações (CORS, WebMvc)
│       │       └── resources/
│       │           └── application.properties
│       ├── default-images/             # Imagens locais
│       │   ├── covers/                 # 4 capas de restaurante
│       │   └── items/                  # 8 imagens de categorias
│       └── pom.xml
│
└── frontend/
    └── menuQfront/
        ├── src/
        │   ├── components/             # Componentes reutilizáveis
        │   │   ├── cart/               # Carrinho flutuante
        │   │   ├── header/             # Cabeçalho
        │   │   ├── footer/             # Rodapé
        │   │   ├── qrcode/             # Gerador de QR Codes
        │   │   └── modals/             # Modais (guest info, etc)
        │   ├── pages/                  # Páginas da aplicação
        │   │   ├── home/               # Página inicial
        │   │   ├── login/              # Login/Cadastro
        │   │   ├── restaurants/        # Dashboard do restaurante
        │   │   ├── menu/               # Menu público (QR Code)
        │   │   └── profile/            # Perfil do usuário
        │   ├── contexts/               # Contexts React
        │   │   ├── AuthContext.tsx    # Autenticação
        │   │   ├── CartContext.tsx    # Carrinho de compras
        │   │   └── UIContext.tsx      # Estado da UI
        │   ├── services/
        │   │   └── api.ts              # Chamadas à API
        │   └── routes/
        │       └── index.tsx           # Definição de rotas
        └── package.json
```

## 🎨 Sistema de Imagens

### Imagens de Categorias (Automáticas)

O sistema atribui automaticamente imagens aos pratos baseado na categoria escolhida:

| Categoria | Arquivo | Descrição |
|-----------|---------|-----------|
| 🍔 Lanches | lanche.jpg | Hambúrgueres, sanduíches |
| 🍕 Pizzas | pizza.jpg | Pizzas variadas |
| 🍱 Japonesa | japonesa.jpg | Sushi, sashimi, etc |
| 🍚 Brasileira | brasileira.jpg | Pratos típicos brasileiros |
| 🥤 Bebidas | bebidas.jpg | Refrigerantes, sucos |
| 🍧 Açaí | acai.jpg | Açaí e sobremesas geladas |
| 🍰 Doces | doces.jpg | Sobremesas em geral |
| 💪 Fitness | fitness.jpg | Pratos saudáveis |

**Localização**: `backend/backend/default-images/items/`

### Capas de Restaurante

4 opções de capas disponíveis no cadastro:

1. **Capa 1** - Moderna/Elegante
2. **Capa 2** - Casual/Aconchegante
3. **Capa 3** - Temática
4. **Capa 4** - Fast-food/Delivery

**Localização**: `backend/backend/default-images/covers/`

### Avatares de Funcionários

Gerados dinamicamente via DiceBear API (estilo "personas")

## 🔌 Principais Endpoints da API

### Restaurantes
- `GET /api/restaurants` - Lista todos os restaurantes
- `GET /api/restaurants/{id}` - Busca restaurante por ID
- `GET /api/restaurants/owner/{userId}` - Busca restaurante do usuário
- `POST /api/restaurants` - Cria novo restaurante
- `PUT /api/restaurants/{id}` - Atualiza restaurante
- `DELETE /api/restaurants/{id}` - Remove restaurante

### Itens do Cardápio
- `GET /api/items` - Lista todos os itens
- `GET /api/items/{id}` - Busca item por ID
- `GET /api/items/restaurant/{restaurantId}` - Itens por restaurante
- `POST /api/items` - Cria novo item
- `PUT /api/items/{id}` - Atualiza item
- `DELETE /api/items/{id}` - Remove item

### Pedidos
- `GET /api/orders` - Lista todos os pedidos
- `GET /api/orders/restaurant/{restaurantId}` - Pedidos por restaurante
- `POST /api/orders` - Cria novo pedido
- `DELETE /api/orders/{id}` - Remove pedido

### Funcionários
- `GET /api/employees/restaurant/{restaurantId}` - Lista funcionários
- `POST /api/employees` - Adiciona funcionário
- `PUT /api/employees/{id}` - Atualiza funcionário
- `DELETE /api/employees/{id}` - Remove funcionário

## 👥 Fluxo de Uso

### Para Donos de Restaurante

1. **Cadastro**: Crie uma conta no sistema
2. **Criar Restaurante**: Configure nome, descrição e escolha uma capa
3. **Adicionar Itens**: Cadastre pratos escolhendo categoria (imagem automática)
4. **Marcar Destaques**: Selecione até 5 pratos como "Em Alta"
5. **Gerar QR Codes**: Defina número de mesas e gere códigos individuais
6. **Imprimir QR Codes**: Baixe e imprima os códigos para cada mesa
7. **Receber Pedidos**: Acompanhe pedidos em tempo real no dashboard

### Para Clientes

1. **Escanear QR Code**: Escaneie o código na mesa
2. **Informar Nome**: Digite seu nome ao acessar pela primeira vez
3. **Explorar Cardápio**: Navegue pelas categorias com imagens
4. **Adicionar ao Carrinho**: Selecione pratos e quantidades
5. **Finalizar Pedido**: Envie o pedido para a cozinha
6. **Aguardar**: O pedido aparece no dashboard do restaurante

## 🔒 Segurança

- Senhas hashadas no banco de dados
- Validação de entrada em todos os endpoints
- CORS configurado para localhost (dev) e domínio de produção
- Rate limiting em produção
- Validação de propriedade (usuário só edita seus próprios dados)

## 🌟 Diferenciais

- ✅ **Zero upload de arquivos**: Sistema 100% com imagens pré-definidas
- ✅ **Mapeamento automático**: Categoria → Imagem sem intervenção
- ✅ **QR Codes individuais**: Cada mesa tem seu próprio código
- ✅ **Identificação do cliente**: Nome capturado via modal na primeira visita
- ✅ **Carrinho inteligente**: Aparece apenas em páginas de mesa
- ✅ **URLs absolutas**: Sistema de conversão de URLs relativas→absolutas

## 📝 Notas de Desenvolvimento

### Histórico de Mudanças

- **Fase 1**: Sistema completo com upload de imagens
- **Fase 2**: Remoção de uploads, implementação de imagens pré-definidas
- **Fase 3**: Sistema de mapeamento categoria→imagem automático
- **Fase 4**: Correção de URLs (relativas → absolutas)
- **Fase 5**: Integração do carrinho flutuante em todas as páginas necessárias

### Perfis do Spring Boot

- **dev**: Desenvolvimento local, sem rate limiting
- **prod**: Produção, com rate limiting e validações extras

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Jonathan**

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!
