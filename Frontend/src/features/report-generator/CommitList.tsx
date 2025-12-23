import type { Commit } from "@/services/api";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GitCommitHorizontal } from "lucide-react";

interface CommitListProps {
  commits: Commit[];
  selectedCommitIds: string[];
  onToggleCommit: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
}

export function CommitList({ commits, selectedCommitIds, onToggleCommit, onToggleAll }: CommitListProps) {
  const allSelected = commits.length > 0 && selectedCommitIds.length === commits.length;
  const someSelected = selectedCommitIds.length > 0 && selectedCommitIds.length < commits.length;

  if (commits.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted-foreground/20">
        <GitCommitHorizontal className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground font-medium">Nenhum commit encontrado neste período.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-[60vh] min-h-[400px] max-h-[600px]">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="select-all"
            checked={allSelected || (someSelected ? "indeterminate" : false)}
            onCheckedChange={(checked) => onToggleAll(checked === true)}
            data-testid="checkbox-select-all"
            aria-label="Selecionar todos os commits"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Selecionar Todos ({commits.length})
          </label>
        </div>
        <div className="text-xs text-muted-foreground">
          {selectedCommitIds.length} selecionado{selectedCommitIds.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {commits.map((commit) => {
            const isSelected = selectedCommitIds.includes(commit.sha);
            return (
              <div
                key={commit.sha}
                className={`flex items-start space-x-4 p-4 hover:bg-muted/40 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                onClick={() => onToggleCommit(commit.sha)}
                data-testid={`row-commit-${commit.sha}`}
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`Commit ${commit.sha.substring(0, 7)}: ${commit.message}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleCommit(commit.sha);
                  }
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleCommit(commit.sha)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                  aria-hidden="true"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2 text-foreground break-words">
                    {commit.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground/70">
                      {commit.sha.substring(0, 7)}
                    </span>
                    {commit.author && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate max-w-[150px]">{commit.author.name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          {format(new Date(commit.author.date), "d 'de' MMM, HH:mm", { locale: ptBR })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

