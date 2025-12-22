import "whatwg-fetch";
import "@testing-library/jest-dom";

// JSDOM doesn't always allow assigning to window.location.href directly.
// Some code paths in this repo set window.location.href on 401.
// We replace it with a writable stub so tests can assert redirects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const originalLocation = window.location as any;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).location;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).location = { href: originalLocation?.href ?? "" };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).location;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).location = originalLocation;
});
