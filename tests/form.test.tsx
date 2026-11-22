// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from '@testing-library/react'
import App from '../client/App'
import catalog from '../catalog/blueprints.json'
import { sample, expected } from './example'
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
function setup() {
  const mock = vi.fn()
  vi.stubGlobal('fetch', mock)
  return mock
}
const catalogResponse = () => Response.json({ blueprints: catalog })
function fill(id: string, value: string) {
  fireEvent.change(document.getElementById(id)!, { target: { value } })
}
async function choose() {
  await screen.findByRole('option', { name: catalog[0].name })
  fill('blueprintId', 'shield-module')
}
it('загрузка, ошибка, повторная загрузка и пустой каталог', async () => {
  const mock = setup()
  let fail!: () => void
  mock
    .mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          fail = reject
        }),
    )
    .mockResolvedValueOnce(Response.json({ blueprints: [] }))
  render(<App />)
  expect(screen.getByRole('status').textContent).toContain('Загрузка')
  expect(document.querySelector('fieldset')?.disabled).toBe(true)
  await act(async () => fail())
  fireEvent.click(await screen.findByRole('button', { name: 'Повторить' }))
  await screen.findByText('Нет доступных чертежей')
  expect(mock).toHaveBeenCalledTimes(2)
})
it('сообщает ошибки полей без POST и сохраняет общие значения при смене рецепта', async () => {
  const mock = setup().mockResolvedValueOnce(catalogResponse())
  render(<App />)
  await choose()
  fireEvent.click(screen.getByRole('button', { name: 'Рассчитать' }))
  expect(
    document
      .getElementById('materialUnitPricesIsk.tritanium')
      ?.getAttribute('aria-invalid'),
  ).toBe('true')
  expect(mock).toHaveBeenCalledTimes(1)
  fill('runs', '7')
  fill('materialUnitPricesIsk.tritanium', '0')
  fill('materialUnitPricesIsk.pyerite', '2')
  fill('saleUnitPriceIsk', '5')
  fill('jobFeeIsk', '9')
  fill('saleFeeIsk', '8')
  fill('blueprintId', 'repair-module')
  for (const [id, value] of Object.entries({
    'materialUnitPricesIsk.tritanium': '0',
    'materialUnitPricesIsk.mexallon': '',
    saleUnitPriceIsk: '',
    runs: '7',
    jobFeeIsk: '9',
    saleFeeIsk: '8',
  }))
    expect((document.getElementById(id) as HTMLInputElement).value).toBe(value)
})
it('повтор после ошибки, блокировка параллельной отправки, результат и устаревание', async () => {
  const mock = setup()
    .mockResolvedValueOnce(catalogResponse())
    .mockRejectedValueOnce(new Error())
  let finish!: (value: Response) => void
  mock.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  render(<App />)
  await choose()
  fill('runs', '10')
  fill('materialUnitPricesIsk.tritanium', ' 1000 ')
  fill('materialUnitPricesIsk.pyerite', '1200')
  fill('jobFeeIsk', '20000')
  fill('saleFeeIsk', '10000')
  fill('saleUnitPriceIsk', '45000')
  const form = document.querySelector('form')!
  fireEvent.submit(form)
  await screen.findByRole('alert')
  expect(
    (document.getElementById('saleUnitPriceIsk') as HTMLInputElement).value,
  ).toBe('45000')
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(mock).toHaveBeenCalledTimes(3)
  expect(document.querySelector('fieldset')?.disabled).toBe(true)
  expect(JSON.parse(mock.mock.calls[2][1].body)).toEqual(sample)
  await act(async () => finish(Response.json(expected)))
  await screen.findByText('Прибыль')
  await screen.findByText('100 000 ISK')
  fill('runs', '11')
  await waitFor(() =>
    expect(screen.getByText(/Результат устарел/)).toBeTruthy(),
  )
})
