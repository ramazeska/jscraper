const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
    target: 'https://aliexpress.com', // target host
    changeOrigin: true, // needed for virtual hosted sites

    pathRewrite: {
        '^/q/': '', // rewrite path
    },
    followRedirects: true,
    onProxyRes,
    //onProxyReq,
    // logLevel: 'debug',
    // logProvider
};


// simple replace
function logProvider(provider) {
    // replace the default console log provider.
    return require('morgan');
}

function onProxyReq(proxyReq, req, res){
    // console.log("Request")
    // console.log(proxyReq.headers)
}

function onProxyRes(proxyRes, req, res) {
    // console.log("not modified\n"+JSON.stringify(proxyRes.headers))
    delete proxyRes.headers['location']
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    proxyRes.headers['access-control-allow-origin'] = '*'
    console.log(proxyRes.headers)
    // console.log(`status: ${proxyRes.headers}, ${res.status}`)
}

const exampleProxy = createProxyMiddleware(options);
const app = express();
app.use(morgan('combined'))
app.use('/q', exampleProxy);
app.listen(3000);