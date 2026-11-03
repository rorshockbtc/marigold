import React from "react";

export interface EditorialColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  /** Highlights the value with the single focal color. */
  focus?: boolean;
  mono?: boolean;
  render?: (row: T) => React.ReactNode;
}

/**
 * Accént-style data table.
 * - md+ : native <table> inside a scroll frame with an opaque sticky header.
 * - <md : stacked hairline list so phones never scroll a wide table sideways.
 */
export function EditorialTable<T>({
  columns,
  rows,
  rowKey,
  maxHeight = 440,
  caption,
}: {
  columns: EditorialColumn<T>[];
  rows: T[];
  rowKey: (row: T, i: number) => string;
  maxHeight?: number;
  caption?: string;
}) {
  const cell = (col: EditorialColumn<T>, row: T) =>
    col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "");
  const [first, ...rest] = columns;

  return (
    <figure className="m-0">
      {caption && (
        <figcaption className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#5A534A]">
          {caption}
        </figcaption>
      )}

      {/* Desktop / tablet */}
      <div
        className="hidden md:block overflow-auto border-y-2 border-[#111111] bg-white"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="sticky top-0 z-10 bg-[#111111] text-white">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    c.align === "right" ? "text-right" : ""
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4DED3]">
            {rows.map((row, i) => (
              <tr key={rowKey(row, i)} className="hover:bg-[#F7F4EE]">
                {columns.map((c, ci) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2.5 align-top ${c.align === "right" ? "text-right tabular-nums" : ""} ${
                      c.mono ? "font-mono text-[12px]" : ""
                    } ${c.focus ? "font-bold text-[#C2341B]" : ci === 0 ? "font-semibold text-[#111111]" : "text-[#2C2825]"}`}
                  >
                    {cell(c, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: stacked list */}
      <ol
        className="md:hidden overflow-auto border-y-2 border-[#111111] divide-y divide-[#E4DED3] bg-white"
        style={{ maxHeight }}
      >
        {rows.map((row, i) => (
          <li key={rowKey(row, i)} className="px-1 py-3">
            <div className="text-[15px] font-semibold leading-snug text-[#111111]">{cell(first, row)}</div>
            <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
              {rest.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-[#6E675F]">{c.label}</dt>
                  <dd className={`text-[13px] tabular-nums ${c.focus ? "font-bold text-[#C2341B]" : "text-[#2C2825]"}`}>
                    {cell(c, row)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
    </figure>
  );
}
