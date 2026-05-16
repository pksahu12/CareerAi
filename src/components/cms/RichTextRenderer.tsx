"use client";

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import type { Options } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";
import Image from "next/image";

const options: Options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields as {
        file: { url: string; details: { image?: { width: number; height: number } } };
        title: string;
        description?: string;
      };
      const url = `https:${file.url}?fm=webp&w=1200`;
      const { width = 1200, height = 630 } = file.details.image ?? {};
      return (
        <figure className="my-8">
          <Image
            src={url}
            alt={description || title || ""}
            width={width}
            height={height}
            className="rounded-lg w-full"
          />
          {description && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {description}
            </figcaption>
          )}
        </figure>
      );
    },

    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri as string}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4 hover:text-primary/80"
      >
        {children}
      </a>
    ),

    [BLOCKS.HEADING_1]: (_node, children) => (
      <h1 className="text-4xl font-bold tracking-tight mt-10 mb-4">
        {children}
      </h1>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="text-3xl font-semibold tracking-tight mt-8 mb-3">
        {children}
      </h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="text-2xl font-semibold mt-6 mb-2">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node, children) => (
      <h4 className="text-xl font-semibold mt-4 mb-2">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (_node, children) => (
      <h5 className="text-lg font-medium mt-4 mb-1">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (_node, children) => (
      <h6 className="text-base font-medium mt-4 mb-1">{children}</h6>
    ),

    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>
    ),

    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="my-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),

    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="my-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),

    [BLOCKS.HR]: () => <hr className="my-8 border-border" />,

    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
    ),
  },
  renderMark: {
    [MARKS.CODE]: (text) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
        {text}
      </code>
    ),
    [MARKS.BOLD]: (text) => (
      <strong className="font-semibold">{text}</strong>
    ),
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
};

interface RichTextRendererProps {
  document: Document;
  className?: string;
}

export function RichTextRenderer({
  document,
  className,
}: RichTextRendererProps) {
  return (
    <div className={className}>
      {documentToReactComponents(document, options)}
    </div>
  );
}
