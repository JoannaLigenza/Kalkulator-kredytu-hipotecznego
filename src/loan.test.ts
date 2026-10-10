import {test} from 'node:test';
import assert from 'node:assert/strict';
import {schedule,total,parseNumber} from './loan.ts';
const loan={amount:500000,years:25,rate:6.5,type:'equal' as const};
test('reference annuity and exact capital reconciliation',()=>{
 const rows=schedule(loan);assert.equal(rows.length,300);assert.equal(rows[0].payment,337604);assert.equal(rows[0].interest,270833);assert.equal(rows.at(-1)?.balance,0);assert.equal(rows.reduce((s,r)=>s+r.principal+r.extra,0),50000000);
});
test('zero interest, equal and decreasing',()=>{
 for(const type of ['equal','decreasing'] as const){const rows=schedule({amount:12000,years:1,rate:0,type},{1:1100});assert.equal(rows[0].payment,100000);assert.equal(rows[1].payment,90000);assert.equal(total(rows,'interest'),0);assert.equal(rows.at(-1)?.balance,0);}
});
test('decreasing reference and overpayment preserves term',()=>{
 const base=schedule({...loan,type:'decreasing'}),rows=schedule({...loan,type:'decreasing'},{1:50000});assert.equal(base[0].principal,166667);assert.equal(rows.length,300);assert.equal(rows[0].interest,base[0].interest);assert.equal(rows[1].principal,Math.round(rows[0].balance/299));assert.ok(rows[1].payment<base[1].payment);
});
test('multiple overpayments, no negative balances, costs and totals',()=>{
 for(const type of ['equal','decreasing'] as const){const cfg={...loan,type},base=schedule(cfg),rows=schedule(cfg,{1:10000,24:20000,299:1000});assert.equal(rows[0].payment,base[0].payment);assert.ok(rows[1].payment<base[1].payment);assert.ok(total(rows,'interest')<total(base,'interest'));assert.equal(rows[23].extra,2000000);assert.ok(rows.every(r=>r.balance>=0&&Number.isInteger(r.interest)));assert.equal(rows.reduce((s,r)=>s+r.principal+r.extra,0),50000000);assert.equal(total(rows,'payment')+total(rows,'extra'),50000000+total(rows,'interest'));}
});
test('full repayment caps extra and ignores subsequent entries',()=>{const rows=schedule(loan,{1:1e7,2:200});assert.equal(rows.length,1);assert.equal(rows[0].balance,0);assert.equal(rows[0].extra+rows[0].principal,50000000);});
test('rounding and input validation',()=>{const rows=schedule({amount:100,years:1,rate:0,type:'equal'});assert.equal(rows.at(-1)?.principal,837);assert.equal(parseNumber('1 234,56'),1234.56);assert.ok(Number.isNaN(parseNumber('-2')));assert.ok(Number.isNaN(parseNumber('')));assert.throws(()=>schedule({...loan,years:1.5}));assert.throws(()=>schedule({...loan,years:31}));});
