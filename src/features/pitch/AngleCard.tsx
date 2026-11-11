import { IconCheck, IconTarget, IconBookmark } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PitchAngle } from "@/types/content";

interface AngleCardProps {
  angle: PitchAngle;
  isSelected: boolean;
  onSelect: () => void;
}

export function AngleCard({ angle, isSelected, onSelect }: AngleCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer transition-all border ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40"
          : "border-border hover:border-primary/40 bg-card"
      }`}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Badge
                variant={isSelected ? "default" : "outline"}
                className="text-[10px] font-mono tracking-wider uppercase"
              >
                {angle.recommendedFormat}
              </Badge>
              {isSelected && (
                <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <IconCheck className="size-3" />
                  Active Pitch
                </span>
              )}
            </div>
            <IconBookmark className={`size-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
            {angle.title}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-2">
            "{angle.hook}"
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <IconTarget className="size-3.5 text-primary shrink-0" />
            <span className="truncate">Audience: <strong className="text-foreground">{angle.targetAudience}</strong></span>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Core Pillars & Arguments
            </div>
            <ul className="space-y-0.5">
              {angle.keyArguments.map((arg, idx) => (
                <li key={idx} className="text-xs text-foreground/90 flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full text-xs h-8 mt-1 cursor-pointer font-medium"
        >
          {isSelected ? (
            <>
              <IconCheck className="size-3.5 mr-1" />
              Selected for Drafting
            </>
          ) : (
            "Select This Editorial Angle"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
