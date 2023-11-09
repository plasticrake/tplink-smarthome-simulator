import EventEmitter from 'events';
import dgram from 'dgram';
import debug from 'debug';

const log = debug('tplink-simulator:udp-server');
const logErr = debug('tplink-simulator:udp-server:error');

interface UdpServerType extends EventEmitter {
  start: () => Promise<UdpServerType>;
  stop: () => void;
  socketBound: boolean;
  socket?: dgram.Socket;
}

const Emitter = new EventEmitter();
Emitter.setMaxListeners(25);

const UdpServer: UdpServerType = Object.assign(Emitter, {
  socketBound: false,

  socket: undefined,

  start: function start({ port = 9999 } = {}): Promise<UdpServerType> {
    const self = UdpServer;

    return new Promise((resolve, reject) => {
      try {
        const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        self.socket = socket;

        socket.on('listening', () => {
          const address = socket.address();
          self.socketBound = true;
          log('UDP server listening', address);
          resolve(UdpServer);
        });

        socket.on('message', (msg, rinfo) => {
          self.emit('message', msg, rinfo);
        });

        socket.on('error', (exception) => {
          logErr(exception);
          socket.close();
          self.socketBound = false;
          reject(exception);
        });

        socket.bind(port);
      } catch (err) {
        reject(err);
      }
    });
  },

  stop: function stop() {
    const self = UdpServer;
    if (self.socketBound) {
      if (self.socket != null) self.socket.close();
      self.socketBound = false;
    }
  },
});

export default UdpServer as UdpServerType;
