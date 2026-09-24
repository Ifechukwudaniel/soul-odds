import arcjet, { shield } from '@arcjet/next';

export default arcjet({
  // ✦ Use `process.env` instead of Env to reduce bundle size in middleware
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    shield({
      mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});
