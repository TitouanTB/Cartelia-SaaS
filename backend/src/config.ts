import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PUBLIC_BASE_URL: z.string().default('http://localhost:3000'),
  
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  DATABASE_URL: z.string(),
  
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_VERIFIED_DOMAIN: z.string().default('noreply.cartelia.app'),
  
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),
  
  HUGGINGFACE_MISTRAL_ENDPOINT: z.string().optional(),
  HUGGINGFACE_API_TOKEN: z.string().optional(),
  
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),
  
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(',').map(origin => origin.trim()),
};
