# ShieldChain AI

ShieldChain AI is a live risk-to-recommendation pipeline for India’s crude-oil supply chain, built for OOSC 4.0 Hackathon, IIIT Allahabad (Problem Statement 1). It replays the 2026 Strait of Hormuz crisis: routine commercial shipping has been effectively closed since 28 February 2026, with a short June reopening failing in July; India, which imports roughly 88% of its crude and historically routed 41–52% through Hormuz, has responded by diversifying sourcing. The demo shows the operational exposure of a 9.5-day strategic reserve buffer and turns disruption into response options.

## Architecture

Static public-data seed files → Gemini-backed risk agent (with cached hardcoded fallbacks) → scenario modeller and reserve optimizer → Gemini-backed procurement orchestrator (with deterministic fallback) → dashboard, map, charts, and decision views. Gemini calls remain server-side; economic and reserve calculations are instant local TypeScript calculations.

## Tech stack

- Next.js 14, App Router, TypeScript, Tailwind CSS
- React Leaflet + OpenStreetMap tiles for the no-key corridor map
- Recharts for the SPR depletion visualization
- Google Gemini API (`gemini-2.5-flash`) through `@google/genai`
- GDELT DOC 2.0 for public, recent event/news signals
- U.S. EIA API v2 for the most recent available WTI crude-price observation (optional key)

The Gemini API free tier is used because it needs no billing account, keeps the demo zero-cost, and has hardcoded fallbacks plus a five-minute risk cache so missing keys, network failures, and daily free-tier caps cannot break a judge demo.

## Setup & run

```bash
npm install
cp .env.local.example .env.local
```

Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey): sign in, choose **Create API key**, and paste it into `.env.local`. To enable the EIA market-price input, get an EIA key from [EIA Open Data](https://www.eia.gov/opendata/) and add both values:

```env
GEMINI_API_KEY=your_key_here
EIA_API_KEY=your_key_here
```

GDELT needs no key. Gemini and EIA keys stay server-side and must never be named with a `NEXT_PUBLIC_` prefix. The app still works without either key using its clearly labeled deterministic fallback.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Feature walkthrough

### Dashboard

The dashboard pairs a 30-second-refreshing corridor risk ticker with a Leaflet map. It marks Hormuz, Red Sea, Suez, and Cape routing exposure alongside India’s refinery hubs, then offers a one-click replay of the February 2026 Hormuz closure.

### Scenario modeller

Choose one of three presets or configure a corridor, capacity loss, and duration manually. The page calculates supply gap, price and freight impact, illustrative GDP impact, and SPR exhaustion timing. Assumption sliders make the proxy multipliers visible and adjustable before handing the gap to procurement.

### Procurement orchestrator

This page ranks alternative crude options by capacity, cost, transit time, and risk, then supplies a plain-language six-hour action summary. Gemini provides contextual strategy where available; a cost-aware greedy allocation always takes over if the API cannot respond.

### Reserve optimizer

Adjust the share of the illustrative gap met by SPR drawdown rather than price pass-through. The reserve chart redraws the projected days of cover from day 0 through day 20.

## Assumptions & limitations

The dashboard’s GDELT event signals, EIA price observation, and Gemini analysis layer are explicitly labeled LIVE, STALE, or UNAVAILABLE. GDELT events are cached for one hour; EIA market data and Gemini analysis for five minutes. Failed refreshes serve the last successful response as STALE; without a cached response the UI shows UNAVAILABLE, never invented values. Gemini is an analysis layer—not a source of physical-world facts. The economic model uses clearly labeled illustrative multipliers, not a calibrated econometric model. Scenario supply gaps are India-level proxies: Hormuz applies India’s seeded 45% pre-crisis share of imported crude; other through-routes are scaled from that exposure using seeded global-share ratios and capped at India’s imported-crude requirement. The combined Hormuz + Red Sea preset allocates Red Sea exposure only from the non-Hormuz import basket to avoid double-counting.

## What we’d build with more time

- Live GDELT integration
- Real freight-rate APIs
- A calibrated econometric model
- Multi-country expansion
- A paid API tier for higher throughput

## Team

HackShield — Sujal Giri, Shambhunath Institute of Engineering & Technology, Prayagraj

Teammate: _add name here_
