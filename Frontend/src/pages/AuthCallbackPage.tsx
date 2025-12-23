import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { authService } from '@/services/auth';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      authService.setToken(token);
      setLocation('/', { replace: true });
    } else {
      setError('Falha na autenticação. Token não recebido.');
    }
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <a href="/" className="text-primary underline">
            Voltar para o início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  );
}
