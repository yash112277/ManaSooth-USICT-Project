var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  assessments: () => assessments,
  consultations: () => consultations,
  gad7Questions: () => gad7Questions,
  insertAssessmentSchema: () => insertAssessmentSchema,
  insertConsultationSchema: () => insertConsultationSchema,
  insertProfessionalSchema: () => insertProfessionalSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  messageSchema: () => messageSchema,
  phq9Questions: () => phq9Questions,
  professionals: () => professionals,
  questionnaireResponseSchema: () => questionnaireResponseSchema,
  supportedLanguages: () => supportedLanguages,
  users: () => users,
  who5Questions: () => who5Questions
});
import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  who5Responses: jsonb("who5_responses").$type(),
  gad7Responses: jsonb("gad7_responses").$type(),
  phq9Responses: jsonb("phq9_responses").$type(),
  who5Score: integer("who5_score"),
  gad7Score: integer("gad7_score"),
  phq9Score: integer("phq9_score"),
  conversationResponses: jsonb("conversation_responses").$type(),
  aiAnalysis: text("ai_analysis"),
  consultationRecommended: boolean("consultation_recommended").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  professionalId: text("professional_id").notNull(),
  dateTime: timestamp("date_time").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  specialization: text("specialization").notNull(),
  bio: text("bio"),
  availability: jsonb("availability").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true
});
var insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true
});
var insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
  createdAt: true
});
var messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number()
});
var who5Questions = [
  "I have felt cheerful and in good spirits",
  "I have felt calm and relaxed",
  "I have felt active and vigorous",
  "I woke up feeling fresh and rested",
  "My daily life has been filled with things that interest me"
];
var gad7Questions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];
var phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that other people could have noticed",
  "Thoughts that you would be better off dead or of hurting yourself"
];
var questionnaireResponseSchema = z.object({
  who5: z.record(z.string(), z.number()),
  gad7: z.record(z.string(), z.number()),
  phq9: z.record(z.string(), z.number())
});
var supportedLanguages = [
  { code: "en", name: "English" },
  { code: "hi", name: "\u0939\u093F\u0902\u0926\u0940" },
  { code: "bn", name: "\u09AC\u09BE\u0982\u09B2\u09BE" },
  { code: "te", name: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
  { code: "ta", name: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
  { code: "mr", name: "\u092E\u0930\u093E\u0920\u0940" }
];

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  // User methods
  async createUser(user) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async updateUserLanguage(id, language) {
    const [updatedUser] = await db.update(users).set({ preferredLanguage: language }).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  // Assessment methods
  async createAssessment(assessment) {
    const [newAssessment] = await db.insert(assessments).values(assessment).returning();
    return newAssessment;
  }
  async getAssessment(id) {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }
  async getAssessmentsByUserId(userId) {
    return await db.select().from(assessments).where(eq(assessments.userId, userId));
  }
  // Consultation methods
  async createConsultation(consultation) {
    const [newConsultation] = await db.insert(consultations).values(consultation).returning();
    return newConsultation;
  }
  async getConsultation(id) {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation;
  }
  async getConsultationsByUserId(userId) {
    return await db.select().from(consultations).where(eq(consultations.userId, userId));
  }
  async getConsultationsByProfessionalId(professionalId) {
    return await db.select().from(consultations).where(eq(consultations.professionalId, professionalId));
  }
  async updateConsultationStatus(id, status) {
    const [updatedConsultation] = await db.update(consultations).set({ status }).where(eq(consultations.id, id)).returning();
    return updatedConsultation;
  }
  // Professional methods
  async createProfessional(professional) {
    const [newProfessional] = await db.insert(professionals).values(professional).returning();
    return newProfessional;
  }
  async getProfessional(id) {
    const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
    return professional;
  }
  async listProfessionals() {
    return await db.select().from(professionals);
  }
  async getProfessionalAvailability(id) {
    const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
    return professional;
  }
};
var storage = new DatabaseStorage();

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
var SYSTEM_PROMPT = `You are a professional mental health assessment chatbot. Your role is to:
1. Review and analyze the user's questionnaire responses (WHO-5, GAD-7, PHQ-9)
2. Have a supportive conversation about their mental health
3. Ask relevant follow-up questions based on their questionnaire responses
4. Provide insights and suggestions while maintaining appropriate boundaries
5. Always include appropriate medical disclaimers
6. Direct users to emergency resources if they express crisis situations

WHO-5 Scoring:
- Raw score ranges from 0-25
- Multiply by 4 to get percentage (0-100)
- Scores below 50 indicate low well-being
- Scores below 28 indicate depression

GAD-7 Scoring:
- 0-4: Minimal anxiety
- 5-9: Mild anxiety
- 10-14: Moderate anxiety
- 15-21: Severe anxiety

PHQ-9 Scoring:
- 0-4: Minimal depression
- 5-9: Mild depression
- 10-14: Moderate depression
- 15-19: Moderately severe depression
- 20-27: Severe depression

Respond in JSON format with: { "message": string, "emergency": boolean }`;
async function generateResponse(message, history, questionnaireResponses) {
  try {
    let systemMessage = SYSTEM_PROMPT;
    if (questionnaireResponses && !history.length) {
      const scores = calculateScores(questionnaireResponses);
      systemMessage += `

Questionnaire Results:
WHO-5 Score: ${scores.who5} (${interpretWHO5(scores.who5)})
GAD-7 Score: ${scores.gad7} (${interpretGAD7(scores.gad7)})
PHQ-9 Score: ${scores.phq9} (${interpretPHQ9(scores.phq9)})`;
    }
    const messages = [
      { role: "system", content: systemMessage },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    return JSON.parse(content);
  } catch (err) {
    const error = err;
    throw new Error("Failed to generate response: " + error.message);
  }
}
function calculateScores(responses) {
  const who5 = Object.values(responses.who5).reduce((sum, val) => sum + val, 0) * 4;
  const gad7 = Object.values(responses.gad7).reduce((sum, val) => sum + val, 0);
  const phq9 = Object.values(responses.phq9).reduce((sum, val) => sum + val, 0);
  return { who5, gad7, phq9 };
}
function interpretWHO5(score) {
  if (score < 28) return "Probable depression";
  if (score < 50) return "Low well-being";
  return "Good well-being";
}
function interpretGAD7(score) {
  if (score >= 15) return "Severe anxiety";
  if (score >= 10) return "Moderate anxiety";
  if (score >= 5) return "Mild anxiety";
  return "Minimal anxiety";
}
function interpretPHQ9(score) {
  if (score >= 20) return "Severe depression";
  if (score >= 15) return "Moderately severe depression";
  if (score >= 10) return "Moderate depression";
  if (score >= 5) return "Mild depression";
  return "Minimal depression";
}
async function analyzeMentalHealth(responses) {
  try {
    const scores = calculateScores(responses);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the mental health assessment scores and provide a comprehensive summary. The scores are:
WHO-5: ${scores.who5}/100 (${interpretWHO5(scores.who5)})
GAD-7: ${scores.gad7}/21 (${interpretGAD7(scores.gad7)})
PHQ-9: ${scores.phq9}/27 (${interpretPHQ9(scores.phq9)})

Provide a JSON response with:
- score: overall well-being score (0-100)
- summary: detailed analysis of the results with recommendations
- needsConsultation: boolean indicating if professional consultation is recommended based on severity of scores`
        }
      ],
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    return JSON.parse(content);
  } catch (err) {
    const error = err;
    throw new Error("Failed to analyze responses: " + error.message);
  }
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    },
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await bcrypt.compare(password, user.password)) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        next(err);
      }
    }
  });
  app2.post("/api/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
      passport.authenticate("local", (err, user) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        req.login(user, (err2) => {
          if (err2) return next(err2);
          res.json(user);
        });
      })(req, res, next);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        next(err);
      }
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
  app2.patch("/api/user/language", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { preferredLanguage } = req.body;
      const updatedUser = await storage.updateUserLanguage(req.user.id, preferredLanguage);
      res.json(updatedUser);
    } catch (err) {
      res.status(400).json({ message: "Invalid language code" });
    }
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  const httpServer = createServer(app2);
  app2.post("/api/chat", async (req, res) => {
    try {
      const { message, history, questionnaireResponses } = req.body;
      const response = await generateResponse(message, history, questionnaireResponses);
      res.json({ response });
    } catch (err) {
      const error = err;
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/assessments", async (req, res) => {
    try {
      const assessment = insertAssessmentSchema.parse(req.body);
      if (assessment.who5Responses || assessment.gad7Responses || assessment.phq9Responses) {
        const analysis = await analyzeMentalHealth({
          who5: assessment.who5Responses || {},
          gad7: assessment.gad7Responses || {},
          phq9: assessment.phq9Responses || {}
        });
        assessment.aiAnalysis = analysis.summary;
        assessment.consultationRecommended = analysis.needsConsultation;
      }
      const result = await storage.createAssessment(assessment);
      res.json(result);
    } catch (err) {
      const error = err;
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/assessments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const assessment = await storage.getAssessment(id);
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    res.json(assessment);
  });
  app2.get("/api/users/:userId/assessments", async (req, res) => {
    const { userId } = req.params;
    const assessments2 = await storage.getAssessmentsByUserId(userId);
    res.json(assessments2);
  });
  app2.post("/api/consultations", async (req, res) => {
    try {
      const consultation = insertConsultationSchema.parse(req.body);
      const result = await storage.createConsultation(consultation);
      res.json(result);
    } catch (err) {
      const error = err;
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/consultations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const consultation = await storage.getConsultation(id);
    if (!consultation) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }
    res.json(consultation);
  });
  app2.get("/api/users/:userId/consultations", async (req, res) => {
    const { userId } = req.params;
    const consultations2 = await storage.getConsultationsByUserId(userId);
    res.json(consultations2);
  });
  app2.patch("/api/consultations/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const result = await storage.updateConsultationStatus(id, status);
      res.json(result);
    } catch (err) {
      const error = err;
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/professionals", async (req, res) => {
    try {
      const professional = insertProfessionalSchema.parse(req.body);
      const result = await storage.createProfessional(professional);
      res.json(result);
    } catch (err) {
      const error = err;
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/professionals", async (req, res) => {
    const professionals2 = await storage.listProfessionals();
    res.json(professionals2);
  });
  app2.get("/api/professionals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const professional = await storage.getProfessional(id);
    if (!professional) {
      res.status(404).json({ error: "Professional not found" });
      return;
    }
    res.json(professional);
  });
  app2.get("/api/professionals/:id/availability", async (req, res) => {
    const id = parseInt(req.params.id);
    const professional = await storage.getProfessionalAvailability(id);
    if (!professional) {
      res.status(404).json({ error: "Professional not found" });
      return;
    }
    res.json(professional.availability);
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
