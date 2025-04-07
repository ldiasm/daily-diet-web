# Daily Diet Web - Guia de Configuração

## Sumário
1. [Requisitos](#requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
   - [macOS](#macos)
   - [Windows](#windows)
   - [Linux](#linux)
3. [Desenvolvimento](#desenvolvimento)
4. [Solução de Problemas](#solução-de-problemas)

## Requisitos

Antes de começar, você precisa ter instalado:

- Node.js (versão 16.x ou superior)
- Yarn (versão 1.22.x ou superior)

## Configuração do Ambiente

### macOS

1. Instale as dependências:
```bash
yarn
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

### Windows

1. Instale as dependências:
```batch
yarn
```

2. Configure as variáveis de ambiente:
```batch
copy .env.example .env
```

### Linux

1. Instale as dependências:
```bash
yarn
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
yarn dev
```

O frontend estará disponível em http://localhost:5173

## Solução de Problemas

### Erros Comuns

1. **Porta 5173 em uso**
   - Verifique se não há outro processo usando a porta
   - Altere a porta no arquivo vite.config.ts

2. **Erro ao iniciar o servidor**
   - Verifique se todas as dependências foram instaladas
   - Tente reinstalar com `yarn`

3. **Erro de compilação**
   - Verifique se o TypeScript está instalado corretamente
   - Tente limpar o cache com `yarn cache clean`

### Logs e Debug

Para ver logs mais detalhados:

macOS/Linux:
```bash
DEBUG=* yarn dev
```
Windows:
```batch
set DEBUG=* && yarn dev
```
