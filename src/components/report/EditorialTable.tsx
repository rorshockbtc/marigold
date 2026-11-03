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
 * - Minimum 12pt (1rem / 16px) readable typography throughout.
 * - md+ : native <table> inside a scroll frame with an opaque sticky header and whitespace-nowrap headers.
 * - <md : stacked hairline list so phones never scroll a wide table sideways.
 */
export function EditorialTable<T>({
  columns,
  rows,
  rowKey,
  maxHeight = 520,
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
        <figcaption className="mb-3 font-mono text-base font-bold uppercase tracking-[0.08em] text-[#5A534A]">
          {caption}
        </figcaption>
      )}

      {/* Desktop / tablet */}
      <div
        className="hidden md:block overflow-auto border-y-2 border-[#111111] bg-white"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse text-left text-base">
          <thead className="sticky top-0 z-10 bg-[#111111] text-white">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-4 py-3.5 font-mono text-base font-bold uppercase tracking-wider whitespace-nowrap ${
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
                    className={`px-4 py-3 align-top text-base ${
                      c.align === "right" ? "text-right tabular-nums whitespace-nowrap" : ""
                    } ${c.mono ? "font-mono text-base" : ""} ${
                      c.focus
                        ? "font-bold text-[#C2341B]"
                        : ci === 0
                        ? "font-semibold text-[#111111]"
                        : "text-[#2C2825]"
                    }`}
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
          <li key={rowKey(row, i)} className="px-2 py-4">
            <div className="text-lg font-semibold leading-snug text-[#111111]">
              {cell(first, row)}
            </div>
            <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {rest.map((c) => (
                <div key={c.key} className="min-w-0 flex items-baseline justify-between gap-2 sm:block">
                  <dt className="font-mono text-base font-semibold text-[#5A534A] whitespace-nowrap">
                    {c.label}
                  </dt>
                  <dd
                    className={`text-base tabular-nums ${
                      c.focus ? "font-bold text-[#C2341B]" : "text-[#2C2825]"
                    }`}
                  >
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
