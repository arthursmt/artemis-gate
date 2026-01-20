import { useState } from "react";
import { Image, ExternalLink, ImageOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EVIDENCE_KEYS } from "@/types/gate";
import { analyzeImageUrl } from "@/lib/imageUtils";

interface EvidenceGalleryProps {
  evidence: Record<string, string>;
  title?: string;
}

const evidenceLabels: Record<string, string> = {
  clientSelfie: "Client Selfie",
  idFront: "ID Front",
  idBack: "ID Back",
  businessProofOfAddress: "Business Address Proof",
  businessPhoto: "Business Photo",
};

function getLabel(key: string): string {
  return evidenceLabels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function EvidenceGallery({ evidence, title = "Evidence" }: EvidenceGalleryProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxLabel, setLightboxLabel] = useState<string>("");

  const allKeys = new Set([...EVIDENCE_KEYS, ...Object.keys(evidence)]);
  const evidenceEntries = Array.from(allKeys).map((key) => {
    const rawUrl = evidence[key];
    const imageInfo = analyzeImageUrl(rawUrl);
    return {
      key,
      rawUrl,
      imageInfo,
      label: getLabel(key),
    };
  });

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
            <Image className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {evidenceEntries.map(({ key, imageInfo, label }) => (
              <div
                key={key}
                className="aspect-square rounded-md border bg-muted overflow-hidden relative group"
                data-testid={`evidence-${key}`}
              >
                {imageInfo.canRender && imageInfo.url ? (
                  <>
                    <img
                      src={imageInfo.url}
                      alt={label}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openLightbox(imageInfo.url!, label)}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                      <span className="text-xs text-muted-foreground text-center px-1">Failed to load</span>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openLightbox(imageInfo.url!, label)}
                        data-testid={`button-view-${key}`}
                      >
                        View
                      </Button>
                    </div>
                  </>
                ) : imageInfo.isLargeBase64 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-muted">
                    <ImageOff className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      Embedded image (base64)
                    </span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      Preview disabled
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground text-center px-1">
                      {label}
                      <br />
                      Missing
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                  <span className="text-xs text-white truncate block">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!lightboxUrl} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {lightboxLabel}
              {lightboxUrl && (
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  data-testid="link-external-evidence"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {lightboxUrl && (
            <div className="relative">
              <img
                src={lightboxUrl}
                alt={lightboxLabel}
                className="w-full h-auto max-h-[70vh] object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
