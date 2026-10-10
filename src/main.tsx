import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { parseNumber, schedule, total, type Loan } from './loan';
import './style.css';
const money = (cents: number) =>
	new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(
		cents / 100,
	);

function App() {
	const [amount, setAmount] = useState('500000');
	const [years, setYears] = useState('25');
	const [rate, setRate] = useState('6,5');
	const [type, setType] = useState<Loan['type']>('equal');
	const [extras, setExtras] = useState<Record<number, string>>({});

	const loan: Loan = {
		amount: parseNumber(amount),
		years: parseNumber(years),
		rate: parseNumber(rate),
		type,
	};

	const errors = {
		amount:
			!Number.isFinite(loan.amount) || loan.amount < 0.01 || loan.amount > 1e8,
		years:
			!Number.isInteger(loan.years) || loan.years < 1 || loan.years > 30,
		rate: !Number.isFinite(loan.rate) || loan.rate < 0 || loan.rate > 100,
	};

	const valid = !Object.values(errors).some(Boolean);

	const { rows, baseline } = useMemo(
		() =>
			valid
				? {
						rows: schedule(
							loan,
							Object.fromEntries(
								Object.entries(extras).map(([k, v]) => [k, parseNumber(v)]),
							),
						),
						baseline: schedule(loan),
					}
				: { rows: [], baseline: [] },
		[amount, years, rate, type, extras, valid],
	);

	const interest = total(rows, 'interest');
	const extra = total(rows, 'extra');
	const saving = total(baseline, 'interest') - interest;

	const invalidExtras = Object.entries(extras).some(
		([m, v]) =>
			Number(m) <= rows.length && v !== '' && !Number.isFinite(parseNumber(v)),
	);

	return (
		<>
			<header className="top">
				<div className="brand">
					<span className="brand-mark">
						H<span>·</span>
					</span>
					<span>
						hipoteka<span className="brand-sub">TWÓJ PLAN SPŁATY</span>
					</span>
				</div>
				<span className="top-note">Kalkulator kredytu hipotecznego</span>
				<span className="currency">PLN</span>
			</header>

			<main>
				<div className="heading">
					<div>
						<span className="eyebrow">KREDYT POD KONTROLĄ</span>
						<h1>
							Zaplanuj raty.
							<br className="mobile-break" /> Zobacz efekt nadpłat.
						</h1>
						<p>
							Wpisz parametry kredytu i sprawdź swój miesięczny harmonogram.
						</p>
					</div>
					<span className="model-tag">Stałe oprocentowanie</span>
				</div>

				<section className="settings" aria-labelledby="parameters">
					<div className="section-label">
						<span className="step">01</span>
						<h2 id="parameters">Parametry kredytu</h2>
					</div>

					<div className="controls">
						<label>
							Kwota kredytu
							<div className={'input-wrap ' + (errors.amount ? 'error' : '')}>
								<input
									aria-invalid={errors.amount}
									inputMode="decimal"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									aria-label="Kwota kredytu"
								/>
								<span>PLN</span>
							</div>
							{errors.amount && (
								<small className="error-text">
									Podaj kwotę od 0,01 do 100 mln zł.
								</small>
							)}
						</label>

						<label>
							Okres spłaty
							<div className={'input-wrap ' + (errors.years ? 'error' : '')}>
								<input
									aria-invalid={errors.years}
									inputMode="numeric"
									value={years}
									onChange={(e) => setYears(e.target.value)}
									aria-label="Okres spłaty w latach"
								/>
								<span>lat</span>
							</div>
							{errors.years && (
								<small className="error-text">
									Podaj pełne lata: od 1 do 30.
								</small>
							)}
						</label>

						<label>
							Oprocentowanie roczne
							<div className={'input-wrap ' + (errors.rate ? 'error' : '')}>
								<input
									aria-invalid={errors.rate}
									inputMode="decimal"
									value={rate}
									onChange={(e) => setRate(e.target.value)}
									aria-label="Oprocentowanie roczne"
								/>
								<span>%</span>
							</div>
							{errors.rate && (
								<small className="error-text">
									Podaj oprocentowanie od 0 do 100%.
								</small>
							)}
						</label>

						<fieldset>
							<legend>Rodzaj rat</legend>
							<div className="segments">
								<button
									aria-pressed={type === 'equal'}
									onClick={() => setType('equal')}
								>
									Równe
								</button>
								<button
									aria-pressed={type === 'decreasing'}
									onClick={() => setType('decreasing')}
								>
									Malejące
								</button>
							</div>
						</fieldset>
					</div>

					<p className="settings-foot">
						Nadpłaty obniżają kolejne raty. Termin spłaty pozostaje bez zmian,
						chyba że spłacisz cały kapitał.
					</p>
				</section>

				{valid ? (
					<>
						<section className="summary" aria-label="Podsumowanie kredytu">
							<article className="primary-card">
								<span>Pierwsza rata</span>
								<strong>{money(rows[0]?.payment ?? 0)}</strong>
								<small>kapitał + odsetki, bez nadpłaty</small>
							</article>
							<article>
								<span>Odsetki do spłaty</span>
								<strong>{money(interest)}</strong>
								<small>Bez nadpłat: {money(total(baseline, 'interest'))}</small>
							</article>
							<article>
								<span>Suma nadpłat</span>
								<strong>{money(extra)}</strong>
								<small>Łączna spłata: {money(total(rows, 'payment') + extra)}</small>
							</article>
							<article className="savings">
								<span>Oszczędność na odsetkach</span>
								<strong>{money(saving)}</strong>
								<small>W porównaniu z brakiem nadpłat</small>
							</article>
						</section>

						<section className="schedule" aria-labelledby="schedule-title">
							<div className="table-heading">
								<div>
									<div className="section-label">
										<span className="step">02</span>
										<h2 id="schedule-title">Harmonogram spłaty</h2>
									</div>
									<p>
										Wpisz nadpłatę przy wybranym miesiącu. Kolejne raty przeliczą
										się automatycznie.
									</p>
								</div>

								<span className="count">
									{rows.length} rat <span>·</span>{' '}
									{type === 'equal' ? 'raty równe' : 'raty malejące'}
								</span>
							</div>

							{invalidExtras && (
								<p role="alert" className="alert">
									Popraw oznaczone nadpłaty. Do tego czasu są liczone jako 0 zł.
									Wpisuj kwoty nieujemne, maksymalnie z dwoma miejscami po
									przecinku.
								</p>
							)}

							<div
								className="table-scroll"
								tabIndex={0}
								role="region"
								aria-label="Pełna tabela rat, przewijana poziomo na małym ekranie"
							>
								<table>
									<thead>
										<tr>
											<th scope="col">Rok / miesiąc</th>
											<th scope="col">Rata</th>
											<th scope="col">Kapitał</th>
											<th scope="col">Odsetki</th>
											<th scope="col" className="extra-head">
												Nadpłata kapitału <span>PLN</span>
											</th>
											<th scope="col">Łączna wpłata</th>
											<th scope="col">Pozostały kapitał</th>
										</tr>
									</thead>

									<tbody>
										{rows.map((row) => {
											const year = Math.ceil(row.month / 12);
											const month = ((row.month - 1) % 12) + 1;
											const bad =
												!!extras[row.month] &&
												!Number.isFinite(parseNumber(extras[row.month]));

											return (
												<tr
													key={row.month}
													className={
														(month === 1 ? 'year-start ' : '') +
														(row.extra > 0 ? 'has-extra' : '')
													}
												>
													<th scope="row">
														<span className="year">Rok {year}</span>
														<span className="month">Miesiąc {month}</span>
													</th>
													<td className="payment">{money(row.payment)}</td>
													<td>{money(row.principal)}</td>
													<td>{money(row.interest)}</td>
													<td className="extra-cell">
														<input
															aria-label={`Nadpłata: rok ${year}, miesiąc ${month}`}
															aria-invalid={bad}
															className={bad ? 'bad' : ''}
															inputMode="decimal"
															placeholder="0,00"
															value={extras[row.month] ?? ''}
															onChange={(e) =>
																setExtras((prev) => ({
																	...prev,
																	[row.month]: e.target.value,
																}))
															}
														/>
														{row.requested > row.extra && (
															<small>
																Uwzględniono {money(row.extra)} — do spłaty
																całości.
															</small>
														)}
													</td>
													<td>{money(row.payment + row.extra)}</td>
													<td className="balance">{money(row.balance)}</td>
												</tr>
											);
										})}
									</tbody>

									<tfoot>
										<tr>
											<th scope="row">Razem</th>
											<td>{money(total(rows, 'payment'))}</td>
											<td>{money(Math.round(loan.amount * 100) - extra)}</td>
											<td>{money(interest)}</td>
											<td>{money(extra)}</td>
											<td>{money(total(rows, 'payment') + extra)}</td>
											<td>{money(0)}</td>
										</tr>
									</tfoot>
								</table>
							</div>

							<div className="table-footer">
								<span>Pełny harmonogram · bez podziału na strony</span>
								<span>Kwoty w PLN</span>
							</div>
						</section>
					</>
				) : (
					<div className="empty" role="status">
						Uzupełnij poprawne parametry, aby wyświetlić harmonogram.
					</div>
				)}

				<footer>
					<strong>Jak liczymy?</strong>
					<p>
						Odsetki miesięczne = pozostały kapitał × oprocentowanie roczne ÷ 12.
						Nadpłatę rozliczamy po racie; wpływa na raty od następnego miesiąca.
						Kwoty zaokrąglamy do groszy, a ostatnia rata wyrównuje saldo.
						Kalkulacja nie obejmuje prowizji, ubezpieczeń ani innych opłat.
					</p>
					<p>
						Symulacja według powyższych założeń. Harmonogram banku może się
						różnić. Wpisane dane są przechowywane tylko do odświeżenia strony.
					</p>
				</footer>
			</main>
		</>
	);
}

createRoot(document.getElementById('root')!).render(<App />);
