import { memo, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Repository } from "@/services/api";
import { cn } from "@/lib/utils";

interface RepoSelectorProps {
  repos: Repository[];
  selectedRepoName: string | null;
  onSelect: (repoName: string) => void;
  isLoading: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onRetry?: () => void;
}

export const RepoSelector = memo(function RepoSelector({
  repos,
  selectedRepoName,
  onSelect,
  isLoading,
  error,
  className,
  placeholder = "Selecione um repositório...",
  disabled = false,
  onRetry,
}: RepoSelectorProps) {
  const isValidSelection = useMemo(() => {
    if (!selectedRepoName || selectedRepoName === '') return false;
    return repos.some(repo => repo.fullName === selectedRepoName);
  }, [selectedRepoName, repos]);

  const currentValue = isValidSelection && selectedRepoName ? selectedRepoName : undefined;

  const isEmpty = repos.length === 0;
  const showEmptyState = !isLoading && isEmpty && !error;
  const isDisabled = disabled || isLoading || (isEmpty && !error);

  const repoItems = useMemo(
    () =>
      repos.map((repo) => (
        <SelectItem
          key={repo.id}
          value={repo.fullName}
          className="cursor-pointer hover:bg-accent py-3"
          data-testid={`repo-item-${repo.id}`}
        >
          {repo.fullName}
        </SelectItem>
      )),
    [repos]
  );

  const getPlaceholder = () => {
    if (isLoading) return "Carregando repositórios...";
    if (error) return "Falha ao carregar repositórios";
    if (isEmpty) return "Nenhum repositório disponível";
    return placeholder;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor="repo-select"
        className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
      >
        Repositório
        {isLoading && (
          <span className="ml-2 inline-flex items-center text-xs normal-case tracking-normal">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Carregando...
          </span>
        )}
        {error && (
          <span className="ml-2 inline-flex items-center text-xs text-destructive normal-case tracking-normal">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </span>
        )}
      </Label>

      <Select
        value={currentValue}
        onValueChange={onSelect}
        disabled={isDisabled}
      >
        <SelectTrigger
          id="repo-select"
          className="w-full h-12 border-input/50 shadow-sm"
          data-testid="input-repository"
          aria-label="Selecionar repositório"
          aria-invalid={!!error}
          aria-describedby={error ? "repo-error" : undefined}
        >
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>
        <SelectContent side="bottom" align="start">
          {showEmptyState ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p className="font-medium">Nenhum repositório encontrado</p>
              <p className="text-xs mt-1">Verifique suas permissões do GitHub</p>
            </div>
          ) : (
            repoItems
          )}
        </SelectContent>
      </Select>

      {error && onRetry && (
        <p id="repo-error" className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}.{" "}
          <button
            onClick={onRetry}
            className="underline hover:no-underline"
            type="button"
          >
            Tentar novamente
          </button>
        </p>
      )}
    </div>
  );
});

RepoSelector.displayName = 'RepoSelector';
