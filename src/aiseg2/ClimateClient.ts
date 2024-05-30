import DigestClient from 'digest-fetch';
import { JSDOM } from 'jsdom';

export type Climate = {
  name: string;
  temperature: number;
  humidity: number;
};

export class ClimateClient {
  constructor(
    private readonly baseURL: string,
    private readonly client: DigestClient,
  ) {}

  async getClimates(): Promise<Climate[]> {
    const maxCount = 20;
    let pageCount = 1;
    let pageEndCheck = false;

    const res: Climate[] = [];

    do {
      const response = await this.client.fetch(
        `${this.baseURL}/page/airenvironment/41?page=${pageCount}`,
      );
      const body = await response.text();

      const dom = new JSDOM(body);
      const document = dom.window.document;
      for (let i = 1; i <= 3; i++) {
        const baseId = `base${i}_1`;
        const climate = extractData(document, baseId);
        if (climate) {
          res.push(climate);
        } else {
          pageEndCheck = true;
        }
        pageCount++;
      }
    } while (!pageEndCheck && pageCount < maxCount);
    return res;
  }
}

function extractData(document: Document, baseId: string): Climate | null {
  const baseElement = document.getElementById(baseId);
  if (!baseElement) {
    return null; // ベースが存在しない場合
  }

  // 場所（txt_name）を抽出
  const placeElement = baseElement.querySelector('.txt_name');
  if (!placeElement) {
    return null; // txt_name がない場合はデータがないと扱う
  }
  const name = placeElement ? placeElement.innerHTML.trim().replace(/<br\s*\/?>/g, ' ') : '';

  // .num_wrapper 配下の要素を取得
  const wrapperElement = baseElement.querySelector('.num_wrapper');
  if (!wrapperElement) {
    return null; // .num_wrapper がない場合はデータがないと扱う
  }

  // 温度を抽出
  const temperatureNumbers: string[] = [];
  const temperatureElements = wrapperElement.querySelectorAll('[id^="num_ond_"]');
  temperatureElements.forEach((element) => {
    const classValue = element.className;
    const match = classValue.match(/no(\d+)/);
    if (match) {
      temperatureNumbers.push(match[1]);
    }
  });
  const temperature =
    temperatureNumbers.length === 3
      ? parseFloat(temperatureNumbers[0] + temperatureNumbers[1] + '.' + temperatureNumbers[2])
      : null;

  // 湿度を抽出
  const humidityNumbers: string[] = [];
  const humidityElements = wrapperElement.querySelectorAll('[id^="num_shitudo_"]');
  humidityElements.forEach((element) => {
    const classValue = element.className;
    const match = classValue.match(/no(\d+)/);
    if (match) {
      humidityNumbers.push(match[1]);
    }
  });
  const humidity =
    humidityNumbers.length === 2 ? parseInt(humidityNumbers[0] + humidityNumbers[1], 10) : null;

  // 温度と湿度が有効な値であるかをチェック
  if (temperature !== null && humidity !== null) {
    return {
      name,
      temperature,
      humidity,
    };
  }
  return null;
}
