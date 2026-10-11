/**
 * How each Case Study Block renders, for visitors and inside the editor alike.
 * Fields match src/content/blocks.mts; the content loader has already checked
 * the rules (alt text, Gallery size), so these only lay the Block out.
 *
 * Images are plain <img>: Case Study images come in any size, the static export
 * can't optimise them, and the loader keeps each under 500 KB.
 */
type Image = { src?: string; alt?: string };

export function Figure({ src, alt, caption }: Image & { caption?: string }) {
  if (!src) return null;
  return (
    <figure className="case-study-figure">
      {/* eslint-disable-next-line @next/next/no-img-element -- see the note above */}
      <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function Callout({ tone, text }: { tone?: "note" | "key"; text?: string }) {
  if (!text) return null;
  const label = tone === "key" ? "Key point" : "Note";
  return (
    <aside className="case-study-callout" data-tone={tone ?? "note"} aria-label={label}>
      <p className="label">{label}</p>
      <p>{text}</p>
    </aside>
  );
}

export function Gallery({ images, caption }: { images?: Image[]; caption?: string }) {
  const shown = (images ?? []).filter((image) => image.src);
  if (shown.length === 0) return null;
  return (
    <figure className="case-study-gallery">
      <ul>
        {shown.map((image, index) => (
          <li key={`${index}-${image.src}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- see the note above */}
            <img src={image.src} alt={image.alt ?? ""} loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

/** The Block components, keyed by Block name, for TinaMarkdown. */
export const blockComponents = {
  Figure: (props: Record<string, unknown>) => <Figure {...(props as Parameters<typeof Figure>[0])} />,
  Callout: (props: Record<string, unknown>) => <Callout {...(props as Parameters<typeof Callout>[0])} />,
  Gallery: (props: Record<string, unknown>) => <Gallery {...(props as Parameters<typeof Gallery>[0])} />,
};
