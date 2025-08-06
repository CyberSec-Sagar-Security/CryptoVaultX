// Example of code that demonstrates our linting and formatting
const _unusedVariable = 'test'; // Prefixed with _ to indicate intentionally unused

export function exampleCode() {
  const x = 1; // ESLint prefers const/let
  if (x === 1) {
    // ESLint prefers strict equality
    // Using console.warn which is allowed by our ESLint config
    console.warn('This is a properly formatted warning message');
  }
  return x;
}

// This code now passes all our linting rules!
