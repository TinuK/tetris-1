# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build` (uses Turbopack)
- **Start production server**: `npm start`
- **Lint code**: `npm run lint` (ESLint with Next.js config)

## Project Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS 4.

### Key Technologies
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Build**: Turbopack enabled for faster development and builds

### Project Structure
- `app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Home page
  - `globals.css` - Global styles and Tailwind imports
- `public/` - Static assets (SVG icons)
- TypeScript path aliases: `@/*` maps to root directory

### Configuration Files
- `next.config.ts` - Next.js configuration (minimal setup)
- `tsconfig.json` - TypeScript config with strict mode and Next.js plugin
- `eslint.config.mjs` - ESLint flat config with Next.js rules
- `postcss.config.mjs` - PostCSS with Tailwind CSS plugin