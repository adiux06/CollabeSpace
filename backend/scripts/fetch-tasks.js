const http = require('http');

const data = JSON.stringify({
  email: 'test1778472808426@test.com',
  password: 'password123'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => {
    const { accessToken } = JSON.parse(body);
    
    // Get Workspaces
    const wsReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/workspaces',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }, (resWS) => {
      let bWS = '';
      resWS.on('data', c => bWS+=c);
      resWS.on('end', () => {
        const workspaces = JSON.parse(bWS);
        const workspaceId = workspaces[0]._id;
        console.log('Got Workspace ID:', workspaceId);

        const taskData = JSON.stringify({
          title: 'Test Task API',
          priority: 'high',
          status: 'To Do',
          workspaceId,
          tags: []
        });

        const createReq = http.request({
          hostname: 'localhost',
          port: 5000,
          path: '/api/tasks',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': taskData.length,
            'Authorization': `Bearer ${accessToken}`
          }
        }, (res2) => {
          let b2 = '';
          res2.on('data', c => b2+=c);
          res2.on('end', () => console.log('Create Response:', res2.statusCode, b2));
        });
        createReq.write(taskData);
        createReq.end();
      });
    });
    wsReq.end();
  });
});

req.write(data);
req.end();
