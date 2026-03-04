import { Search, Star, StarOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import BirdLogo from "./BirdLogo";
import MusicalDetail from "./MusicalDetail";

const mockActors = [
  { id: 1, name: "박은태", role: "배우", image: "https://i.namu.wiki/be/image.png" },
  { id: 2, name: "옥주현", role: "배우", image: "https://i.namu.wiki/be/image2.png" },
  { id: 3, name: "조승우", role: "배우", image: "" },
  { id: 4, name: "홍광호", role: "배우", image: "" },
  { id: 5, name: "김선영", role: "배우", image: "" },
];

const mockMusicals = [
  { id: 1, type: "musical", name: "레미제라블", period: "2024.03 - 2024.06", venue: "블루스퀘어", image: "🎭" },
  { id: 2, type: "musical", name: "엘리자벳", period: "2024.05 - 2024.08", venue: "샤롯데씨어터", image: "👑" },
  { id: 3, type: "musical", name: "지킬앤하이드", period: "2024.09 - 2024.12", venue: "샤롯데씨어터", image: "🧪" },
];

export default function TopNav() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"musical" | "actor" | null>(null);
  const [selectedMusical, setSelectedMusical] = useState<any>(null);
  const [musicalFavorites, setMusicalFavorites] = useState<number[]>([]);
  const [actorFavorites, setActorFavorites] = useState<number[]>([]);

  const syncFavorites = () => {
    const actorsSaved = localStorage.getItem("favoriteActors");
    if (actorsSaved) {
      const parsed = JSON.parse(actorsSaved);
      setActorFavorites(parsed.map((a: any) => a.id));
    } else {
      setActorFavorites([]);
    }

    const musicalsSaved = localStorage.getItem("favoriteMusicals");
    if (musicalsSaved) {
      const parsed = JSON.parse(musicalsSaved);
      setMusicalFavorites(parsed.map((m: any) => m.id));
    } else {
      setMusicalFavorites([]);
    }
  };

  useEffect(() => {
    syncFavorites();

    const handleSync = () => syncFavorites();
    window.addEventListener('storage', handleSync);
    window.addEventListener('favoriteUpdate', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('favoriteUpdate', handleSync);
    };
  }, [showSearch]);

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchType(null);
  };

  const toggleFavoriteActor = (actor: any) => {
    const saved = localStorage.getItem("favoriteActors") || "[]";
    let currentFavs = JSON.parse(saved);
    const isFav = currentFavs.some((f: any) => f.id === actor.id);

    if (isFav) {
      currentFavs = currentFavs.filter((f: any) => f.id !== actor.id);
    } else {
      currentFavs.push({ ...actor, schedules: [] });
    }

    localStorage.setItem("favoriteActors", JSON.stringify(currentFavs));
    setActorFavorites(currentFavs.map((f: any) => f.id));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('favoriteUpdate'));
  };

  const toggleFavoriteMusical = (musical: any) => {
    const saved = localStorage.getItem("favoriteMusicals") || "[]";
    let currentFavs = JSON.parse(saved);
    const isFav = currentFavs.some((f: any) => f.id === musical.id);

    if (isFav) {
      currentFavs = currentFavs.filter((f: any) => f.id !== musical.id);
    } else {
      currentFavs.push({ ...musical, schedules: [] });
    }

    localStorage.setItem("favoriteMusicals", JSON.stringify(currentFavs));
    setMusicalFavorites(currentFavs.map((f: any) => f.id));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('favoriteUpdate'));
  };

  return (
    <>
      {/* Fixed Top Navigation */}
      <header className="fixed top-0 left-0 right-0 max-w-5xl mx-auto bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <BirdLogo />
            <h1 className="text-xl font-bold tracking-tight text-primary">MUDUCK</h1>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <Search size={20} className="text-primary" />
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-4 px-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl border border-white/30 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-primary/20">
              <Search size={18} className="text-primary" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="배우 또는 뮤지컬 검색..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleSearchClose}
                className="p-1 hover:bg-primary/10 rounded-full transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Search Type Buttons */}
            <div className="flex gap-2 p-4 shrink-0">
              <button
                onClick={() => setSearchType("musical")}
                className={`flex-1 rounded-full py-2 px-3 text-sm font-medium transition-all ${searchType === "musical"
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white/40 border border-primary/30 text-primary hover:bg-primary/10"
                  }`}
              >
                전체 뮤지컬 조회
              </button>
              <button
                onClick={() => setSearchType("actor")}
                className={`flex-1 rounded-full py-2 px-3 text-sm font-medium transition-all ${searchType === "actor"
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white/40 border border-primary/30 text-primary hover:bg-primary/10"
                  }`}
              >
                전체 배우 조회
              </button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(searchQuery || searchType) ? (
                <>
                  {[...mockMusicals.map(m => ({ ...m, type: "musical" })), ...mockActors.map(a => ({ ...a, type: "actor" }))]
                    .filter((item) => !searchType || item.type === searchType)
                    .filter((item) =>
                      !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item, index) => {
                      const isActor = item.type === "actor";
                      const isFavorite = isActor
                        ? actorFavorites.includes(item.id)
                        : musicalFavorites.includes(item.id);

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (!isActor) {
                              setSelectedMusical(item);
                            }
                          }}
                          className="p-3 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {isActor ? "👤" : (item as any).image}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-foreground">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {isActor ? (item as any).role : (item as any).period}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isActor) {
                                toggleFavoriteActor(item);
                              } else {
                                toggleFavoriteMusical(item);
                              }
                            }}
                            className={`p-2 rounded-full transition-all ${isFavorite
                              ? "text-yellow-400 bg-yellow-50"
                              : "text-muted-foreground/30 hover:text-yellow-400 hover:bg-yellow-50"
                              }`}
                          >
                            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                          </button>
                        </div>
                      );
                    })}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  검색어를 입력하거나 카테고리를 선택하세요
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MusicalDetail
        isOpen={!!selectedMusical}
        onClose={() => setSelectedMusical(null)}
        musical={selectedMusical || { title: "", period: "", venue: "", image: "" }}
      />
    </>
  );
}
