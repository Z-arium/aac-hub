// Applies a "Videos" issue form to the video lists: add or remove Community
// picks, or hide or unhide videos in Recent uploads.
// Reads the issue body from ISSUE_BODY and writes a reply for the issue to REPLY_FILE.

import fs from "node:fs";
import { HIDDEN, PICKS, readJson, readList, videoDetails, videoIds, writeJson } from "./lib.mjs";

const body = process.env.ISSUE_BODY ?? "";
const key = process.env.YOUTUBE_API_KEY;

/** Issue forms render each field as "### Label" followed by its answer. */
function field(label) {
  const m = body.match(new RegExp(`### ${label}[^\\n]*\\n([\\s\\S]*?)(?=\\n### |$)`));
  const value = m?.[1].trim() ?? "";
  return value === "_No response_" ? "" : value;
}

const action = field("What should happen");
const ids = videoIds(field("YouTube links"));
const guide = field("Guide page").match(/guides\/([\w-]+)/)?.[1];
const blurb = field("Why it's worth watching").replace(/\s+/g, " ");

const lines = [];
const picks = readJson(PICKS);
const hidden = readList(HIDDEN);

if (ids.length === 0) {
  lines.push("I couldn't find a YouTube link in this request. Open a new one and paste the video's link.");
} else if (action.startsWith("Add")) {
  for (const id of ids) {
    if (picks.some((p) => p.id === id)) {
      lines.push(`- \`${id}\` is already a Community pick.`);
      continue;
    }
    try {
      const v = await videoDetails(id, key);
      picks.unshift({
        id,
        title: v.title,
        creator: v.channel,
        channelUrl: v.channelUrl,
        published: v.published.slice(0, 10),
        ...(guide && { guide }),
        blurb,
        added: new Date().toISOString().slice(0, 10),
      });
      lines.push(`- Added **${v.title}** by ${v.channel}.`);
    } catch (err) {
      lines.push(`- Couldn't load \`${id}\` from YouTube (${err.message}). Is the video public?`);
    }
  }
} else if (action.startsWith("Remove")) {
  for (const id of ids) {
    const i = picks.findIndex((p) => p.id === id);
    if (i < 0) lines.push(`- \`${id}\` wasn't a Community pick.`);
    else lines.push(`- Removed **${picks.splice(i, 1)[0].title}**.`);
  }
} else if (action.startsWith("Hide")) {
  for (const id of ids) {
    if (hidden.includes(id)) lines.push(`- \`${id}\` was already hidden.`);
    else {
      hidden.push(id);
      lines.push(`- \`${id}\` won't show in Recent uploads.`);
    }
  }
} else if (action.startsWith("Show")) {
  for (const id of ids) {
    const i = hidden.indexOf(id);
    if (i < 0) lines.push(`- \`${id}\` wasn't hidden.`);
    else {
      hidden.splice(i, 1);
      lines.push(`- \`${id}\` can show in Recent uploads again.`);
    }
  }
} else {
  lines.push(`I don't know the action "${action}".`);
}

writeJson(PICKS, picks);
const header = fs.readFileSync(HIDDEN, "utf8").split("\n").filter((l) => l.startsWith("#"));
fs.writeFileSync(HIDDEN, [...header, ...hidden].join("\n") + "\n");
fs.writeFileSync(process.env.REPLY_FILE ?? "reply.md", lines.join("\n") + "\n");
console.log(lines.join("\n"));
