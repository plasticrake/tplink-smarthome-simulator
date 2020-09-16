const EventEmitter = require('events');
const dgram = require('dgram');
const net = require('net');
const debug = require('debug');
const { decrypt, decryptWithHeader } = require('tplink-smarthome-crypto');

const UdpServer = require('./udp-server');

const log = debug('device');
const logUdp = debug('device:udp');
const logUdpErr = debug('device:udp:error');
const logTcp = debug('device:tcp');
const logTcpErr = debug('device:tcp:error');

class DeviceNetworking extends EventEmitter {
  constructor({
    device,
    model,
    port = 0,
    address = '0.0.0.0',
    responseDelay = 0,
  } = {}) {
    super();
    this.device = device;
    this.model = model;
    this.port = port;
    this.address = address;
    this.responseDelay = responseDelay;

    this.serverBound = false;
    this.udpSocketBound = false;
  }

  processUdpMessage(msg, rinfo) {
    const decryptedMsg = decrypt(msg).toString('utf8');
    logUdp('[%s] UDP receiving', this.model, rinfo.port, rinfo.address);
    this.emit('data', {
      time: Date.now(),
      protocol: 'udp',
      message: decryptedMsg,
      remoteAddress: rinfo.address,
      remotePort: rinfo.port,
    });
    logUdp(decryptedMsg);

    let response;
    let responseForLog;
    try {
      ({ response, responseForLog } = this.device.processUdpMessage(
        decryptedMsg
      ));
    } catch (err) {
      logUdpErr('processUdpMessage, could not process:', decryptedMsg);
      logUdpErr(err);
      this.emit('error', err);
      return;
    }

    if (response !== undefined) {
      setTimeout(() => {
        logUdp(
          '[%s] UDP responding, delay:%s,',
          this.model,
          this.responseDelay,
          rinfo.port,
          rinfo.address
        );
        logUdp(responseForLog);
        this.emit('response', {
          time: Date.now(),
          protocol: 'tcp',
          message: responseForLog,
          remoteAddress: rinfo.address,
          remotePort: rinfo.port,
        });
        this.udpSocket.send(
          response,
          0,
          response.length,
          rinfo.port,
          rinfo.address
        );
      }, this.responseDelay);
    }
  }

  processTcpMessage(msg, socket) {
    logTcp(
      '[%s] TCP DATA',
      this.model,
      socket.remoteAddress,
      socket.remotePort
    );
    const decryptedMsg = decryptWithHeader(msg).toString('utf8');
    logTcp(decryptedMsg);
    this.emit('data', {
      time: Date.now(),
      protocol: 'tcp',
      message: decryptedMsg,
      localAddress: socket.localAddress,
      localPort: socket.localPort,
      remoteAddress: socket.remoteAddress,
      remotePort: socket.remotePort,
    });

    let response;
    let responseForLog;
    try {
      ({ response, responseForLog } = this.device.processTcpMessage(
        decryptedMsg
      ));
    } catch (err) {
      logTcpErr('processTcpMessage, could not process:', decryptedMsg);
      logTcpErr(err);
      this.emit('error', err);
      return;
    }

    if (response !== undefined) {
      Object.assign(socket, { msg_pending: socket.msg_pending + 1 });
      setTimeout(() => {
        logTcp(
          '[%s] TCP responding, delay:%s,',
          this.model,
          this.responseDelay,
          socket.address()
        );
        logTcp(responseForLog);
        this.emit('response', {
          time: Date.now(),
          protocol: 'tcp',
          message: responseForLog,
          localAddress: socket.localAddress,
          localPort: socket.localPort,
          remoteAddress: socket.remoteAddress,
          remotePort: socket.remotePort,
        });
        socket.write(response);
        Object.assign(socket, { msg_pending: socket.msg_pending - 1 });
        if (
          this.device.endSocketAfterResponse ||
          (socket.msg_pending === 0 && socket.close_pending)
        ) {
          socket.end();
        }
      }, this.responseDelay);
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        let udpAddress;
        let retryCount = 0;
        this.server = net.createServer({ allowHalfOpen: true }, (socket) => {
          Object.assign(socket, {
            msg_pending: 0,
            close_pending: false,
          });
          socket.on('data', (chunk) => {
            this.processTcpMessage(chunk, socket);
          });
          socket.on('error', (err) => {
            this.emit('error', err);
          });
          socket.on('end', () => {
            Object.assign(socket, { close_pending: true });
            if (socket.msg_pending === 0) {
              socket.end();
            }
          });
        });
        this.server.on('listening', () => {
          this.serverBound = true;
          const tcpAddress = this.server.address();
          this.address = tcpAddress.address;
          this.port = tcpAddress.port;
          log('[%s] TCP server bound', this.model, tcpAddress);
          resolve(this);
        });
        this.server.on('error', (err) => {
          logTcpErr(err);
          if (
            err.code === 'EADDRINUSE' &&
            udpAddress != null &&
            retryCount < 2
          ) {
            retryCount += 1;
            logTcpErr('Address in use, retrying...');
            setTimeout(() => {
              this.server.close();
              this.server.listen({ port: udpAddress.port, host: this.address });
            }, 500);
            return;
          }
          reject(err);
        });

        // bind to UDP then TCP and share port
        this.udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

        // Save to call removeListener on #stop()
        this.udpCb = (msg, rinfo) => {
          this.processUdpMessage(msg, rinfo);
        };

        UdpServer.on('message', this.udpCb);

        this.udpSocket.on('message', this.udpCb);

        this.udpSocket.on('error', (exception) => {
          logUdpErr(exception);
          this.udpSocket.close();
          this.udpSocketBound = false;
          reject(exception);
        });

        this.udpSocket.bind(this.port, this.address, () => {
          this.udpSocketBound = true;
          udpAddress = this.udpSocket.address();
          log('[%s] UDP bound', this.model, udpAddress);
          this.server.listen({ port: udpAddress.port, host: this.address });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (typeof this.udpCb === 'function') {
        UdpServer.removeListener('message', this.udpCb);
      }
      if (this.udpSocketBound) {
        this.udpSocket.close();
        this.udpSocketBound = false;
      }
      if (this.serverBound) {
        this.server.close(() => {
          this.serverBound = false;
          resolve(this);
        });
      } else {
        resolve(this);
      }
    });
  }
}

module.exports = DeviceNetworking;
