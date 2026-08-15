# Private Zone source files

This directory holds the local plaintext sources for Private Zone. The YAML config,
images, and music are ignored by Git; only these README files are tracked.

After changing any private content, run:

```sh
pnpm private-zone:encrypt
pnpm build
```

The encryption command reads `PRIVATE_ZONE_PASSWORD` from the ignored root `.env`,
replaces `public/private-zone/encrypted/` with authenticated `.pze` ciphertext, and
regenerates `src/generated/private-zone-payload.json`. Commit those encrypted outputs.

Never put the plaintext sources back under `public/`.
