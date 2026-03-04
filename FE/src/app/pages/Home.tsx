import { useEffect, useState } from "react";
import { motion } from "motion/react";
import MusicalCarousel from "../components/MusicalCarousel";
import QuoteCard from "../components/QuoteCard";

const mockCurrentMusicals = [
  {
    id: 1,
    title: "레미제라블",
    period: "2024.03 - 2024.06",
    venue: "블루스퀘어",
    image: "🎭",
  },
  {
    id: 2,
    title: "엘리자벳",
    period: "2024.05 - 2024.08",
    venue: "샤롯데씨어터",
    image: "👑",
  },
  {
    id: 3,
    title: "킹키부츠",
    period: "2024.04 - 2024.07",
    venue: "디큐브아트센터",
    image: "👢",
  },
  {
    id: 4,
    title: "시카고",
    period: "2024.06 - 2024.09",
    venue: "샤롯데씨어터",
    image: "💃",
  },
];

const mockUpcomingMusicals = [
  {
    id: 5,
    title: "위키드",
    period: "2024.07 - 2024.10",
    venue: "블루스퀘어",
    image: "🧙‍♀️",
  },
  {
    id: 6,
    title: "맘마미아",
    period: "2024.08 - 2024.11",
    venue: "예술의전당",
    image: "🎵",
  },
  {
    id: 7,
    title: "오페라의 유령",
    period: "2024.09 - 2024.12",
    venue: "블루스퀘어",
    image: "🎭",
  },
];

const quotes = [
  { text: "To love another person is to see the face of God.", musical: "레미제라블" },
  { text: "Defying gravity", musical: "위키드" },
  { text: "Memory, all alone in the moonlight", musical: "캣츠" },
  { text: "Don't cry for me Argentina", musical: "에비타" },
  { text: "The sun will come out tomorrow", musical: "애니" },
];

const mockTicketingData = [
  {
    id: 1,
    title: "헤드윅",
    date: "2026-03-20",
    time: "14:00",
    sites: [
      { name: "인터파크", url: "https://tickets.interpark.com/" },
      { name: "YES24", url: "http://ticket.yes24.com/" }
    ],
    image: "🎸",
  },
  {
    id: 2,
    title: "시카고",
    date: "2026-03-25",
    time: "11:00",
    sites: [
      { name: "인터파크", url: "https://tickets.interpark.com/" },
      { name: "티켓링크", url: "http://www.ticketlink.co.kr/" }
    ],
    image: "💃",
  },
  {
    id: 3,
    title: "지킬앤하이드",
    date: "2026-03-18",
    time: "10:00",
    sites: [
      { name: "인터파크", url: "https://tickets.interpark.com/" }
    ],
    image: "🧪",
  },
];

export default function Home() {
  const [todayQuote, setTodayQuote] = useState(quotes[0]);
  const [upcomingTicketing, setUpcomingTicketing] = useState<typeof mockTicketingData>([]);

  useEffect(() => {
    // Select random quote for today
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setTodayQuote(quotes[randomIndex]);

    // Process ticketing data
    const now = new Date();
    const sortedAndFiltered = mockTicketingData
      .filter(item => {
        const ticketDate = new Date(`${item.date}T${item.time}`);
        return ticketDate > now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        return dateA - dateB;
      });
    setUpcomingTicketing(sortedAndFiltered);
  }, []);

  return (
    <div className="px-4 py-6 space-y-8 pb-10">
      {/* Today's Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <QuoteCard quote={todayQuote} />
      </motion.div>

      {/* Ticketing D-Day */}
      {upcomingTicketing.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base font-bold text-foreground">티켓팅 D-Day</h2>
            <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">UPCOMING</span>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {upcomingTicketing.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-52 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-md rounded-3xl p-5 border border-primary/20 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 text-4xl">
                  {item.image}
                </div>
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-primary bg-white/80 px-2 py-1 rounded-lg shadow-sm">
                    {Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일 남음
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 truncate">{item.title}</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-primary/70">DATE</span>
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-primary/70">TIME</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.sites.map(site => (
                      <a
                        key={site.name}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm hover:bg-primary/20 transition-colors cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {site.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Current Musicals */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-base font-bold mb-4 text-foreground px-1">현재 공연 중</h2>
        <MusicalCarousel musicals={mockCurrentMusicals} />
      </motion.section>

      {/* Upcoming Musicals */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-base font-bold mb-4 text-foreground px-1">개막 예정</h2>
        <MusicalCarousel musicals={mockUpcomingMusicals} />
      </motion.section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
