var url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;
var app = require("http").createServer(handler);
var io = require('socket.io')(app);

app.listen(parseInt(port, 10));
;

function handler (request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };



  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
}




var count = 0;
var clients = {};



io.on('connection', function(socket){
    console.log("client connected");
    var id = count++;
    // Store the connection method so we can loop through & contact all clients
    clients[id] = socket

    socket.on('data', function(data) {
       // The string message that was sent to us
        // Loop through all clients
        for(var i in clients){
            // Send a message to the client with the message
            clients[i].emit('message', data);
        }
    });
    socket.on('disconnect', function(reasonCode, description) {
        delete clients[id];
        console.log('client disconnected.');
    });

});

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");