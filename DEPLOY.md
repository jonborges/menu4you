# 🚀 Guia de Deploy - MenuQ

## 📋 Checklist Pré-Deploy

✅ Código está usando variáveis de ambiente  
✅ `.env` adicionado ao `.gitignore`  
✅ Configurações de CORS dinâmicas  
✅ Porta configurada via variável `$PORT`  
✅ Frontend com `vercel.json` configurado  

---

## 🔧 Backend - Deploy no Railway (Gratuito)

### 1. Preparar o Repositório

```bash
cd MenuQ
git add .
git commit -m "Preparar para deploy"
git push origin main
```

### 2. Criar Conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha o repositório **MenuQ**
6. Railway detectará automaticamente que é um projeto Spring Boot

### 3. Adicionar Banco de Dados MySQL

1. No seu projeto Railway, clique em **"+ New"**
2. Selecione **"Database" → "Add MySQL"**
3. Railway criará automaticamente as variáveis:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### 4. Configurar Variáveis de Ambiente

No Railway, vá em **Settings → Variables** e adicione:

```bash
# Banco de Dados (Railway gera automaticamente, mas precisa juntar em DATABASE_URL)
DATABASE_URL=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=false&allowPublicKeyRetrieval=true
DATABASE_USERNAME=${MYSQLUSER}
DATABASE_PASSWORD=${MYSQLPASSWORD}

# Frontend URL (você vai pegar isso depois do deploy da Vercel)
FRONTEND_URL=https://seu-app.vercel.app

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

**⚠️ IMPORTANTE**: No Railway, você pode usar variáveis dentro de variáveis. A `DATABASE_URL` vai juntar automaticamente os valores do MySQL.

### 5. Configurar Build

No Railway, vá em **Settings → Build**:

- **Root Directory**: `backend/backend`
- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -Dserver.port=$PORT -jar target/*.jar`

### 6. Deploy

1. Railway fará o deploy automaticamente
2. Após o build, clique no projeto e vá em **Settings → Domains**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada (ex: `menuq-backend.up.railway.app`)

### 7. Copiar as Imagens

As imagens da pasta `default-images/` precisam estar no servidor. Railway persiste arquivos, então:

1. Faça commit da pasta `default-images/` no git:
```bash
git add backend/backend/default-images/
git commit -m "Adicionar imagens padrão"
git push
```

2. Railway detectará e fará redeploy automaticamente

---

## 🌐 Frontend - Deploy na Vercel

### 1. Preparar o Repositório

Já está preparado com o `vercel.json` ✅

### 2. Criar Conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório **MenuQ**

### 3. Configurar o Projeto

Na tela de configuração:

- **Framework Preset**: Vite
- **Root Directory**: `frontend/menuQfront`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Configurar Variáveis de Ambiente

Antes de fazer deploy, adicione em **Environment Variables**:

```bash
VITE_API_URL=https://menuq-backend.up.railway.app
```

**⚠️ IMPORTANTE**: Use a URL que você copiou do Railway (passo 6 acima)

### 5. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (1-2 minutos)
3. Após o deploy, copie a URL gerada (ex: `menuq.vercel.app`)

### 6. Atualizar CORS no Backend

1. Volte no Railway
2. Vá em **Variables**
3. Atualize a variável `FRONTEND_URL`:
```bash
FRONTEND_URL=https://menuq.vercel.app
```

4. Railway fará redeploy automaticamente

---

## ✅ Verificação Final

### Testar o Backend

```bash
curl https://menuq-backend.up.railway.app/api/restaurants
```

Deve retornar JSON com a lista de restaurantes.

### Testar o Frontend

1. Acesse `https://menuq.vercel.app`
2. Faça login ou crie uma conta
3. Crie um restaurante e adicione itens
4. Verifique se as imagens aparecem
5. Gere um QR Code e teste em outro dispositivo

---

## 🐛 Troubleshooting

### Backend não conecta ao banco

**Erro**: `Communications link failure`

**Solução**: Verifique se a `DATABASE_URL` está correta. No Railway, vá em:
- MySQL service → Variables
- Copie os valores e monte manualmente a URL

### Imagens não aparecem

**Erro**: 404 nas imagens

**Solução**: 
1. Verifique se a pasta `default-images/` está no git
2. No Railway, vá em Deployments → Logs e procure por "default-images"
3. Se não aparecer, faça commit forçado:
```bash
git add -f backend/backend/default-images/
git commit -m "Force add images"
git push
```

### CORS bloqueado

**Erro**: `Access-Control-Allow-Origin`

**Solução**: 
1. Verifique se a variável `FRONTEND_URL` no Railway está correta
2. Deve ser exatamente igual à URL da Vercel (com https://)
3. Sem barra no final!

### Frontend não conecta à API

**Erro**: `Failed to fetch`

**Solução**:
1. Verifique se a variável `VITE_API_URL` na Vercel está correta
2. Tente acessar diretamente a URL da API no navegador
3. Se não funcionar, o problema é no backend

---

## 💰 Custos

- **Railway**: $5 de crédito grátis por mês (suficiente para ~500 horas)
- **Vercel**: 100GB de banda grátis por mês
- **Total**: R$ 0,00 (dentro do free tier)

---

## 🔄 Atualizações Futuras

Depois do deploy, para atualizar:

```bash
# Fazer alterações no código
git add .
git commit -m "Sua mensagem"
git push

# Railway e Vercel fazem deploy automático!
```

---

## 📊 Monitoramento

### Railway (Backend)
- **Logs**: Deployments → View Logs
- **Métricas**: Metrics (CPU, RAM, Network)
- **Banco**: MySQL service → Connect (para acessar via MySQL Workbench)

### Vercel (Frontend)
- **Analytics**: Aba Analytics
- **Logs**: Deployments → View Function Logs
- **Performance**: Insights

---

## 🆘 Suporte

Se algo der errado:

1. **Railway Logs**: Veja os logs do backend para erros Java/Spring
2. **Vercel Logs**: Veja os logs de build do frontend
3. **Browser Console**: F12 → Console para erros JavaScript
4. **Network Tab**: F12 → Network para ver requisições falhando

---

✅ **Pronto!** Seu MenuQ está no ar e acessível de qualquer lugar do mundo! 🌍
