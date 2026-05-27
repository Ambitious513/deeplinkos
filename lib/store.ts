import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { DEFAULT_LINK_POLICY } from "@/lib/constants";
import { createSlug, normalizeSlug } from "@/lib/slug";
import type {
  ClickSessionRecord,
  CreateLinkInput,
  EscapeEventRecord,
  EscapeState,
  LinkRecord,
  RouteSelection
} from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const linksFile = path.join(dataDir, "links.json");
const sessionsFile = path.join(dataDir, "click-sessions.json");
const eventsFile = path.join(dataDir, "escape-events.json");

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
    routingConfig: DEFAULT_LINK_POLICY,
    metadata: null
  };

  links.push(record);
  await writeCollection(linksFile, links);

  return record;
}

export async function createClickSession(session: ClickSessionRecord) {
  const sessions = await readCollection<ClickSessionRecord>(sessionsFile);
  sessions.push(session);
  await writeCollection(sessionsFile, sessions);
  return session;
}

export async function findClickSessionByToken(clickToken: string) {
  const sessions = await readCollection<ClickSessionRecord>(sessionsFile);
  return sessions.find((session) => session.clickToken === clickToken) || null;
}

export async function updateClickSession(
  clickToken: string,
  updater: (session: ClickSessionRecord) => ClickSessionRecord
) {
  const sessions = await readCollection<ClickSessionRecord>(sessionsFile);
  const index = sessions.findIndex((session) => session.clickToken === clickToken);

  if (index === -1) {
    return null;
  }

  const next = updater(sessions[index]);
  sessions[index] = next;
  await writeCollection(sessionsFile, sessions);
  return next;
}

export async function appendEscapeEvent(event: EscapeEventRecord) {
  const events = await readCollection<EscapeEventRecord>(eventsFile);
  events.push(event);
  await writeCollection(eventsFile, events);
  return event;
}

export async function createEscapeEvent(params: {
  clickSession: ClickSessionRecord;
  eventName: EscapeState;
  attemptedMethod?: string | null;
  latencyMs?: number | null;
  experimentLane?: string | null;
}) {
  const now = new Date().toISOString();

  return appendEscapeEvent({
    id: randomUUID(),
    clickSessionId: params.clickSession.id,
    eventName: params.eventName,
    attemptedMethod: params.attemptedMethod || null,
    latencyMs: params.latencyMs ?? null,
    platformFamily: params.clickSession.platformFamily,
    browserFamilyInferred: params.clickSession.browserFamilyInferred,
    oemFamilyInferred: params.clickSession.oemFamilyInferred,
    xContextInferred: params.clickSession.xContextInferred,
    experimentLane: params.experimentLane || null,
    debugPayloadHash: params.clickSession.debugPayloadHash,
    createdAt: now
  });
}

export async function markRouteSelected(clickToken: string, routeSelected: RouteSelection) {
  return updateClickSession(clickToken, (session) => ({
    ...session,
    routeSelected,
    stateCurrent: "route_selected",
    lastEventAt: new Date().toISOString()
  }));
}
