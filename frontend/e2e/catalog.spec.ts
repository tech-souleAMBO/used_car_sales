import { test, expect } from '@playwright/test';

test.describe('Catalogue', () => {
  test('affiche la page d\'accueil avec des véhicules', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /trouvez votre prochaine voiture/i })).toBeVisible();

    // Au moins une carte véhicule doit être présente (nécessite le seed backend)
    const vehicleCards = page.locator('a[href^="/vehicules/"]');
    await expect(vehicleCards.first()).toBeVisible();
  });

  test('filtre les résultats par marque', async ({ page }) => {
    await page.goto('/');

    const brandSelect = page.getByLabel('Marque');
    const options = await brandSelect.locator('option').allTextContents();
    const firstRealBrand = options.find((o) => o !== 'Toutes les marques');
    test.skip(!firstRealBrand, 'Aucune marque disponible (backend non seedé ?)');

    await brandSelect.selectOption({ label: firstRealBrand! });
    await page.getByRole('button', { name: 'Rechercher' }).click();

    await expect(page).toHaveURL(/brandId=/);
    await expect(page.locator('a[href^="/vehicules/"]').first()).toBeVisible();
  });

  test('ouvre la fiche détaillée d\'un véhicule depuis le catalogue', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('a[href^="/vehicules/"]').first();
    await firstCard.waitFor();
    const href = await firstCard.getAttribute('href');

    await firstCard.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    // La fiche doit afficher un prix et un bouton de contact
    await expect(page.getByText(/€/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description' })).toBeVisible();
  });

  test('affiche une page 404 conviviale pour un véhicule inexistant', async ({ page }) => {
    await page.goto('/vehicules/ce-slug-nexiste-pas-123456');
    await expect(page.getByText(/n'existe plus ou a été retirée/i)).toBeVisible();
  });
});
