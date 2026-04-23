#!/usr/bin/env node
// CSV → recalls.json 변환 스크립트
// 사용법: node scripts/convert-recalls.js <input.csv> [output.json]
// data.go.kr "한국교통안전공단_자동차결함 리콜현황" CSV 전용
//
// CSV 예상 컬럼 (data.go.kr 2024년 이후 포맷 기준):
//   제작자, 차명, 생산기간(부터), 생산기간(까지), 리콜개시일, 리콜사유

import fs from 'node:fs';
import path from 'node:path';

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function normalizeDate(s) {
  if (!s) return '';
  const t = s.trim().replace(/\./g, '-').replace(/\//g, '-');
  const m = t.match(/^(\d{4})-?(\d{1,2})-?(\d{1,2})$/);
  if (m) {
    const [, y, mm, dd] = m;
    return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return t;
}

function findColumnIndex(headers, candidates) {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h.replace(/\s/g, '').includes(c));
    if (idx >= 0) return idx;
  }
  return -1;
}

const [, , inputArg, outputArg] = process.argv;
if (!inputArg) {
  console.error('사용법: node scripts/convert-recalls.js <input.csv> [output.json]');
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputPath = path.resolve(outputArg || 'data/recalls.json');

let raw = fs.readFileSync(inputPath);
if (raw[0] === 0xff && raw[1] === 0xfe) raw = raw.slice(2);
if (raw[0] === 0xfe && raw[1] === 0xff) raw = raw.slice(2);
if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) raw = raw.slice(3);

let text;
try {
  text = raw.toString('utf8');
  if (text.includes('�') || /[가-힯]/.test(text) === false) throw new Error('try euc-kr');
} catch {
  const { TextDecoder } = await import('node:util');
  text = new TextDecoder('euc-kr').decode(raw);
}

const lines = text.split(/\r?\n/).filter(l => l.trim());
if (lines.length < 2) {
  console.error('CSV 내용이 비어 있습니다.');
  process.exit(1);
}

const headers = parseCsvLine(lines[0]).map(h => h.trim());
console.log('헤더:', headers);

const iMaker = findColumnIndex(headers, ['제작자', '제조사', '제작사']);
const iModel = findColumnIndex(headers, ['차명', '모델']);
const iFrom = findColumnIndex(headers, ['생산기간부터', '생산시작', '생산기간(부터)']);
const iTo = findColumnIndex(headers, ['생산기간까지', '생산종료', '생산기간(까지)']);
const iDate = findColumnIndex(headers, ['리콜개시일', '개시일', '리콜일자']);
const iReason = findColumnIndex(headers, ['리콜사유', '결함내용', '리콜내용', '사유']);

if ([iMaker, iModel, iDate, iReason].some(i => i < 0)) {
  console.error('필수 컬럼을 찾지 못했습니다. 헤더 확인 필요:', {
    maker: iMaker, model: iModel, date: iDate, reason: iReason,
  });
  process.exit(1);
}

const records = [];
for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  const maker = (cols[iMaker] || '').trim();
  const model = (cols[iModel] || '').trim();
  const reason = (cols[iReason] || '').trim();
  if (!maker || !model) continue;
  records.push({
    maker,
    model,
    from: iFrom >= 0 ? normalizeDate(cols[iFrom]) : '',
    to: iTo >= 0 ? normalizeDate(cols[iTo]) : '',
    date: normalizeDate(cols[iDate]),
    reason,
  });
}

records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const latestDate = records[0]?.date || new Date().toISOString().slice(0, 10);
const output = {
  source: '한국교통안전공단 자동차리콜센터 (공공데이터포털)',
  updatedAt: latestDate,
  count: records.length,
  records,
};

fs.writeFileSync(outputPath, JSON.stringify(output));
console.log(`✅ ${records.length}건 변환 완료 → ${outputPath}`);
console.log(`   최신 리콜: ${latestDate}`);
console.log(`   제조사 수: ${new Set(records.map(r => r.maker)).size}개`);
