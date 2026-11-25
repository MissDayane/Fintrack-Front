# FinTrack Web (Frontend React Desacoplado)

Interface web em **React + TypeScript + Vite**, pronta para funcionar **100% standalone** agora e se conectar à **API Principal Java (`:8081`)** e ao **Microserviço de IA (`:8082`)** depois com uma única variável de ambiente.

## Identidade Visual Aplicada
- **Roxo Profundo:** `#2D0B6B`
- **Roxo Tech:** `#7A3FF2`
- **Amarelo Ouro:** `#F4B400`
- **Lavanda Claro:** `#E9E3FF`
- **Cinza Suave:** `#F5F7FA`

## Como Rodar

```bash
npm install
npm run dev
```

Por padrão (`VITE_API_MODE=mock`), todas as telas funcionam com dados locais persistidos no navegador (Login com qualquer e-mail/senha, Cadastro, Dashboard, Contas, Transações, FinTrack IA e Perfil).

## Conectando à API Java Depois

1. Copie o exemplo de variáveis:
   ```bash
   cp .env.example .env
   ```
2. Altere no `.env`:
   ```env
   VITE_API_MODE=api
   VITE_API_BASE_URL=http://localhost:8081
   VITE_AI_API_BASE_URL=http://localhost:8082
   ```
3. Ajuste, se necessário, os mappers de DTO em `src/services/accountsService.ts` e `src/services/transactionsService.ts` de acordo com o Swagger da API (`:8081/swagger-ui.html`).
