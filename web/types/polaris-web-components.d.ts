// Minimal JSX typings for Shopify Polaris Web Components (s-*)
// We intentionally keep this permissive to avoid blocking development when
// upstream types are incomplete.
//
// NOTE: React 19 types may source JSX types from module namespaces, so we
// augment both global `JSX` and React's module-scoped `JSX`.

type PolarisIntrinsicElements = {
  "s-page": any;
  "s-card": any;
  "s-text": any;
  "s-button": any;
  [elemName: string]: any;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends PolarisIntrinsicElements {}
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends PolarisIntrinsicElements {}
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends PolarisIntrinsicElements {}
  }
}

export {};
