import express from "express";

import { PORT } from "./config";

import { faker } from "@faker-js/faker";

const app = express();

app.get("/statistics", (_req, res, _next) => {
  res.json({
    today_count: faker.number.int(10_000),
    total_count: faker.number.int({
      min: 5_000_000,
      max: 6_000_000,
    }),
  });
});

const randomUser = () => {
  return {
    userColor: faker.helpers.arrayElement([
      "Red",
      "Orange",
      "Green",
      "Blue",
      "Gray",
      "Purple",
      "Unknown",
    ]),
    userId: faker.number.int(1_000_000),
    username: faker.internet.username(),
  };
};

const randomBenben = () => ({
  content: faker.lorem.sentence(),
  grabTime: faker.date.past().toISOString().slice(0, -1),
  id: faker.number.int(6_000_000),
  time: faker.date.past().toISOString().slice(0, -1),
  ...randomUser(),
});

app.get("/tools/getRandom", (_req, res, _next) => {
  res.json(randomBenben());
});

app.get("/tools/at/:username", (_req, res, _next) => {
  res.json(faker.helpers.multiple(randomBenben, {
    count: {
      min: 0,
      max: 3,
    },
  }));
});

app.get("/tools/circle/:id", (_req, res, _next) => {
  res.json({
    benbenCnt: faker.number.int(100),
    cacheHit: faker.datatype.boolean(),
    result: faker.helpers.multiple(() => ({
      uid: faker.number.int(1_000_000),
      weight: faker.number.int(100),
    }), {
      count: {
        min: 0,
        max: 100,
      }
    }).sort((a, b) => b.weight - a.weight),
  });
});

app.get("/blackHistory/usernames/:id", (_req, res, _next) => {
  res.json(faker.helpers.multiple(() => faker.internet.username(), {
    count: {
      min: 1,
      max: 3,
    },
  }));
});

const benbenCnt = new Map<number, number>();

const getLastFromArrayOrItem = <T>(a: T | Array<T> | undefined): T | undefined => {
  if (Array.isArray(a)) return a.at(-1);
  return a;
};

const parseIntElseDefault = (str: any, def: number): number => {
  const res = parseInt(str);
  if (isNaN(res)) return def;
  return res;
};

app.get("/blackHistory/feed/:id", (req, res, _next) => {
  const page = parseIntElseDefault(getLastFromArrayOrItem(req.query.page), 1);
  const perPage = parseIntElseDefault(getLastFromArrayOrItem(req.query.per_page), 50);
  const id = parseInt(req.params.id);

  if (!benbenCnt.has(id)) {
    benbenCnt.set(id, faker.number.int(10_000));
  }

  const total = benbenCnt.get(id)!;
  const pageCnt = Math.max(Math.min(total - perPage * (page - 1), perPage), 0);

  const user = { ...randomUser(), userId: id };

  res.json({
    count: total,
    feeds: faker.helpers.multiple(() => ({
      ...randomBenben(),
      ...user,
    }), {
      count: pageCnt,
    }),
  });
});

app.get("/tools/heatmap/:id", (_req, res, _next) => {
  const heatmap: Array<{ count: number, date: string }> = [];
  const now = +new Date();
  for (let i = 365; i--;) {
    heatmap.push({
      count: faker.number.int(10),
      date: (new Date(now - i * 86400_000)).toISOString().slice(0, 10),
    });
  }
  res.json(heatmap);
});

app.get("/search/db", (_req, res, _next) => {
  res.json(faker.helpers.multiple(randomBenben, {
    count: 50,
  }));
});

app.get("/list", (_req, res, _next) => {
  res.json(faker.helpers.multiple(randomBenben, {
    count: 100,
  }));
});

app.get("/tools/getFeed/:id", (req, res, _next) => {
  res.json({ ...randomBenben(), id: parseInt(req.params.id) });
});

app.get("/:id", (_req, res, _next) => {
  res.send("Ok");
});

app.use((req, res, _next) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).send("not implemented");
});

app.listen(PORT, () => {
  console.log(`Mock server listening on port ${PORT}.`);
});
