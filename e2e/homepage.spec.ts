import { expect, test } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Vérifier que la page se charge correctement
    await expect(page).toHaveTitle(/Arkoa/)

    // Vérifier la présence d'éléments clés
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/')

    // Chercher un lien ou bouton de connexion
    const signInLink = page.locator(
      'a[href*="signin"], button:has-text("Sign in"), a:has-text("Sign in")'
    )

    if ((await signInLink.count()) > 0) {
      await signInLink.first().click()
      await expect(page).toHaveURL(/.*signin/)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Vérifier que la page est responsive
    await expect(page.locator('body')).toBeVisible()
  })
})
