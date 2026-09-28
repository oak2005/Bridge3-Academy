-- Bridge3 Academy — Round 2: Tools Directory Schema & Seeds (Phase 5)
-- Run this in Supabase SQL Editor

create table if not exists tool_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references tool_categories(id) on delete cascade,
  name text not null,
  description text not null,
  url text not null,
  logo_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  order_index integer not null default 0,
  pricing_type text not null default 'free' check (pricing_type in ('free', 'freemium', 'paid')),
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_tools_category on tools(category_id);
create index if not exists idx_tools_published on tools(is_published);
create index if not exists idx_tools_featured on tools(is_featured);

-- RLS
alter table tool_categories enable row level security;
alter table tools enable row level security;

create policy "Anyone can view categories"
  on tool_categories for select
  using (true);

create policy "Anyone can view published tools"
  on tools for select
  using (is_published = true);

-- Seed tool categories
insert into tool_categories (id, name, slug, description, order_index) values
  ('11111111-1111-1111-1111-111111111101', 'Wallets', 'wallets', 'Secure crypto wallets for Stacks, Bitcoin, and EVM ecosystems.', 1),
  ('11111111-1111-1111-1111-111111111102', 'Centralized Exchanges (CEX)', 'cex', 'Fiat-to-crypto gateways with high support across Africa.', 2),
  ('11111111-1111-1111-1111-111111111103', 'Decentralized Exchanges (DEX)', 'dex', 'Swap tokens and provide liquidity directly from your wallet.', 3),
  ('11111111-1111-1111-1111-111111111104', 'Block Explorers', 'explorers', 'Track on-chain transactions, smart contracts, and addresses.', 4),
  ('11111111-1111-1111-1111-111111111105', 'Portfolio Trackers', 'trackers', 'Track market data, prices, and your crypto holdings.', 5),
  ('11111111-1111-1111-1111-111111111106', 'Security & Safety', 'security', 'Protect your assets and revoke smart contract allowances.', 6),
  ('11111111-1111-1111-1111-111111111107', 'Developer Tools', 'dev-tools', 'IDEs, playgrounds, and smart contract development tools.', 7),
  ('11111111-1111-1111-1111-111111111108', 'Community & Governance', 'community', 'Official forums, governance spaces, and communities.', 8)
on conflict (slug) do nothing;

-- Seed verified tools
insert into tools (category_id, name, description, url, is_featured, is_published, order_index, pricing_type, difficulty, tags) values
  -- Wallets
  ('11111111-1111-1111-1111-111111111101', 'Leather Wallet', 'The leading Bitcoin and Stacks Web3 wallet. Connect to Clarity dApps, manage STX and Ordinals.', 'https://leather.io', true, true, 1, 'free', 'beginner', '{"stacks", "bitcoin", "wallet", "recommended"}'),
  ('11111111-1111-1111-1111-111111111101', 'Xverse Wallet', 'Mobile and web wallet built for Bitcoin, Stacks, and BRC-20 tokens. Easy staking and DeFi.', 'https://www.xverse.app', true, true, 2, 'free', 'beginner', '{"stacks", "bitcoin", "mobile", "ordinals"}'),
  ('11111111-1111-1111-1111-111111111101', 'MetaMask', 'The industry-standard Ethereum and EVM wallet for dApps and tokens.', 'https://metamask.io', false, true, 3, 'free', 'beginner', '{"ethereum", "evm", "wallet"}'),

  -- CEX
  ('11111111-1111-1111-1111-111111111102', 'Luno', 'Secure fiat-to-crypto exchange operating extensively in Nigeria, South Africa, and Uganda.', 'https://www.luno.com', true, true, 1, 'freemium', 'beginner', '{"cex", "fiat", "africa", "mobile"}'),
  ('11111111-1111-1111-1111-111111111102', 'Quidax', 'African cryptocurrency exchange offering direct local currency deposits and withdrawals.', 'https://www.quidax.com', true, true, 2, 'freemium', 'beginner', '{"cex", "fiat", "nigeria", "africa"}'),
  ('11111111-1111-1111-1111-111111111102', 'Binance', 'Global cryptocurrency exchange with extensive P2P liquidity across African nations.', 'https://www.binance.com', false, true, 3, 'freemium', 'intermediate', '{"cex", "p2p", "trading"}'),

  -- DEX
  ('11111111-1111-1111-1111-111111111103', 'ALEX Lab', 'The premiere DeFi protocol on Bitcoin via Stacks. Swap STX tokens, lend, borrow, and earn yield.', 'https://alexlab.co', true, true, 1, 'free', 'intermediate', '{"dex", "stacks", "defi", "bitcoin"}'),
  ('11111111-1111-1111-1111-111111111103', 'Uniswap', 'The largest decentralized exchange protocol on Ethereum, Arbitrum, and Polygon.', 'https://app.uniswap.org', false, true, 2, 'free', 'intermediate', '{"dex", "ethereum", "defi"}'),

  -- Block Explorers
  ('11111111-1111-1111-1111-111111111104', 'Hiro Stacks Explorer', 'Inspect Stacks blocks, transactions, smart contracts, and microblocks in real time.', 'https://explorer.hiro.so', true, true, 1, 'free', 'beginner', '{"stacks", "explorer", "hiro"}'),
  ('11111111-1111-1111-1111-111111111104', 'Mempool.space', 'Live Bitcoin mempool visualizer, transaction fee estimator, and block explorer.', 'https://mempool.space', true, true, 2, 'free', 'beginner', '{"bitcoin", "mempool", "explorer"}'),
  ('11111111-1111-1111-1111-111111111104', 'Etherscan', 'Comprehensive block explorer and analytics platform for Ethereum.', 'https://etherscan.io', false, true, 3, 'free', 'intermediate', '{"ethereum", "explorer"}'),

  -- Portfolio Trackers
  ('11111111-1111-1111-1111-111111111105', 'CoinGecko', 'Independent cryptocurrency data aggregator with real-time prices, charts, and market caps.', 'https://www.coingecko.com', true, true, 1, 'free', 'beginner', '{"prices", "charts", "portfolio"}'),
  ('11111111-1111-1111-1111-111111111105', 'CoinMarketCap', 'Popular cryptocurrency tracking and discovery platform.', 'https://coinmarketcap.com', false, true, 2, 'free', 'beginner', '{"prices", "market-cap"}'),

  -- Security
  ('11111111-1111-1111-1111-111111111106', 'Revoke.cash', 'Manage token allowances and revoke access to rogue or unused smart contracts.', 'https://revoke.cash', true, true, 1, 'free', 'beginner', '{"security", "allowance", "must-have"}'),

  -- Developer Tools
  ('11111111-1111-1111-1111-111111111107', 'Clarity Playground', 'Interactive browser sandbox to write, test, and run Clarity smart contracts without setup.', 'https://clarity-lang.org', true, true, 1, 'free', 'beginner', '{"clarity", "stacks", "developer", "playground"}'),
  ('11111111-1111-1111-1111-111111111107', 'Remix IDE', 'Browser-based integrated development environment for Solidity smart contracts.', 'https://remix.ethereum.org', false, true, 2, 'free', 'intermediate', '{"solidity", "ethereum", "developer", "ide"}');
