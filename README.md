# aiseg2-influxdb

パナソニック製の AiSEG2 から利用できる Web インターフェースにある各情報をスクレイピングして influxdb に投入するツールです。

後述の通りすべての環境で動作を保証していないので自己責任です。

## 動作環境

このツールを使用するには、動作環境にて Node.js のインストール及び、Web操作が可能な AiSEG2端末が必要です。

下記環境で動作確認をしています。作者自宅の機材でしか動作確認していないため、それ以外の環境の動作は保証できません。

- 実行環境
  - Nix `2.18.5`
  - System `aarch64-darwin`
- AiSEG2
  - 本体型番 `MKN713`
  - ファームウェア `Ver.2.97I-01`

## 機能概要

本ツールでは以下の機能をサポートしています。

- AiSEG2 から取得したメトリクスを指定の influxdb へ保存
- AiSEG2 から取得できる項目は以下のとおりです。
  - 消費電力の合計
  - 発電電力の合計
  - 売電電力（消費電力の合計と発電電力の合計の差）
  - AiSEG2 が認識している発電機器ごとの発電量（最大3つまで）
  - AiSEG2 の計測回路に設定された回路ごとの消費電力

## 導入方法

### 注意点

AiSEG2 はそのままでは HTTP しか喋らないため、LAN など境界内でツールを展開してください。

境界外からアクセスする場合は別途トンネリングやリバースプロキシなどをつかって経路の暗号化を実施してください。

### 事前準備

```shell
cp .envrc.sample .envrc
direnv allow
```

### ツールのインストール

ホスト環境の適当な作業ディレクトリで本リポジトリをクローンします。

```sh
git clone https://github.com/sawadashota/aiseg2-influxdb.git
```

リポジトリ内に入ります。

```sh
cd ./aiseg2-influxdb
```

依存パッケージをインストールします。

```sh
make setup
```

設定ファイル（`.env`）をサンプルファイルからコピーしてご利用の環境に合わせて設定値を入れます。

```sh
cp .env.sample .env
```

### ツールの起動

以下のコマンドで起動することができます。

```sh
make start
```
