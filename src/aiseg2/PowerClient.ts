import { JSDOM } from 'jsdom';
import DigestClient from 'digest-fetch';

export type PowerSummary = {
  totalGenerationPowerKW: MetricsElement;
  totalUsagePowerKW: MetricsElement;
  totalBalancePowerKW: MetricsElement;
  detailsGenerationPower: MetricsElement[];
};

export type DetailUsagePower = MetricsElement[];

type MetricsElement = {
  name: string;
  value: number;
};

export class PowerClient {
  constructor(
    private readonly baseURL: string,
    private readonly client: DigestClient,
  ) {}

  private getNumericValue(input: string | null | undefined): number {
    if (input === undefined || input === null) return 0;

    const array = input.match(/[0-9]|\./g);
    if (array === null) return 0;
    return Number(array.join(''));
  }

  async getPowerSummary(): Promise<PowerSummary> {
    const response = await this.client.fetch(`${this.baseURL}/page/electricflow/111`);
    const body = await response.text();

    const dom = new JSDOM(body);
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

    const detailsGenerationPower: MetricsElement[] = [];

    for (let index = 1; index <= 3; index++) {
      const generationPowerItemName = document.getElementById(`g_d_${index}_title`)?.textContent;
      if (generationPowerItemName !== '') {
        detailsGenerationPower.push({
          name: `${generationPowerItemName}(W)`,
          value: this.getNumericValue(
            document.getElementById(`g_d_${index}_capacity`)?.textContent,
          ),
        });
      }
    }

    return {
      totalGenerationPowerKW,
      totalUsagePowerKW,
      totalBalancePowerKW,
      detailsGenerationPower,
    };
  }

  async getDetailsUsagePower(): Promise<DetailUsagePower> {
    let pageEndCheck: string = '';
    let pageCount = 1;
    const maxCount = 20;

    const usagePowerItems: MetricsElement[] = [];

    do {
      const response = await this.client.fetch(
        `${this.baseURL}/page/electricflow/1113?id=${pageCount}`,
      );
      const body = await response.text();

      const dom = new JSDOM(body);
      const document = dom.window.document;

      // 重複ページかどうかチェック
      const checkDuplicate: string[] = [];
      for (let index = 1; index <= 10; index++) {
        const name = document.querySelector(`#stage_${index} > div.c_device`)?.textContent;
        checkDuplicate.push(name ?? '');
      }
      if (pageEndCheck === checkDuplicate.join(',')) {
        break;
      }

      for (let index = 1; index <= 10; index++) {
        const name = document.querySelector(`#stage_${index} > div.c_device`)?.textContent;
        if (name === '' || name === null || name === undefined) {
          continue;
        }

        usagePowerItems.push({
          name: `${name}(W)`,
          value: this.getNumericValue(
            document.querySelector(`#stage_${index} > div.c_value`)?.textContent,
          ),
        });
      }
      pageEndCheck = checkDuplicate.join(',');
      pageCount++;
    } while (pageCount <= maxCount);

    return usagePowerItems;
  }
}
