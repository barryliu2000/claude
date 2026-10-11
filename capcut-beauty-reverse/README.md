# 剪映（CapCut）美顏功能：本機逆向流程（使用 REA）

目標：在**裝有剪映的那台電腦**上，用 [REA](https://github.com/morluto/rea)（本機 MCP 逆向工具）+ Claude Code，
弄清楚剪映美顏功能「怎麼運作」（用哪些模組、參數、處理流程），再據此在本機重現／呼叫。

> 雲端容器沒有你的剪映，所以分析必須在你自己的電腦上跑；REA 全程本機執行，不上傳檔案。

## 範圍與界線（請先看）

- ✅ 分析**你自己合法安裝**的剪映，用於理解原理、做互通／學習。
- ✅ 取得「流程、參數名稱、參數範圍、演算法結構」後，用開源方案（MediaPipe / OpenCV / ONNX）自行重現。
- ❌ 不要把剪映內的模型檔、素材、授權金鑰抽出來**散布或商用**，這違反其使用條款與著作權。
- ❌ 不要繞過登入、會員／付費檢查或簽章。

## 1. 安裝 REA（在裝有剪映的電腦）

需要 Node.js + npm：

```bash
npx rea-agents setup        # 選 Claude Code，檢查變更後核准；完成後重啟 Claude Code
npm install --global rea-agents
rea --help
```

原生執行檔（.dll / .exe / .dylib）分析需要 Ghidra 或 Hopper（自備）：

```bash
rea providers --json
rea doctor --provider ghidra --json   # 若 provider_unavailable 用這行診斷
```

## 2. 找到剪映安裝位置

| 系統 | 常見路徑 |
|---|---|
| Windows 剪映專業版 | `%LOCALAPPDATA%\JianyingPro\Apps\<版本>\` |
| Windows CapCut | `%LOCALAPPDATA%\CapCut\Apps\<版本>\` |
| macOS | `/Applications/VideoFusion-macOS.app` 或 `/Applications/CapCut.app` |

美顏常見位置（依版本而異，需實際確認）：

- 特效／濾鏡資源：`Resources\` 或 `effect` 相關目錄，多為資源包（含 `.json` 參數描述）
- 模型：`.model`、`.bytenn`、`.tflite`、`.onnx` 等推論模型（人臉關鍵點、分割）
- 原生函式庫：名稱含 `effect`、`beauty`、`face`、`vesdk`、`lvvideo` 等的 `.dll` / `.dylib`

## 3. 逆向步驟

先列清單、不修改任何檔案：

```bash
# 1) 盤點：哪些檔案跟美顏有關
find "<剪映安裝目錄>" -type f \( -iname "*beauty*" -o -iname "*face*" -o -iname "*effect*" -o -iname "*.model" -o -iname "*.onnx" -o -iname "*.tflite" \) | head -200

# 2) 原生函式庫分析（以 Ghidra 為例）
rea analyze "<path>/xxx_beauty.dll" --provider ghidra --json > beauty-evidence.json
rea search  "<path>/xxx_beauty.dll" "beauty" --provider ghidra --json
rea search  "<path>/xxx_beauty.dll" "smooth" --provider ghidra --json
rea trace   "<path>/xxx_beauty.dll" "whiten" --provider ghidra --json

# 3) 若有 Electron / ASAR 前端（參數 UI 與 JSON）
rea analyze-javascript-application "<path>/app.asar" --json > ui-evidence.json
```

## 4. 交給 Claude Code 的提示詞

在裝有剪映的電腦上開 Claude Code（已註冊 REA），貼上：

```text
用 REA 分析我本機的剪映（安裝目錄：<填入路徑>）的「美顏」功能，只做唯讀分析，不修改任何檔案。
請回答並附上證據（檔案、位址、字串）：
1. 美顏由哪些模組負責（人臉偵測／關鍵點／分割／渲染）？檔名與職責。
2. 磨皮、美白、瘦臉、大眼等各項的參數名稱、數值範圍、預設值。
3. 處理流程順序（例如：偵測 → 關鍵點 → 皮膚遮罩 → 雙邊/高頻磨皮 → 混合）。
4. 用到哪些推論模型（格式、輸入輸出張量尺寸），但不要匯出或複製模型檔。
5. 區分「觀察到的事實」與「推測」，不確定的明確標示未知。
最後把結論整理成 findings.md，我會貼回來讓你重現演算法。
```

## 5. 拿到結果後

把 `findings.md`（不含模型檔）貼回雲端這個 session，我會用開源元件（MediaPipe Face Mesh +
OpenCV 雙邊濾波／高頻保留磨皮、膚色美白、網格變形做瘦臉大眼）依照分析出的參數與流程，
寫成可本機執行的美顏工具並校準效果。

## 常見問題

- **找不到美顏程式碼**：多半在資源包與推論模型，渲染邏輯在 shader（`.glsl` / 編譯後 `.spv`）；
  可請 Claude 用 `rea search` 搜 `smooth`、`whiten`、`skin`、`bilateral`、`faceu`。
- **函式庫被加殼／混淆**：REA 會在證據中標示限制；此時改以「黑盒比對」（相同輸入圖、
  不同滑桿值，比較輸出）反推參數曲線。
- **想直接呼叫剪映的美顏**：官方未公開 API，不建議；請走開源重現。
