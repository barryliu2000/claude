// 風格標題擠出：單一平行光，擠出與投影同方向，投影為硬邊。
// 參數與 title-component-spec.md 第 5 節一致。

const LIGHT = { x: 0.5, y: 0.866 }; // 往右下約 60°

// hex 色彩線性插值，回傳 #rrggbb
function lerp(a, b, t) {
  const A = [0, 2, 4].map(i => parseInt(a.slice(1 + i, 3 + i), 16));
  const B = [0, 2, 4].map(i => parseInt(b.slice(1 + i, 3 + i), 16));
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// el: 標題元素（h1），from / to: 側壁顏色（hex），depth: 擠出層數（預設 7）
function extrude(el, from, to, depth = 7) {
  const step = 0.6;
  const L = ['drop-shadow(0 -1px 0 rgba(255,255,255,.5))']; // 頂緣細光

  for (let i = 1; i <= depth; i++) {
    const t = (i - 1) / Math.max(depth - 1, 1);
    const x = (i * step * LIGHT.x).toFixed(2);
    const y = (i * step * LIGHT.y).toFixed(2);
    L.push(`drop-shadow(${x}px ${y}px 0 ${lerp(from, to, t)})`);
  }

  const k = 6; // 投影：沿光線 6px、硬邊、28% 黑
  L.push(`drop-shadow(${(k * LIGHT.x).toFixed(2)}px ${(k * LIGHT.y).toFixed(2)}px 0 rgba(0,0,0,.28))`);

  el.style.filter = L.join(' ');
}

// 各樣式的側壁色（與 spec 第 5.4 節一致）
const STYLES = {
  '01': { from: '#E4D8CC', to: '#2A5A5E' },
  '02': { from: '#5F9DA0', to: '#143A3C' },
  '03': { from: '#E4D8CC', to: '#0C3030' },
  '05': { from: '#D8CDB6', to: '#A08C70' },
  '07': { from: '#9A6A22', to: '#0C3030' },
  '13': { from: '#8FC4C6', to: '#0C3030' },
  // 14 螢光筆不做擠出
};

// 用法：extrude(document.querySelector('.title'), STYLES['13'].from, STYLES['13'].to);
