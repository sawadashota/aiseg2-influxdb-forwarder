import { JSDOM } from 'jsdom';
import DigestClient from 'digest-fetch';

type MetricsElement = {
  name: string;
  value: number;
};

export class AiSEG2 {
  private readonly host: string;
  private readonly user: string;
  private readonly password: string;

  constructor(ipAddress: string, user: string, password: string) {
    if (ipAddress === '') {
      throw new AiSEG2Error('AiSEG2 の IP アドレスが指定されていません。');
    }
    if (user === '') {
      throw new AiSEG2Error('AiSEG2 のログインユーザー名が指定されていません。');
    }
    if (password === '') {
      throw new AiSEG2Error('AiSEG2 のログインパスワードが指定されていません。');
    }

    this.host = ipAddress;
    this.user = user;
    this.password = password;
  }

  private getNumericValue(input: string | null | undefined): number {
    if (input === undefined || input === null) return 0;

    const array = input.match(/[0-9]|\./g);
    if (array === null) return 0;
    return Number(array.join(''));
  }

  async getPowerSummary() {
    const client = new DigestClient(this.user, this.password, { algorithm: 'MD5' });
    const response = await client.fetch(`http://${this.host}/page/electricflow/111`);
    const body = await response.text();

    const dom = await new JSDOM(body);
    const document = dom.window.document;

    const totalGenerationPowerKW: MetricsElement = {
      name: '総発電電力(kW)',
      value: this.getNumericValue(document.getElementById('g_capacity')?.textContent),
    };
    const totalUsagePowerKW: MetricsElement = {
      name: '総消費電力(kW)',
      value: this.getNumericValue(document.getElementById('u_capacity')?.textContent),
    };
    const totalBalancePowerKW: MetricsElement = {
      name: '売買電力(kW)',
      value: totalGenerationPowerKW.value - totalUsagePowerKW.value,
    };

    const generationPowerItems: MetricsElement[] = [];

    const generationPowerItemName1 = document.getElementById('g_d_1_title')?.textContent;
    if (generationPowerItemName1 !== '') {
      generationPowerItems.push({
        name: `${generationPowerItemName1}(W)`,
        value: this.getNumericValue(document.getElementById('g_d_1_capacity')?.textContent),
      });
    }

    const generationPowerItemName2 = document.getElementById('g_d_2_title')?.textContent;
    if (generationPowerItemName2 !== '') {
      generationPowerItems.push({
        name: `${generationPowerItemName2}(W)`,
        value: this.getNumericValue(document.getElementById('g_d_2_capacity')?.textContent),
      });
    }

    const generationPowerItemName3 = document.getElementById('g_d_3_title')?.textContent;
    if (generationPowerItemName3 !== '') {
      generationPowerItems.push({
        name: `${generationPowerItemName3}(W)`,
        value: this.getNumericValue(document.getElementById('g_d_3_capacity')?.textContent),
      });
    }

    return {
      totalGenerationPowerKW,
      totalUsagePowerKW,
      totalBalancePowerKW,
      generationPowerItems,
    };
  }

  async getUsagePowerDetails() {}
}

class AiSEG2Error extends Error {
  static {
    this.prototype.name = 'AiSEG2Error';
  }
}
