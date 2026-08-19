import { test, expect } from '@playwright/test';

// Utilise le compte admin créé par le seed backend (npm run prisma:seed)
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'ChangeMe123!';

test.describe('Authentification admin', () => {
  test('redirige vers la connexion quand on accède au dashboard sans être authentifié', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin');
  });

  test('refuse une connexion avec de mauvais identifiants', async ({ page }) => {
    await page.goto('/admin');
    await page.getByLabel('E-mail').fill('inconnu@example.com');
    await page.getByLabel('Mot de passe').fill('MauvaisMotDePasse');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page.getByText(/identifiants invalides/i)).toBeVisible();
    await expect(page).toHaveURL('/admin');
  });

  test('connecte un admin valide, affiche le dashboard, puis se déconnecte', async ({ page }) => {
    await page.goto('/admin');
    await page.getByLabel('E-mail').fill(ADMIN_EMAIL);
    await page.getByLabel('Mot de passe').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();
    await expect(page.getByText('Véhicules au total')).toBeVisible();

    // La session doit survivre à un rechargement complet (rafraîchissement silencieux via le
    // cookie httpOnly, voir app/admin/layout.tsx)
    await page.reload();
    await expect(page).toHaveURL('/admin/dashboard');

    await page.getByRole('button', { name: /déconnexion/i }).click();
    await expect(page).toHaveURL('/admin');

    // Une fois déconnecté, le dashboard ne doit plus être accessible
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin');
  });
});
