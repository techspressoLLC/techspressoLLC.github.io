# EVENT page switch guide

`partials/event/` には、EVENTページの表示内容を切り替えるためのHTMLを置いています。

## Files

- `coming-soon.html`
  - 現在表示しているEVENTページ
- `popup-cove-hatanodai.html`
  - 以前のPOP UP詳細ページ

## How to switch

1. `script.js` を開く
2. `EVENT_CONTENT_VARIANT` の値を変更する

```js
const EVENT_CONTENT_VARIANT = 'coming-soon';
```

### Values

- `coming-soon`
  - COMING SOONページを表示
- `popup-cove-hatanodai`
  - 以前のPOP UP詳細ページを表示

## Example

以前のEVENTページを復活するとき:

```js
const EVENT_CONTENT_VARIANT = 'popup-cove-hatanodai';
```
