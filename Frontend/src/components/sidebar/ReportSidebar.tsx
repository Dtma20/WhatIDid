import { useState, useRef, useEffect } from "react";
import {
    PanelLeftClose,
    PanelLeft,
    Plus,
    FileText,
    Star,
    StarOff,
    Trash2,
    Pencil,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypewriterText } from "@/components/shared/TypewriterText";
import { cn } from "@/lib/utils";
import type { SavedReport } from "@/services/api";

interface GroupedReports {
    today: SavedReport[];
    yesterday: SavedReport[];
    lastWeek: SavedReport[];
    older: SavedReport[];
}

interface ReportSidebarProps {
    reports: SavedReport[];
    activeReportId: string | null;
    isLoading?: boolean;
    onSelectReport: (id: string) => void;
    onNewReport: () => void;
    onDeleteReport: (id: string) => void;
    onRenameReport?: (id: string, newName: string) => void;
    onToggleFavorite?: (id: string) => void;
}

function groupReportsByDate(reports: SavedReport[]): GroupedReports {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const grouped: GroupedReports = {
        today: [],
        yesterday: [],
        lastWeek: [],
        older: [],
    };

    for (const report of reports) {
        const reportDate = new Date(report.generatedAt);
        const reportDay = new Date(
            reportDate.getFullYear(),
            reportDate.getMonth(),
            reportDate.getDate()
        );

        if (reportDay.getTime() === today.getTime()) {
            grouped.today.push(report);
        } else if (reportDay.getTime() === yesterday.getTime()) {
            grouped.yesterday.push(report);
        } else if (reportDay >= lastWeek) {
            grouped.lastWeek.push(report);
        } else {
            grouped.older.push(report);
        }
    }

    return grouped;
}

interface ReportItemProps {
    report: SavedReport;
    isActive: boolean;
    isCollapsed: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename?: (newName: string) => void;
    onToggleFavorite?: () => void;
}

function ReportItem({
    report,
    isActive,
    isCollapsed,
    onSelect,
    onDelete,
    onRename,
    onToggleFavorite,
}: ReportItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(report.summary);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (onRename && editValue.trim() !== report.summary) {
            onRename(editValue.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleRename();
        } else if (e.key === "Escape") {
            setEditValue(report.summary);
            setIsEditing(false);
        }
    };

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onSelect}
                        className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p className="font-medium">{report.summary}</p>
                    <p className="text-xs text-muted-foreground">{report.repositoryName}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden",
                isActive
                    ? "bg-primary/10 text-foreground border-l-2 border-primary"
                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            )}
            onClick={onSelect}
        >
            <FileText className="w-4 h-4 shrink-0" />

            <div className="flex-1 min-w-0 overflow-hidden" style={{ maxWidth: 'calc(100% - 24px)' }}>
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-background border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                ) : (
                    <>
                        <p className="text-sm font-medium truncate text-ellipsis whitespace-nowrap overflow-hidden">
                            <TypewriterText text={report.summary} speed={20} />
                        </p>
                        <p className="text-xs text-muted-foreground truncate text-ellipsis whitespace-nowrap overflow-hidden">
                            {report.repositoryName}
                        </p>
                    </>
                )}
            </div>

            {report.isFavorite && !isHovered && (
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
            )}

            {isHovered && !isEditing && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onToggleFavorite && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={onToggleFavorite}
                        >
                            {report.isFavorite ? (
                                <StarOff className="w-3 h-3" />
                            ) : (
                                <Star className="w-3 h-3" />
                            )}
                        </Button>
                    )}
                    {onRename && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setIsEditing(true)}
                        >
                            <Pencil className="w-3 h-3" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={onDelete}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    );
}

interface ReportGroupProps {
    title: string;
    reports: SavedReport[];
    activeReportId: string | null;
    isCollapsed: boolean;
    onSelectReport: (id: string) => void;
    onDeleteReport: (id: string) => void;
    onRenameReport?: (id: string, newName: string) => void;
    onToggleFavorite?: (id: string) => void;
}

