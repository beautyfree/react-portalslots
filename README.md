<p align="center">
    <img width="20%" src=".github/assets/logo.png" alt="react-portalslots" />
  <h1 align="center">react-portalslots</h1>
</p>
<p align="center">
Tiny React Portal slots (Provider + named Slot & Portal factory).
</p>
<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-portalslots.svg?style=flat-round&v=1)](https://www.npmjs.com/package/react-portalslots)
[![NPM Version](https://badgen.net/npm/v/react-portalslots?v=1)](https://www.npmjs.com/package/react-portalslots)
[![License](https://img.shields.io/npm/l/react-portalslots?style=flat&v=1)](https://github.com/beautyfree/react-portalslots/blob/main/LICENSE)

</div>

React components often need to render content in different parts of the UI tree. Traditional approaches lead to prop drilling, tight coupling, and layout constraints.

**react-portalslots** provides:
- **Decoupled rendering**: Render content anywhere, display it elsewhere
- **Named slots**: Semantic slots (header, footer, sidebar) that components can target
- **Type safety**: Full TypeScript support
- **Minimal API**: Just a provider and factory function

Perfect for layout systems, component libraries, and avoiding prop drilling.

## Installation

```bash
npm install react-portalslots
# or
pnpm add react-portalslots
# or
yarn add react-portalslots
# or
bun add react-portalslots
```

## Usage

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
        {/* These can live anywhere in the tree */}
        <HeaderPortal>
          <button>Save</button>
        </HeaderPortal>
        <FooterPortal>
          <small>© 2025</small>
        </FooterPortal>

        {/* App content */}
        <div>Dashboard</div>
      </Layout>
    </PortalSlotsProvider>
  );
}
```

## Without this library

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

## API

### `PortalSlotsProvider`

Context provider that must wrap your application.

```tsx
<PortalSlotsProvider>
  <App />
</PortalSlotsProvider>
```

### `PortalSlot(name?: string)`

Factory function that creates a pair of components for a named slot.

- **PortalSlot.Slot**: The slot container where content will be rendered
- **PortalSlot**: Portal component that renders content into the slot

```tsx
const HeaderPortal = PortalSlot('header');

// Use the slot in your layout
<HeaderPortal.Slot />

// Render content into the slot from anywhere
<HeaderPortal>
  <button>Save</button>
</HeaderPortal>
```

## License

MIT
