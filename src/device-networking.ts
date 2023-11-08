import debug from 'debug';
import dgram, { RemoteInfo } from 'dgram';
import EventEmitter from 'events';
import net from 'net';
import { decrypt, decryptWithHeader } from 'tplink-smarthome-crypto';

import type { Device } from './device';
import UdpServer from './udp-server';

const log = debug('device');
const logUdp = debug('device:udp');
const logUdpErr = debug('device:udp:error');
const logTcp = debug('device:tcp');
const logTcpErr = debug('device:tcp:error');

const delay = (t: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, t);
  });

export default class DeviceNetworking extends EventEmitter {
  address = '0.0.0.0';

  device;

  model?: string;

  port = 0;

  responseDelay = 0;

  server?: net.Server;

  serverBound = false;

  udpCb?: (msg: Buffer, rinfo: dgram.RemoteInfo) => void;

  udpSocket?: dgram.Socket;

  udpSocketBound = false;

  constructor({
    device,
    model,
    port = 0,
    address = '0.0.0.0',
    responseDelay = 0,
  }: {
    device: Device;
    model: string;
    port?: number;
    address?: string;
    responseDelay?: number;
  }) {
    super();
    this.device = device;
    this.model = model;
    this.port = port;
    this.address = address;
    this.responseDelay = responseDelay;

    this.serverBound = false;
    this.udpSocketBound = false;
  }

  processUdpMessage(msg: Buffer, rinfo: RemoteInfo) {
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

    let response: Buffer | undefined;
    let responseForLog: Buffer | string | undefined;
    try {
      ({ response, responseForLog } =
        this.device.processUdpMessage(decryptedMsg));
    } catch (err) {
      logUdpErr('processUdpMessage, could not process:', decryptedMsg);
      logUdpErr(err);
      this.emit('error', err);
      return;
    }

    if (response !== undefined) {
      delay(this.responseDelay).then(() => {
        if (this.udpSocket == null) throw new Error('udpSocket was undefined');
        if (response == null) throw new Error('Response was undefined');

        logUdp(
          '[%s] UDP responding, delay:%s,',
          this.model,
          this.responseDelay,
          rinfo.port,
          rinfo.address,
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
          rinfo.address,
        );
      });
    }
  }

  processTcpMessage(msg: Buffer, socket: net.Socket) {
    logTcp(
      '[%s] TCP DATA',
      this.model,
      socket.remoteAddress,
      socket.remotePort,
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

    let response: Buffer | string | undefined;
    let responseForLog: Buffer | string | undefined;
    try {
      ({ response, responseForLog } =
        this.device.processTcpMessage(decryptedMsg));
    } catch (err) {
      logTcpErr('processTcpMessage, could not process:', decryptedMsg);
      logTcpErr(err);
      this.emit('error', err);
      return;
    }

    if (response !== undefined) {
      delay(this.responseDelay).then(() => {
        if (response == null) throw new Error('Response was undefined');

        logTcp(
          '[%s] TCP responding, delay:%s,',
          this.model,
          this.responseDelay,
          socket.address(),
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
        if (this.device.endSocketAfterResponse) {
          socket.end();
        }
      });
    }
  }

  async start(): Promise<this> {
    return new Promise((resolve, reject) => {
      try {
        let udpAddress: net.AddressInfo | undefined;
        let retryCount = 0;

        const server = net.createServer((socket) => {
          socket.on('data', (chunk) => {
            this.processTcpMessage(chunk, socket);
          });
          socket.on('error', (err) => {
            this.emit('error', err);
          });
          socket.on('end', () => {
            socket.end();
          });
        });
        this.server = server;

        server.on('listening', () => {
          this.serverBound = true;
          const tcpAddress = server.address() as net.AddressInfo | null;
          if (tcpAddress == null)
            throw new Error('Server.address() returned null');

          this.address = tcpAddress.address;
          this.port = tcpAddress.port;
          log('[%s] TCP server bound', this.model, tcpAddress);
          resolve(this);
        });

        server.on('error', (err) => {
          logTcpErr(err);
          if (
            'code' in err &&
            // @ts-ignore: it's fine
            err?.code === 'EADDRINUSE' &&
            udpAddress != null &&
            retryCount < 2
          ) {
            retryCount += 1;
            logTcpErr('Address in use, retrying...');

            delay(500).then(() => {
              server.close();
              if (udpAddress == null)
                throw new Error('udpAddress was undefined');
              server.listen({ port: udpAddress.port, host: this.address });
            });
          }
          reject(err);
        });

        // bind to UDP then TCP and share port
        const udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.udpSocket = udpSocket;

        // Save to call removeListener on #stop()
        this.udpCb = (msg, rinfo) => {
          this.processUdpMessage(msg, rinfo);
        };

        UdpServer.on('message', this.udpCb);

        udpSocket.on('message', this.udpCb);

        udpSocket.on('error', (exception) => {
          logUdpErr(exception);
          udpSocket.close();
          this.udpSocketBound = false;
          reject(exception);
        });

        udpSocket.bind(this.port, this.address, () => {
          this.udpSocketBound = true;
          udpAddress = udpSocket.address();
          log('[%s] UDP bound', this.model, udpAddress);
          server.listen({ port: udpAddress.port, host: this.address });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async stop(): Promise<this> {
    return new Promise((resolve) => {
      if (typeof this.udpCb === 'function') {
        UdpServer.removeListener('message', this.udpCb);
      }
      if (this.udpSocketBound) {
        if (this.udpSocket != null) this.udpSocket.close();
        this.udpSocketBound = false;
      }
      if (this.serverBound) {
        if (this.server != null)
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
