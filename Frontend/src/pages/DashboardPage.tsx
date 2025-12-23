import { useState, useEffect, useRef, useMemo } from "react";
import { api, ApiError, type Repository, type Commit, type Report } from "@/services/api";
import { RepoSelector } from "@/features/report-generator/RepoSelector";
import { BranchSelector } from "@/features/report-generator/BranchSelector";
import { CommitList } from "@/features/report-generator/CommitList";
import { ReportDisplay } from "@/features/report-generator/ReportDisplay";
import { ReportSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { TypewriterText } from "@/components/shared/TypewriterText";
import { UserMenu } from "@/components/shared/UserMenu";

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reportSectionRef = useRef<HTMLElement>(null);
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });

  const [selectedRepoName, setSelectedRepoName] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCommitIds, setSelectedCommitIds] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [startTitleTyping, setStartTitleTyping] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const iconRef = useRef<HTMLDivElement | null>(null);

  const { data: savedReportsData, isLoading: isLoadingReports } = useQuery({
    queryKey: ["reports"],
    queryFn: api.getReports,
  });

  const savedReports = savedReportsData?.data ?? [];

  const { mutate: deleteReportMutation } = useMutation({
    mutationFn: api.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      if (activeReportId) {
        setActiveReportId(null);
        setReport(null);
        setIsCreatingNew(true);
      }
      toast({ title: "Relatório excluído" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    },
  });

  const { mutate: generateReport, isPending: isGenerating } = useMutation<
    Report,
    Error,
    Commit[]
  >({
    mutationFn: api.generateReport,
    onSuccess: (data) => {
      setReport(data);
      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Falha ao gerar o relatório. Tente novamente.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    },
  });

  const { data: repos = [], isLoading: isLoadingRepos } = useQuery<Repository[]>({
    queryKey: ["repositories"],
    queryFn: api.getRepositories,
  });

  const selectedRepo = useMemo(() => {
    return repos.find((repo) => repo.fullName === selectedRepoName) || null;
  }, [repos, selectedRepoName]);

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<
    string[]
  >({
    queryKey: ["branches", selectedRepo?.owner.login, selectedRepo?.name],
    queryFn: () =>
      api.getBranches(selectedRepo!.owner.login, selectedRepo!.name),
    enabled: !!selectedRepo,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingCommits,
  } = useInfiniteQuery({
    queryKey: ["commits", selectedRepo?.owner.login, selectedRepo?.name, selectedBranch],
    queryFn: ({ pageParam }) =>
      api.getCommits(
        selectedRepo!.owner.login,
        selectedRepo!.name,
        selectedBranch,
        pageParam
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    enabled: !!selectedRepo && !!selectedBranch,
  });

  const commits = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);


  useEffect(() => {
    if (!selectedRepo) {
      if (selectedBranch !== "") setSelectedBranch("");
      return;
    }

    if (branches.length > 0) {
      const currentBranchExists = branches.some((b) => b === selectedBranch);

      if (!selectedBranch || !currentBranchExists) {
        const defaultBranch = branches.find(
          (b) => b === selectedRepo.default_branch
        );
        const newBranch = defaultBranch || branches[0];

        if (selectedBranch !== newBranch) {
          setSelectedBranch(newBranch);
        }
      }
    }
  }, [selectedRepo, branches, selectedBranch]);

  useEffect(() => {
    setReport(null);
    setSelectedCommitIds([]);
  }, [selectedRepo?.name, selectedBranch]);

  const commitsKey = commits.map((c) => c.sha).join(",");
  useEffect(() => {
    if (commits.length > 0) {
      const allIds = commits.map((c) => c.sha);
      setSelectedCommitIds(allIds);
    }
  }, [commitsKey]);

  useEffect(() => {
    const el = iconRef.current;
    if (!el) {
      setStartTitleTyping(true);
      return;
    }

    const onAnimEnd = () => setStartTitleTyping(true);
    el.addEventListener('animationend', onAnimEnd);

    // Fallback: ensure typing starts after 1500ms if animationend doesn't fire
    const fallback = setTimeout(() => setStartTitleTyping(true), 1500);

    return () => {
      el.removeEventListener('animationend', onAnimEnd);
      clearTimeout(fallback);
    };
  }, [iconRef]);

  const handleGenerateReportClick = () => {
    if (selectedCommitIds.length === 0) {
      toast({
        title: "Nenhum commit selecionado",
        description: "Por favor, selecione pelo menos um commit.",
        variant: "destructive",
      });
      return;
    }

    const selectedCommits = commits.filter((commit) =>
      selectedCommitIds.includes(commit.sha)
    );
    generateReport(selectedCommits);
  };

  const toggleCommit = (id: string) => {
    setSelectedCommitIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAllCommits = (checked: boolean) => {
    setSelectedCommitIds(checked ? commits.map((c) => c.sha) : []);
  };

  const handleSelectReport = async (id: string) => {
    try {
      const reportDetail = await api.getReportById(id);
      setReport(reportDetail.content);
      setActiveReportId(id);
      setIsCreatingNew(false);
      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      toast({ title: "Erro ao carregar relatório", variant: "destructive" });
    }
  };

  const handleNewReport = () => {
    setActiveReportId(null);
    setReport(null);
    setIsCreatingNew(true);
    setSelectedRepoName("");
    setSelectedBranch("");
    setSelectedCommitIds([]);
  };

  const handleDeleteReport = (id: string) => {
    deleteReportMutation(id);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <ReportSidebar
        reports={savedReports}
        activeReportId={activeReportId}
        isLoading={isLoadingReports}
        onSelectReport={handleSelectReport}
        onNewReport={handleNewReport}
        onDeleteReport={handleDeleteReport}
      />

      <main className="flex-1 pb-20 overflow-auto">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center space-y-4">
            <div ref={iconRef} className="inline-flex items-center justify-center p-3 bg-primary/5 rounded-full mb-4 animate-spin-in-grow">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              {startTitleTyping ? (
                <TypewriterText
                  text="WhatIDid"
                  speed={80}
                  onComplete={() => setShowSubtitle(true)}
                />
              ) : (
                <span aria-hidden className="inline-block w-0 h-0" />
              )}
            </h1>
            <p className="text-md max-w-lg mx-auto h-7">
              <span className="text-muted-foreground/90">
                {showSubtitle && (
                  <TypewriterText
                    text="Relatórios a partir do seu Git em segundos"
                    speed={40}
                  />
                )}
              </span>
            </p>
          </header>

          {isCreatingNew && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <section className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <RepoSelector
                    repos={repos}
                    selectedRepoName={selectedRepoName}
                    onSelect={setSelectedRepoName}
                    isLoading={isLoadingRepos}
                  />
                  <BranchSelector
                    branches={branches}
                    selectedBranch={selectedBranch}
                    onSelect={setSelectedBranch}
                    isLoading={isLoadingBranches}
                  />
                </div>
              </section>

              {selectedRepo && selectedBranch && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Selecionar Commits</h2>
                    {commits.length > 0 && (
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {commits.length} commits encontrados
                      </span>
                    )}
                  </div>

                  {isLoadingCommits && !isFetchingNextPage ? (
                    <div className="h-96 border rounded-xl flex flex-col items-center justify-center bg-card/50 space-y-3">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Buscando commits...
                      </p>
                    </div>
                  ) : (
                    <CommitList
                      commits={commits}
                      selectedCommitIds={selectedCommitIds}
                      onToggleCommit={toggleCommit}
                      onToggleAll={toggleAllCommits}
                    />
                  )}

                  {hasNextPage && (
                    <div
                      ref={inViewRef}
                      className="flex items-center justify-center pt-4"
                    >
                      <Button
                        variant="ghost"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Carregar mais"
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      size="lg"
                      onClick={handleGenerateReportClick}
                      disabled={isGenerating || selectedCommitIds.length === 0}
                      className="w-full font-semibold shadow-lg transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Gerar Relatório {selectedCommitIds.length > 0 && `(${selectedCommitIds.length})`}
                        </>
                      )}
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}

          {report && (
            <section ref={reportSectionRef} className="pt-8">
              <ReportDisplay report={report} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}