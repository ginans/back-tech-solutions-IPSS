import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stringify } from 'yaml';
import type { OpenAPIObject } from '@nestjs/swagger';

const OAS_DIR = resolve(process.cwd(), 'oas');
const OAS_FILE = resolve(OAS_DIR, 'oas.yaml');

export function writeOasYaml(document: OpenAPIObject): void {
  mkdirSync(OAS_DIR, { recursive: true });
  writeFileSync(OAS_FILE, stringify(document), 'utf-8');
}