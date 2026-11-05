const fs = require('fs');
const path = require('path');

const esmPath = path.resolve('node_modules/lucide-react/dist/esm/lucide-react.js');
const content = fs.readFileSync(esmPath, 'utf8');
const matches = [...content.matchAll(/export\s+\{([^}]+)\}/g)];
const exportsSet = new Set();
for (const m of matches) {
  const parts = m[1].split(',');
  for (const p of parts) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    if (trimmed.includes(' as ')) {
      exportsSet.add(trimmed.split(' as ')[1].trim());
    } else {
      exportsSet.add(trimmed);
    }
  }
}

const header = `import * as React from 'react';

export interface IconNode extends Array<string | Record<string, string>> {}
export interface LucideProps extends React.SVGAttributes<SVGSVGElement> {
  key?: string | number | null;
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  absoluteStrokeWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export type LucideIcon = React.ForwardRefExoticComponent<
  LucideProps & React.RefAttributes<SVGSVGElement>
>;

export type Icon = LucideIcon;
export declare const Icon: LucideIcon;
export declare const createLucideIcon: (iconName: string, iconNode: any) => LucideIcon;
export declare const icons: Record<string, LucideIcon>;
`;

const lines = [header];
for (const name of exportsSet) {
  if (['icons', 'createLucideIcon', 'Icon'].includes(name)) continue;
  lines.push(`export declare const ${name}: LucideIcon;`);
}

fs.writeFileSync(path.resolve('node_modules/lucide-react/dist/lucide-react.d.ts'), lines.join('\n'), 'utf8');
fs.writeFileSync(path.resolve('node_modules/lucide-react/index.d.ts'), `export * from './dist/lucide-react';\n`, 'utf8');
fs.writeFileSync(
  path.resolve('node_modules/lucide-react/dynamicIconImports.d.ts'),
  `declare const dynamicIconImports: Record<string, () => Promise<{ default: any }>>;\nexport default dynamicIconImports;\nexport type IconName = string;\n`,
  'utf8'
);

// Also update node_modules/lucide-react/package.json if needed
const pkgJsonPath = path.resolve('node_modules/lucide-react/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
pkg.types = 'dist/lucide-react.d.ts';
pkg.typings = 'dist/lucide-react.d.ts';
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2), 'utf8');

console.log('Successfully wrote declaration files. Total icon exports written:', exportsSet.size);
