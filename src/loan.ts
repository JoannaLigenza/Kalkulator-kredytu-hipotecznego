export type Loan = { amount: number; years: number; rate: number; type: 'equal' | 'decreasing' };
export type Row = {month:number; principal:number; interest:number; payment:number; extra:number; requested:number; balance:number};
export function parseNumber(value:string):number {
 const clean=value.replace(/\s/g,'').replace(',','.');
 return /^\d+(\.\d{0,2})?$/.test(clean) ? Number(clean) : NaN;
}
// All monetary balances and postings are integer grosze. Interest is posted monthly.
export function schedule(loan:Loan, extras:Record<number,number>={}):Row[] {
 if(!Number.isFinite(loan.amount)||loan.amount<=0||loan.amount>1e8||!Number.isInteger(loan.years)||loan.years<1||loan.years>100||!Number.isFinite(loan.rate)||loan.rate<0||loan.rate>100) throw new Error('Nieprawidłowe parametry kredytu');
 const months=loan.years*12, r=loan.rate/1200;
 let balance=Math.round(loan.amount*100), base=0;
 const recalculate=(remaining:number)=> loan.type==='decreasing'||r===0 ? Math.round(balance/remaining) : Math.round(balance*r/(-Math.expm1(-remaining*Math.log1p(r))));
 base=recalculate(months);
 const rows:Row[]=[];
 for(let month=1;month<=months&&balance>0;month++) {
  const interest=Math.round(balance*r);
  const principal=month===months?balance:Math.min(balance,Math.max(0,loan.type==='decreasing'?base:base-interest));
  const requested=Math.round(Math.max(0,Number.isFinite(extras[month])?extras[month]:0)*100);
  const extra=Math.min(requested,balance-principal);
  balance-=principal+extra;
  rows.push({month,principal,interest,payment:principal+interest,extra,requested,balance});
  if(extra>0&&month<months) base=recalculate(months-month);
 }
 return rows;
}
export const total=(rows:Row[],field:'interest'|'extra'|'payment')=>rows.reduce((sum,row)=>sum+row[field],0);
