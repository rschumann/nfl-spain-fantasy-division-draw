import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadTeamKeys() {
  const path = resolve(process.cwd(), 'config/team-keys.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadBaseUrl() {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('BASE_URL=')) {
        return trimmed.replace('BASE_URL=', '').trim();
      }
    }
  }
  return 'http://127.0.0.1:3000';
}

function printRow(entry, idx, baseUrl) {
  const num = String(idx + 1).padStart(2, ' ');
  const name = entry.teamName.padEnd(24, ' ');
  const key = entry.key.padEnd(15, ' ');
  const url = `${baseUrl}/?key=${entry.key}`;
  console.info(`| ${num} | ${name} | ${key} | ${url}`);
}

function main() {
  const keys = loadTeamKeys();
  const baseUrl = loadBaseUrl();

  console.info(
    '\n================================================================================'
  );
  console.info(`  NFL SPAIN FANTASY - ACCESO PERSONALIZADO POR EQUIPO`);
  console.info(`  Base URL: ${baseUrl}`);
  console.info(
    '================================================================================\n'
  );

  console.info(
    '| #  | Equipo                   | Clave / Token   | Enlace Personalizado'
  );
  console.info(
    '|----|--------------------------|-----------------|----------------------------------------------------'
  );

  keys.forEach((entry, idx) => printRow(entry, idx, baseUrl));
  console.info(
    '\n================================================================================\n'
  );
}

main();
