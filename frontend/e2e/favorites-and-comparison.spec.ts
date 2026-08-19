import { test, expect } from '@playwright/test';

test.describe('Favoris et comparateur', () => {
  test('ajoute un véhicule aux favoris et le retrouve sur /favoris', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('a[href^="/vehicules/"]').first();
    await firstCard.waitFor();

    const favoriteButton = firstCard.getByRole('button', { name: /ajouter aux favoris/i });
    await favoriteButton.click();

    await page.goto('/favoris');
    await expect(page.locator('a[href^="/vehicules/"]').first()).toBeVisible();
  });

  test('ajoute un véhicule au comparateur et le retrouve sur /comparateur', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('a[href^="/vehicules/"]').first();
    await firstCard.waitFor();

    const compareButton = firstCard.getByRole('button', { name: /ajouter au comparateur/i });
    await compareButton.click();

    await page.goto('/comparateur');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Prix')).toBeVisible();
  });

  test('affiche un message quand les favoris sont vides', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/favoris');
    await expect(page.getByText(/vous n'avez pas encore ajouté/i)).toBeVisible();
  });
});
