require("dotenv").config();

const z = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  SUPER_ADMIN_NAME: z.string().default("Platform Owner"),
  SUPER_ADMIN_EMAIL: z.string().email().default("superadmin@instituteos.com"),
  SUPER_ADMIN_PHONE: z.string().default("9999999999"),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
  CORS_ORIGIN: z.string().default("*")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  bcryptSaltRounds: parsed.data.BCRYPT_SALT_ROUNDS,
  superAdminName: parsed.data.SUPER_ADMIN_NAME,
  superAdminEmail: parsed.data.SUPER_ADMIN_EMAIL,
  superAdminPhone: parsed.data.SUPER_ADMIN_PHONE,
  superAdminPassword: parsed.data.SUPER_ADMIN_PASSWORD,
  corsOrigin: parsed.data.CORS_ORIGIN
};

module.exports = { env };
