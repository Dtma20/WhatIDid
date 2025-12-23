# What I Did

What I Did generates concise, structured daily reports from a Git history using an LLM.

## 🛠 Tech Stack

* **Backend:** NestJS, Prisma (PostgreSQL), AES-256-GCM encryption for tokens.
* **Frontend:** React, Vite, Tailwind CSS.
* **LLM:** Gemini (via adapter pattern).

## 🚀 Local Setup

### 1. Environment Variables

No diretório `Backend`, configure o seu `.env`. Os pontos de atenção são:

* `DATABASE_URL`: O Postgres roda por padrão na porta **5433** (via Docker).
* `ENCRYPTION_KEY`: Deve ser uma string de 64 caracteres hexadecimais.
* `GEMINI_API_KEY`: Sua chave de API do Google AI Studio.

### 2. Run the App

```bash
pnpm install
docker compose up -d
cd Backend && pnpm prisma migrate dev && cd ..
pnpm dev
```

* **Frontend:** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
* **Backend:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

## 📌 Important Notes

* **Database:** O PostgreSQL está configurado no `docker-compose.yaml` para usar a porta **5433** para evitar conflitos com instâncias locais.
* **Security:** Tokens de acesso são criptografados em repouso no banco de dados via extensão do Prisma.
* **LLM Schema:** O backend utiliza um schema JSON estrito. Caso altere o prompt, valide o DTO em `Backend/src/core/llm/dto/daily-report.dto.ts`.

## 🔍 Troubleshooting

* **Backend não inicia:** Verifique se a `ENCRYPTION_KEY` possui exatamente 64 caracteres hexadecimais.
* **Erro de Conexão com Banco:** Certifique-se de que o container Docker está rodando e que a porta no `DATABASE_URL` é a `5433`.
