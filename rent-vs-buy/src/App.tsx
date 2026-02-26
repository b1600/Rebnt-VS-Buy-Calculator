import './App.css'
import { useMemo, useState } from 'react'
import { NumberField } from './components/NumberField'
import { Sparkline } from './components/Sparkline'
import { formatMoney, monthToYearsLabel } from './lib/format'
import { computeRentVsBuy, type RentVsBuyInputs } from './lib/rentVsBuy'

const DEFAULTS: RentVsBuyInputs = {
  years: 10,

  homePrice: 650_000,
  downPaymentPct: 20,
  mortgageRatePct: 6.5,
  mortgageTermYears: 30,

  buyClosingCostPct: 2.5,
  sellCostPct: 6,

  propertyTaxRatePct: 1.1,
  homeInsuranceAnnual: 1_800,
  maintenanceRatePct: 1.0,
  hoaMonthly: 0,

  homeAppreciationPct: 3.0,

  rentMonthly: 3_200,
  rentGrowthPct: 3.0,
  rentersInsuranceMonthly: 20,

  investmentReturnPct: 6.0,
}

function App() {
  const [inputs, setInputs] = useState<RentVsBuyInputs>(DEFAULTS)

  const result = useMemo(() => computeRentVsBuy(inputs), [inputs])
  const netWorthSeries = useMemo(
    () => result.points.map((p) => p.buyNetWorth - p.rentNetWorth),
    [result.points],
  )

  const buyWins = result.buyWinsBy >= 0

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="kicker">Rent vs Buy</div>
          <h1 className="title">Rent‑vs‑buy calculator</h1>
          <p className="subtitle">
            Compares end net worth after {inputs.years} years, including mortgage amortization, home
            appreciation, rent growth, ownership costs, and investing the cost difference.
          </p>
        </div>
        <div className="headerActions">
          <button className="btn" onClick={() => setInputs(DEFAULTS)}>
            Reset defaults
          </button>
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <h2 className="panelTitle">Inputs</h2>

          <div className="group">
            <div className="groupTitle">Timeline</div>
            <div className="fields">
              <NumberField
                label="Horizon"
                value={inputs.years}
                onChange={(v) => setInputs((s) => ({ ...s, years: v }))}
                step={1}
                min={1}
                max={50}
                suffix="years"
              />
            </div>
          </div>

          <div className="group">
            <div className="groupTitle">Buy</div>
            <div className="fields">
              <NumberField
                label="Home price"
                value={inputs.homePrice}
                onChange={(v) => setInputs((s) => ({ ...s, homePrice: v }))}
                step={1_000}
                min={0}
                prefix="$"
              />
              <NumberField
                label="Down payment"
                value={inputs.downPaymentPct}
                onChange={(v) => setInputs((s) => ({ ...s, downPaymentPct: v }))}
                step={0.5}
                min={0}
                max={100}
                suffix="%"
              />
              <NumberField
                label="Mortgage rate"
                value={inputs.mortgageRatePct}
                onChange={(v) => setInputs((s) => ({ ...s, mortgageRatePct: v }))}
                step={0.05}
                min={0}
                suffix="%"
              />
              <NumberField
                label="Mortgage term"
                value={inputs.mortgageTermYears}
                onChange={(v) => setInputs((s) => ({ ...s, mortgageTermYears: v }))}
                step={1}
                min={1}
                max={40}
                suffix="years"
              />
              <NumberField
                label="Buy closing costs"
                value={inputs.buyClosingCostPct}
                onChange={(v) => setInputs((s) => ({ ...s, buyClosingCostPct: v }))}
                step={0.1}
                min={0}
                max={20}
                suffix="%"
                hint="of price"
              />
              <NumberField
                label="Selling costs"
                value={inputs.sellCostPct}
                onChange={(v) => setInputs((s) => ({ ...s, sellCostPct: v }))}
                step={0.1}
                min={0}
                max={20}
                suffix="%"
                hint="of sale price"
              />
            </div>
          </div>

          <div className="group">
            <div className="groupTitle">Ownership costs</div>
            <div className="fields">
              <NumberField
                label="Property tax"
                value={inputs.propertyTaxRatePct}
                onChange={(v) => setInputs((s) => ({ ...s, propertyTaxRatePct: v }))}
                step={0.05}
                min={0}
                max={10}
                suffix="%"
                hint="annual"
              />
              <NumberField
                label="Home insurance"
                value={inputs.homeInsuranceAnnual}
                onChange={(v) => setInputs((s) => ({ ...s, homeInsuranceAnnual: v }))}
                step={50}
                min={0}
                prefix="$"
                hint="per year"
              />
              <NumberField
                label="Maintenance"
                value={inputs.maintenanceRatePct}
                onChange={(v) => setInputs((s) => ({ ...s, maintenanceRatePct: v }))}
                step={0.05}
                min={0}
                max={10}
                suffix="%"
                hint="annual of value"
              />
              <NumberField
                label="HOA"
                value={inputs.hoaMonthly}
                onChange={(v) => setInputs((s) => ({ ...s, hoaMonthly: v }))}
                step={10}
                min={0}
                prefix="$"
                hint="per month"
              />
            </div>
          </div>

          <div className="group">
            <div className="groupTitle">Rent + investing</div>
            <div className="fields">
              <NumberField
                label="Rent"
                value={inputs.rentMonthly}
                onChange={(v) => setInputs((s) => ({ ...s, rentMonthly: v }))}
                step={50}
                min={0}
                prefix="$"
                hint="per month"
              />
              <NumberField
                label="Rent growth"
                value={inputs.rentGrowthPct}
                onChange={(v) => setInputs((s) => ({ ...s, rentGrowthPct: v }))}
                step={0.1}
                min={-20}
                max={30}
                suffix="%"
                hint="annual"
              />
              <NumberField
                label="Renter’s insurance"
                value={inputs.rentersInsuranceMonthly}
                onChange={(v) => setInputs((s) => ({ ...s, rentersInsuranceMonthly: v }))}
                step={5}
                min={0}
                prefix="$"
                hint="per month"
              />
              <NumberField
                label="Home appreciation"
                value={inputs.homeAppreciationPct}
                onChange={(v) => setInputs((s) => ({ ...s, homeAppreciationPct: v }))}
                step={0.1}
                min={-20}
                max={30}
                suffix="%"
                hint="annual"
              />
              <NumberField
                label="Investment return"
                value={inputs.investmentReturnPct}
                onChange={(v) => setInputs((s) => ({ ...s, investmentReturnPct: v }))}
                step={0.1}
                min={-50}
                max={50}
                suffix="%"
                hint="annual"
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <h2 className="panelTitle">Results</h2>

          <div className="cards">
            <div className={`card ${buyWins ? 'good' : 'bad'}`}>
              <div className="cardLabel">Winner after {inputs.years} years</div>
              <div className="cardValue">{buyWins ? 'Buy' : 'Rent'}</div>
              <div className="cardSub">
                Net worth difference: <strong>{formatMoney(Math.abs(result.buyWinsBy))}</strong>
              </div>
            </div>
            <div className="card">
              <div className="cardLabel">End net worth</div>
              <div className="twoCol">
                <div>
                  <div className="miniLabel">Buy</div>
                  <div className="miniValue">{formatMoney(result.end.buyNetWorth)}</div>
                </div>
                <div>
                  <div className="miniLabel">Rent</div>
                  <div className="miniValue">{formatMoney(result.end.rentNetWorth)}</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="cardLabel">Break-even</div>
              <div className="cardValue">
                {result.breakEvenMonth === null ? 'No' : monthToYearsLabel(result.breakEvenMonth)}
              </div>
              <div className="cardSub">First month buy net worth ≥ rent net worth</div>
            </div>
          </div>

          <div className="chartWrap">
            <div className="chartHeader">
              <div className="chartTitle">Buy advantage over time</div>
              <div className="chartLegend">
                {netWorthSeries.length ? formatMoney(netWorthSeries[netWorthSeries.length - 1]!) : ''}
              </div>
            </div>
            <Sparkline values={netWorthSeries} />
            <div className="chartFoot">
              <span>Start</span>
              <span>{inputs.years}y</span>
            </div>
          </div>

          <div className="details">
            <div className="detailsTitle">Key numbers</div>
            <div className="detailsGrid">
              <div className="detail">
                <div className="detailLabel">Up‑front cash to buy</div>
                <div className="detailValue">{formatMoney(result.upFrontCashForBuy)}</div>
              </div>
              <div className="detail">
                <div className="detailLabel">Mortgage payment (P+I)</div>
                <div className="detailValue">{formatMoney(result.mortgagePaymentMonthly)}</div>
              </div>
              <div className="detail">
                <div className="detailLabel">End home value (est.)</div>
                <div className="detailValue">{formatMoney(result.end.homeValue)}</div>
              </div>
              <div className="detail">
                <div className="detailLabel">End mortgage balance</div>
                <div className="detailValue">{formatMoney(result.end.mortgageBalance)}</div>
              </div>
            </div>
          </div>

          <div className="note">
            This is a simplified model (no income taxes, itemized deductions, PMI, vacancy risk, or
            major renovations). It’s meant for directional decisions—stress test assumptions.
          </div>
        </section>
      </main>

      <footer className="footer">
        Built locally. Edit assumptions in <code>src/App.tsx</code> or extend the model in{' '}
        <code>src/lib/rentVsBuy.ts</code>.
      </footer>
      </div>
  )
}

export default App
