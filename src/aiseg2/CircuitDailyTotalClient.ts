import DigestClient from 'digest-fetch';
import { JSDOM } from 'jsdom';
import dayjs from 'dayjs';

export type CircuitDailyTotal = {
  date: Date;
  name: string;
  value: number;
};

export type CircuitDailyTotalScrapingOption = {
  name: string;
  circuitId: string;
  unit: string;
  valueHtmlId: string;
};

abstract class CircuitDailyTotalClient {
  protected constructor(
    private readonly baseURL: string,
    private readonly client: DigestClient,
    private readonly option: CircuitDailyTotalScrapingOption,
  ) {}

  // makeDataQuery is base64 encoded JSON string
  // ex: {"day":[2024,6,8],"term":"2024/06/08","termStr":"day","id":"1","circuitid":"30"}
  private makeDataQuery(date: dayjs.Dayjs): string {
    const jsonString = JSON.stringify({
      day: [date.get('year'), date.get('month') + 1, date.get('date')],
      term: date.format('YYYY/MM/DD'),
      termStr: 'day',
      id: '1',
      circuitid: this.option.circuitId,
    });
    return Buffer.from(jsonString).toString('base64');
  }

  private getNumericValue(input: string | null | undefined): number {
    if (input === undefined || input === null) return 0;

    const array = input.match(/[0-9]|\./g);
    if (array === null) return 0;
    return Number(array.join(''));
  }

  async getCircuitDailyTotal(date: dayjs.Dayjs): Promise<CircuitDailyTotal> {
    const response = await this.client.fetch(
      `${this.baseURL}/page/graph/584?data=${this.makeDataQuery(date)}`,
    );
    const body = await response.text();

    const dom = new JSDOM(body);
    const document = dom.window.document;

    const name = this.option.name;
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

export class CircuitDailyTotalPowerUsageEVClient extends CircuitDailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      name: '電力使用量(EV)',
      circuitId: '30',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class CircuitDailyTotalPowerUsageLivingACClient extends CircuitDailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      name: 'リビングエアコン',
      circuitId: '27',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class CircuitDailyTotalPowerUsageMasterRoomACClient extends CircuitDailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      name: '主寝室エアコン',
      circuitId: '26',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}

export class CircuitDailyTotalPowerUsageRoom2ACClient extends CircuitDailyTotalClient {
  constructor(baseURL: string, client: DigestClient) {
    super(baseURL, client, {
      name: '洋室２エアコン',
      circuitId: '25',
      unit: 'kWh',
      valueHtmlId: 'val_kwh',
    });
  }
}
