import * as error from '../error';

import fetch from 'node-fetch';
import EndPoint from '../endpoint';
import AdidInfo from '../adidinfo';

interface Request {
  appVer: string;
  sdkVer: string;
  os: string;
  market: string;
  deviceId?: string;
  serialNo?: string;
  previousDeviceId?: string;
  previousSerialNo?: string;
}

interface Response {
  expiryTime: number;
  accessToken: string;
}

interface Headers {
  'appId': string;
  'appSecret': string;
  'requestedBy': string;
  'Content-Type': string;
  'User-Agent': string;
}

function makeRequest(obj: { [name: string]: string }): Request {
  return {
    appVer: obj.appVer,
    sdkVer: obj.sdkVer,
    os: obj.os,
    market: obj.market,
    deviceId: obj.udid,
    serialNo: obj.os,
    previousDeviceId: obj.udid,
    previousSerialNo: obj.os
  }
}

function makeHeaders(obj: { [name: string]: string }): Headers {
  return {
    'appId': obj.appId,
    'appSecret': obj.appSecret,
    'requestedBy': obj.os,
    'User-Agent': obj['User-Agent'],
    'Content-Type': obj['Content-Type']
  }
}

async function CreateWithPreviousInfo(config: Request, adidInfo: AdidInfo): Promise<Response> {
  const url = EndPoint.AccessTokenCreateWithPreviousInfo;

  const body = makeRequest({ ...config, ...adidInfo });
  const headers = makeHeaders({ ...config, 'Content-Type': 'application/json;charset=UTF-8' });

  try {
    const resp = await fetch(url, { method: 'post', body: JSON.stringify(body), headers });
    const json = await resp.json();

    if (!json.expiryTime) {
      throw new error.ZinnyAccessToken.UnknownError(JSON.stringify(json));
    }

    return json;
  } catch (e) {
    if (e instanceof error.ZinnyError) {
      throw e;
    }
    if (e instanceof Error) {
      e = e as Error & { type: string };

      if (e.type === 'system') {
        throw new error.ZinnyAccessToken.NotFoundError(JSON.stringify(e));
      } else if (e.type === 'invalid-json') {
        throw new error.ZinnyAccessToken.InvalidJsonError(JSON.stringify(e));
      } else {
        throw new error.ZinnyAccessToken.UnknownError(JSON.stringify(e));
      }
    }
  }
}

export const ZinnyAccessToken = {
  CreateWithPreviousInfo,
};