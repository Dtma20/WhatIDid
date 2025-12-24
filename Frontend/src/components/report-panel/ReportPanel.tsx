import { useState } from "react";
import {
    PanelRightClose,
    PanelRight,
    Copy,
    CheckCircle2,
    FileText,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@/services/api";

interface ReportPanelProps {
    report: Report | null;
    onClose?: () => void;
    className?: string;
    isMobile?: boolean;
}

function reportToMarkdown(report: Report): string {
    const lines: string[] = [];
    const { summary, groups, meta } = report;

    if (!summary || !meta) {
        return "# Relatório\n\nNenhum dado disponível.";
    }

    lines.push(`# ${summary.title || "Relatório"}`);
    lines.push("");
    lines.push(
        `> 📅 ${meta.date_context || ""} | 🔧 ${meta.primary_language || ""} | ⚡ Esforço: ${meta.effort_level || ""}`
    );
    lines.push("");
    lines.push("## Resumo Executivo");
    lines.push("");
    lines.push(summary.executive_overview || "");
    lines.push("");

    if (summary.technical_highlights.length > 0) {
        lines.push("## Destaques Técnicos");
        lines.push("");
        for (const highlight of summary.technical_highlights) {
            lines.push(`- ${highlight}`);
        }
        lines.push("");
    }

    if (groups.length > 0) {
        lines.push("## Atividades por Categoria");
        lines.push("");
        for (const group of groups) {
            lines.push(`### ${group.icon} ${group.category}`);
            lines.push("");
            for (const item of group.items) {
                lines.push(
                    `- ${item.description} _(${item.impact}, ${item.original_commits_count} commit${item.original_commits_count > 1 ? "s" : ""})_`
                );
            }
            lines.push("");
        }
    }

    return lines.join("\n");
}

function getImpactColor(impact: string) {
    switch (impact.toLowerCase()) {
        case "major":
        case "critical":
            return "text-red-500 bg-red-500/10";
        case "moderate":
            return "text-yellow-500 bg-yellow-500/10";
        case "minor":
            return "text-green-500 bg-green-500/10";
        default:
            return "text-muted-foreground bg-muted";
    }
}

export function ReportPanel({ report, onClose, className, isMobile = false }: ReportPanelProps) {
    const { toast } = useToast();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!report) {
        return null;
    }

    const { summary, groups, meta } = report;
    const markdownContent = reportToMarkdown(report);

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
        const blob = new Blob([markdownContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${new Date().toISOString().split("T")[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Download iniciado!",
            description: "O arquivo Markdown está sendo baixado.",
        });
    };

    const effectiveCollapsed = isMobile ? false : isCollapsed;

    if (!summary || !meta) {
        return (
            <aside
                className={cn(
                    "flex flex-col",
                    isMobile
                        ? "w-full h-full bg-background"
                        : "sticky top-0 self-start h-screen bg-card border-l hidden lg:flex",
                    !isMobile && (effectiveCollapsed ? "w-16" : "w-96 lg:w-[28rem]"),
                    className
                )}
            >
                <div className="p-6 text-center">
                    <p className="text-sm text-destructive">
                        Erro ao carregar o relatório.
                    </p>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className={cn(
                "flex flex-col transition-all duration-300 ease-in-out",
                isMobile
                    ? "w-full h-full bg-background"
                    : "sticky top-0 self-start h-screen bg-card border-l hidden lg:flex",
                !isMobile && (effectiveCollapsed ? "w-16" : "w-96 lg:w-[28rem]"),
                className
            )}
            style={{ zIndex: 20 }}
        >

            <div className="flex items-center justify-between p-4 border-b shrink-0">
                {!effectiveCollapsed && (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <h2 className="font-semibold text-sm truncate">Relatório Gerado</h2>
                    </div>
                )}
                <div className={cn("flex items-center gap-1", effectiveCollapsed && "mx-auto")}>
                    {onClose && !effectiveCollapsed && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    {!isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="h-8 w-8"
                        >
                            {effectiveCollapsed ? (
                                <PanelRight className="h-4 w-4" />
                            ) : (
                                <PanelRightClose className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>
            </div>


            {!effectiveCollapsed && (
                <div className="flex gap-2 p-3 border-b shrink-0">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                        {copied ? (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                        ) : (
                            <Copy className="w-4 h-4 mr-2" />
                        )}
                        {copied ? "Copiado" : "Copiar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                        <FileText className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            )}


            {effectiveCollapsed && (
                <div className="flex flex-col items-center gap-2 p-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleCopy}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Copiar Markdown</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleDownload}>
                                <FileText className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Download .md</TooltipContent>
                    </Tooltip>
                </div>
            )}


            {!effectiveCollapsed && (
                <ScrollArea className="flex-1 overflow-hidden">
                    <div className="p-4 space-y-6">

                        <div>
                            <h1 className="text-xl font-bold text-foreground leading-tight">
                                {summary.title}
                            </h1>
                        </div>


                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 bg-muted rounded-md">
                                📅 {meta.date_context}
                            </span>
                            <span className="px-2 py-1 bg-muted rounded-md">
                                🔧 {meta.primary_language}
                            </span>
                            <span className="px-2 py-1 bg-muted rounded-md">
                                ⚡ {meta.effort_level}
                            </span>
                        </div>


                        <div className="space-y-2">
                            <h2 className="text-sm font-semibold text-foreground">
                                Resumo Executivo
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {summary.executive_overview}
                            </p>
                        </div>


                        {summary.technical_highlights.length > 0 && (
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold text-foreground">
                                    Destaques Técnicos
                                </h2>
                                <ul className="space-y-1">
                                    {summary.technical_highlights.map((highlight, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}


                        {groups.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold text-foreground">
                                    Atividades
                                </h2>
                                <div className="space-y-3">
                                    {groups.map((group, groupIndex) => (
                                        <div
                                            key={groupIndex}
                                            className="border rounded-lg p-3 bg-muted/20"
                                        >
                                            <h3 className="font-medium text-sm text-foreground flex items-center gap-2 mb-2">
                                                <span>{group.icon}</span>
                                                {group.category}
                                            </h3>
                                            <ul className="space-y-2">
                                                {group.items.map((item, itemIndex) => (
                                                    <li
                                                        key={itemIndex}
                                                        className="text-xs text-muted-foreground"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="flex-1">{item.description}</span>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <span
                                                                    className={cn(
                                                                        "text-[10px] px-1.5 py-0.5 rounded-full",
                                                                        getImpactColor(item.impact)
                                                                    )}
                                                                >
                                                                    {item.impact}
                                                                </span>
                                                            </div>
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
                </ScrollArea>
            )}
        </aside>
    );
}
