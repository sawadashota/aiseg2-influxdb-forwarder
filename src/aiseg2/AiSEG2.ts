import DigestClient from 'digest-fetch';
import { PowerClient } from './PowerClient';
import { AiSEG2Error } from './error';
import { ClimateClient } from './ClimateClient';
import {
  DailyTotalGasUsageClient,
  DailyTotalHotWaterUsageClient,
  DailyTotalPowerBuyingClient,
  DailyTotalPowerGenerationClient,
  DailyTotalPowerSellingClient,
  DailyTotalPowerUsageClient,
} from './DailyTotalClient';
import { CircuitDailyTotalPowerUsageEVClient } from './CircuitDailyTotalClient';

export class AiSEG2 {
  public readonly power: PowerClient;
  public readonly climate: ClimateClient;
  public readonly dailyTotalPowerUsage: DailyTotalPowerUsageClient;
  public readonly dailyTotalPowerGeneration: DailyTotalPowerGenerationClient;
  public readonly dailyTotalPowerBuying: DailyTotalPowerBuyingClient;
  public readonly dailyTotalPowerSelling: DailyTotalPowerSellingClient;
  public readonly dailyTotalHotWaterUsage: DailyTotalHotWaterUsageClient;
  public readonly dailyTotalGasUsage: DailyTotalGasUsageClient;
  public readonly circuitDailyTotalPowerUsageEV: CircuitDailyTotalPowerUsageEVClient;

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
    this.dailyTotalPowerUsage = new DailyTotalPowerUsageClient(baseURL, client);
    this.dailyTotalPowerGeneration = new DailyTotalPowerGenerationClient(baseURL, client);
    this.dailyTotalPowerBuying = new DailyTotalPowerBuyingClient(baseURL, client);
    this.dailyTotalPowerSelling = new DailyTotalPowerSellingClient(baseURL, client);
    this.dailyTotalHotWaterUsage = new DailyTotalHotWaterUsageClient(baseURL, client);
    this.dailyTotalGasUsage = new DailyTotalGasUsageClient(baseURL, client);
    this.circuitDailyTotalPowerUsageEV = new CircuitDailyTotalPowerUsageEVClient(baseURL, client);
  }
}
