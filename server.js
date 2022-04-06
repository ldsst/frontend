const express = require("express");
const compression = require('compression');
const next = require("next");

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
    .then(() => {
        const server = express();

        server.use(compression());

        server.get('/reset-password/:token', (req, res) => {
            return app.render(req, res, '/reset-password', { token: req.params.token })
        })

         server.get('/block-account/:token', (req, res) => {
            return app.render(req, res, '/block-account', { token: req.params.token })
        })

        server.get("*", (req, res) => handle(req, res));

        const port = 3001;

        server.listen(process.env.PORT || port, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
        });
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    });

module.exports = app;