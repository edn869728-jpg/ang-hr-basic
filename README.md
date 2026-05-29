# ANG HR Basic

ANG HR Basic 是員工基本版前端。

## GitHub Pages 預計網址

```text
https://edn869728-jpg.github.io/ang-hr-basic/
```

## 版本定位

- 員工登入
- 員工首頁
- 打卡
- 請假申請
- 補打卡申請
- 希望休
- 資料上傳
- 通知查看

## 架構

```text
Flutter App / Browser
→ GitHub Pages 前端
→ GAS API
→ Google Sheets
```

## 設定

請在 `config.js` 設定 GAS Web App `/exec` 網址：

```js
apiBaseUrl: '你的 GAS Web App /exec 網址'
```

不要把 Google Sheet ID、Drive Folder ID、token、真實姓名、電話、身分證、生日寫在前端 repo。
