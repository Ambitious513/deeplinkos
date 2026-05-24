import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { createSlug, normalizeSlug } from "@/lib/slug";
import type { CreateLinkInput, LinkRecord } from "@/lib/types";

const dataFile = path.join(process.cwd(), "data", "links.json");

async function ensureDataFile() {
  await mkdir(path.dirname(dataFile), { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]", "utf8");
  }
}

async function readLinks() {
  await ensureDataFile();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as LinkRecord[];
}

async function writeLinks(links: LinkRecord[]) {
  await writeFile(dataFile, JSON.stringify(links, null, 2), "utf8");
}

export async function listLinks() {
  const links = await readLinks();
  return links.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function findLinkBySlug(slug: string) {
  const normalized = normalizeSlug(slug);
  const links = await readLinks();
  return links.find((link) => link.slug === normalized) || null;
}

export async function createLink(input: CreateLinkInput) {
  const links = await readLinks();
  const desiredSlug = normalizeSlug(input.slug) || createSlug();

  if (!desiredSlug) {
    throw new Error("Unable to generate a slug.");
  }

  if (links.some((link) => link.slug === desiredSlug)) {
    throw new Error("That slug is already taken.");
  }

  const now = new Date().toISOString();
  const record: LinkRecord = {
    id: randomUUID(),
    slug: desiredSlug,
    title: input.title?.trim() || "Custom smart link",
    preset: input.preset || "custom",
    status: "active",
    iosDeepLink: input.iosDeepLink,
    iosStoreUrl: input.iosStoreUrl,
    androidDeepLink: input.androidDeepLink,
    androidStoreUrl: input.androidStoreUrl,
    desktopUrl: input.desktopUrl,
    campaign: input.campaign,
    workspaceId: null,
    createdByUserId: null,
    createdAt: now,
    updatedAt: now
  };

  links.push(record);
  await writeLinks(links);

  return record;
}
