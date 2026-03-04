import { useRef, useState } from "react";
import MusicalDetail from "./MusicalDetail";

interface Musical {
  id: number;
  title: string;
  period: string;
  venue: string;
  image: string;
}

interface MusicalCarouselProps {
  musicals: Musical[];
}

export default function MusicalCarousel({ musicals }: MusicalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMusical, setSelectedMusical] = useState<Musical | null>(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {musicals.map((musical) => (
          <div
            key={musical.id}
            onClick={() => setSelectedMusical(musical)}
            className="flex-shrink-0 w-52 bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="text-7xl">{musical.image}</span>
            </div>
            <h3 className="text-base font-bold text-foreground mb-1 truncate">
              {musical.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-1">{musical.period}</p>
            <p className="text-xs text-muted-foreground truncate">{musical.venue}</p>
          </div>
        ))}
      </div>

      <MusicalDetail
        isOpen={!!selectedMusical}
        onClose={() => setSelectedMusical(null)}
        musical={selectedMusical || { id: 0, title: "", period: "", venue: "", image: "" }}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
