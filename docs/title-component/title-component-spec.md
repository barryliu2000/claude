# 風格標題元件設計規格（9:16）

版本：v3 ｜ 適用：IG 限時動態、Reels 封面、輪播封面 ｜ 畫布：1080 × 1920

## 1. 範圍

本規格定義「風格標題」元件的視覺參數與實作方式。元件只包含主標題，不含任何裝飾小字（`.tag`、`.foot` 已全數移除）。

已定稿樣式：01 原配色、02 反轉、03 單色奶油、05 奶油紙雕、07 金箔、13 光暈鑲邊、14 螢光筆。

## 2. 設計來源

- 配色取自參考圖（實際取樣）：青綠 `#306C6C`、奶油 `#F0E4D8`、珊瑚 `#E46C48`。
- 立體感來自**單一平行光**：擠出與投影都朝同一方向，投影為硬邊。
- 不使用背景暈影（Halo）與外發光，影子只來自光線投出的那一條。

## 3. 結構

```
Card (1080×1920, flex 置中)
├─ 背景      （linear / radial gradient，見第 8 節；不是暈影）
└─ Title     （h1，position: relative，兩行，每行 display:block）
     ├─ Line 1  （fill 漸層 A）
     └─ Line 2  （fill 漸層 B）
```

不包含：Halo 元素、`.tag`、`.foot`。

## 4. 排版

| 參數 | 值 |
|---|---|
| 字重 | 900（Noto Sans TC） |
| 字級 | 176px |
| 行高 | 1.22 |
| 對齊 | 置中 |
| 字距 | 預設 |

## 5. 光源與立體擠出（Extrude）

以多層 `drop-shadow` 疊加實作，不使用 `text-shadow`，因為漸層字面會被 `text-shadow` 蓋住。

### 5.1 光源

| 參數 | 值 |
|---|---|
| 光線方向（單位向量） | `LIGHT = (0.5, 0.866)`，即往右下約 60° |
| 光源數量 | 1（平行光） |

擠出與投影都沿 `LIGHT` 方向排列，不另外設定角度。

### 5.2 擠出層

| 參數 | 值 |
|---|---|
| 層數 `depth` | 7（統一值） |
| 每層沿光線推進 `step` | 0.6px，第 i 層位移 = `i × 0.6 × LIGHT` |
| 總位移 | 約 (2.1px, 3.6px) |
| 側壁顏色 | 由 `from` 線性插值到 `to`，t = (i−1)/(depth−1) |
| 頂緣細光 | `drop-shadow(0 -1px 0 rgba(255,255,255,.5))`，置於最前 |

### 5.3 投影

| 參數 | 值 |
|---|---|
| 位移 | `k = 6px` 沿 `LIGHT`，即 (3px, 5.2px) |
| 模糊 | 0（硬邊） |
| 顏色 | `rgba(0,0,0,.28)` |
| 位置 | 最後一層 |

產生順序：頂緣細光 → 擠出層（i = 1…depth）→ 投影。

### 5.4 各樣式的側壁色（from → to）

| 樣式 | 字面 | from | to |
|---|---|---|---|
| 01 原配色 | 奶油 / 珊瑚 | `#E4D8CC` | `#2A5A5E` |
| 02 反轉 | 青綠 / 珊瑚 | `#5F9DA0` | `#143A3C` |
| 03 單色奶油 | 奶油 | `#E4D8CC` | `#0C3030` |
| 05 奶油紙雕 | 白紙 | `#D8CDB6` | `#A08C70` |
| 07 金箔 | 金 | `#9A6A22` | `#0C3030` |
| 13 光暈鑲邊 | 奶油白 | `#8FC4C6` | `#0C3030` |

14 螢光筆**不做擠出**（試過，螢光條下方的邊會變得雜亂）。

## 6. 字面填色（Fill）

所有字面採直向漸層，並以 `background-clip: text` 套用；`.title` 的 `color` 設為 `transparent`。

| 名稱 | 漸層（上 → 下） |
|---|---|
| fill-cream | `#FCF0E4` → `#F0E4D8` 60% → `#E4D8CC` |
| fill-coral | `#F0A884` → `#E46C48` 60% → `#D85C3C` |
| fill-teal | `#5F9DA0` → `#306C6C` 55% → `#2A5E62` |
| fill-paper | `#FFFFFF` → `#F6EFE0` 70% → `#ECE2CF` |
| fill-gold | `#FFF1C4` → `#E8B964` 55% → `#9A6A22` |

