import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar as CalendarIcon, Plus, Star, StarOff, User, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import FavoriteCalendar from "../components/FavoriteCalendar";

const mockActors = [
  { id: 1, name: "박은태", role: "배우", image: "https://i.namu.wiki/be/image.png" },
  { id: 2, name: "옥주현", role: "배우", image: "https://i.namu.wiki/be/image2.png" },
  { id: 3, name: "조승우", role: "배우", image: "" },
  { id: 4, name: "홍광호", role: "배우", image: "" },
  { id: 5, name: "김선영", role: "배우", image: "" },
];

const mockMusicals = [
  { id: 1, name: "레미제라블", emoji: "🎭", schedules: [] },
  { id: 2, name: "엘리자벳", emoji: "👑", schedules: [] },
  { id: 3, name: "지킬앤하이드", emoji: "🧪", schedules: [] },
];

interface Actor {
  id: number;
  name: string;
  image: string;
  schedules: { date: string; musical: string; venue: string }[];
}

interface Musical {
  id: number;
  name: string;
  emoji: string;
  schedules: { date: string; event: string; description: string }[];
}

export default function MyFavorite() {
  const [actors, setActors] = useState<Actor[]>(() => {
    const saved = localStorage.getItem("favoriteActors");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "박은태",
        image: "https://i.namu.wiki/be/image.png",
        schedules: [
          { date: "2024-03-15", musical: "레미제라블", venue: "블루스퀘어" },
          { date: "2024-03-20", musical: "레미제라블", venue: "블루스퀘어" },
        ],
      },
      {
        id: 2,
        name: "옥주현",
        image: "https://i.namu.wiki/be/image2.png",
        schedules: [
          { date: "2024-03-18", musical: "엘리자벳", venue: "샬롯데씨어터" },
        ],
      },
    ];
  });

  const [musicals, setMusicals] = useState<Musical[]>(() => {
    const saved = localStorage.getItem("favoriteMusicals");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "레미제라블",
        emoji: "🎭",
        schedules: [
          { date: "2024-03-10", event: "티켓 오픈", description: "인터파크 티켓" },
          { date: "2024-03-15", event: "개막", description: "블루스퀘어" },
        ],
      },
      {
        id: 2,
        name: "엘리자벳",
        emoji: "👑",
        schedules: [
          { date: "2024-03-25", event: "팬 사인회", description: "샬롯데씨어터" },
        ],
      },
    ];
  });

  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [selectedMusical, setSelectedMusical] = useState<Musical | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<"actor" | "musical">("actor");

  const [searchQuery, setSearchQuery] = useState("");

  const toggleFavoriteActor = (actor: any) => {
    const isFav = actors.some(f => f.id === actor.id);
    let updated;
    if (isFav) {
      updated = actors.filter(f => f.id !== actor.id);
    } else {
      updated = [...actors, { ...actor, schedules: [] }];
    }
    setActors(updated);
    localStorage.setItem("favoriteActors", JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('favoriteUpdate'));
  };

  useEffect(() => {
    // Listen for storage changes from other components
    const handleSync = () => {
      const currentActors = localStorage.getItem("favoriteActors");
      if (currentActors) setActors(JSON.parse(currentActors));

      const currentMusicals = localStorage.getItem("favoriteMusicals");
      if (currentMusicals) setMusicals(JSON.parse(currentMusicals));
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('favoriteUpdate', handleSync);

    // Theme sync
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--secondary", theme.secondary);
      document.documentElement.style.setProperty("--background", theme.bg);
      document.documentElement.style.setProperty("--foreground", theme.foreground);
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('favoriteUpdate', handleSync);
    };
  }, []);

  const toggleFavoriteMusical = (musical: any) => {
    const isFav = musicals.some(f => f.id === musical.id);
    let updated;
    if (isFav) {
      updated = musicals.filter(f => f.id !== musical.id);
    } else {
      updated = [...musicals, { ...musical, schedules: [] }];
    }
    setMusicals(updated);
    localStorage.setItem("favoriteMusicals", JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('favoriteUpdate'));
  };





  const handleActorClick = (actor: Actor) => {
    setSelectedActor(actor);
    setCalendarType("actor");
    setShowCalendar(true);
  };

  const handleMusicalClick = (musical: Musical) => {
    setSelectedMusical(musical);
    setCalendarType("musical");
    setShowCalendar(true);
  };

  return (
    <div className="px-4 py-6">
      <Tabs defaultValue="actors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/60 backdrop-blur-md rounded-full p-1">
          <TabsTrigger value="actors" className="rounded-full">
            My Actor
          </TabsTrigger>
          <TabsTrigger value="musicals" className="rounded-full">
            My Musical
          </TabsTrigger>
        </TabsList>

        {/* My Actor Tab */}
        <TabsContent value="actors" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base text-foreground">즐겨찾는 배우</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
                  <Plus size={16} className="mr-1" />
                  배우 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-xl border-white/40 max-w-[90%] rounded-3xl">
                <DialogHeader>
                  <DialogTitle>배우 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="actor-search" className="mb-2 inline-block">배우 이름 검색</Label>
                    <div className="relative">
                      <Input
                        id="actor-search"
                        placeholder="배우 이름을 입력하세요..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/60 pr-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 py-2">
                    {searchQuery ? (
                      mockActors
                        .filter(a => a.name.includes(searchQuery))
                        .map(actor => {
                          const isFav = actors.some(f => f.id === actor.id);
                          return (
                            <div key={actor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                  {actor.name[0]}
                                </div>
                                <span className="text-sm font-medium">{actor.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant={isFav ? "outline" : "default"}
                                onClick={() => toggleFavoriteActor(actor)}
                                className="rounded-full px-4 h-8 text-xs"
                              >
                                {isFav ? "취소" : "추가"}
                              </Button>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        배우 이름을 입력하여 검색하세요
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {actors.map((actor, index) => (
              <motion.div
                key={actor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleActorClick(actor)}
                className="w-full relative bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteActor(actor);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-sm z-10 transition-all text-yellow-500 hover:scale-110"
                >
                  <Star size={16} fill="currentColor" />
                </button>
                <div className="aspect-[3/4] bg-white rounded-2xl flex items-center justify-center mb-3 overflow-hidden border border-primary/10 shadow-inner relative">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {actor.image ? (
                      <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-primary/30" />
                    )}
                  </div>
                </div>
                <h3 className="text-sm text-foreground text-center">{actor.name}</h3>
              </motion.div>
            ))}
          </div>

          {actors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              즐겨찾는 배우를 추가해보세요! ⭐
            </div>
          )}
        </TabsContent>

        {/* My Musical Tab */}
        <TabsContent value="musicals" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base text-foreground">즐겨찾는 뮤지컬</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
                  <Plus size={16} className="mr-1" />
                  뮤지컬 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-xl border-white/40 max-w-[90%] rounded-3xl">
                <DialogHeader>
                  <DialogTitle>뮤지컬 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="musical-search" className="mb-2 inline-block">뮤지컬 이름 검색</Label>
                    <div className="relative">
                      <Input
                        id="musical-search"
                        placeholder="뮤지컬 이름을 입력하세요..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/60 pr-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 py-2">
                    {searchQuery ? (
                      mockMusicals
                        .filter(m => m.name.includes(searchQuery))
                        .map(musical => {
                          const isFav = musicals.some(f => f.id === musical.id);
                          return (
                            <div key={musical.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                  {musical.emoji}
                                </div>
                                <span className="text-sm font-medium">{musical.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant={isFav ? "outline" : "default"}
                                onClick={() => toggleFavoriteMusical(musical)}
                                className="rounded-full px-4 h-8 text-xs"
                              >
                                {isFav ? "취소" : "추가"}
                              </Button>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        뮤지컬 이름을 입력하여 검색하세요
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {musicals.map((musical, index) => (
              <motion.div
                key={musical.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleMusicalClick(musical)}
                className="w-full relative bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteMusical(musical);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-sm z-10 transition-all text-yellow-500 hover:scale-110"
                >
                  <Star size={16} fill="currentColor" />
                </button>
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-3">
                  <span className="text-4xl">{musical.emoji}</span>
                </div>
                <h3 className="text-sm text-foreground text-center">{musical.name}</h3>
              </motion.div>
            ))}
          </div>

          {musicals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              즐겨찾는 뮤지컬을 추가해보세요! 🎭
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Calendar Modal */}
      {
        showCalendar && (
          <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
            <DialogContent className="bg-white/95 backdrop-blur-xl border-white/40 max-w-[95%] max-h-[80vh] rounded-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {calendarType === "actor" ? selectedActor?.name : selectedMusical?.name} 일정
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <FavoriteCalendar
                  schedules={
                    calendarType === "actor"
                      ? selectedActor?.schedules || []
                      : selectedMusical?.schedules || []
                  }
                  type={calendarType}
                />
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div >
  );
}
