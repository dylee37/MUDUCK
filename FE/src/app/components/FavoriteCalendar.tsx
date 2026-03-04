import { useState } from "react";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ActorSchedule {
  date: string;
  musical: string;
  venue: string;
}

interface MusicalSchedule {
  date: string;
  event: string;
  description: string;
}

interface FavoriteCalendarProps {
  schedules: ActorSchedule[] | MusicalSchedule[];
  type: "actor" | "musical";
}

export default function FavoriteCalendar({ schedules, type }: FavoriteCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const scheduleDates = schedules.map((s) => new Date(s.date));

  const getSchedulesForDate = (date: Date | undefined) => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.filter((s) => s.date === dateStr);
  };

  const selectedSchedules = getSchedulesForDate(selectedDate);

  const modifiers = {
    scheduled: scheduleDates,
  };

  const modifiersStyles = {
    scheduled: {
      backgroundColor: "rgba(199, 91, 122, 0.3)",
      borderRadius: "50%",
      fontWeight: "bold",
      color: "#c75b7a",
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ko}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-3xl border border-white/40 bg-white/40 p-3"
        />
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm text-foreground px-2">
            {format(selectedDate, "yyyy년 M월 d일", { locale: ko })}
          </h3>
          {selectedSchedules.length > 0 ? (
            <div className="space-y-2">
              {selectedSchedules.map((schedule, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-md"
                >
                  {type === "actor" && "musical" in schedule ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🎭</span>
                        <span className="text-sm text-foreground">{schedule.musical}</span>
                      </div>
                      <div className="text-xs text-muted-foreground pl-6">{schedule.venue}</div>
                    </>
                  ) : "event" in schedule ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">
                          {schedule.event.includes("티켓")
                            ? "🎫"
                            : schedule.event.includes("사인회")
                            ? "✍️"
                            : schedule.event.includes("개막")
                            ? "🎭"
                            : "📅"}
                        </span>
                        <span className="text-sm text-foreground">{schedule.event}</span>
                      </div>
                      <div className="text-xs text-muted-foreground pl-6">
                        {schedule.description}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm bg-white/40 rounded-2xl">
              이 날짜에 일정이 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