13 與 14 的字面為純色（13：`#FCF0E4`；14：`#0C3030`），不使用漸層。

## 7. 暈影與外發光（已移除）

v2 的 Halo（徑向暈影）與 13 的外發光（`drop-shadow(0 0 16px ...)`）已全部移除，理由是使用者要求影子只來自燈光。

- 不得在文字周圍加任何對稱的模糊陰影或暈。
- 唯一的陰影是第 5.3 節的硬邊投影。

## 8. 背景

背景為燈光漸層，屬於背景本身，不是暈影。

| 樣式 | 背景 |
|---|---|
| 01 | `radial-gradient(ellipse 70% 40% at 30% 15%, rgba(119,184,186,.5), transparent 70%)` + `linear-gradient(180deg, #3C7C80, #306C6C 45%, #245A5E)` |
| 02 | `radial-gradient(ellipse 70% 40% at 50% 0%, #FFFAF2, transparent 70%)` + `linear-gradient(180deg, #F6ECDD, #ECE0CD)` |
| 03 | `radial-gradient(circle at 50% 40%, #3C7C80, #184848 60%, #0C3030)` |
| 05 | `radial-gradient(circle at 50% 30%, #FBF7EE, #ECE4D2)` |
| 07 | `radial-gradient(circle at 50% 35%, #245A5E, #0C3030 80%)` |
| 13 | `radial-gradient(circle at 50% 50%, #3C7C80, #0C3030 75%)` |
| 14 | `linear-gradient(180deg, #F6ECDD, #ECE0CD)` |

使用者尚未確認是否也要把這些背景燈光拉平，若要拉平，改成單色底即可，不影響標題規格。

## 9. 各樣式設定

| 編號 | 名稱 | 第 1 行 | 第 2 行 | 擠出 | 投影 | 特殊 |
|---|---|---|---|---|---|---|
| 01 | 原配色 | fill-cream | fill-coral | depth 7 | 有 | 無 |
| 02 | 反轉 | fill-teal | fill-coral | depth 7 | 有 | 無 |
| 03 | 單色奶油 | fill-cream | fill-cream | depth 7 | 有 | 無 |
| 05 | 奶油紙雕 | fill-paper | fill-paper | depth 7 | 有 | 無 |
| 07 | 金箔 | fill-gold | fill-gold | depth 7 | 有 | 無 |
| 13 | 光暈鑲邊 | `#FCF0E4` | `#FCF0E4` | depth 7 | 有 | 無外發光 |
| 14 | 螢光筆 | `#0C3030` | `#0C3030` + 螢光底 | 無 | 無 | 螢光底：`linear-gradient(transparent 58%, rgba(232,185,100,.85) 58%, rgba(232,185,100,.85) 92%, transparent 92%)` |

## 10. 實作參考

```js
const LIGHT = { x: 0.5, y: 0.866 };

function extrude(el, from, to, depth = 7) {
  const step = 0.6;
  const L = ['drop-shadow(0 -1px 0 rgba(255,255,255,.5))'];
  for (let i = 1; i <= depth; i++) {
    const t = (i - 1) / Math.max(depth - 1, 1);
    const x = (i * step * LIGHT.x).toFixed(2);
    const y = (i * step * LIGHT.y).toFixed(2);
    L.push(`drop-shadow(${x}px ${y}px 0 ${lerp(from, to, t)})`);
  }
  const k = 6;
  L.push(`drop-shadow(${(k * LIGHT.x).toFixed(2)}px ${(k * LIGHT.y).toFixed(2)}px 0 rgba(0,0,0,.28))`);
  el.style.filter = L.join(' ');
}
```

`lerp(a, b, t)` 為 hex 色彩線性插值，逐通道計算後回傳 `#rrggbb`。

## 11. 驗收

- 1080 × 1920 輸出，無水平捲動。
- 每張只有主標題與背景，無小字、無 Halo、無外發光。
- 擠出與投影同方向，投影為硬邊。
- 立體感：擠出總位移約 4px，目視可辨但不拖長。
- 對比：字面與背景的對比足以在縮圖（270 × 480）時仍可讀。

## 12. 已知限制

- 配色為取樣近似值；珊瑚側壁色為中階外推，非直接取樣。
- 擠出深度 7 層是從 6、7、8、9、10、11 層的比較中選出的，比較是在縮圖上做的，未逐像素比對參考圖。
- 字級 176px 以「如何自動化／內容創作」兩行為基準，換成更長的標題需重新排版。
- 14 螢光筆無擠出，若要統一立體感，需另行設計。
