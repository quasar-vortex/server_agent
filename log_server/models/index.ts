import z from "zod";

export const registerServerModel = z.object({
  body: z.object({
    ipAddress: z.string(),
    name: z.string(),
  }),
});

export const uploadLogModel = z.object({
  body: z.object({
    logs: z.array(
      z.object({
        serverId: z.string(),
        commandLabel: z.string(),
        command: z.string(),
        response: z.string(),
      })
    ),
  }),
});

export type RegisterServerModel = z.infer<typeof registerServerModel>["body"];
export type UploadLogModel = z.infer<typeof uploadLogModel>["body"];
