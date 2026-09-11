"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMru } from "@/lib/format";
import type { CategorySlice } from "@/core/actions/admin/overview";

/** Palette catégorielle validée (skill dataviz) — voir ../../../../DESIGN_SYSTEM.md. Au-delà de 4 catégories, regrouper sous "Autre" plutôt qu'ajouter une teinte. */
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function ExpensesBreakdownChart({ data }: { data: CategorySlice[] }) {
  const height = Math.max(160, data.length * 48);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dépenses par catégorie</CardTitle>
        <p className="text-sm text-muted-foreground">Mois en cours.</p>
      </CardHeader>
      <CardContent style={{ height }}>
        {data.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Aucune dépense ce mois-ci.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fill: "var(--foreground)", fontSize: 13 }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--foreground)" }}
                formatter={(value) => [formatMru(Number(value)), "Montant"] as [string, string]}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {data.map((entry, i) => (
                  <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
                ))}
                <LabelList
                  dataKey="amount"
                  position="right"
                  formatter={(v) => formatMru(Number(v))}
                  style={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
