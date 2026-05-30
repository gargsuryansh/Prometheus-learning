import express from "express";
import type { Request, Response, NextFunction } from "express";
import promClient from "prom-client";

const app = express();
app.use(middleware);

const requestCounter = new promClient.Counter({
    name: "http_requests_total",
    help: "Total numbr of HTTP requests",
    labelNames: ['method', 'route', 'status_code']

});

const activeRequestGauge = new promClient.Gauge({
    name: "active_requests",
    help: "Number of active requests"
});

export const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000] // Define your own buckets here
});

export function middleware(req: Request, res: Response, next: NextFunction) {
    activeRequestGauge.inc();
    const startTime = Date.now()

    res.on('finish', () => {
        const endTime = Date.now();
        console.log(`Request took ${endTime - startTime} ms`);

        //Increment request counter

        requestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });

        if (req.route.path !== "/metrics") {
            activeRequestGauge.dec();
        }

        httpRequestDurationMicroseconds.observe({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            code: res.statusCode,
        }, endTime - startTime);
    });

    next();
}



app.get("/cpu", (req, res) => {
    for (let i = 0; i < 1000000000; i++) {
        Math.random();
    }
    res.json({
        message: "cpu"
    })
})

app.get("/timer", async (req, res) => {
    await new Promise(s => setTimeout(s, 10000));
    res.json({
        message: "timer"
    })
})

app.get("/users", (req, res) => {

    res.json({
        message: "users"
    })
    const endTime = Date.now();

})

app.get("/metrics", async (req, res) => {
    const metrics = await promClient.register.metrics();
    console.log(promClient.register.contentType);
    res.set('content-Type', promClient.register.contentType);
    res.end(metrics);
});

app.listen(3000);