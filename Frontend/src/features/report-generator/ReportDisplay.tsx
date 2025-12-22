import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@/services/api";

interface ReportDisplayProps {
  report: Report;
}

function reportToMarkdown(report: Report): string {
  const lines: string[] = [];
  const { summary, groups, meta } = report;

  lines.push(`# ${summary.title}`);
  lines.push('');
  lines.push(`> 📅 ${meta.date_context} | 🔧 ${meta.primary_language} | ⚡ Esforço: ${meta.effort_level}`);
  lines.push('');
  lines.push('## Resumo Executivo');
  lines.push('');
  lines.push(summary.executive_overview);
  lines.push('');

  if (summary.technical_highlights.length > 0) {
    lines.push('## Destaques Técnicos');
    lines.push('');
    for (const highlight of summary.technical_highlights) {
      lines.push(`- ${highlight}`);
    }
    lines.push('');
  }

  if (groups.length > 0) {
    lines.push('## Atividades por Categoria');
    lines.push('');
    for (const group of groups) {
      lines.push(`### ${group.icon} ${group.category}`);
      lines.push('');
      for (const item of group.items) {
        lines.push(`- ${item.description} _(${item.impact}, ${item.original_commits_count} commit${item.original_commits_count > 1 ? 's' : ''})_`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const markdownContent = reportToMarkdown(report);
  const { summary, groups, meta } = report;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "O relatório está pronto para colar em qualquer lugar.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado!",
      description: "O arquivo Markdown está sendo baixado.",
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'major': return 'text-red-500 bg-red-500/10';
      case 'moderate': return 'text-yellow-500 bg-yellow-500/10';
      case 'minor': return 'text-green-500 bg-green-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card className="w-full border shadow-lg bg-card animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          Relatório Gerado
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy-report">
            {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} data-testid="button-download-report">
            <FileText className="w-4 h-4 mr-2" />
            Download .md
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">
            {summary.title}
          </h1>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-2 py-1 bg-muted rounded-md">
              📅 {meta.date_context}
            </span>
            <span className="px-2 py-1 bg-muted rounded-md">
              🔧 {meta.primary_language}
            </span>
            <span className="px-2 py-1 bg-muted rounded-md">
              ⚡ Esforço: {meta.effort_level}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Resumo Executivo
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {summary.executive_overview}
            </p>
          </div>

          {summary.technical_highlights.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Destaques Técnicos
              </h2>
              <ul className="space-y-2">
                {summary.technical_highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {groups.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Atividades por Categoria
              </h2>
              <div className="space-y-4">
                {groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="border rounded-lg p-4 bg-muted/20">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <span className="text-xl">{group.icon}</span>
                      {group.category}
                    </h3>
                    <ul className="space-y-2">
                      {group.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground flex-1">
                            {item.description}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getImpactColor(item.impact)}`}>
                              {item.impact}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.original_commits_count} commit{item.original_commits_count > 1 ? 's' : ''}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
