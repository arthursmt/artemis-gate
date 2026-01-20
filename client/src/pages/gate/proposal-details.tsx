import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Loader2, RefreshCw, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { GateLayout } from "@/components/gate/GateLayout";
import { StageBadge } from "@/components/gate/StageBadge";
import { MemberDetails } from "@/components/gate/MemberDetails";
import { EvidenceGallery } from "@/components/gate/EvidenceGallery";
import { ContractSection } from "@/components/gate/ContractSection";
import { DecisionPanel } from "@/components/gate/DecisionPanel";
import { AuditTrail } from "@/components/gate/AuditTrail";
import { isApiConfigured } from "@/config/api";
import { getProposal, submitDecision, ApiError } from "@/lib/api";
import { extractMembers, extractContract, extractGlobalEvidence, findLeader, formatDate, formatValue } from "@/lib/selectors";
import type { ProposalDetail, Member, DecisionPayload } from "@/types/gate";

interface ProposalDetailsPageProps {
  params: { proposalId: string };
}

export default function ProposalDetailsPage({ params }: ProposalDetailsPageProps) {
  const { proposalId } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: proposal, isLoading, isError, error, refetch } = useQuery<ProposalDetail>({
    queryKey: ["/api/gate/proposals", proposalId],
    queryFn: () => getProposal(proposalId),
    enabled: isApiConfigured() && !!proposalId,
  });

  const members = useMemo(() => {
    return extractMembers(proposal?.payload);
  }, [proposal]);

  const selectedMember = useMemo(() => {
    if (!members.length) return null;
    if (selectedMemberId) {
      return members.find((m) => m.id === selectedMemberId) || members[0];
    }
    return findLeader(members) || members[0];
  }, [members, selectedMemberId]);

  const contract = useMemo(() => {
    return extractContract(proposal?.payload);
  }, [proposal]);

  const globalEvidence = useMemo(() => {
    return extractGlobalEvidence(proposal?.payload);
  }, [proposal]);

  const handleDecisionSubmit = async (payload: DecisionPayload) => {
    setIsSubmitting(true);
    try {
      await submitDecision(proposalId, payload);
      toast({
        title: "Decision Submitted",
        description: `Proposal has been ${payload.decision.toLowerCase()}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gate/proposals"] });
      navigate("/gate/inbox");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({
          title: "Stage Changed",
          description: "The proposal stage has changed. Refreshing...",
          variant: "destructive",
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to submit decision",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.isLeader && !b.isLeader) return -1;
      if (!a.isLeader && b.isLeader) return 1;
      return 0;
    });
  }, [members]);

  return (
    <GateLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/gate/inbox">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inbox
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="button-refresh-proposal"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {!isApiConfigured() && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="py-6">
              <p className="text-amber-800 dark:text-amber-200 text-center">
                API not configured. Please set VITE_API_BASE_URL to load proposal details.
              </p>
            </CardContent>
          </Card>
        )}

        {isApiConfigured() && isLoading && (
          <Card>
            <CardContent className="py-12 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {isApiConfigured() && isError && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-6">
              <p className="text-red-800 dark:text-red-200 text-center">
                {error instanceof Error ? error.message : "Failed to load proposal"}
              </p>
            </CardContent>
          </Card>
        )}

        {isApiConfigured() && !isLoading && !isError && proposal && (
          <>
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold" data-testid="text-proposal-id">
                      {formatValue(proposal.groupId) !== "--" ? `Group: ${proposal.groupId}` : `Proposal: ${proposalId.slice(0, 8)}...`}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(proposal.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {members.length} member{members.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <StageBadge stage={proposal.stage} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3">
                <Card className="h-fit">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium mb-3">Members</h3>
                    {sortedMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No members found</p>
                    ) : (
                      <div className="space-y-1">
                        {sortedMembers.map((member) => (
                          <button
                            key={member.id}
                            onClick={() => setSelectedMemberId(member.id || null)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedMember?.id === member.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                            data-testid={`button-member-${member.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{formatValue(member.name)}</span>
                              {member.isLeader && (
                                <span className="text-xs opacity-75 ml-1">(Leader)</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {selectedMember ? (
                    <MemberDetails member={selectedMember} />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Select a member to view details</p>
                      </CardContent>
                    </Card>
                  )}
                </ScrollArea>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-4 pr-4">
                    {selectedMember?.evidence && Object.keys(selectedMember.evidence).length > 0 ? (
                      <EvidenceGallery evidence={selectedMember.evidence} title="Member Evidence" />
                    ) : Object.keys(globalEvidence).length > 0 ? (
                      <EvidenceGallery evidence={globalEvidence} title="Evidence" />
                    ) : (
                      <Card>
                        <CardContent className="py-6 text-center">
                          <p className="text-sm text-muted-foreground">No evidence available</p>
                        </CardContent>
                      </Card>
                    )}

                    <ContractSection contract={contract} />
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DecisionPanel
                proposalId={proposalId}
                currentStage={proposal.stage}
                onSubmit={handleDecisionSubmit}
                isSubmitting={isSubmitting}
              />
              <AuditTrail decisions={proposal.decisions} />
            </div>
          </>
        )}
      </div>
    </GateLayout>
  );
}
