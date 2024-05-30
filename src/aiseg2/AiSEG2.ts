import DigestClient from 'digest-fetch';
import { PowerClient } from './PowerClient';
import { AiSEG2Error } from './error';
import { ClimateClient } from './ClimateClient';

export class AiSEG2 {
  public readonly power: PowerClient;
  public readonly climate: ClimateClient;

  constructor(host: string, user: string, password: string, useHTTPS = false) {
    if (host === '') {
      throw new AiSEG2Error('AiSEG2 のホストが指定されていません。');
    }
    if (user === '') {
      throw new AiSEG2Error('AiSEG2 のログインユーザー名が指定されていません。');
    }
    if (password === '') {
      throw new AiSEG2Error('AiSEG2 のログインパスワードが指定されていません。');
    }

    const baseURL = `${useHTTPS ? 'https' : 'http'}://${host}`;
    const client = new DigestClient(user, password, { algorithm: 'MD5' });

    this.power = new PowerClient(baseURL, client);
    this.climate = new ClimateClient(baseURL, client);
  }
}
