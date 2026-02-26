export type RentVsBuyInputs = {
  years: number

  homePrice: number
  downPaymentPct: number
  mortgageRatePct: number
  mortgageTermYears: number

  buyClosingCostPct: number
  sellCostPct: number

  propertyTaxRatePct: number
  homeInsuranceAnnual: number
  maintenanceRatePct: number
  hoaMonthly: number

  homeAppreciationPct: number

  rentMonthly: number
  rentGrowthPct: number
  rentersInsuranceMonthly: number

  investmentReturnPct: number
}

export type RentVsBuyPoint = {
  month: number
  homeValue: number
  mortgageBalance: number
  homeEquity: number
  buyInvestments: number
  rentInvestments: number
  buyNetWorth: number
  rentNetWorth: number
}

export type RentVsBuyResult = {
  inputs: RentVsBuyInputs
  upFrontCashForBuy: number
  mortgagePaymentMonthly: number
  points: RentVsBuyPoint[]
  end: RentVsBuyPoint
  breakEvenMonth: number | null
  buyWinsBy: number
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function monthlyRateFromAnnualPct(aprPct: number) {
  return aprPct <= 0 ? 0 : aprPct / 100 / 12
}

function monthlyGrowthFromAnnualPct(ratePct: number) {
  const r = ratePct / 100
  return Math.pow(1 + r, 1 / 12) - 1
}

function pmt(principal: number, aprPct: number, months: number) {
  if (months <= 0) return 0
  const r = monthlyRateFromAnnualPct(aprPct)
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

export function sanitizeInputs(raw: RentVsBuyInputs): RentVsBuyInputs {
  return {
    ...raw,
    years: clamp(Math.round(raw.years), 1, 50),
    homePrice: Math.max(0, raw.homePrice),
    downPaymentPct: clamp(raw.downPaymentPct, 0, 100),
    mortgageRatePct: Math.max(0, raw.mortgageRatePct),
    mortgageTermYears: clamp(Math.round(raw.mortgageTermYears), 1, 40),
    buyClosingCostPct: clamp(raw.buyClosingCostPct, 0, 20),
    sellCostPct: clamp(raw.sellCostPct, 0, 20),
    propertyTaxRatePct: clamp(raw.propertyTaxRatePct, 0, 10),
    homeInsuranceAnnual: Math.max(0, raw.homeInsuranceAnnual),
    maintenanceRatePct: clamp(raw.maintenanceRatePct, 0, 10),
    hoaMonthly: Math.max(0, raw.hoaMonthly),
    homeAppreciationPct: clamp(raw.homeAppreciationPct, -20, 30),
    rentMonthly: Math.max(0, raw.rentMonthly),
    rentGrowthPct: clamp(raw.rentGrowthPct, -20, 30),
    rentersInsuranceMonthly: Math.max(0, raw.rentersInsuranceMonthly),
    investmentReturnPct: clamp(raw.investmentReturnPct, -50, 50),
  }
}

export function computeRentVsBuy(rawInputs: RentVsBuyInputs): RentVsBuyResult {
  const inputs = sanitizeInputs(rawInputs)
  const months = inputs.years * 12

  const downPayment = inputs.homePrice * (inputs.downPaymentPct / 100)
  const buyClosingCosts = inputs.homePrice * (inputs.buyClosingCostPct / 100)
  const upFrontCashForBuy = downPayment + buyClosingCosts

  const loanAmount = Math.max(0, inputs.homePrice - downPayment)
  const mortgageMonths = inputs.mortgageTermYears * 12
  const mortgagePaymentMonthly = pmt(loanAmount, inputs.mortgageRatePct, mortgageMonths)

  const invR = monthlyGrowthFromAnnualPct(inputs.investmentReturnPct)
  const homeG = monthlyGrowthFromAnnualPct(inputs.homeAppreciationPct)
  const rentG = monthlyGrowthFromAnnualPct(inputs.rentGrowthPct)

  let homeValue = inputs.homePrice
  let mortgageBalance = loanAmount
  let buyInvestments = 0
  let rentInvestments = upFrontCashForBuy

  const points: RentVsBuyPoint[] = []

  let breakEvenMonth: number | null = null

  for (let m = 0; m <= months; m++) {
    const homeEquity = Math.max(0, homeValue - mortgageBalance)
    const buyNetWorth = homeEquity + buyInvestments
    const rentNetWorth = rentInvestments

    const point: RentVsBuyPoint = {
      month: m,
      homeValue,
      mortgageBalance,
      homeEquity,
      buyInvestments,
      rentInvestments,
      buyNetWorth,
      rentNetWorth,
    }
    points.push(point)

    if (breakEvenMonth === null && m > 0 && buyNetWorth >= rentNetWorth) {
      breakEvenMonth = m
    }
    if (m === months) break

    // Grow balances first (assumes end-of-month contributions below)
    buyInvestments *= 1 + invR
    rentInvestments *= 1 + invR

    // Home value changes through month
    homeValue *= 1 + homeG

    // Monthly expenses
    const propertyTaxMonthly = (homeValue * (inputs.propertyTaxRatePct / 100)) / 12
    const insuranceMonthly = inputs.homeInsuranceAnnual / 12
    const maintenanceMonthly = (homeValue * (inputs.maintenanceRatePct / 100)) / 12
    const hoaMonthly = inputs.hoaMonthly

    const rentThisMonth = inputs.rentMonthly * Math.pow(1 + rentG, m)
    const renterOutflow = rentThisMonth + inputs.rentersInsuranceMonthly

    // Mortgage payment this month (if still within term and balance > 0)
    let mortgageOutflow = 0
    if (mortgageBalance > 0 && m < mortgageMonths) {
      const r = monthlyRateFromAnnualPct(inputs.mortgageRatePct)
      const interest = mortgageBalance * r
      const principal = Math.min(mortgageBalance, Math.max(0, mortgagePaymentMonthly - interest))
      mortgageBalance = Math.max(0, mortgageBalance - principal)
      mortgageOutflow = interest + principal
    }

    const ownerOutflow =
      mortgageOutflow + propertyTaxMonthly + insuranceMonthly + maintenanceMonthly + hoaMonthly

    // Invest the monthly cost difference
    const delta = ownerOutflow - renterOutflow
    if (delta > 0) {
      rentInvestments += delta
    } else if (delta < 0) {
      buyInvestments += -delta
    }
  }

  // Apply selling costs at end (liquidate home into net worth)
  const end0 = points[points.length - 1]!
  const netSaleProceeds = end0.homeValue * (1 - inputs.sellCostPct / 100) - end0.mortgageBalance
  const end: RentVsBuyPoint = {
    ...end0,
    buyNetWorth: end0.buyInvestments + netSaleProceeds,
    homeEquity: netSaleProceeds,
  }
  points[points.length - 1] = end

  return {
    inputs,
    upFrontCashForBuy,
    mortgagePaymentMonthly,
    points,
    end,
    breakEvenMonth,
    buyWinsBy: end.buyNetWorth - end.rentNetWorth,
  }
}

