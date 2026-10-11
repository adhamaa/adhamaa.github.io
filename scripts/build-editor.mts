/**
 * Builds the TinaCMS editor into public/admin, before Next.js copies public/.
 *
 * With Tina Cloud credentials (NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN) it
 * builds the editor that signs in through Tina Cloud, reading Content from the
 * repository itself so CI never waits on Tina Cloud's index. Without them it
 * builds a local editor, so `pnpm build` and the smoke suite work anywhere —
 * except on a push to master, where deploying an editor nobody can sign in to
 * would be a silent failure, so it stops the build instead.
 */
import { spawnSync } from "node:child_process";

const cloud = Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID && process.env.TINA_TOKEN);
const deploying =
  process.env.GITHUB_ACTIONS === "true" &&
  process.env.GITHUB_EVENT_NAME === "push" &&
  process.env.GITHUB_REF === "refs/heads/master";

if (!cloud && deploying) {
  console.error(
    "\nThe editor needs Tina Cloud credentials to deploy: set the repository variable " +
      "NEXT_PUBLIC_TINA_CLIENT_ID and the secret TINA_TOKEN (see README, Editing content).\n"
  );
  process.exit(1);
}

const args = cloud
  ? ["build", "--content=local", "--skip-search-index", "--noTelemetry", ...(deploying ? [] : ["--skip-cloud-checks"])]
  : ["build", "--local", "--skip-search-index", "--noTelemetry", "--skip-cloud-checks"];

console.log(`Building the editor (${cloud ? "Tina Cloud" : "local only"})…`);
const result = spawnSync("pnpm", ["exec", "tinacms", ...args], { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
