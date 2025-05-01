import "dotenv/config";

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SocksProxyAgent } from "socks-proxy-agent";

const app = express();

const UPSTREAM_API_BASE = process.env.UPSTREAM_API_BASE ?? "https://api-benben.imken.dev"
const PROXY_SERVER = process.env.PROXY_SERVER;
const agent = PROXY_SERVER ? new SocksProxyAgent(PROXY_SERVER) : undefined;

console.log(PROXY_SERVER);

const PORT = process.env.PORT ?? 8844;

app.use("/", createProxyMiddleware({
  target: UPSTREAM_API_BASE,
  changeOrigin: true,
  agent,
}));

app.listen(PORT);
