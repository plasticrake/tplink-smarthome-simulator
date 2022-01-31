import { encrypt, encryptWithHeader } from 'tplink-smarthome-crypto';

import { processCommands, unreliableData } from './utils';
import DeviceNetworking from './device-networking';

export type MethodResponse = { children?: { id: string }[] };

export type CommonSysinfo = {
  alias: string;
  deviceId: string;
  model: string;
  sw_ver: string;
  hw_ver: string;
};

type SysinfoChildren = {
  children?: [{ id: string; alias: string; state: number }];
};

export type PlugSysinfo = CommonSysinfo &
  SysinfoChildren &
  (
    | { type: 'IOT.SMARTPLUGSWITCH' | 'IOT.RANGEEXTENDER.SMARTPLUG' }
    | { mic_type: 'IOT.SMARTPLUGSWITCH' }
  ) &
  ({ mac: string } | { ethernet_mac: string }) & {
    feature: string;
    led_off: 0 | 1;
    relay_state?: 0 | 1;
    dev_name?: string;
    brightness?: number;
  };

type BulbSysinfoLightState = {
  on_off: 0 | 1;
};

export type BulbSysinfo = CommonSysinfo & {
  mic_type: string; // 'IOT.SMARTBULB';
  mic_mac: string;
  description: string;
  light_state: BulbSysinfoLightState;
  is_dimmable: 0 | 1;
  is_color: 0 | 1;
  is_variable_color_temp: 0 | 1;
};

interface DeviceType {
  endSocketAfterResponse?: boolean;
}

type ApiType = {
  system: { get_sysinfo: () => PlugSysinfo | BulbSysinfo };
};

type DataType = {
  alias?: string;
  model: string;
  mac: string;
  system: { sysinfo: PlugSysinfo | BulbSysinfo };
};

class Device implements DeviceType {
  static models = [
    'hs100',
    'hs105',
    'hs110',
    'hs110v2',
    'hs200',
    'hs220',
    'hs300',
    'lb100',
    'lb120',
    'lb130',
  ];

  api: ApiType;

  data: DataType;

  deviceNetworking: DeviceNetworking;

  endSocketAfterResponse?: boolean;

  model: string;

  unreliablePercent = 0;

  #deviceInfo: {
    initDefaults: () => void;
    api: Record<string, unknown>;
    children: Array<{ sysinfo: { id: string } }>;
    data: DataType;
    reset: () => void;
    constructor: { errors: Record<string, unknown> };
  };

  constructor({
    model,
    port = 0,
    address = '0.0.0.0',
    alias,
    responseDelay = 0,
    unreliablePercent = 0,
    data = {},
  }: {
    model: string;
    port?: number;
    address?: string;
    alias?: string;
    responseDelay?: number;
    unreliablePercent?: number;
    data?: Partial<DataType>;
  }) {
    this.deviceNetworking = new DeviceNetworking({
      device: this,
      model,
      port,
      address,
      responseDelay,
    });

    this.model = model;
    const buildableData = { ...data };
    buildableData.model = model;
    if (alias != null) buildableData.alias = alias;

    // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
    const SpecificDevice = require(`./devices/${model}`);
    this.#deviceInfo = new SpecificDevice(buildableData);
    this.#deviceInfo.initDefaults();
    this.api = this.#deviceInfo.api as ApiType;
    this.data = this.#deviceInfo.data;

    this.unreliablePercent = unreliablePercent;
  }

  get address() {
    return this.deviceNetworking.address;
  }

  get port() {
    return this.deviceNetworking.port;
  }

  async start() {
    return this.deviceNetworking.start();
  }

  async stop() {
    return this.deviceNetworking.stop();
  }

  get children() {
    return this.#deviceInfo.children;
  }

  processMessage(
    msg: Buffer | string,
    encryptFn: (arg: string) => Buffer,
    customizerFn?: (
      moduleName: string,
      methodName: string,
      methodResponse: MethodResponse
    ) => MethodResponse
  ) {
    this.#deviceInfo.reset();

    let responseUnencrypted: Buffer | string = processCommands(
      msg,
      this.api,
      this.#deviceInfo.constructor.errors,
      customizerFn
    );

    let response = encryptFn(responseUnencrypted);

    const badData = unreliableData(this.unreliablePercent);
    if (badData !== undefined) {
      responseUnencrypted = badData;
      response = badData;
    }

    return { response, responseForLog: responseUnencrypted };
  }

  processUdpMessage(msg: Buffer | string) {
    return this.processMessage(
      msg,
      encrypt,
      (moduleName, methodName, methodResponse) => {
        // UDP only returns last two characters of child.id
        if (
          moduleName === 'system' &&
          methodName === 'get_sysinfo' &&
          methodResponse &&
          methodResponse.children &&
          methodResponse.children.length > 0
        ) {
          methodResponse.children.forEach((child) => {
            // eslint-disable-next-line no-param-reassign
            child.id = child.id.slice(-2);
          });
        }
        return methodResponse;
      }
    );
  }

  processTcpMessage(msg: Buffer | string) {
    return this.processMessage(msg, encryptWithHeader);
  }
}

export { Device, processCommands };
