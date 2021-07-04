const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
    target: 'https://zap.co.il', // target host
    changeOrigin: true, // needed for virtual hosted sites

    pathRewrite: {
        '^/q/': '', // rewrite path
    },
    onProxyRes
};

function onProxyRes(proxyRes, req, res) {
    console.log(proxyRes.headers)
    // proxyRes.headers['x-added'] = 'foobar'; // add new header to response
    // console.log(proxyRes.headers)
    // delete proxyRes.headers['x-removed']; // remove header from response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    console.log(proxyRes.headers)
}

const exampleProxy = createProxyMiddleware(options);
const app = express();
app.use('/q', exampleProxy);
app.listen(3000);