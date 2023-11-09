import dgram from 'node:dgram';
import EventEmitter from 'node:events';

import debug from 'debug';
import type TypedEmitter from 'typed-emitter';

const log = debug('tplink-simulator:udp-server');
const logErr = debug('tplink-simulator:udp-server:error');

type UdpServerEvents = {
  message: (msg: Buffer, rinfo: dgram.RemoteInfo) => void;
};

class UdpServer extends (EventEmitter as new () => TypedEmitter<UdpServerEvents>) {
  socketBound = false;

  socket: dgram.Socket | undefined = undefined;

  constructor() {
    super();
    this.setMaxListeners(25);
  }

  start({ port = 9999 } = {}): Promise<UdpServer> {
    return new Promise((resolve, reject) => {
      try {
        const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.socket = socket;

        socket.on('listening', () => {
          const address = socket.address();
          this.socketBound = true;
          log('UDP server listening', address);
          resolve(this);
        });

        socket.on('message', (msg, rinfo) => {
          this.emit('message', msg, rinfo);
        });

        socket.on('error', (exception) => {
          logErr(exception);
          socket.close();
          this.socketBound = false;
          reject(exception);
        });

        socket.bind(port);
      } catch (err) {
        reject(err);
      }
    });
  }

  stop() {
    if (this.socketBound) {
      if (this.socket != null) this.socket.close();
      this.socketBound = false;
    }
  }
}

export default new UdpServer();
