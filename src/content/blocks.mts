/**
 * The Blocks a Case Study can hold, defined once.
 *
 * TinaCMS shows these as the "insert" choices in a Case Study's editor, and the
 * content loader parses Case Studies against the same list, so a Block can't
 * exist in one and not the other. Plain data only: Node runs the loader
 * directly, and Tina bundles its config, so this file imports nothing.
 */
export const blockTemplates = [
  {
    name: "Figure",
    label: "Figure",
    fields: [
      { name: "src", label: "Image", type: "image", required: true },
      {
        name: "alt",
        label: "Alt text",
        type: "string",
        required: true,
        description: "What the image shows, for people who can't see it.",
      },
      { name: "caption", label: "Caption", type: "string" },
    ],
  },
  {
    name: "Callout",
    label: "Callout",
    fields: [
      {
        name: "tone",
        label: "Tone",
        type: "string",
        options: ["note", "key"],
        description: "A note is an aside; key marks a decision or lesson.",
      },
      {
        name: "text",
        label: "Text",
        type: "string",
        required: true,
        ui: { component: "textarea" },
      },
    ],
  },
  {
    name: "Gallery",
    label: "Gallery",
    fields: [
      {
        name: "images",
        label: "Images",
        type: "object",
        list: true,
        description: "Two to six images.",
        fields: [
          { name: "src", label: "Image", type: "image", required: true },
          { name: "alt", label: "Alt text", type: "string", required: true },
        ],
      },
      { name: "caption", label: "Caption", type: "string" },
    ],
  },
] as const;

/** A Case Study's rich-text field, as Tina defines it and the loader parses it. */
export const caseStudyField = {
  name: "body",
  label: "Case Study",
  type: "rich-text",
  isBody: true,
  parser: { type: "mdx" },
  templates: blockTemplates,
} as const;
