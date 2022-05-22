# 技術要素

- GAS
- Typescript

# 開発環境セットアップ

## yarn と node のインストール

```
$ brew install yarn node@16.14.0
```

## dependencies のインストール

```
$ yarn
```

## Apps Script の開発環境準備

```
$ clasp login
```

- 上記のコードを実行することで web ブラウザが開き、Google へのログイン、認証が始まります。
- 許可をした後、Apps Script への操作が可能になります。

  #### ※ clasp について、詳しくは[こちら](https://github.com/google/clasp)へ

- Apps Script への push には、ルートプロジェクトに dist ディレクトリが必要になります。

# Docs

## FigmaToGS について

- Figma で作成したデザインを画像化し、Google Slides に自動で貼り付ける GAS スクリプトです。

## 使用方法

![デザイン例](/assets/images/docs/figma-sample-design.png)

![PC側スライド_1](/assets/images/docs/slides-sample-images-pc_1.png)

![SP側スライド_1](/assets/images/docs/slides-sample-images-sp_1.png)

### 事前準備

- 環境変数（後述）を指定します。
- 別の Google Spread Sheet に同期する Slides の対象スライド ID とスライド名を入力しておき、Spread Sheet ID を指定してください。
- ビルドし、コンパイルされた成果物を Apps Script へプッシュ（コマンドあり）し、main.js に記載している figmaToGs 関数を実行してください。

### Figma

- Slides に送るデザインは、Pages の Frame に限ります。
- また、Frame は以下の条件に合致する場合に、Slides へと送信されます。
  - Frame 名の最後に`~~~-GS:PC-`を付けた場合、PC のデザインを保つ
  - Frame 名の最後に`~~~-GS:SP-`を付けた場合、SP のデザインを保つ
