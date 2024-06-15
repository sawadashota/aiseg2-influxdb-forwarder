import DigestClient from 'digest-fetch';
import { JSDOM } from 'jsdom';

export type SmartMeter = {
  name: string;
  unit: string;
  value: number;
};

export class SmartMeterClient {
  constructor(
    private readonly baseURL: string,
    private readonly client: DigestClient,
  ) {}

  private parse(document: Document): SmartMeter {
    const BUYING = '買電中';

    const candidates = document.querySelectorAll('#valinfo .valimg');
    const filtered = Array.from(candidates).filter((el) => !el.classList.contains('disable'));
    if (filtered.length === 0) {
      throw new Error('No found: #valinfo .valimg:not(.disable)');
    }
    const el = filtered[0];

    const text = el.textContent!.trim();
    const matches = text.match(/^(\d+)([A-Za-z]{1,2})\s+(.+)$/);
    if (!matches || matches.length !== 4) {
      throw new Error(`No matches found text: ${text} matches: ${matches}`);
    }
    let value = parseInt(matches[1].trim()); // Extract the value (e.g., "100")
    const unit = matches[2].trim(); // Extract the unit (e.g., "W")
    const status = matches[3].trim(); // Extract the status (e.g., "売電中")

    if (status === BUYING) {
      value = -value;
    }

    return {
      name: 'SmartMeter',
      unit: unit,
      value: value,
    };
  }

  async getSmartMeter(): Promise<SmartMeter> {
    const response = await this.client.fetch(`${this.baseURL}/page/smartmeter/2`);
    const body = await response.text();

    const dom = new JSDOM(body);
    const document = dom.window.document;

    return this.parse(document);
  }
}
