import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { listCollections } from "@/core/actions/admin/collections";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const STATUS_DOT: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  PROGRESS: "bg-amber-500",
  COMPLETE: "bg-emerald-500",
};

function parseMonth(month?: string): { year: number; m: number } {
  const now = new Date();
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, mm] = month.split("-").map(Number);
    return { year: y, m: mm - 1 };
  }
  return { year: now.getFullYear(), m: now.getMonth() };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { year, m } = parseMonth(month);

  const first = new Date(year, m, 1);
  const last = new Date(year, m + 1, 0);
  const from = `${year}-${pad(m + 1)}-01`;
  const to = `${year}-${pad(m + 1)}-${pad(last.getDate())}`;

  const collections = await listCollections({ from, to });
  const byDay = new Map<string, typeof collections>();
  for (const c of collections) {
    if (!c.scheduled_date) continue;
    const key = c.scheduled_date.slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(c);
    byDay.set(key, arr);
  }

  // Grille : commence au lundi de la semaine du 1er.
  const startOffset = (first.getDay() + 6) % 7; // 0=lundi
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = new Date(year, m - 1, 1);
  const next = new Date(year, m + 1, 1);
  const label = first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Calendrier" description="Vue mensuelle des collectes planifiées." />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium capitalize">{label}</h3>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon" aria-label="Mois précédent">
            <Link href={`/admin/calendar?month=${prev.getFullYear()}-${pad(prev.getMonth() + 1)}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/calendar">Aujourd&apos;hui</Link>
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="Mois suivant">
            <Link href={`/admin/calendar?month=${next.getFullYear()}-${pad(next.getMonth() + 1)}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const key = d ? `${year}-${pad(m + 1)}-${pad(d)}` : null;
            const dayCollections = key ? byDay.get(key) ?? [] : [];
            const isToday = key === todayKey;
            return (
              <div
                key={i}
                className={cn(
                  "min-h-24 border-b border-r p-1.5 text-sm",
                  !d && "bg-muted/20",
                  (i + 1) % 7 === 0 && "border-r-0",
                )}
              >
                {d && (
                  <>
                    <div className={cn("mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs", isToday && "bg-primary text-primary-foreground font-semibold")}>
                      {d}
                    </div>
                    <div className="space-y-1">
                      {dayCollections.map((c) => (
                        <Link
                          key={c.id}
                          href={`/admin/collections/${c.id}`}
                          className="flex items-center gap-1 truncate rounded bg-accent px-1.5 py-0.5 text-xs hover:bg-accent/70"
                          title={c.title}
                        >
                          <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[c.status ?? ""] ?? "bg-muted-foreground")} />
                          <span className="truncate">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
