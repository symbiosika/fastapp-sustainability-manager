import { defineServer } from "./fastapp-framework/src";
import { addBaseTool } from "./fastapp-framework/src/lib/ai/interaction/tools";
import { dbAppSchema } from "./lib/db/db-schema";

// Import all tools
// import {
//   getUserProfileTool,
//   updateUserProfileTool,
//   createUserProfileTool,
// } from "./lib/tools/user-profile-tools";
import { defineDataRoutes } from "./routes";

/**
 * Adds AI Tools to the server
 */

// Chat Summaries Tool
// addBaseTool(
//   "chat-summaries",
//   "Chat Summaries",
//   "Retrieve the last X chat conversation summaries to understand recent conversation context and history",
//   getChatSummariesTool
// );

/**
 * SERVER
 */
const server = defineServer({
  appName: "Sustainability Manager",
  staticPrivateDataPath: "./static",
  staticPublicDataPath: "./public",
  staticTemplates: [],

  customDbSchema: dbAppSchema,

  customHonoApps: [
    {
      baseRoute: "/app",
      app: defineDataRoutes,
    },
  ],
  customCollectionPermissions: {},
  useLicenseSystem: false,
  // WhatsApp
  // useWhatsApp: true,
  // whatsAppIncomingWebhookHandler: handleIncomingWhatsAppMessage,
});

export default server;

console.log(`...server is running on port http://localhost:3000`);
