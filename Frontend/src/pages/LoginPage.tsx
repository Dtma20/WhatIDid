import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Github, Sparkles, Lock, Globe } from 'lucide-react';
import { authService } from '@/services/auth';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function LoginPage() {
  const [includePrivate, setIncludePrivate] = useState(true);

  const handleLogin = () => {
    window.location.href = authService.getLoginUrl(includePrivate);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full animate-spin-in-grow">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight">
              WhatIDid
            </h1>

            <p className="text-muted-foreground text-lg">
              Transforme seu histórico do Git em relatórios profissionais em segundos.
            </p>
          </div>

          <div className="space-y-4">
            <div
              className="flex items-center justify-center gap-3 p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setIncludePrivate(!includePrivate)}
            >
              <Checkbox
                id="private-repos"
                checked={includePrivate}
                onCheckedChange={(checked) => setIncludePrivate(checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="private-repos" className="flex items-center gap-2 text-sm cursor-pointer">
                {includePrivate ? (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span>Incluir repositórios privados</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Apenas repositórios públicos</span>
                  </>
                )}
              </label>
            </div>

            <Button
              size="lg"
              onClick={handleLogin}
              className="w-full font-semibold text-base py-6"
            >
              <Github className="mr-2 h-5 w-5" />
              Entrar com GitHub
            </Button>

            <p className="text-xs text-muted-foreground">
              {includePrivate
                ? "Você terá acesso a todos os seus repositórios, incluindo os privados."
                : "Você terá acesso apenas aos seus repositórios públicos."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
