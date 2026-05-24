import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || /^(https?:\/\/|[a-z][a-z0-9+.-]*:\/\/)/i.test(value), {
    message: "Use a valid URL or app URI scheme."
  });

export const createLinkSchema = z
  .object({
    destinationUrl: optionalUrl,
    title: z
      .string()
      .trim()
      .min(2, "Add a title with at least 2 characters.")
      .max(80)
      .optional()
      .transform((value) => (value ? value : undefined)),
    preset: z
      .enum(["custom", "instagram", "whatsapp", "telegram", "tiktok", "youtube", "google-maps"])
      .optional(),
    slug: z
      .string()
      .trim()
      .max(50)
      .optional()
      .transform((value) => (value ? value : undefined)),
    iosDeepLink: optionalUrl,
    iosStoreUrl: optionalUrl,
    androidDeepLink: optionalUrl,
    androidStoreUrl: optionalUrl,
    desktopUrl: optionalUrl,
    campaign: z
      .string()
      .trim()
      .max(80)
      .optional()
      .transform((value) => (value ? value : undefined))
  })
  .superRefine((value, ctx) => {
    if (!value.destinationUrl && !value.iosDeepLink && !value.androidDeepLink && !value.desktopUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add a destination link first.",
        path: ["destinationUrl"]
      });
    }
  });
