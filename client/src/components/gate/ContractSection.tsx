import { useState } from "react";
import { FileSignature, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Contract, ContractSignature } from "@/types/gate";
import { formatDate, formatValue } from "@/lib/selectors";

interface ContractSectionProps {
  contract: Contract | undefined;
}

export function ContractSection({ contract }: ContractSectionProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxLabel, setLightboxLabel] = useState<string>("");

  if (!contract) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No contract information available</p>
        </CardContent>
      </Card>
    );
  }

  const openLightbox = (url: string, label: string) => {
    setLightboxUrl(url);
    setLightboxLabel(label);
  };

  const closeLightbox = () => {
    setLightboxUrl(null);
    setLightboxLabel("");
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Contract
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Contract ID</span>
            <span className="font-mono">{formatValue(contract.contractId)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Created At</span>
            <span>{formatDate(contract.createdAt)}</span>
          </div>

          {contract.signatures && contract.signatures.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Signatures ({contract.signatures.length})</h4>
              <div className="space-y-2">
                {contract.signatures.map((sig, idx) => (
                  <SignatureRow
                    key={sig.memberId || idx}
                    signature={sig}
                    onViewSignature={(url) => openLightbox(url, `${sig.name || "Member"}'s Signature`)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!lightboxUrl} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {lightboxLabel}
              {lightboxUrl && (
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  data-testid="link-external-signature"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {lightboxUrl && (
            <div className="bg-white rounded-md p-4">
              <img
                src={lightboxUrl}
                alt={lightboxLabel}
                className="w-full h-auto max-h-[50vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface SignatureRowProps {
  signature: ContractSignature;
  onViewSignature: (url: string) => void;
}

function SignatureRow({ signature, onViewSignature }: SignatureRowProps) {
  const isSigned = !!signature.signedAt;

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50" data-testid={`signature-${signature.memberId || signature.name}`}>
      <div className="flex items-center gap-2">
        {isSigned ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Clock className="h-4 w-4 text-amber-500" />
        )}
        <div>
          <span className="text-sm font-medium">{formatValue(signature.name)}</span>
          {isSigned && (
            <span className="text-xs text-muted-foreground ml-2">
              {formatDate(signature.signedAt)}
            </span>
          )}
        </div>
      </div>
      {signature.signatureUrl && (
        <button
          onClick={() => onViewSignature(signature.signatureUrl!)}
          className="w-16 h-8 border rounded bg-white overflow-hidden hover:ring-2 ring-primary transition-all"
          data-testid={`button-view-signature-${signature.memberId || signature.name || "unknown"}`}
        >
          <img
            src={signature.signatureUrl}
            alt="Signature preview"
            className="w-full h-full object-contain"
          />
        </button>
      )}
    </div>
  );
}
