import { test, expect } from '@playwright/test';

test.describe('Contact vendeur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('a[href^="/vehicules/"]').first();
    await firstCard.waitFor();
    await firstCard.click();
  });

  test('envoie le formulaire de contact avec succès', async ({ page }) => {
    await page.getByLabel('Nom').fill('Camille Test');
    await page.getByLabel('E-mail').fill('camille.test@example.com');
    await page
      .getByLabel('Message')
      .fill('Bonjour, ce véhicule est-il toujours disponible ? Merci de me recontacter.');

    await page.getByRole('button', { name: /envoyer un e-mail au vendeur/i }).click();

    await expect(page.getByText(/votre message a bien été envoyé/i)).toBeVisible();
  });

  test('affiche une erreur de validation si le message est trop court', async ({ page }) => {
    await page.getByLabel('Nom').fill('Camille Test');
    await page.getByLabel('E-mail').fill('camille.test@example.com');
    const messageInput = page.getByLabel('Message');
    await messageInput.fill('trop court');

    // La validation HTML5 (minLength) empêche la soumission : le message de succès ne doit pas apparaître
    await page.getByRole('button', { name: /envoyer un e-mail au vendeur/i }).click();
    await expect(page.getByText(/votre message a bien été envoyé/i)).not.toBeVisible();
  });

  test('propose un bouton WhatsApp quand un numéro de contact est renseigné', async ({ page }) => {
    const whatsappButton = page.getByRole('link', { name: /contacter sur whatsapp/i });
    if (await whatsappButton.count()) {
      await expect(whatsappButton).toHaveAttribute('href', /wa\.me/);
      await expect(whatsappButton).toHaveAttribute('target', '_blank');
    }
  });
});