function ReportGroup({
    title,
    reports,
    activeReportId,
    isCollapsed,
    onSelectReport,
    onDeleteReport,
    onRenameReport,
    onToggleFavorite,
}: ReportGroupProps) {
    if (reports.length === 0) return null;

    return (
        <div className="space-y-1">
            {!isCollapsed && (
                <div className="flex items-center gap-2 px-3 py-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {title}
                    </span>
                </div>
            )}
            <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
                {reports.map((report) => (
                    <ReportItem
                        key={report.id}
                        report={report}
                        isActive={report.id === activeReportId}
                        isCollapsed={isCollapsed}
                        onSelect={() => onSelectReport(report.id)}
                        onDelete={() => onDeleteReport(report.id)}
                        onRename={onRenameReport ? (name) => onRenameReport(report.id, name) : undefined}
                        onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(report.id) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}

export function ReportSidebar({
    reports,
    activeReportId,
    isLoading,
    onSelectReport,
    onNewReport,
    onDeleteReport,
    onRenameReport,
    onToggleFavorite,
}: ReportSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const groupedReports = groupReportsByDate(reports);

    return (
        <aside
            className={cn(
                "sticky top-0 self-start h-screen bg-card border-r flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-72"
            )}
            style={{ zIndex: 20 }}
        >
            <div className="flex items-center justify-between p-4 border-b">
                {!isCollapsed && (
                    <h2 className="font-semibold text-sm">Histórico</h2>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn("h-8 w-8", isCollapsed && "mx-auto")}
                >
                    {isCollapsed ? (
                        <PanelLeft className="h-4 w-4" />
                    ) : (
                        <PanelLeftClose className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className="p-2 border-b">
                {isCollapsed ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onNewReport}
                                className="w-full h-10"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Novo Relatório</TooltipContent>
                    </Tooltip>
                ) : (
                    <Button
                        variant="outline"
                        onClick={onNewReport}
                        className="w-full justify-start gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Relatório
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 px-2 py-2 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground text-sm">
                            Carregando...
                        </div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                        {!isCollapsed && (
                            <p className="text-sm text-muted-foreground">
                                Nenhum relatório ainda
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 w-full overflow-hidden">
                        <ReportGroup
                            title="Hoje"
                            reports={groupedReports.today}
                            activeReportId={activeReportId}
                            isCollapsed={isCollapsed}
                            onSelectReport={onSelectReport}
                            onDeleteReport={onDeleteReport}
                            onRenameReport={onRenameReport}
                            onToggleFavorite={onToggleFavorite}
                        />
                        <ReportGroup
                            title="Ontem"
                            reports={groupedReports.yesterday}
                            activeReportId={activeReportId}
                            isCollapsed={isCollapsed}
                            onSelectReport={onSelectReport}
                            onDeleteReport={onDeleteReport}
                            onRenameReport={onRenameReport}
                            onToggleFavorite={onToggleFavorite}
                        />
                        <ReportGroup
                            title="Últimos 7 dias"
                            reports={groupedReports.lastWeek}
                            activeReportId={activeReportId}
                            isCollapsed={isCollapsed}
                            onSelectReport={onSelectReport}
                            onDeleteReport={onDeleteReport}
                            onRenameReport={onRenameReport}
                            onToggleFavorite={onToggleFavorite}
                        />
                        <ReportGroup
                            title="Mais antigos"
                            reports={groupedReports.older}
                            activeReportId={activeReportId}
                            isCollapsed={isCollapsed}
                            onSelectReport={onSelectReport}
                            onDeleteReport={onDeleteReport}
                            onRenameReport={onRenameReport}
                            onToggleFavorite={onToggleFavorite}
                        />
                    </div>
                )}
            </ScrollArea>
        </aside>
    );
}
