import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface QuoteCardProps {
  quote: {
    text: string;
    musical: string;
  };
}

export default function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="relative bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-primary" />
          <span className="text-xs text-primary">오늘의 대사</span>
        </div>

        <blockquote className="text-base text-foreground mb-3 leading-relaxed">
          "{quote.text}"
        </blockquote>

        <div className="flex items-center gap-2">
          <span className="text-lg">🎭</span>
          <span className="text-xs text-muted-foreground">- {quote.musical}</span>
        </div>
      </div>
    </motion.div>
  );
}
