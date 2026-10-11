"use client";

import * as React from "react";
import { useEditState, useTina } from "tinacms/dist/react";
import { tinaField } from "tinacms/dist/tina-field";

import type { Profile, Role, StackGroup } from "@/content/load.mts";

/**
 * Live Profile, Roles and Stack Groups for click-to-edit, without turning whole
 * sections into client components.
 *
 * Visitors get the build's Content straight back from `useTina`. Inside the
 * editor, Tina swaps in live data and `edit` turns on, so the small islands
 * below update as the owner types and mark themselves click-to-edit. Fields
 * the queries select must exist in tina/config.ts.
 */
export const PROFILE_QUERY = `query Profile {
  profile(relativePath: "profile.yml") {
    name shortName handle role focus location timezone available availableLabel
    email phone siteUrl resumeUrl coverLetterUrl tagline
    stats { value label } bio capabilities now principles { title body }
  }
}`;

export const ROLES_QUERY = `query Roles {
  roles(relativePath: "roles.yml") {
    roles { title company location period summary points stack current }
  }
}`;

export const STACK_QUERY = `query Stack {
  stack(relativePath: "stack.yml") { groups { title note items } }
}`;

/** Shared so `useTina` sees the same variables on every render. */
const NO_VARIABLES = {};

type Live = {
  profile: Profile;
  roles: Role[];
  stackGroups: StackGroup[];
  /** True only inside the editor. */
  edit: boolean;
};

const LiveContext = React.createContext<Live | null>(null);

export function LiveContentProvider({
  profile,
  roles,
  stackGroups,
  children,
}: {
  profile: Profile;
  roles: Role[];
  stackGroups: StackGroup[];
  children: React.ReactNode;
}) {
  // useTina treats new `data` as new Content and re-renders, so each initial
  // shape is built once; building it inline would loop forever.
  const [initial] = React.useState(() => ({
    profile: { profile },
    roles: { roles: { roles } },
    stack: { stack: { groups: stackGroups } },
  }));
  const profileData = useTina({ query: PROFILE_QUERY, variables: NO_VARIABLES, data: initial.profile }).data;
  const rolesData = useTina({ query: ROLES_QUERY, variables: NO_VARIABLES, data: initial.roles }).data;
  const stackData = useTina({ query: STACK_QUERY, variables: NO_VARIABLES, data: initial.stack }).data;
  const { edit } = useEditState();

  const value = React.useMemo(
    () => ({
      profile: profileData.profile,
      roles: rolesData.roles.roles ?? [],
      stackGroups: stackData.stack.groups ?? [],
      edit,
    }),
    [profileData, rolesData, stackData, edit]
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive(): Live {
  const live = React.useContext(LiveContext);
  if (!live) throw new Error("useLive needs <LiveContentProvider> above it");
  return live;
}

/** `data-tina-field` for a field while editing; nothing for visitors. */
export function field(
  edit: boolean,
  object: unknown,
  property: string,
  index?: number
): string | undefined {
  if (!edit) return undefined;
  return tinaField(object as Parameters<typeof tinaField>[0], property as never, index) || undefined;
}

type ProfileKey = keyof Profile;

/**
 * One piece of Profile text, live and click-to-edit inside the editor. Points
 * at a field (`tagline`), an item of a list (`now`, index 2), or a field of a
 * list item (`stats`, index 0, `value`).
 */
export function LiveText({
  name,
  index,
  sub,
  lower,
}: {
  name: ProfileKey;
  index?: number;
  sub?: string;
  lower?: boolean;
}) {
  const { profile, edit } = useLive();
  const own = profile[name] as unknown;

  let value: unknown;
  let marker: string | undefined;
  if (sub !== undefined && index !== undefined) {
    const item = (own as Record<string, unknown>[] | undefined)?.[index];
    value = item?.[sub];
    marker = field(edit, item, sub);
  } else if (index !== undefined) {
    value = (own as unknown[] | undefined)?.[index];
    marker = field(edit, profile, name, index);
  } else {
    value = own;
    marker = field(edit, profile, name);
  }

  const text = value == null ? "" : String(value);
  return <span data-tina-field={marker}>{lower ? text.toLowerCase() : text}</span>;
}
