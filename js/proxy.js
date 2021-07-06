const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
    target: 'https://aliexpress.com', // target host
    changeOrigin: true, // needed for virtual hosted sites

    pathRewrite: {
        '^/q/': '', // rewrite path
    },
    followRedirects: true,
    onProxyRes,
    onProxyReq
};

function onProxyReq(proxyReq, req, res){
    console.log("Request")
    console.log(proxyReq.headers)
}

function onProxyRes(proxyRes, req, res) {
    console.log("not modified\n"+JSON.stringify(proxyRes.headers))
    // proxyRes.headers['x-added'] = 'foobar'; // add new header to response
    // console.log(proxyRes.headers)
    // delete proxyRes.headers['x-removed']; // remove header from response
    delete proxyRes.headers['location']
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    proxyRes.headers['access-control-allow-origin'] = '*'
    console.log(proxyRes.headers)
}

const exampleProxy = createProxyMiddleware(options);
const app = express();
app.use('/q', exampleProxy);
app.listen(3000);