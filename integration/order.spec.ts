import { test, expect } from '@playwright/test'
import { sample, expected } from '../tests/example'
test('контрольный заказ через собранный клиент и API', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Чертёж', { exact: true }).selectOption('shield-module')
  for (const [id, v] of Object.entries({
    runs: '10',
    'materialUnitPricesIsk.tritanium': '1000',
    'materialUnitPricesIsk.pyerite': '1200',
    jobFeeIsk: '20000',
    saleFeeIsk: '10000',
    saleUnitPriceIsk: '45000',
  }))
    await page.locator('[id="' + id + '"]').fill(v)
  const response = page.waitForResponse((r) =>
    r.url().endsWith('/calculations'),
  )
  await page.getByRole('button', { name: 'Рассчитать' }).click()
  const res = await response
  expect(res.request().postDataJSON()).toEqual(sample)
  expect(await res.json()).toEqual(expected)
  const report = page.getByRole('complementary')
  for (const text of [
    '320 000 ISK',
    '340 000 ISK',
    '350 000 ISK',
    '35 000,00 ISK',
    '450 000 ISK',
    'Прибыль',
    '100 000 ISK',
    '35 000 ISK',
  ])
    await expect(report.getByText(text, { exact: true })).toBeVisible()
  await page.setViewportSize({ width: 360, height: 800 })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(360)
  await page.getByLabel('Число запусков').fill('11')
  await expect(report.getByText(/Результат устарел/)).toBeVisible()
})
