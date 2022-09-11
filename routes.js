const fs = require('fs');

const requestHandler = (req, res) => {
  const requestUrl = req.url;
  const requestMethod = req.method;

  if (requestUrl === '/') {
    res.write('<html>');
    res.write('<head><title>Enter message</title></head>');
    res.write('<body><form action="/message" method="POST"><input type="text" name="inputMessage"></input><button type="submit">Send</button></form></body>');
    res.write('</.body>');
    return res.end();
  } else if (requestUrl === '/message' && requestMethod === 'POST') {
    const requestBody = [];
    req.on('data', chunk => requestBody.push(chunk));

    return req.on('end', () => {
      const parsedBody = Buffer.concat(requestBody).toString();
      const message = parsedBody.split('=')[1];
      fs.writeFile('message.txt', message, err => {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  }

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>Random title in the Head</title></head>');
  res.write('<body><h1>Random h1 in the Body</h1></body>');
  res.write('</.body>');
  res.end();
}

module.exports = requestHandler;

// module.exports.handler = requestHandler;
// exports.handler = requestHandler;