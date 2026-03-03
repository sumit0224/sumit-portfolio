# Project Structure Rules

## Folder Map

```text
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── sections/
│   └── features/
├── pages/
├── hooks/
├── context/
├── assets/
│   ├── icons/
│   ├── images/
│   └── fonts/
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
├── utils/
├── constants/
├── types/
└── lib/

public/
├── icons/
└── og/
```

## Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `useSomething.ts`
- Utils: `camelCase.ts`
- Constants files: `camelCase.ts`, values in `SCREAMING_SNAKE_CASE`
- CSS files: `kebab-case.css`

## Decision Guide

- Put route/page containers in `src/pages`.
- Put reusable visual pieces in `src/components`.
- Put app-level config values in `src/constants`.
- Put pure helper logic in `src/utils`.
- Put type-only declarations in `src/types`.
- Put third-party adapters/wrappers in `src/lib`.
- Put static files in `src/assets` or `public`.

## Root Rules

Only keep project-level files in root:

- `package.json`
- lock files
- `README.md`
- `.env.example`
- config files (`vite.config.ts`, `tsconfig.json`, etc.)
- this `STRUCTURE.md`

Do not place feature code, component files, or random assets directly in root.
