declare module 'nerdamer' {
  interface NerdamerExpression {
    expand(): NerdamerExpression;
    evaluate(sub?: Record<string, number | string>): NerdamerExpression;
    text(): string;
  }

  interface NerdamerStatic {
    (expression: string): NerdamerExpression;
  }

  const nerdamer: NerdamerStatic;
  export default nerdamer;
}

declare module 'nerdamer/Algebra.js';
declare module 'nerdamer/Calculus.js';
