import { z, type ZodSchema } from "zod";
import { type FileType, fileTypeSchema } from "./files/FileType.js";
import { jsonSerializableSchema } from "./JSONSerializable.js";

/**
 * @public
 */
export interface ChatMessagePartTextData {
  type: "text";
  text: string;
}
export const chatMessagePartTextDataSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

/**
 * @public
 */
export interface ChatMessagePartFileData {
  type: "file";
  /**
   * Original file name that is uploaded.
   */
  name: string;
  /**
   * Internal identifier for the file. Autogenerated, and is unique.
   */
  identifier: string;
  /**
   * Size of the file in bytes.
   */
  sizeBytes: number;
  /**
   * Type of the file.
   */
  fileType: FileType;
}
export const chatMessagePartFileDataSchema = z.object({
  type: z.literal("file"),
  name: z.string(),
  identifier: z.string(),
  sizeBytes: z.number().int(),
  fileType: fileTypeSchema,
});

/**
 * @public
 */
export interface FunctionToolCallRequest {
  id?: string;
  type: "function";
  arguments?: Record<string, any>;
  name: string;
}
export const functionToolCallRequestSchema = z.object({
  id: z.string().optional(),
  type: z.literal("function"),
  arguments: z.record(jsonSerializableSchema).optional(),
  name: z.string(),
}) as ZodSchema<FunctionToolCallRequest>;

/**
 * @public
 */
export type ToolCallRequest = FunctionToolCallRequest;
export const toolCallRequestSchema = z.discriminatedUnion("type", [
  functionToolCallRequestSchema as any,
]) as ZodSchema<ToolCallRequest>;

/**
 * @public
 */
export interface ChatMessagePartToolCallRequestData {
  type: "toolCallRequest";
  /**
   * Tool calls requested
   */
  toolCallRequest: ToolCallRequest;
}
export const chatMessagePartToolCallRequestDataSchema = z.object({
  type: z.literal("toolCallRequest"),
  toolCallRequest: toolCallRequestSchema,
});

/**
 * @public
 */
export interface ChatMessagePartToolCallResultData {
  type: "toolCallResult";
  /**
   * Result of a tool call
   */
  content: string;
  /**
   * The tool call ID that this result is for
   */
  toolCallId?: string;
}
export const chatMessagePartToolCallResultDataSchema = z.object({
  type: z.literal("toolCallResult"),
  content: z.string(),
  toolCallId: z.string().optional(),
});

/**
 * @public
 */
export type ChatMessagePartData =
  | ChatMessagePartTextData
  | ChatMessagePartFileData
  | ChatMessagePartToolCallRequestData
  | ChatMessagePartToolCallResultData;
export const chatMessagePartDataSchema = z.discriminatedUnion("type", [
  chatMessagePartTextDataSchema,
  chatMessagePartFileDataSchema,
  chatMessagePartToolCallRequestDataSchema,
  chatMessagePartToolCallResultDataSchema,
]);

/**
 * @public
 */
export type ChatMessageRoleData = "assistant" | "user" | "system" | "tool";
export const chatMessageRoleDataSchema = z.enum(["assistant", "user", "system", "tool"]);

/**
 * @public
 */
export type ChatMessageData =
  | {
      role: "assistant";
      content: Array<
        ChatMessagePartTextData | ChatMessagePartFileData | ChatMessagePartToolCallRequestData
      >;
    }
  | {
      role: "user";
      content: Array<ChatMessagePartTextData | ChatMessagePartFileData>;
    }
  | {
      role: "system";
      content: Array<ChatMessagePartTextData | ChatMessagePartFileData>;
    }
  | {
      role: "tool";
      content: Array<ChatMessagePartToolCallResultData>;
    };

export const chatMessageDataSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("assistant"),
    content: z.array(
      z.discriminatedUnion("type", [
        chatMessagePartTextDataSchema,
        chatMessagePartFileDataSchema,
        chatMessagePartToolCallRequestDataSchema,
      ]),
    ),
  }),
  z.object({
    role: z.literal("user"),
    content: z.array(
      z.discriminatedUnion("type", [chatMessagePartTextDataSchema, chatMessagePartFileDataSchema]),
    ),
  }),
  z.object({
    role: z.literal("system"),
    content: z.array(
      z.discriminatedUnion("type", [chatMessagePartTextDataSchema, chatMessagePartFileDataSchema]),
    ),
  }),
  z.object({
    role: z.literal("tool"),
    content: z.array(chatMessagePartToolCallResultDataSchema),
  }),
]);

/**
 * @public
 */
export interface ChatHistoryData {
  messages: Array<ChatMessageData>;
}
export const chatHistoryDataSchema = z.object({
  messages: z.array(chatMessageDataSchema),
});
