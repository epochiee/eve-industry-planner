import type { Order, Result } from '../shared/contract'
export const sample: Order = {
  blueprintId: 'shield-module',
  runs: 10,
  materialUnitPricesIsk: { tritanium: '1000', pyerite: '1200' },
  jobFeeIsk: '20000',
  saleFeeIsk: '10000',
  saleUnitPriceIsk: '45000',
}
export const expected: Result = {
  blueprintId: 'shield-module',
  productName: 'Щитовой модуль',
  runs: 10,
  productQuantity: 10,
  materials: [
    {
      id: 'tritanium',
      name: 'Тританиум',
      quantity: 200,
      unitPriceIsk: '1000',
      totalCostIsk: '200000',
    },
    {
      id: 'pyerite',
      name: 'Пайерит',
      quantity: 100,
      unitPriceIsk: '1200',
      totalCostIsk: '120000',
    },
  ],
  totals: {
    materialsCostIsk: '320000',
    jobFeeIsk: '20000',
    saleFeeIsk: '10000',
    productionCostIsk: '340000',
    totalCostIsk: '350000',
    unitCostIsk: '35000.00',
    revenueIsk: '450000',
    profitIsk: '100000',
    breakEvenUnitPriceIsk: '35000',
    outcome: 'profit',
  },
}
