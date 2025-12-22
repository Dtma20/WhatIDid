import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { GitBranch } from "lucide-react";

interface BranchSelectorProps {
  branches: string[];
  selectedBranch: string;
  onSelect: (branch: string) => void;
  isLoading: boolean;
}

export function BranchSelector({ branches, selectedBranch, onSelect, isLoading }: BranchSelectorProps) {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor="branch-select" className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Branch
      </Label>
      <Select
        disabled={isLoading}
        value={selectedBranch}
        onValueChange={onSelect}
      >
        <SelectTrigger
          id="branch-select"
          className="h-12 bg-card border-input/50 transition-all shadow-sm"
          data-testid="select-branch"
          aria-label="Selecionar branch"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Selecione uma branch" />
          </div>
        </SelectTrigger>
        <SelectContent side="bottom" align="start">
          {branches.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma branch disponível
            </div>
          ) : (
            branches.map((branch) => (
              <SelectItem key={branch} value={branch}>
                {branch}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

