# What I Did

"What I Did" is a web application that automatically generates a summary of development activities from a GitHub repository for a given day. The user provides a repository URL and a date, and the application fetches the commits, uses a Large Language Model (LLM) to analyze them, and presents a summarized report.

## Architecture Overview

The project is a monorepo with a `Backend` and a `Frontend`.

- **Backend**: A [NestJS](https://nestjs.com/) application responsible for fetching and processing data.
  - **GitHub Service**: Fetches commit data from GitHub repositories using `@octokit/rest`.
  - **LLM Intelligence**: An agnostic module for interacting with Large Language Models (like Google Gemini) to analyze and summarize commit messages. It uses a factory and adapter pattern for flexibility.
- **Frontend**: A [React](https://react.dev/) application built with [Vite](https://vitejs.dev/) and styled with [TailwindCSS](https://tailwindcss.com/) for a modern and responsive user interface.

## How it Works

1. The user provides a GitHub repository URL and selects a date on the frontend.
2. The frontend sends a request to the backend's `/api/generate-daily` endpoint.
3. The backend's GitHub Service fetches all commits for the specified day.
4. The commits are processed and sanitized to remove irrelevant information.
5. The cleaned commit messages are sent to an LLM via the LlmService for analysis and summarization.
6. The backend returns the generated summary as a structured response.
7. The frontend displays the summary to the user in a clean, readable format.

## Project setup

```bash
# Install all dependencies for both backend and frontend
pnpm install
```

## Running the project

```bash
# Run both frontend and backend in development mode
# The frontend will be available on http://localhost:5173
# The backend will be available on http://localhost:3000
pnpm run dev
```

## Run tests

```bash
# Run all backend tests
pnpm --filter backend test
```
