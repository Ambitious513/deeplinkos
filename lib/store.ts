import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { createSlug, normalizeSlug } from "@/lib/slug";
import type { CreateLinkInput, LinkRecord } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const linksFile = path.join(dataDir, "links.json");

async function ensureJsonFile(filePath: string, initialValue = "[]") {
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, initialValue, "utf8");
  }
}

async function readCollection<T>(filePath: string) {
  await ensureJsonFile(filePath);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T[];
}

async function writeCollection<T>(filePath: string, records: T[]) {
  await writeFile(filePath, JSON.stringify(records, null, 2), "utf8");
}

export async function listLinks() {
  const links = await readCollection<LinkRecord>(linksFile);
  return links.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function findLinkBySlug(slug: string) {
  const normalized = normalizeSlug(slug);
  const links = await readCollection<LinkRecord>(linksFile);
  return links.find((link) => link.slug === normalized) || null;
}

export async function createLink(input: CreateLinkInput) {
  const links = await readCollection<LinkRecord>(linksFile);
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
    updatedAt: now,
    metadata: null
  };

  links.push(record);
  await writeCollection(linksFile, links);

  return record;
}
