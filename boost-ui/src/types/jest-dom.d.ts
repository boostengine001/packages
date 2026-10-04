// Pulls in global matcher types (toBeInTheDocument, toHaveFocus, ...) for TypeScript
// when running `npm run typecheck` across src (vitest.setup.ts is outside tsconfig include).
import '@testing-library/jest-dom/vitest';
