import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as nseData from "./nse_data.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1386e4ec/health", (c) => {
  return c.json({ status: "ok" });
});

// Get NSE indices
app.get("/make-server-1386e4ec/indices", async (c) => {
  try {
    const indices = await nseData.fetchIndices();
    return c.json({ success: true, data: indices });
  } catch (error) {
    console.error('Error fetching indices:', error);
    return c.json({ success: false, error: 'Failed to fetch indices' }, 500);
  }
});

// Get single stock quote
app.get("/make-server-1386e4ec/quote/:symbol", async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const exchange = c.req.query('exchange') as 'NSE' | 'NYSE' | 'NASDAQ' || 'NSE';
    
    const quote = await nseData.fetchStockData(symbol, exchange);
    
    if (!quote) {
      return c.json({ success: false, error: 'Stock not found' }, 404);
    }
    
    return c.json({ success: true, data: quote });
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return c.json({ success: false, error: 'Failed to fetch stock quote' }, 500);
  }
});

// Get multiple stock quotes
app.post("/make-server-1386e4ec/quotes", async (c) => {
  try {
    const body = await c.req.json();
    const symbols = body.symbols || [];
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return c.json({ success: false, error: 'Invalid symbols array' }, 400);
    }
    
    const quotes = await nseData.fetchMultipleStocks(symbols);
    return c.json({ success: true, data: quotes });
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return c.json({ success: false, error: 'Failed to fetch quotes' }, 500);
  }
});

// Get top gainers
app.get("/make-server-1386e4ec/top-gainers", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const gainers = await nseData.fetchTopGainers(limit);
    return c.json({ success: true, data: gainers });
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return c.json({ success: false, error: 'Failed to fetch top gainers' }, 500);
  }
});

// Get top losers
app.get("/make-server-1386e4ec/top-losers", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const losers = await nseData.fetchTopLosers(limit);
    return c.json({ success: true, data: losers });
  } catch (error) {
    console.error('Error fetching top losers:', error);
    return c.json({ success: false, error: 'Failed to fetch top losers' }, 500);
  }
});

Deno.serve(app.fetch);