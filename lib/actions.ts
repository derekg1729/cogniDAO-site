"use server";

import { getSession } from "@/lib/auth";
import {
  addDomainToVercel,
  removeDomainFromVercelProject,
  validDomainRegex,
} from "@/lib/domains";
import { getBlurDataURL } from "@/lib/utils";
import { writeFile } from "fs/promises";
import { eq, and } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";
import path from "path";
import { withPostAuth, withSiteAuth } from "./auth";
import db from "./db";
import { SelectPost, SelectSite, posts, sites, users, agents, apiConnections } from "./schema";
import { createAIService, sendMessageToAI } from './ai-service';
import { getApiConnectionByService } from './db-access';
import type { Message } from './ai-service';

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const createSite = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const [response] = await db
      .insert(sites)
      .values({
        name,
        description,
        subdomain,
        userId: session.user.id,
      })
      .returning();

    revalidateTag(
      `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This subdomain is already taken`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const updateSite = withSiteAuth(
  async (formData: FormData, site: SelectSite, key: string) => {
    const value = formData.get(key) as string;

    try {
      let response;

      if (key === "customDomain") {
        if (value.includes("vercel.pub")) {
          return {
            error: "Cannot use vercel.pub subdomain as your custom domain",
          };

          // if the custom domain is valid, we need to add it to Vercel
        } else if (validDomainRegex.test(value)) {
          response = await db
            .update(sites)
            .set({
              customDomain: value,
            })
            .where(eq(sites.id, site.id))
            .returning()
            .then((res) => res[0]);

          await Promise.all([
            addDomainToVercel(value),
            // Optional: add www subdomain as well and redirect to apex domain
            // addDomainToVercel(`www.${value}`),
          ]);

          // empty value means the user wants to remove the custom domain
        } else if (value === "") {
          response = await db
            .update(sites)
            .set({
              customDomain: null,
            })
            .where(eq(sites.id, site.id))
            .returning()
            .then((res) => res[0]);
        }

        // if the site had a different customDomain before, we need to remove it from Vercel
        if (site.customDomain && site.customDomain !== value) {
          response = await removeDomainFromVercelProject(site.customDomain);

          /* Optional: remove domain from Vercel team 

          // first, we need to check if the apex domain is being used by other sites
          const apexDomain = getApexDomain(`https://${site.customDomain}`);
          const domainCount = await db.select({ count: count() }).from(sites).where(or(eq(sites.customDomain, apexDomain), ilike(sites.customDomain, `%.${apexDomain}`))).then((res) => res[0].count);


          // if the apex domain is being used by other sites
          // we should only remove it from our Vercel project
          if (domainCount >= 1) {
            await removeDomainFromVercelProject(site.customDomain);
          } else {
            // this is the only site using this apex domain
            // so we can remove it entirely from our Vercel team
            await removeDomainFromVercelTeam(
              site.customDomain
            );
          }
          
          */
        }
      } else if (key === "image" || key === "logo") {
        const file = formData.get(key) as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;
        
        // Save to public/uploads directory
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await import("fs").then(fs => 
          fs.promises.mkdir(uploadDir, { recursive: true })
        );
        
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Write the file
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        // Create URL
        const url = `/uploads/${filename}`;

        const blurhash = key === "image" ? await getBlurDataURL(url) : null;

        response = await db
          .update(sites)
          .set({
            [key]: url,
            ...(blurhash && { imageBlurhash: blurhash }),
          })
          .where(eq(sites.id, site.id))
          .returning()
          .then((res) => res[0]);
      } else {
        response = await db
          .update(sites)
          .set({
            [key]: value,
          })
          .where(eq(sites.id, site.id))
          .returning()
          .then((res) => res[0]);
      }

      console.log(
        "Updated site data! Revalidating tags: ",
        `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        `${site.customDomain}-metadata`,
      );
      revalidateTag(
        `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      site.customDomain && revalidateTag(`${site.customDomain}-metadata`);

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This ${key} is already taken`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deleteSite = withSiteAuth(
  async (_: FormData, site: SelectSite) => {
    try {
      const [response] = await db
        .delete(sites)
        .where(eq(sites.id, site.id))
        .returning();

      revalidateTag(
        `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      response.customDomain && revalidateTag(`${site.customDomain}-metadata`);
      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const getSiteFromPostId = async (postId: string) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: {
      siteId: true,
    },
  });

  return post?.siteId;
};

export const createPost = withSiteAuth(
  async (_: FormData, site: SelectSite) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const [response] = await db
      .insert(posts)
      .values({
        siteId: site.id,
        userId: session.user.id,
      })
      .returning();

    revalidateTag(
      `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    site.customDomain && revalidateTag(`${site.customDomain}-posts`);

    return response;
  },
);

// creating a separate function for this because we're not using FormData
export const updatePost = async (data: SelectPost) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, data.id),
    with: {
      site: true,
    },
  });

  if (!post || post.userId !== session.user.id) {
    return {
      error: "Post not found",
    };
  }

  try {
    const [response] = await db
      .update(posts)
      .set({
        title: data.title,
        description: data.description,
        content: data.content,
      })
      .where(eq(posts.id, data.id))
      .returning();

    revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
    );

    // if the site has a custom domain, we need to revalidate those tags too
    post.site?.customDomain &&
      (revalidateTag(`${post.site?.customDomain}-posts`),
      revalidateTag(`${post.site?.customDomain}-${post.slug}`));

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updatePostMetadata = withPostAuth(
  async (
    formData: FormData,
    post: SelectPost & {
      site: SelectSite;
    },
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "image") {
        const file = formData.get("image") as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        // Save to public/uploads directory
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await import("fs").then(fs => 
          fs.promises.mkdir(uploadDir, { recursive: true })
        );
        
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Write the file
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        // Create URL
        const url = `/uploads/${filename}`;

        const blurhash = await getBlurDataURL(url);
        response = await db
          .update(posts)
          .set({
            image: url,
            imageBlurhash: blurhash,
          })
          .where(eq(posts.id, post.id))
          .returning()
          .then((res) => res[0]);
      } else {
        response = await db
          .update(posts)
          .set({
            [key]: key === "published" ? value === "true" : value,
          })
          .where(eq(posts.id, post.id))
          .returning()
          .then((res) => res[0]);
      }

      revalidateTag(
        `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
      );

      // if the site has a custom domain, we need to revalidate those tags too
      post.site?.customDomain &&
        (revalidateTag(`${post.site?.customDomain}-posts`),
        revalidateTag(`${post.site?.customDomain}-${post.slug}`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This slug is already in use`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deletePost = withPostAuth(
  async (_: FormData, post: SelectPost) => {
    try {
      const [response] = await db
        .delete(posts)
        .where(eq(posts.id, post.id))
        .returning({
          siteId: posts.siteId,
        });

      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const [response] = await db
      .update(users)
      .set({
        [key]: value,
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

/**
 * Deletes an agent by ID
 * @param id - The ID of the agent to delete
 * @returns An object indicating success or error
 */
export const deleteAgent = async (id: string) => {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if the agent exists and belongs to the user
    const agent = await db.query.agents.findFirst({
      where: (agents, { eq, and }) => 
        and(eq(agents.id, id), eq(agents.userId, session.user.id)),
    });

    if (!agent) {
      return {
        error: "Agent not found or you don't have permission to delete it",
      };
    }

    // Delete the agent
    await db.delete(agents).where(eq(agents.id, id));

    // Revalidate the agents cache
    revalidateTag("agents");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting agent:", error);
    return {
      error: "Failed to delete agent",
    };
  }
};

/**
 * Get all agents for a user
 * @param userId - The user ID to get agents for
 * @returns An array of agents
 */
export const getAgents = async (userId: string) => {
  try {
    const agentsList = await db.query.agents.findMany({
      where: (agents, { eq }) => eq(agents.userId, userId),
      orderBy: (agents, { desc }) => [desc(agents.createdAt)],
    });

    return agentsList;
  } catch (error) {
    console.error("Error getting agents:", error);
    return [];
  }
};

/**
 * Get a single agent by ID
 * @param id - The agent ID to get
 * @returns The agent or null if not found
 */
export const getAgent = async (id: string) => {
  try {
    const agent = await db.query.agents.findFirst({
      where: (agents, { eq }) => eq(agents.id, id),
    });

    return agent;
  } catch (error) {
    console.error("Error getting agent:", error);
    return null;
  }
};

/**
 * Send a message to an agent and get a response from the AI model
 */
export const sendMessage = async (
  agentId: string, 
  messageContent: string,
  messageHistory?: Message[]
) => {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    console.log("[sendMessage Action] Received messageContent:", messageContent);
    console.log("[sendMessage Action] Received messageHistory:", JSON.stringify(messageHistory, null, 2));

    // Get agent details and API connection
    const agent = await getAgent(agentId);

    if (!agent) {
      return { error: "Agent not found" };
    }

    // Determine the service based on the agent's model
    let serviceType: 'openai' | 'anthropic';
    if (agent.model.startsWith('gpt')) {
      serviceType = 'openai';
    } else if (agent.model.startsWith('claude')) {
      serviceType = 'anthropic';
    } else {
      // Handle unknown model type or agent not found
      return { error: agent ? `Unsupported model type: ${agent.model}` : "Agent not found" };
    }
    
    const connection = await getApiConnectionByService(session.user.id, serviceType);

    if (!connection) {
      return { error: `API connection not found for ${serviceType}.` };
    }

    // Use messageHistory, defaulting to an empty array if it's undefined
    const history = messageHistory ?? [];
    
    // Log the potentially defaulted history
    console.log("[sendMessage Action] Using messageHistory:", JSON.stringify(history, null, 2));

    // Construct the full message list for sendMessageToAI
    // Prepend history, add current user message
    const currentMessage: Message = { role: 'user', content: messageContent };
    const messagesToSend: Message[] = [
      ...history, 
      currentMessage
    ];

    console.log("[sendMessage Action] Sending messagesToAI:", JSON.stringify(messagesToSend, null, 2));

    // Prepare the agent object for sendMessageToAI, ensuring instructions is string | undefined
    const agentForAI = {
      ...agent,
      instructions: agent.instructions ?? undefined, // Convert null instructions to undefined
    };

    // Call the sendMessageToAI function which handles system prompts and service creation
    const response = await sendMessageToAI(
      agentForAI, 
      messagesToSend,
      connection.encryptedApiKey
    );

    // Assuming sendMessageToAI returns AIResponse { content: string }
    return {
      id: nanoid(),
      role: 'assistant',
      content: response.content,
    };

  } catch (error) {
    console.error("Error in sendMessage action:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Create a new API connection with an encrypted API key
 * @param formData - Form data containing service and apiKey
 * @returns The created API connection or an error
 */
export const createApiConnection = async (formData: FormData) => {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const service = formData.get("service") as string;
    const apiKey = formData.get("apiKey") as string;
    const name = formData.get("name") as string || "Default";

    if (!service || !apiKey) {
      return {
        error: "Service and API key are required",
      };
    }

    // Import encryption utilities
    const { encryptApiKey } = await import("./encryption");
    
    // Encrypt the API key
    const encryptedApiKey = await encryptApiKey(apiKey);

    // Check if a connection for this service already exists for the user
    const existingConnection = await db.query.apiConnections.findFirst({
      where: (apiConnections, { eq, and }) => 
        and(
          eq(apiConnections.service, service),
          eq(apiConnections.userId, session.user.id)
        ),
    });

    if (existingConnection) {
      // Update the existing connection
      const [response] = await db
        .update(apiConnections)
        .set({
          encryptedApiKey,
          name,
          updatedAt: new Date(),
        })
        .where(eq(apiConnections.id, existingConnection.id))
        .returning();

      return response;
    } else {
      // Create a new connection
      const [response] = await db
        .insert(apiConnections)
        .values({
          service,
          encryptedApiKey,
          name,
          userId: session.user.id,
        })
        .returning();

      return response;
    }
  } catch (error: any) {
    console.error("Error creating API connection:", error);
    return {
      error: error.message || "Failed to create API connection",
    };
  }
};

/**
 * Get all API connections for a user
 * @returns An array of API connections
 */
export const getApiConnections = async () => {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return [];
    }

    const connections = await db.query.apiConnections.findMany({
      where: (apiConnections, { eq }) => eq(apiConnections.userId, session.user.id),
      orderBy: (apiConnections, { desc }) => [desc(apiConnections.updatedAt)],
    });

    // Return connections without the encrypted API keys
    return connections.map(conn => ({
      id: conn.id,
      service: conn.service,
      name: conn.name,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      // Don't include the actual encrypted API key for security
      hasKey: Boolean(conn.encryptedApiKey),
    }));
  } catch (error) {
    console.error("Error getting API connections:", error);
    return [];
  }
};

/**
 * Delete an API connection
 * @param id - The ID of the API connection to delete
 * @returns An object indicating success or error
 */
export const deleteApiConnection = async (id: string) => {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if the connection exists and belongs to the user
    const connection = await db.query.apiConnections.findFirst({
      where: (apiConnections, { eq, and }) => 
        and(
          eq(apiConnections.id, id),
          eq(apiConnections.userId, session.user.id)
        ),
    });

    if (!connection) {
      return {
        error: "API connection not found or you don't have permission to delete it",
      };
    }

    // Delete the connection
    await db.delete(apiConnections).where(eq(apiConnections.id, id));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting API connection:", error);
    return {
      error: "Failed to delete API connection",
    };
  }
};

/**
 * Create a new agent
 * @param formData - Form data containing agent details
 * @returns The created agent or an error
 */
export const createAgent = async (formData: FormData) => {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const model = formData.get("model") as string;
    const temperatureStr = formData.get("temperature") as string;
    const instructions = formData.get("instructions") as string;
    
    // Parse temperature as a float or use default
    const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.7;

    if (!name) {
      return {
        error: "Name is required",
      };
    }

    // Validate temperature
    if (isNaN(temperature) || temperature < 0 || temperature > 2) {
      return {
        error: "Temperature must be a number between 0 and 2",
      };
    }

    // Create the agent
    const [response] = await db
      .insert(agents)
      .values({
        name,
        description,
        model: model || "gpt-4",
        temperature,
        instructions,
        userId: session.user.id,
      })
      .returning();

    // Revalidate the agents cache
    revalidateTag("agents");

    return response;
  } catch (error: any) {
    console.error("Error creating agent:", error);
    return {
      error: error.message || "Failed to create agent",
    };
  }
};

/**
 * Update an existing agent
 * @param data - Object containing agent details to update
 * @returns The updated agent or an error
 */
export const updateAgent = async (data: {
  id: string;
  name: string;
  description?: string;
  model: string;
  temperature?: number;
  instructions?: string;
}) => {
  try {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if the agent exists and belongs to the user
    const agent = await db.query.agents.findFirst({
      where: (agents, { eq, and }) => 
        and(eq(agents.id, data.id), eq(agents.userId, session.user.id)),
    });

    if (!agent) {
      return {
        error: "Agent not found or you don't have permission to update it",
      };
    }

    // Validate input
    if (!data.name) {
      return {
        error: "Name is required",
      };
    }

    // Validate temperature if provided
    if (data.temperature !== undefined && 
       (isNaN(data.temperature) || data.temperature < 0 || data.temperature > 2)) {
      return {
        error: "Temperature must be a number between 0 and 2",
      };
    }

    // Update the agent
    await db.update(agents)
      .set({
        name: data.name,
        description: data.description,
        model: data.model,
        temperature: data.temperature !== undefined ? data.temperature : undefined,
        instructions: data.instructions,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(agents.id, data.id),
          eq(agents.userId, session.user.id)
        )
      );

    // Revalidate the agents cache
    revalidateTag("agents");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error updating agent:", error);
    return {
      error: error.message || "Failed to update agent",
    };
  }
};
