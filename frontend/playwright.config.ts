import { defineConfig, devices } from '@playwright/test';

/**
 * Ces tests supposent que le backend NestJS tourne sur NEXT_PUBLIC_API_URL
 * (par défaut http://localhost:4000/api/v1) avec des données de démonstration
 * (voir `npm run prisma:seed` côté backend) — voir e2e/README.md pour la procédure complète.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],

  // Démarre automatiquement `next dev` si aucun serveur ne tourne déjà sur le port 3000
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
