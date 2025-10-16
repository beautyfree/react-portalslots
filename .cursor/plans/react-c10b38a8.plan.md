<!-- c10b38a8-59cd-4bdf-a986-9b7c1322ce4e 49bcb4c3-958f-4af7-abec-a94088b5c023 -->
# Package “react-portalslots” with tsup

### Goals

- Ship a tiny React library that provides `PortalSlotsProvider`, `PortalSlot(name)`, and `usePortalSlots` with reactive updates when a slot mounts/unmounts.
- Output ESM, CJS, and type declarations. Keep `react` and `react-dom` as peer deps. Use pnpm for all commands [[memory:8654862]].

### Files to add

- `package.json`
  - name: `react-portalslots`
  - version: `0.1.0`
  - main/module/types/exports wired to `dist`
  - peerDependencies: `react >=17`, `react-dom >=17`
  - devDependencies: `typescript`, `tsup`, `@types/react`, `@types/react-dom`
  - scripts: `build`, `dev`, `clean`, `prepublishOnly`
  - sideEffects: false, files: ["dist"]
- `tsconfig.json`
  - `jsx`: `react-jsx`, `moduleResolution`: `bundler`, `strict`: true, `skipLibCheck`: true
- `tsup.config.ts`
  - entry: `src/index.ts`, `dts: true`, `format: ['esm','cjs']`, `external: ['react','react-dom']`, `sourcemap: true`, `clean: true`
- `src/index.ts`
  - re-export public API: `PortalSlotsProvider`, `PortalSlot`, `usePortalSlots`
- `src/PortalSlots.tsx`
  - Implement provider, hook, and `PortalSlot(name)` using a small registry to notify subscribers when slots change (ensures the portal renders as soon as its slot mounts).
- `README.md`
  - Install, usage examples, API, SSR notes, constraints (single Slot per name), and license.
- `LICENSE` (MIT)

### Key implementation details (essential snippets)

- Minimal registry with pub/sub + `useSyncExternalStore` so `Portal` re-renders when a `Slot` appears:
```ts
class PortalSlotsRegistry {
  private slots = new Map<symbol, HTMLElement>();
  private listeners = new Set<() => void>();
  get(id: symbol) { return this.slots.get(id); }
  set(id: symbol, el: HTMLElement) { if (this.slots.has(id)) throw new Error('Portal slot already exists'); this.slots.set(id, el); this.emit(); }
  delete(id: symbol) { this.slots.delete(id); this.emit(); }
  subscribe(l: () => void) { this.listeners.add(l); return () => this.listeners.delete(l); }
  private emit() { this.listeners.forEach(l => l()); }
}
```

- Provider and API outline:
```ts
const PortalSlotsContext = createContext<PortalSlotsRegistry | null>(null);
export function PortalSlotsProvider({ children }: PropsWithChildren) {
  const store = useMemo(() => new PortalSlotsRegistry(), []);
  return <PortalSlotsContext.Provider value={store}>{children}</PortalSlotsContext.Provider>;
}
export function usePortalSlots() { const v = useContext(PortalSlotsContext); if (!v) throw new Error('usePortalSlots must be used within a PortalSlotsProvider'); return v; }
export function PortalSlot(name = 'portal') {
  const id = Symbol(name);
  const Slot = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => {
    const ref = useRef<HTMLDivElement>(null);
    const store = usePortalSlots();
    useLayoutEffect(() => { const el = ref.current; if (!el) return; store.set(id, el); return () => store.delete(id); }, [store]);
    return <div className={`${className} ${name} slot`.trim()} ref={ref}>{children}</div>;
  };
  const Portal = ({ children }: PropsWithChildren) => {
    const store = usePortalSlots();
    const slot = useSyncExternalStore(store.subscribe.bind(store), () => store.get(id), () => undefined);
    return slot ? createPortal(children, slot) : null;
  };
  return Object.assign(Portal, { Slot });
}
```


### package.json essentials

```json
{
  "name": "react-portalslots",
  "version": "0.1.0",
  "description": "Tiny React Portal slots (Provider + named Slot & Portal factory).",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "sideEffects": false,
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm build"
  },
  "peerDependencies": {
    "react": ">=17",
    "react-dom": ">=17"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsup": "^8.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### Usage example (README excerpt)

```tsx
import { PortalSlotsProvider, PortalSlot } from 'react-portalslots';

const HeaderPortal = PortalSlot('header');
const FooterPortal = PortalSlot('footer');

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <header className="page-header">
        <HeaderPortal.Slot />
      </header>

      <main className="page-content">{children}</main>

      <footer className="page-footer">
        <FooterPortal.Slot />
      </footer>
    </div>
  );
}

export function App() {
  return (
    <PortalSlotsProvider>
      <Layout>
        {/* App content */}
        <div>Dashboard</div>
      </Layout>

      {/* These can live anywhere in the tree */}
      <HeaderPortal>
        <button>Save</button>
      </HeaderPortal>

      <FooterPortal>
        <small>© 2025</small>
      </FooterPortal>
    </PortalSlotsProvider>
  );
}
```

### Without this library (anti-pattern)

```tsx
import React from 'react';

type LayoutProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

function Layout({ header, footer, children }: LayoutProps) {
  return (
    <div className="page">
      <header className="page-header">{header}</header>
      <main className="page-content">{children}</main>
      <footer className="page-footer">{footer}</footer>
    </div>
  );
}

export function App() {
  // Content that wants to render into the header/footer must be lifted up here
  // from deep components, causing prop drilling and tight coupling.
  return (
    <Layout
      header={<button>Save</button>}
      footer={<small>© 2025</small>}
    >
      <SomeToolbar />
    </Layout>
  );
}

function SomeToolbar() {
  // Cannot push content into the header without threading callbacks/state
  // through multiple layers or using a global store (which is brittle).
  return null;
}
```

- Drawbacks: prop drilling, implicit coupling, awkward lifting of state/UI, hard reuse/testing.

### Build & publish

- Install dev deps: `pnpm add -D typescript tsup @types/react @types/react-dom` [[memory:8654862]]
- Build: `pnpm build`
- Verify output: `dist/index.mjs`, `dist/index.cjs`, `dist/index.d.ts`
- Publish (public): `npm publish --access public`

### To-dos

- [ ] Create package.json, tsconfig.json, tsup.config.ts, base folders
- [ ] Implement PortalSlots provider, hook, and PortalSlot API in src
- [ ] Configure tsup (ESM+CJS+d.ts) and peer deps external
- [ ] Write README with usage and MIT license
- [ ] Build library and verify dist files and types