/**
 * Global Jest type augmentation for @testing-library/jest-dom
 *
 * This file extends Jest's `expect` matchers with the custom matchers
 * provided by @testing-library/jest-dom (e.g. toBeInTheDocument,
 * toHaveTextContent, toHaveAttribute, toHaveClass).
 *
 * It is included automatically via the "include" paths in tsconfig.json.
 */
import '@testing-library/jest-dom';
