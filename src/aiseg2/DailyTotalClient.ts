import DigestClient from 'digest-fetch';
import { JSDOM } from 'jsdom';
import dayjs from 'dayjs';

export type DailyTotal = {
  date: Date;
  name: string;
  value: number;
};

export type DailyTotalScrapingOption = {
  graphId: string;
  unit: string;
  valueHtmlId: string;
};

abstract class DailyTotalClient {
  protected constructor(
    private readonly baseURL: string,
    private readonly client: DigestClient,
    private readonly option: DailyTotalScrapingOption,
  ) {}

  // makeDataQuery is base64 encoded JSON string
  // ex: {"day":[2024,6,6],"month_compare":"mon","day_compare":"day"}
  private makeDataQuery(date: dayjs.Dayjs): string {
    const jsonString = JSON.stringify({
      day: [date.get('year'), date.get('month') + 1, date.get('date')],
      month_compare: 'mon',
      day_compare: 'day',
    });
    return Buffer.from(jsonString).toString('base64');
  }

  private getNumericValue(input: string | null | undefined): number {
    if (input === undefined || input === null) return 0;

    const array = input.match(/[0-9]|\./g);
    if (array === null) return 0;
    return Number(array.join(''));
  }

  async getDailyTotalPower(date: dayjs.Dayjs): Promise<DailyTotal> {
    const response = await this.client.fetch(
      `${this.baseURL}/page/graph/${this.option.graphId}?data=${this.makeDataQuery(date)}`,
    );
    const body = await response.text();

    const dom = new JSDOM(body);
    const document = dom.window.document;

    const name = document.getElementById(`h_title`)?.textContent ?? '';
    const value = this.getNumericValue(
      document.getElementById(this.option.valueHtmlId)?.textContent,
    );
    return {
      date: date.toDate(),
      name: `${name}(${this.option.unit})`,
      value: value,
    };
  }
}

export class DailyTotalPowerGenerationClient extends DailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      graphId: '51111',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class DailyTotalPowerBuyingClient extends DailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      graphId: '53111',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class DailyTotalPowerSellingClient extends DailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      graphId: '54111',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class DailyTotalPowerUsageClient extends DailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      graphId: '52111',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class DailyTotalHotWaterUsageClient extends DailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      graphId: '55111',
      unit: 'L',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class DailyTotalGasUsageClient extends DailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      graphId: '57111',
      unit: '㎥',
      valueHtmlId: 'val_kwh',
    });
  }
}
