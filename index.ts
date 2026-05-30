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

export function middleware(req: Request, res: Response, next: NextFunction) {
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