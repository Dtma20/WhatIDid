# What I Did

**What I Did** generates concise, structured daily reports from a Git history using an LLM.

## 🛠 Tech Stack

* **Backend:** NestJS, Prisma (PostgreSQL), AES-256-GCM encryption for tokens
* **Frontend:** React, Vite, Tailwind CSS
* **LLM:** Gemini (via adapter pattern)

## 🚀 Local Setup

### 1. Environment Variables

In the `Backend` directory, configure your `.env` file. Pay special attention to:

* `DATABASE_URL`: PostgreSQL runs on port **5433** by default (via Docker)
* `ENCRYPTION_KEY`: Must be a 64-character hexadecimal string
* `GEMINI_API_KEY`: Your Google AI Studio API key

### 2. Run the Application

```bash
pnpm install
docker compose up -d
cd Backend && pnpm prisma migrate dev && cd ..
pnpm dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend:** [http://localhost:3000](http://localhost:3000)

## 📌 Important Notes

* **Database:** PostgreSQL is configured in `docker-compose.yaml` to use port **5433** to avoid conflicts with local instances.
* **Security:** Access tokens are encrypted at rest in the database using a Prisma extension.
* **LLM Schema:** The backend enforces a strict JSON schema. If you modify the prompt, make sure to validate the DTO in
  `Backend/src/core/llm/dto/daily-report.dto.ts`.

## 🔍 Troubleshooting

* **Backend does not start:** Ensure that `ENCRYPTION_KEY` contains exactly 64 hexadecimal characters.
* **Database connection error:** Verify that the Docker container is running and that the port in `DATABASE_URL` is set to **5433**.
