import React from 'react';
import {Composition, AbsoluteFill, useCurrentFrame, interpolate, Easing, staticFile, Img, Series, Audio} from 'remotion';
import SCENES from './scenes.json';

const FPS = 30, W = 1080, H = 1920;
const YEL = '#FFD640', RED = '#FF5A5F', GRN = '#3DD68C', INK = '#141824', MUTED = '#B4C0D6', HL = '#FFD600', BLUE = '#4C8DFF';
const ease = Easing.out(Easing.cubic);
const CY = 850; const cy = (h: number) => Math.max(270, Math.round(CY - h / 2));
const k = (t: number, d = 0, dur = 0.45) => interpolate(t, [d, d + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
const fonts = `
@font-face{font-family:PH;font-weight:400;src:url(${staticFile('fonts/AlibabaPuHuiTi-3-55-Regular.ttf')});}
@font-face{font-family:PH;font-weight:700;src:url(${staticFile('fonts/AlibabaPuHuiTi-3-85-Bold.ttf')});}
@font-face{font-family:PH;font-weight:900;src:url(${staticFile('fonts/AlibabaPuHuiTi-3-105-Heavy.ttf')});}
`;

// ---------- primitives ----------
const glassStyle = (extra: any = {}): React.CSSProperties => ({
  position: 'absolute', borderRadius: 28,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.17), rgba(255,255,255,0.05)), rgba(12,20,36,0.40)',
  backdropFilter: 'blur(26px) saturate(140%)', WebkitBackdropFilter: 'blur(26px) saturate(140%)',
  border: '1.5px solid rgba(255,255,255,0.28)',
  boxShadow: '0 28px 60px rgba(0,0,0,0.5), inset 0 1.5px 0 rgba(255,255,255,0.55)',
  color: 'white', overflow: 'hidden', ...extra,
});
const Glass: React.FC<{x: number; y: number; w: number; h: number; style?: any; children?: any}> = ({x, y, w, h, style, children}) =>
  <div style={glassStyle({left: x, top: y, width: w, height: h, ...style})}>{children}</div>;
const Txt: React.FC<{x: number; y: number; size: number; color?: string; w?: number; weight?: number; align?: any; style?: any; children?: any}> =
  ({x, y, size, color = 'white', w, weight = 900, align = 'left', style, children}) =>
  <div style={{position: 'absolute', left: x, top: y, width: w, fontSize: size, fontWeight: weight, color, textAlign: align, lineHeight: 1.18, whiteSpace: w ? 'normal' : 'nowrap', ...style}}>{children}</div>;
const Source: React.FC<{text: string; y?: number}> = ({text, y = 1362}) =>
  <div style={{position: 'absolute', right: 28, top: y, padding: '6px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.72)', color: '#DCE2F0', fontSize: 25, fontWeight: 400}}>{text}</div>;
const Chip: React.FC<{bg: string; color?: string; size?: number; children?: any; style?: any}> = ({bg, color = 'white', size = 30, children, style}) =>
  <span style={{display: 'inline-block', padding: '6px 18px', borderRadius: 14, background: bg, color, fontSize: size, fontWeight: 900, ...style}}>{children}</span>;
const slideUp = (t: number, d = 0, dist = 40) => ({opacity: k(t, d), transform: `translateY(${(1 - k(t, d)) * dist}px)`});
const slideX = (t: number, d = 0, dist = 600) => ({opacity: k(t, d, 0.55), transform: `translateX(${(1 - k(t, d, 0.55)) * dist}px)`});
const pop = (t: number, d = 0) => ({opacity: k(t, d, 0.3), transform: `scale(${interpolate(t, [d, d + 0.45], [0.8, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.8))})})`});
const col = (v: number) => (v > 0 ? GRN : v < 0 ? RED : '#C9D2E3');
const sgn = (v: number, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%';

// ---------- background ----------
const Bg: React.FC<{img: string; blur?: number; dark?: number}> = ({img, blur = 0, dark = 0.55}) => <AbsoluteFill>
  <Img src={staticFile('img/' + img)} style={{width: W, height: H, objectFit: 'cover', filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? 'scale(1.06)' : undefined}} />
  <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(4,8,18,${dark - 0.1}) 0%, rgba(4,8,18,${dark}) 55%, rgba(4,8,18,${Math.min(0.95, dark + 0.25)}) 100%)`}} />
  <AbsoluteFill style={{background: 'radial-gradient(circle at 15% 22%, rgba(40,120,255,0.14), transparent 45%), radial-gradient(circle at 88% 70%, rgba(0,190,170,0.12), transparent 45%)'}} />
</AbsoluteFill>;

// ---------- numbered title bar ----------
const TopBar: React.FC<{num?: string; text: string; c?: string}> = ({num, text, c}) => <div style={{position: 'absolute', left: 36, top: 130, display: 'flex', alignItems: 'center', ...glassStyle({position: 'absolute', borderRadius: 24, padding: '14px 30px 14px 16px', ...(c ? {background: `linear-gradient(90deg, ${c}cc, ${c}55 60%, rgba(12,20,36,0.45))`, border: `1.5px solid ${c}`, boxShadow: `0 20px 40px rgba(0,0,0,0.45), 0 0 30px ${c}66, inset 0 1.5px 0 rgba(255,255,255,0.5)`} : {})})}}>
  {num && <div style={{width: 70, height: 70, borderRadius: 35, background: 'linear-gradient(180deg,#ffe066,#f5b800)', color: INK, fontSize: 44, fontWeight: 900, textAlign: 'center', lineHeight: '70px', marginRight: 22, boxShadow: '0 0 24px rgba(255,214,64,0.6)'}}>{num}</div>}
  <div style={{fontSize: 52, fontWeight: 900, color: 'white', letterSpacing: 1}}>{text}</div>
</div>;

// ---------- beats ----------
const Title = ({t}: any) => <>
  <Txt x={0} w={W} y={640} size={150} color={YEL} align="center" style={{...slideUp(t, 0.15), textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>11月20日</Txt>
  <Txt x={0} w={W} y={820} size={150} align="center" style={{...slideUp(t, 0.3), textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>美股早报</Txt>
  <div style={{position: 'absolute', left: 0, width: W, top: 1030, textAlign: 'center', ...slideUp(t, 0.5)}}>
    <span style={{...glassStyle({position: 'relative', display: 'inline-block', padding: '12px 36px', fontSize: 40, fontWeight: 700}), borderRadius: 40}}>20 Nov 2026 · 周五收市</span></div>
</>;

const Hook = ({t}: any) => {
  const rows = [['Sunway Construction', '净利 +25%', '股价 −7.7%', '#E5484D', 'build.jpg', '周四 RM7.50 → 周五 RM6.92'], ['YTL Power', '被纽约时报点名', '股价 −1.25%', '#2E6BE6', 'dc.jpg', '盘中最低 RM3.81，收 RM3.95']];
  return <>
    {rows.map(([n, a, b, c, img, sub], i) => <PCard key={i} x={60} y={330 + i * 400} w={960} h={340} v="A" c={c} img={img} style={slideX(t, 0.1 + i * 0.9, i ? -600 : 600)}>
      <div style={{position: 'absolute', left: 50, top: 36}}><Chip bg={c} size={36}>{n}</Chip></div>
      <Txt x={50} y={130} size={i ? 60 : 72} color={i ? 'white' : GRN}>{a}</Txt>
      <div style={{position: 'absolute', right: 40, top: 120, ...pop(t, 0.6 + i * 0.9)}}><Chip bg={i ? 'rgba(255,90,95,0.45)' : RED} size={60} style={{padding: '14px 26px'}}>{b}</Chip></div>
      <Txt x={50} y={250} size={32} weight={700} color="#DDE4F0">{sub}</Txt>
    </PCard>)}
    <Txt x={0} w={W} y={1150} size={70} color={YEL} align="center" style={{...slideUp(t, 2.6), textShadow: '0 6px 24px rgba(0,0,0,0.8)'}}>剧情有点反过来？</Txt>
    <Source text="数据：Yahoo Finance 日线；The Star" />
  </>;
};

const Market = ({t, R}: any) => <>
  <Glass x={60} y={cy(770)} w={960} h={520} style={slideUp(t)}>
    <Txt x={50} y={44} size={44} weight={700} color="#D6DEEC">富时大马综合指数 FBM KLCI</Txt>
    <Txt x={50} y={130} size={150}>{(1566.16 - 9.65 * k(t, 0.3, 1.2)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Txt>
    <div style={{position: 'absolute', left: 54, top: 320}}><Chip bg={RED} size={50}>−9.65 点 · −0.61%</Chip></div>
    <div style={{position: 'absolute', left: 54, top: 420, ...pop(t, 1.2)}}><Chip bg="rgba(255,214,64,0.22)" color={YEL} size={40} style={{border: '1.5px solid rgba(255,214,64,0.6)'}}>15 个月最低</Chip></div>
  </Glass>
  {t > R(1) - 0.1 && <Glass x={60} y={cy(770) + 570} w={960} h={200} style={slideUp(t, R(1))}>
    <Txt x={50} y={34} size={40} weight={700} color="#D6DEEC">过去 10 个交易日</Txt>
    <Txt x={50} y={100} size={64} color={RED}>跌了 9 天</Txt>
  </Glass>}
  <Source text="来源：The Star、Malay Mail、The Edge（11月20日）" />
</>;

const Site = ({t, b}: any) => { const y0 = cy(190 + 30 + 600); return <>
  <Glass x={40} y={y0} w={1000} h={190} style={slideUp(t)}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 12, height: 190, background: b.c}} />
    <Txt x={50} y={30} size={66}>{b.name}</Txt>
    <Txt x={52} y={118} size={36} weight={700} color="#D6DEEC">{b.line}</Txt>
  </Glass>
  <div style={{...glassStyle({left: 40, top: y0 + 220, width: 1000, height: 600, padding: 0, border: `2px solid ${rgba(b.c, 0.7)}`, boxShadow: `0 28px 60px rgba(0,0,0,0.55), 0 0 36px ${rgba(b.c, 0.35)}`}), ...slideUp(t, 0.2)}}>
    <Img src={staticFile('img/' + b.img)} style={{position: 'absolute', left: 0, top: 0, width: 1000, height: 600, objectFit: 'cover', objectPosition: 'top left', transform: `scale(${1 + 0.04 * k(t, 0.3, 6)})`, transformOrigin: 'top left'}} />
  </div>
  <Source text={'画面：' + b.name + ' 官网'} />
</>; };

const Node: React.FC<{x: number; y: number; w: number; title: string; sub: string; c: string; t: number; d: number}> = ({x, y, w, title, sub, c, t, d}) =>
  <Glass x={x} y={y} w={w} h={150} style={{...pop(t, d), borderColor: c}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 10, height: 150, background: c}} />
    <Txt x={36} y={26} size={48}>{title}</Txt>
    <Txt x={38} y={92} size={30} weight={700} color="#D6DEEC">{sub}</Txt>
  </Glass>;
const Arrow: React.FC<{y: number; t: number; d: number}> = ({y, t, d}) => <svg style={{position: 'absolute', left: 520, top: y, opacity: k(t, d)}} width="40" height="60">
  <line x1="20" y1="0" x2="20" y2="44" stroke="white" strokeWidth="5" strokeDasharray="9 7" /><path d="M6 40 L20 58 L34 40" fill="none" stroke="white" strokeWidth="5" /></svg>;
const NYT = ({t}: any) => <>
  <div style={{position: 'absolute', left: 60, top: 290, ...slideUp(t)}}><Chip bg="rgba(255,90,95,0.85)" size={38}>纽约时报的指控（未经官方认定）</Chip></div>
  <Node x={140} y={380} w={800} title="阿里巴巴" sub="中国科技公司 · 使用者" c="#FF7A00" t={t} d={0.2} />
  <Arrow y={535} t={t} d={0.9} />
  <Node x={140} y={600} w={800} title="Megaspeed" sub="新加坡公司 · 中间人" c="#9B7BFF" t={t} d={1.3} />
  <Arrow y={755} t={t} d={2.0} />
  <Node x={140} y={820} w={800} title="Speedmatrix" sub="Megaspeed 的马来西亚子公司 · 运作芯片" c="#9B7BFF" t={t} d={2.4} />
  <Arrow y={975} t={t} d={3.1} />
  <Node x={140} y={1040} w={800} title="YTL 柔佛数据中心" sub="放着 Nvidia 芯片（远程使用）" c={BLUE} t={t} d={3.5} />
  <div style={{position: 'absolute', left: 140, top: 1220, width: 800, textAlign: 'center', ...pop(t, 4.6)}}><Chip bg={GRN} color={INK} size={40}>YTL Power：报导完全不属实</Chip></div>
  <Source text="来源：The Edge、TNGlobal 引述纽约时报（11月20日）" />
</>;

const Statement = ({t, b, R}: any) => {
  const lines = b.lines as string[]; const h = 170 + 90 * lines.length;
  return <><Glass x={50} y={340} w={980} h={h} style={slideUp(t)}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 14, height: h, background: b.c || GRN}} />
    <Txt x={60} y={40} size={44} color={b.c ? '#FF8A8A' : '#7CF0B4'}>{b.title}</Txt>
    {lines.map((l, i) => <Txt key={i} x={60} y={120 + i * 90} size={50} style={slideX(t, (b.at ? R(b.at[i]) : 0.25 + 0.35 * i), 40)}>{l}</Txt>)}
  </Glass><Source text={b.src} /></>;
};

const Quip = ({t, b}: any) => <>
  <div style={{position: 'absolute', left: 70, top: cy(330), width: 940, ...pop(t, 0.05)}}>
    <div style={{...glassStyle({position: 'relative', borderRadius: 40, padding: '50px 54px', background: 'linear-gradient(180deg, rgba(255,214,64,0.28), rgba(255,170,0,0.14)), rgba(12,20,36,0.5)', border: '2px solid rgba(255,214,64,0.6)'})}}>
      <div style={{fontSize: 68, fontWeight: 900, color: 'white', lineHeight: 1.3}}>{b.text}</div>
      {b.sub && <div style={{fontSize: 36, fontWeight: 700, color: YEL, marginTop: 18}}>{b.sub}</div>}
    </div>
    <svg width="90" height="60" style={{marginLeft: 120, marginTop: -2}}><path d="M0 0 L90 0 L20 60 Z" fill="rgba(255,214,64,0.35)" /></svg>
  </div>
</>;

// moomoo-style bars: two periods, revenue + net profit panels
const Fin = ({t, b, R}: any) => {
  const panels = [['营收', b.rev, b.revL], ['净利', b.np, b.npL]];
  return <>
    {panels.map(([name, v, L]: any, p) => {
      const d0 = p ? (b.npAt !== undefined ? R(b.npAt) : 0.6) : 0;
      if (t < d0 - 0.05) return null;
      const mx = Math.max(...v), chg = (v[1] / v[0] - 1) * 100;
      return <Glass key={p} x={50} y={300 + p * 540} w={980} h={500} style={slideUp(t, d0)}>
        <Txt x={44} y={30} size={46}>{name}</Txt>
        <Txt x={46} y={92} size={26} weight={400} color={MUTED}>{b.unit}</Txt>
        <div style={{position: 'absolute', right: 40, top: 28, ...pop(t, d0 + 0.9)}}><Chip bg={col(chg)} color={chg > 0 ? INK : 'white'} size={40}>{L && L[2] ? L[2] : sgn(chg)}</Chip></div>
        {[0, 1].map(i => {
          const hh = 220 * v[i] / mx * k(t, d0 + 0.2 + i * 0.25, 0.8);
          return <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 170 + i * 380, bottom: 80, width: 240, height: hh, borderRadius: '14px 14px 4px 4px', background: i ? `linear-gradient(180deg, ${chg >= 0 ? '#6FF0B0' : '#FF8C8F'}, ${chg >= 0 ? '#1FAE6B' : '#D63A40'})` : 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))', boxShadow: i ? `0 0 30px ${chg >= 0 ? 'rgba(61,214,140,0.45)' : 'rgba(255,90,95,0.45)'}` : 'none'}} />
            <Txt x={140 + i * 380} w={300} y={420 - hh - 55} size={38} align="center" style={{opacity: k(t, d0 + 0.7 + i * 0.25)}}>{L ? L[i] : ''}</Txt>
            <Txt x={140 + i * 380} w={300} y={432} size={30} weight={700} align="center" color="#D6DEEC">{b.per[i]}</Txt>
          </React.Fragment>;
        })}
      </Glass>;
    })}
    {b.chip && t > R(b.chip[0]) - 0.05 && <div style={{position: 'absolute', left: 50, top: 1300 - 30, width: 980, textAlign: 'center', ...pop(t, R(b.chip[0]))}}><Chip bg="rgba(76,141,255,0.9)" size={40}>{b.chip[1]}</Chip></div>}
    <Source text={b.src} y={1380} />
  </>;
};

const Reasons = ({t, b, R}: any) => <>
  <Txt x={70} y={300} size={60} style={slideUp(t)}>{b.title || '为什么？'}</Txt>
  {b.items.map(([ic, l, s]: any, i: number) => {
    const d = b.at ? R(b.at[i]) : 0.3 + i * 0.5; if (t < d - 0.05) return null;
    return <Glass key={i} x={50} y={420 + i * 250} w={980} h={220} style={slideX(t, d)}>
      <div style={{position: 'absolute', left: 36, top: 50, width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.14)', fontSize: 60, fontWeight: 900, color: YEL, textAlign: 'center', lineHeight: '120px'}}>{i + 1}</div>
      <Txt x={190} y={48} size={50}>{l}</Txt>
      <Txt x={192} y={124} size={32} weight={400} color={MUTED} w={760}>{s}</Txt>
    </Glass>;
  })}
  <Source text={b.src} />
</>;

const BigNum = ({t, b}: any) => <>
  <Glass x={60} y={460} w={960} h={560} style={slideUp(t)}>
    <Txt x={0} w={960} y={60} size={46} align="center" weight={700} color="#D6DEEC">{b.label}</Txt>
    <Txt x={0} w={960} y={170} size={b.size || 150} align="center" color={b.color || YEL}>{b.fmt ? b.fmt.replace('#', (b.val * k(t, 0.2, 1.2)).toLocaleString('en-US', {minimumFractionDigits: b.dec || 0, maximumFractionDigits: b.dec || 0})) : b.text}</Txt>
    {b.chip && <div style={{position: 'absolute', left: 0, width: 960, top: 390, textAlign: 'center', ...pop(t, 1.3)}}><Chip bg={b.chipBg || GRN} color={INK} size={44}>{b.chip}</Chip></div>}
  </Glass>
  <Source text={b.src} />
</>;

const Div = ({t, b}: any) => {
  if (b.none) return <><Glass x={60} y={560} w={960} h={360} style={slideUp(t)}>
    <Txt x={0} w={960} y={70} size={46} align="center" weight={700} color="#D6DEEC">派息</Txt>
    <Txt x={0} w={960} y={160} size={90} align="center" color={MUTED}>{b.none}</Txt>
  </Glass><Source text={b.src} /></>;
  const cal = (lab: string, m: string, d: string, wd: string, x: number, delay: number, c: string) =>
    <div style={{...glassStyle({left: x, top: 560, width: 300, height: 330, borderRadius: 24}), ...pop(t, delay), background: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 300, height: 64, background: c, fontSize: 32, fontWeight: 900, textAlign: 'center', lineHeight: '64px', letterSpacing: 4}}>{m}</div>
      <Txt x={0} w={300} y={70} size={130} align="center">{d}</Txt>
      <Txt x={0} w={300} y={222} size={34} align="center" color="#E8EDF7">{wd}</Txt>
      <Txt x={0} w={300} y={272} size={32} align="center" color={YEL}>{lab}</Txt>
    </div>;
  return <>
    <Glass x={60} y={300} w={960} h={220} style={slideUp(t)}>
      <Txt x={50} y={36} size={40} weight={700} color="#D6DEEC">{b.kind || '派息'}</Txt>
      <Txt x={50} y={96} size={96} color={YEL}>{b.amt}</Txt>
      {b.ytd && <Txt x={520} y={128} size={34} weight={700} color="#D6DEEC">{b.ytd}</Txt>}
    </Glass>
    {b.ex && cal('除权日', 'DEC', b.ex[0], b.ex[1], 200, 0.6, '#3C7DFF')}
    {cal('派发日', 'DEC', b.pay[0], b.pay[1], b.ex ? 580 : 390, b.ex ? 1.0 : 0.6, '#1FAE6B')}
    <Source text={b.src} />
  </>;
};

// candlestick price chart with close labels
const Price = ({t, b}: any) => {
  const D = b.d as any[]; const n = D.length;
  const lo = Math.min(...D.map(x => x[3])), hi = Math.max(...D.map(x => x[2])); const pad = (hi - lo) * 0.18;
  const y0 = 520, h = 560, x0 = 110, w = 860, cw = w / n;
  const Y = (v: number) => y0 + h - (v - lo + pad) / (hi - lo + 2 * pad) * h;
  const last = D[n - 1], prev = D[n - 2][4], chg = (last[4] / prev - 1) * 100;
  return <>
    <Glass x={40} y={290} w={1000} h={1050} style={slideUp(t)} />
    <Txt x={80} y={320} size={50} style={slideUp(t)}>{b.title}</Txt>
    <Txt x={82} y={390} size={30} weight={400} color={MUTED} style={slideUp(t)}>每日 K 线 · 令吉（RM）</Txt>
    <div style={{position: 'absolute', right: 80, top: 322, ...pop(t, 1.6)}}><Chip bg={col(chg)} color={chg > 0 ? INK : 'white'} size={44}>{`周五 RM${last[4].toFixed(2)}  ${sgn(chg)}`}</Chip></div>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {[0, 1, 2, 3].map(i => <line key={i} x1={x0} x2={x0 + w} y1={y0 + i * h / 3} y2={y0 + i * h / 3} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />)}
      {D.map((x, i) => {
        const a = k(t, 0.2 + i * 0.16, 0.3); const up = x[4] >= x[1]; const c = up ? GRN : RED; const cx = x0 + cw * (i + 0.5);
        const isLast = i === n - 1;
        return <g key={i} opacity={a}>
          <line x1={cx} x2={cx} y1={Y(x[2])} y2={Y(x[3])} stroke={c} strokeWidth="4" />
          <rect x={cx - cw * 0.28} width={cw * 0.56} y={Y(Math.max(x[1], x[4]))} height={Math.max(4, Math.abs(Y(x[1]) - Y(x[4])))} fill={c} rx="4" stroke={isLast ? 'white' : 'none'} strokeWidth="3" />
          <circle cx={cx} cy={Y(x[4])} r="9" fill="white" stroke={c} strokeWidth="4" />
          <text x={cx} y={y0 + h + 52} fill="#C9D2E3" fontSize="28" fontWeight="700" textAnchor="middle">{x[0]}</text>
          {(i >= n - 2) && <text x={cx} y={Y(x[2]) - 24} fill="white" fontSize="34" fontWeight="900" textAnchor="middle">{x[4].toFixed(2)}</text>}
        </g>;
      })}
      {b.minMark && (() => { const mi = D.reduce((m: number, x: any, i: number) => x[3] < D[m][3] ? i : m, 0); const cx = x0 + cw * (mi + 0.5); const yy = Y(D[mi][3]); const a = k(t, 2.2); return <g opacity={a}>
        <line x1={cx - 40} x2={cx + 40} y1={yy + 4} y2={yy + 4} stroke={YEL} strokeWidth="3" strokeDasharray="6 5" />
        <text x={cx} y={yy + 48} fill={YEL} fontSize="30" fontWeight="900" textAnchor="middle">{`本周最低 ${D[mi][3].toFixed(2)}`}</text></g>; })()}
      {b.lowMark && (() => { const cx = x0 + cw * (n - 0.5); const yy = Y(last[3]); const a = k(t, 2.2); return <g opacity={a}>
        <line x1={cx + 30} x2={cx + 70} y1={yy} y2={yy} stroke={YEL} strokeWidth="3" strokeDasharray="6 5" />
        <text x={cx - 20} y={yy + 48} fill={YEL} fontSize="30" fontWeight="900" textAnchor="end">{`盘中低 ${last[3].toFixed(2)}`}</text></g>; })()}
    </svg>
    <Source text="数据：Yahoo Finance 日线（11月13日–20日）" y={1380} />
  </>;
};

const Downgrade = ({t}: any) => <>
  <Glass x={60} y={420} w={960} h={620} style={slideUp(t)}>
    <Txt x={50} y={40} size={42} weight={700} color="#D6DEEC">券商 CGS International</Txt>
    <div style={{position: 'absolute', left: 50, top: 170}}><Chip bg="rgba(61,214,140,0.25)" color="#7CF0B4" size={70} style={{border: '2px solid #3DD68C', padding: '18px 40px'}}>买入</Chip></div>
    <Txt x={420} y={180} size={80} color={MUTED} style={{opacity: k(t, 0.5)}}>→</Txt>
    <div style={{position: 'absolute', left: 560, top: 170, ...pop(t, 0.8)}}><Chip bg="rgba(255,214,64,0.25)" color={YEL} size={70} style={{border: '2px solid #FFD640', padding: '18px 40px'}}>持有</Chip></div>
    <Txt x={50} y={360} size={40} w={860} style={slideUp(t, 1.3)}>原因：新频谱、监管成本</Txt>
    <Txt x={50} y={430} size={40} w={860} style={slideUp(t, 1.6)}>可能拖慢未来两年盈利成长</Txt>
  </Glass>
  <Source text="来源：Business Today（11月20日）" />
</>;

const Compare = ({t, b}: any) => {
  const mx = Math.max(...b.v);
  return <>
    <Txt x={70} y={330} size={58} style={slideUp(t)}>{b.title}</Txt>
    {b.v.map((v: number, i: number) => <Glass key={i} x={50} y={460 + i * 300} w={980} h={260} style={slideX(t, 0.3 + i * 0.6)}>
      <Txt x={44} y={30} size={40} weight={700} color="#D6DEEC">{b.lab[i]}</Txt>
      <div style={{position: 'absolute', left: 44, top: 110, height: 90, borderRadius: 18, width: 640 * v / mx * k(t, 0.5 + i * 0.6, 0.9), background: i === b.hi ? `linear-gradient(90deg, #ffe58a, ${YEL})` : 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))'}} />
      <Txt x={940} y={120} size={60} color={i === b.hi ? YEL : 'white'} style={{transform: 'translateX(-100%)', opacity: k(t, 1 + i * 0.6)}}>{b.txt[i]}</Txt>
    </Glass>)}
    {b.chip && <div style={{position: 'absolute', left: 0, width: W, top: 1100, textAlign: 'center', ...pop(t, 1.9)}}><Chip bg={b.chipBg || RED} size={42}>{b.chip}</Chip></div>}
    <Source text={b.src} />
  </>;
};

const Calendar = ({t, R}: any) => {
  const rows = [['周一', '23', ['Maybank', '公布第三季业绩'], 'kl.jpg', '#F2B705', 'Maybank IR'], ['周二', '24', ['Impact Capital', '创业板（ACE）挂牌'], 'build.jpg', '#3C7DFF', 'moomoo / MT Newswires']];
  return <>
    {rows.map(([wd, dd, ls, img, c, src]: any, i) => {
      const d = R(i + 1); if (t < d - 0.05) return null; const y = cy(680) + i * 360;
      return <div key={i} style={{...glassStyle({left: 50, top: y, width: 980, height: 320}), ...slideX(t, d)}}>
        <Img src={staticFile('img/' + img)} style={{position: 'absolute', left: -20, top: -20, width: 1020, height: 360, objectFit: 'cover', filter: 'blur(4px) brightness(0.8)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,10,22,0.6), rgba(6,10,22,0.35))'}} />
        <div style={{...glassStyle({left: 30, top: 40, width: 210, height: 240, borderRadius: 22}), background: 'linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.12))'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 210, height: 56, background: c, fontSize: 30, fontWeight: 900, textAlign: 'center', lineHeight: '56px', letterSpacing: 4}}>NOV</div>
          <Txt x={0} w={210} y={58} size={118} align="center">{dd}</Txt>
          <Txt x={0} w={210} y={190} size={34} align="center" color="#E8EDF7">{wd}</Txt>
        </div>
        <Txt x={290} y={86} size={62}>{ls[0]}</Txt>
        <Txt x={292} y={176} size={42} weight={700} color="#E2E8F3">{ls[1]}</Txt>
        <Txt x={950} y={272} size={24} weight={400} color="#D0D8E6" style={{transform: 'translateX(-100%)'}}>{src}</Txt>
      </div>;
    })}
  </>;
};

const Outro = ({t}: any) => <>
  <Txt x={0} w={W} y={680} size={86} color={YEL} align="center" style={{...slideUp(t), textShadow: '0 8px 30px rgba(0,0,0,0.7)'}}>关注 · 收藏 · 分享</Txt>
  <Txt x={0} w={W} y={820} size={86} align="center" style={{...slideUp(t, 0.15), textShadow: '0 8px 30px rgba(0,0,0,0.7)'}}>下个交易日见</Txt>
  <Glass x={110} y={1010} w={860} h={100} style={slideUp(t, 0.3)}><Txt x={0} w={860} y={28} size={40} weight={700} align="center">内容仅为新闻整理，不构成投资建议</Txt></Glass>
</>;


// official document card: full page -> yellow boxes -> zoom -> takeaway
const Doc = ({t, b}: any) => {
  const [iw, ih] = b.size; const [vx, vy, vw, vh] = b.view || [0, 0, iw, ih];
  let CW = 980, H = CW * vh / vw; if (H > 800) { H = 800; CW = H * vw / vh; }
  const takeH = b.take ? 70 + 66 * b.take.length : 0;
  const tot = H + (b.take ? 28 + takeH : 0); const Y = cy(tot); const X = (W - CW) / 2;
  const zk = b.zoom ? interpolate(t, [b.zoom[0], b.zoom[0] + 1.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)}) : 0;
  const [zx, zy, zw, zh] = b.zoom ? b.zoom[1] : [vx, vy, vw, vh];
  const s0 = CW / vw, s1 = Math.min(CW / zw, H / zh);
  const drift = 1 + 0.03 * k(t, b.zoom ? b.zoom[0] + 1.8 : 0.4, 6);
  const sc = (s0 + (s1 - s0) * zk) * drift;
  const cx0 = vx + vw / 2, cy0 = vy + vh / 2, cx1 = zx + zw / 2, cy1 = zy + zh / 2;
  const fx = cx0 + (cx1 - cx0) * zk, fy = cy0 + (cy1 - cy0) * zk;
  const ox = CW / 2 - fx * sc, oy = H / 2 - fy * sc;
  return <>
    <div style={{...glassStyle({left: X - 10, top: Y - 10, width: CW + 20, height: H + 20, borderRadius: 24, background: 'rgba(255,255,255,0.14)', border: `2px solid ${rgba(b.c || '#ffffff', 0.6)}`}), ...slideUp(t)}}>
      <div style={{position: 'absolute', left: 10, top: 10, width: CW, height: H, overflow: 'hidden', borderRadius: 16, background: 'white'}}>
        <div style={{position: 'absolute', left: ox, top: oy, width: iw * sc, height: ih * sc}}>
          <Img src={staticFile('img/' + b.img)} style={{width: '100%', height: '100%'}} />
          {(b.boxes || []).map(([x, y, w, h, at]: number[], i: number) => <div key={i} style={{position: 'absolute', left: x * sc - 6, top: y * sc - 4, width: (w * sc + 12) * k(t, at, 0.5), height: h * sc + 8, border: `4px solid ${HL}`, background: 'rgba(255,214,0,0.25)', borderRadius: 8, opacity: k(t, at, 0.2)}} />)}
        </div>
      </div>
    </div>
    {b.take && <div style={{position: 'absolute', left: 70, top: Y + H + 28, width: 940, height: takeH, ...pop(t, b.takeAt)}}>
      <div style={{...glassStyle({position: 'relative', height: takeH, borderRadius: 26, background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), rgba(8,12,24,0.88)', ...(b.takeImg ? {border: `2px solid ${b.c}`, boxShadow: `0 28px 60px rgba(0,0,0,0.6), 0 0 40px ${rgba(b.c, 0.5)}`} : {})})}}>
        {b.takeImg && <><Img src={staticFile('img/' + b.takeImg)} style={{position: 'absolute', left: -20, top: -20, width: 980, height: takeH + 40, objectFit: 'cover', filter: 'blur(4px) brightness(0.7) saturate(1.2)'}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, rgba(6,10,22,0.85), rgba(6,10,22,0.5) 60%, ${rgba(b.c, 0.35)})`}} /></>}
        <div style={{position: 'absolute', left: 40, top: 22}}>
          <div style={{fontSize: 28, fontWeight: 700, color: HL, marginBottom: 6}}>{b.takeTitle || '重点'}</div>
          {b.take.map((l: string, i: number) => <div key={i} style={{fontSize: i ? 40 : 50, fontWeight: 900, color: 'white', lineHeight: 1.25}}>{l}</div>)}
        </div>
      </div></div>}
    <Source text={b.src} y={1380} />
  </>;
};

const News = ({t, b}: any) => {
  const hs = b.items.map(([img, w, h]: any) => h * 960 / w + 70); const tot = hs.reduce((x: number, y: number) => x + y, 0) + 30 * (hs.length - 1) + (b.chip ? 110 : 0);
  let y = cy(tot);
  return <>
    {b.items.map(([img, w, h, src]: any, i: number) => { const sc = 960 / w; const yy = y; y += hs[i] + 30; return <div key={i} style={{...glassStyle({left: 50, top: yy, width: 980, height: hs[i], borderRadius: 22, background: 'rgba(255,255,255,0.12)'}), ...slideX(t, 0.1 + i * 0.8, i % 2 ? -600 : 600)}}>
      <Img src={staticFile('img/' + img)} style={{position: 'absolute', left: 10, top: 10, width: 960, height: h * sc, borderRadius: 14}} />
      <Txt x={20} y={h * sc + 20} size={30} weight={700} color="#D6DEEC">{src}</Txt>
    </div>; })}
    {b.chip && <div style={{position: 'absolute', left: 50, top: y + 10, width: 980, textAlign: 'center', ...pop(t, b.chipAt || 1.8)}}><Chip bg={b.chipBg || GRN} color={b.chipBg ? 'white' : INK} size={44}>{b.chip}</Chip></div>}
    <Source text={b.src} />
  </>;
};

const fmtM = (v: number) => Math.abs(v) >= 100 ? (v / 100).toFixed(Math.abs(v) >= 1000 ? 1 : 2) + ' 亿' : (v < 0 ? '−' : '') + Math.round(Math.abs(v) * 100).toLocaleString('en-US') + ' 万';
const Fin5 = ({t, b}: any) => {
  const panels = [['营收', b.rev], ['净利', b.np]];
  return <>
    {panels.map(([name, v]: any, p) => {
      const d0 = p ? 0.9 : 0; const n = v.length;
      const mx = Math.max(...v, 0), mn = Math.min(...v, 0); const H0 = 215, top = 170;
      const Y = (x: number) => top + H0 * (mx - x) / (mx - mn || 1);
      const yoy = (v[n - 1] / v[0] - 1) * 100;
      return <Glass key={p} x={40} y={290 + p * 540} w={1000} h={510} style={slideUp(t, d0)}>
        <Txt x={40} y={26} size={46}>{name}</Txt>
        <Txt x={42} y={86} size={26} weight={400} color={MUTED}>令吉 RM · 每季</Txt>
        <div style={{position: 'absolute', left: 170, top: 30, ...pop(t, d0 + 1.2)}}><Chip bg={col(yoy)} color={yoy > 0 ? INK : 'white'} size={36}>{b.yoyL && b.yoyL[p] ? b.yoyL[p] : '同比 ' + sgn(yoy)}</Chip></div>
        <svg width="1000" height="510" style={{position: 'absolute', left: 0, top: 0}}>
          <line x1="40" x2="960" y1={Y(0)} y2={Y(0)} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          {v.map((x: number, i: number) => {
            const last = i === n - 1; const bw = 120, cx = 120 + i * 190;
            const a = k(t, d0 + 0.15 + i * 0.12, 0.6); const y1 = Y(0) + (Y(x) - Y(0)) * a;
            const up = x >= 0; const c = last ? (p ? (x >= v[0] ? 'url(#gG)' : 'url(#gR)') : 'url(#gC)') : (up ? 'rgba(255,255,255,0.38)' : 'rgba(255,90,95,0.7)');
            return <g key={i}>
              <rect x={cx - bw / 2} width={bw} y={Math.min(Y(0), y1)} height={Math.max(2, Math.abs(y1 - Y(0)))} rx="10" fill={c} stroke={last ? 'white' : 'none'} strokeWidth="2.5" />
              <text x={cx} y={up ? Math.min(Y(0), y1) - 14 : Math.max(Y(0), y1) + 34} fill={last ? YEL : 'white'} fontSize={last ? 34 : 27} fontWeight="900" textAnchor="middle" opacity={k(t, d0 + 0.6 + i * 0.12)}>{fmtM(x)}</text>
              <text x={cx} y={470} fill={last ? 'white' : '#AEB9CC'} fontSize="26" fontWeight={last ? 900 : 700} textAnchor="middle">{b.q[i]}</text>
            </g>;
          })}
          <defs>
            <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={rgba('#ffffff', 0.85)} /><stop offset="0.35" stopColor={b.c} /><stop offset="1" stopColor={rgba(b.c, 0.75)} /></linearGradient>
            <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6FF0B0" /><stop offset="1" stopColor="#1FAE6B" /></linearGradient>
            <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF8C8F" /><stop offset="1" stopColor="#D63A40" /></linearGradient>
          </defs>
        </svg>
      </Glass>;
    })}
    <Source text="数据：Bursa Malaysia 季报（KLSE Screener 整理）" y={1380} />
  </>;
};

// ================= style variants (A = photo immersion, B = brand-colour glass) =================
const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const PCard: React.FC<{x: number; y: number; w: number; h: number; v: string; c: string; img?: string; style?: any; children?: any}> = ({x, y, w, h, v, c, img, style, children}) => {
  if (v === 'A') return <div style={{...glassStyle({left: x, top: y, width: w, height: h, border: `1.5px solid ${rgba(c, 0.6)}`, boxShadow: `0 28px 60px rgba(0,0,0,0.55), 0 0 40px ${rgba(c, 0.35)}, inset 0 1.5px 0 rgba(255,255,255,0.5)`}), ...style}}>
    {img && <Img src={staticFile('img/' + img)} style={{position: 'absolute', left: -30, top: -30, width: w + 60, height: h + 60, objectFit: 'cover', filter: 'blur(5px) brightness(0.75) saturate(1.25)'}} />}
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, rgba(6,10,22,0.86) 0%, rgba(6,10,22,0.62) 55%, ${rgba(c, 0.25)} 100%)`}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 35%)'}} />
    <div style={{position: 'absolute', left: 0, bottom: 0, width: w, height: 6, background: `linear-gradient(90deg, ${c}, ${rgba(c, 0)})`}} />
    {children}</div>;
  return <div style={{...glassStyle({left: x, top: y, width: w, height: h, background: `linear-gradient(135deg, ${rgba(c, 0.55)} 0%, ${rgba(c, 0.18)} 45%, rgba(10,14,28,0.55) 100%)`, border: `1.5px solid ${rgba(c, 0.7)}`}), ...style}}>
    <div style={{position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: 110, background: rgba(c, 0.35), filter: 'blur(40px)'}} />
    {children}</div>;
};
const Badge: React.FC<{c: string; children: any; size?: number}> = ({c, children, size = 110}) => <div style={{width: size, height: size, borderRadius: size / 2, background: `radial-gradient(circle at 35% 30%, ${rgba('#ffffff', 0.45)}, ${c} 60%)`, boxShadow: `0 0 30px ${rgba(c, 0.7)}, inset 0 2px 0 rgba(255,255,255,0.5)`, color: 'white', fontSize: size * 0.48, fontWeight: 900, textAlign: 'center', lineHeight: `${size}px`}}>{children}</div>;
const Tile: React.FC<{img: string; x: number; y: number; s: number; c: string}> = ({img, x, y, s, c}) => <div style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: 24, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.75)', boxShadow: `0 14px 30px rgba(0,0,0,0.5), 0 0 24px ${rgba(c, 0.5)}`}}><Img src={staticFile('img/' + img)} style={{width: s, height: s, objectFit: 'cover'}} /></div>;

const ReasonsV = ({t, b}: any) => <>
  <div style={{position: 'absolute', left: 60, top: cy(130 + b.items.length * 330), ...slideUp(t)}}><Chip bg={b.c} size={46} style={{padding: '10px 30px', boxShadow: `0 0 30px ${rgba(b.c, 0.6)}`}}>{b.title || '为什么？'}</Chip></div>
  {b.items.map(([l, sub, img]: any, i: number) => <PCard key={i} x={50} y={cy(130 + b.items.length * 330) + 130 + i * 330} w={980} h={290} v={b.v} c={b.c} img={img} style={slideX(t, 0.3 + i * 0.5, i % 2 ? -600 : 600)}>
    <div style={{position: 'absolute', left: 40, top: 90}}><Badge c={b.c}>{i + 1}</Badge></div>
    <Txt x={190} y={b.v === 'B' ? 70 : 80} size={56} w={b.v === 'B' ? 560 : 740}>{l}</Txt>
    <Txt x={192} y={b.v === 'B' ? 150 : 165} size={34} weight={700} color="#DDE4F0" w={b.v === 'B' ? 540 : 740}>{sub}</Txt>
    {b.v === 'B' && <Tile img={img} x={770} y={45} s={200} c={b.c} />}
  </PCard>)}
  <Source text={b.src} />
</>;

const ListV = ({t, b}: any) => {
  const n = b.lines.length;
  if (b.v === 'A') return <><PCard x={50} y={cy(200 + n * 120)} w={980} h={200 + n * 120} v="A" c={b.c} img={b.img} style={slideUp(t)}>
      <div style={{position: 'absolute', left: 44, top: 44}}><Chip bg={b.c} size={40}>{b.title}</Chip></div>
      {b.lines.map((l: string, i: number) => <div key={i} style={{position: 'absolute', left: 44, top: 150 + i * 120, display: 'flex', alignItems: 'center', gap: 26, ...slideX(t, b.at ? b.at[i] : 0.3 + i * 0.35, 40)}}>
        <div style={{width: 18, height: 70, borderRadius: 9, background: b.c, boxShadow: `0 0 18px ${b.c}`}} />
        <div style={{fontSize: 56, fontWeight: 900, color: 'white'}}>{l}</div></div>)}
    </PCard><Source text={b.src} /></>;
  return <>
    <div style={{position: 'absolute', left: 50, top: 320, width: 980, height: 120, borderRadius: 26, background: `linear-gradient(90deg, ${b.c}, ${rgba(b.c, 0.4)})`, boxShadow: `0 0 40px ${rgba(b.c, 0.5)}`, ...slideUp(t)}}>
      <Txt x={40} y={30} size={54}>{b.title}</Txt>
      <Tile img={b.img} x={830} y={-30} s={170} c={b.c} />
    </div>
    {b.lines.map((l: string, i: number) => <PCard key={i} x={50 + (i % 2) * 40} y={490 + i * 175} w={940} h={145} v="B" c={b.c} style={slideX(t, 0.3 + i * 0.35, 600)}>
      <div style={{position: 'absolute', left: 30, top: 25}}><Badge c={b.c} size={95}>✓</Badge></div>
      <Txt x={150} y={40} size={54}>{l}</Txt></PCard>)}
    <Source text={b.src} />
  </>;
};

const CompareV = ({t, b}: any) => {
  const mx = Math.max(...b.v2);
  if (b.v === 'A') return <>
    <Txt x={60} y={310} size={60} style={slideUp(t)}>{b.title}</Txt>
    {b.v2.map((val: number, i: number) => { const hi = i === b.hi; const cc = hi ? b.c : '#8C97AE';
      return <PCard key={i} x={50} y={430 + i * 330} w={980} h={290} v="A" c={cc} img={b.img} style={slideX(t, 0.3 + i * 0.6)}>
        <Txt x={44} y={34} size={42} weight={700} color="#E2E8F3">{b.lab[i]}</Txt>
        <div style={{position: 'absolute', left: 44, top: 120, height: 110, borderRadius: 22, width: 890 * val / mx * k(t, 0.5 + i * 0.6, 0.9), background: `linear-gradient(180deg, ${rgba('#ffffff', 0.55)} 0%, ${cc} 45%, ${rgba(cc, 0.85)} 100%)`, boxShadow: `0 10px 30px ${rgba(cc, 0.5)}, inset 0 -6px 0 rgba(0,0,0,0.2)`}}>
          <div style={{position: 'absolute', right: 26, top: 22, fontSize: 56, fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', opacity: k(t, 1 + i * 0.6), whiteSpace: 'nowrap'}}>{b.txt[i]}</div></div>
      </PCard>; })}
    {b.chip && <div style={{position: 'absolute', left: 0, width: W, top: 1130, textAlign: 'center', ...pop(t, 1.9)}}><Chip bg={b.chipBg || RED} size={46}>{b.chip}</Chip></div>}
    <Source text={b.src} />
  </>;
  return <>
    <PCard x={50} y={cy(1000)} w={980} h={1000} v="B" c={b.c} style={slideUp(t)}>
      <Txt x={44} y={40} size={52}>{b.title}</Txt>
      <Tile img={b.img} x={790} y={30} s={150} c={b.c} />
      {b.v2.map((val: number, i: number) => { const hi = i === b.hi; const hh = 520 * val / mx * k(t, 0.4 + i * 0.5, 0.9); const x = 170 + i * 380;
        return <React.Fragment key={i}>
          <div style={{position: 'absolute', left: x, top: 860 - hh, width: 260, height: hh, borderRadius: '24px 24px 8px 8px', background: hi ? `linear-gradient(180deg, ${rgba('#ffffff', 0.6)}, ${b.c} 35%, ${rgba(b.c, 0.8)})` : 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.22))', boxShadow: hi ? `0 0 40px ${rgba(b.c, 0.6)}` : 'none'}} />
          <div style={{position: 'absolute', left: x - 40, width: 340, top: 860 - hh - 80, textAlign: 'center', fontSize: 50, fontWeight: 900, color: hi ? YEL : 'white', opacity: k(t, 0.9 + i * 0.5)}}>{b.txt[i]}</div>
          <Txt x={x - 40} w={340} y={880} size={36} weight={700} align="center" color="#E2E8F3">{b.lab[i]}</Txt>
        </React.Fragment>; })}
    </PCard>
    {b.chip && <div style={{position: 'absolute', left: 0, width: W, top: cy(1000) + 940, textAlign: 'center', ...pop(t, 1.9)}}><Chip bg={b.chipBg || RED} size={44}>{b.chip}</Chip></div>}
    <Source text={b.src} y={1380} />
  </>;
};

const DowngradeV = ({t, b}: any) => {
  if (b.v === 'A') return <><PCard x={50} y={360} w={980} h={760} v="A" c={b.c} img={b.img} style={slideUp(t)}>
      <Txt x={44} y={40} size={40} weight={700} color="#E2E8F3">券商 CGS International</Txt>
      <div style={{position: 'absolute', left: 70, top: 170, transform: 'rotate(-8deg)', border: '8px solid #3DD68C', borderRadius: 26, padding: '14px 44px', fontSize: 110, fontWeight: 900, color: '#3DD68C', opacity: 1 - 0.55 * k(t, 1.0)}}>买入
        <div style={{position: 'absolute', left: -10, right: -10, top: '48%', height: 10, background: RED, transform: `scaleX(${k(t, 1.0, 0.4)})`, transformOrigin: 'left'}} /></div>
      <div style={{position: 'absolute', left: 520, top: 230, transform: 'rotate(6deg)', ...pop(t, 1.4)}}><div style={{border: `8px solid ${YEL}`, borderRadius: 26, padding: '14px 44px', fontSize: 110, fontWeight: 900, color: YEL, boxShadow: `0 0 40px ${rgba(YEL, 0.5)}`}}>持有</div></div>
      <Txt x={44} y={500} size={44} style={slideUp(t, 1.9)}>原因：新频谱、监管成本</Txt>
      <Txt x={44} y={580} size={44} style={slideUp(t, 2.2)}>可能拖慢未来两年盈利成长</Txt>
    </PCard><Source text="来源：Business Today（11月20日）" /></>;
  const ang = interpolate(k(t, 0.8, 1.0), [0, 1], [50, 0]);
  return <><PCard x={50} y={330} w={980} h={900} v="B" c={b.c} style={slideUp(t)}>
      <Txt x={44} y={40} size={44}>券商评级 · CGS International</Txt>
      <Tile img={b.img} x={800} y={26} s={140} c={b.c} />
      <svg width="980" height="520" style={{position: 'absolute', left: 0, top: 150}}>
        {[['卖出', '#FF5A5F', 180, 240], ['持有', '#FFD640', 240, 300], ['买入', '#3DD68C', 300, 360]].map(([l, c, a0, a1]: any, i) => {
          const R = 300, cx = 490, cy = 420, p = (a: number) => [cx + R * Math.cos(a * Math.PI / 180), cy + R * Math.sin(a * Math.PI / 180)];
          const [x0, y0] = p(a0 + 2), [x1, y1] = p(a1 - 2); const [lx, ly] = [cx + 370 * Math.cos((a0 + a1) / 2 * Math.PI / 180), cy + 370 * Math.sin((a0 + a1) / 2 * Math.PI / 180)];
          return <g key={i}><path d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`} stroke={c} strokeWidth="56" fill="none" strokeLinecap="round" opacity={l === '持有' ? 1 : 0.45} />
            <text x={lx} y={ly + 14} fill="white" fontSize="40" fontWeight="900" textAnchor="middle">{l}</text></g>; })}
        <g transform={`rotate(${ang} 490 420)`}><path d="M478 420 L490 150 L502 420 Z" fill="white" /><circle cx="490" cy="420" r="26" fill="white" /></g>
      </svg>
      <div style={{position: 'absolute', left: 0, width: 980, top: 640, textAlign: 'center', ...pop(t, 1.9)}}><Chip bg={YEL} color={INK} size={50}>买入 → 持有</Chip></div>
      <Txt x={0} w={980} y={750} size={38} weight={700} align="center" color="#E2E8F3" style={slideUp(t, 2.2)}>原因：新频谱、监管成本或拖慢未来两年成长</Txt>
    </PCard><Source text="来源：Business Today（11月20日）" /></>;
};

const BigNumV = ({t, b}: any) => {
  const num = b.text || ((b.pre || '') + (b.val * k(t, 0.2, 1.2)).toLocaleString('en-US', {minimumFractionDigits: b.dec || 0, maximumFractionDigits: b.dec || 0}));
  if (b.v === 'A') return <><PCard x={50} y={cy(720)} w={980} h={720} v="A" c={b.c} img={b.img} style={slideUp(t)}>
      <Txt x={0} w={980} y={70} size={46} weight={700} align="center" color="#E2E8F3">{b.label}</Txt>
      <Txt x={0} w={980} y={190} size={b.size || 200} align="center" color="white" style={{textShadow: `0 0 50px ${rgba(b.c, 0.9)}`}}>{num}</Txt>
      <Txt x={0} w={980} y={420} size={60} align="center" color={YEL}>{b.unit}</Txt>
      {b.chip && <div style={{position: 'absolute', left: 0, width: 980, top: 560, textAlign: 'center', ...pop(t, 1.3)}}><Chip bg={b.c} size={42}>{b.chip}</Chip></div>}
    </PCard><Source text={b.src} /></>;
  return <><PCard x={50} y={380} w={980} h={720} v="B" c={b.c} style={slideUp(t)}>
      <Tile img={b.img} x={60} y={70} s={260} c={b.c} />
      <Txt x={360} y={90} size={42} weight={700} color="#F0F3F8" w={580}>{b.label}</Txt>
      <Txt x={355} y={170} size={150} color="white">{num}</Txt>
      <Txt x={360} y={340} size={54} color={YEL}>{b.unit}</Txt>
      <div style={{position: 'absolute', left: 60, top: 440, width: 860, display: 'flex', flexWrap: 'wrap', gap: 8}}>
        {Array.from({length: 40}).map((_, i) => <div key={i} style={{width: 35, height: 35, borderRadius: 8, background: i < 38 ? 'rgba(255,255,255,0.35)' : b.c, opacity: k(t, 0.3 + i * 0.02, 0.2), boxShadow: i >= 38 ? `0 0 14px ${b.c}` : 'none'}} />)}
      </div>
      <div style={{position: 'absolute', left: 0, width: 980, top: 600, textAlign: 'center', ...pop(t, 1.3)}}><Chip bg={b.c} size={40}>{b.chip}</Chip></div>
    </PCard><Source text={b.src} /></>;
};

const SampleComp: React.FC<{card: string; v: string; sec: number}> = ({card, v}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const C: any = {
    reasons: [ReasonsV, 'build.jpg', '2', 'SUNCON 赚多了，股价反跌？', {c: '#E5484D', items: [['工程组合更好赚', '利润率提高', 'build.jpg'], ['去年营收特别高', '数据中心工程刚好在赶工高峰', 'dc.jpg']], src: '来源：Bernama、The Star（11月19日）'}],
    list: [ListV, 'dc.jpg', '1', 'YTL POWER 被纽时点名？', {c: '#2E6BE6', img: 'dc.jpg', title: 'YTL Power 周五声明', lines: ['只提供空间、电力、冷却、网络', '客户包括美国大型云端公司', '符合马来西亚法律与美国管制'], src: '来源：The Star、TNGlobal（11月20日）'}],
    compare: [CompareV, 'cocoa.jpg', '5', 'GUAN CHONG 利润创新高', {c: '#C0263E', img: 'cocoa.jpg', title: '可可豆平均价格（每吨）', v2: [7000, 5840], lab: ['去年同季', '这一季'], txt: ['> US$7,000', 'US$5,840'], hi: 1, chip: '利息开支也降了 40%', chipBg: '#1FAE6B', src: '来源：The Edge（11月18日）'}],
    downgrade: [DowngradeV, 'tower.jpg', '3', 'CELCOMDIGI 照派息，评级被降', {c: '#4B4DED', img: 'tower.jpg'}],
    bignum: [BigNumV, 'store.jpg', '4', '7-ELEVEN 净利翻三倍', {c: '#0E8A4E', img: 'store.jpg', label: '门店总数（这季新开 121 家）', val: 2799, unit: '家', chip: '公共假期 → 每店日销、客单都提高', src: '来源：The Star（11月20日）'}],
  };
  const [Comp, bg, num, bar, b] = C[card];
  return <AbsoluteFill style={{fontFamily: 'PH', background: '#061022'}}>
    <style>{fonts}</style>
    <Bg img={bg} blur={9} dark={0.55} />
    <AbsoluteFill><Comp t={t} b={{...b, v}} R={() => 0} /></AbsoluteFill>
    <TopBar num={num} text={bar} />
    <div style={{position: 'absolute', left: 36, top: 50, display: 'flex', gap: 10}}>
      <div style={{background: YEL, color: INK, fontSize: 30, fontWeight: 900, padding: '5px 16px', borderRadius: 12}}>美股早报</div>
      <div style={{background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: 30, fontWeight: 900, padding: '5px 16px', borderRadius: 12}}>11/20</div></div>
    <div style={{position: 'absolute', right: 30, top: 50, background: v === 'A' ? '#FF7A00' : '#9B7BFF', color: 'white', fontSize: 34, fontWeight: 900, padding: '6px 20px', borderRadius: 12}}>样板 {v}</div>
  </AbsoluteFill>;
};

// consortium donut
const Pie = ({t, b}: any) => {
  const parts = b.parts as any[]; const R = 230, cx = 540, cyy = cy(1000) + 380; let acc = 0;
  return <>
    <PCard x={50} y={cy(1000)} w={980} h={1000} v="B" c={b.c} style={slideUp(t)}>
      <Txt x={44} y={40} size={50}>{b.title}</Txt>
      {b.img && <Tile img={b.img} x={790} y={26} s={150} c={b.c} />}
    </PCard>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {parts.map(([l, v, c]: any, i: number) => { const a0 = acc; acc += v; const prog = k(t, 0.3 + i * 0.4, 0.7);
        const a1 = a0 + (v * prog); const p0 = [cx + R * Math.sin(a0 / 100 * 2 * Math.PI), cyy - R * Math.cos(a0 / 100 * 2 * Math.PI)], p1 = [cx + R * Math.sin(a1 / 100 * 2 * Math.PI), cyy - R * Math.cos(a1 / 100 * 2 * Math.PI)];
        return <path key={i} d={`M${p0[0]} ${p0[1]} A${R} ${R} 0 ${a1 - a0 > 50 ? 1 : 0} 1 ${p1[0]} ${p1[1]}`} stroke={c} strokeWidth={i === 0 ? 120 : 100} fill="none" style={{filter: i === 0 ? `drop-shadow(0 0 18px ${c})` : undefined}} />; })}
      <text x={cx} y={cyy + 10} fill="white" fontSize="96" fontWeight="900" textAnchor="middle" opacity={k(t, 0.8)}>{parts[0][1]}%</text>
      <text x={cx} y={cyy + 60} fill="#E2E8F3" fontSize="34" fontWeight="700" textAnchor="middle" opacity={k(t, 0.8)}>{parts[0][0]}</text>
    </svg>
    <div style={{position: 'absolute', left: 90, top: cyy + 290, width: 900, display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', ...slideUp(t, 1.4)}}>
      {parts.map(([l, v, c]: any, i: number) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 30, fontWeight: 700, color: 'white'}}><div style={{width: 26, height: 26, borderRadius: 8, background: c}} />{l} {v}%</div>)}
    </div>
    {b.chip && t >= (b.chipAt || 2) && <div style={{position: 'absolute', left: 0, width: W, top: cy(1000) + 860, textAlign: 'center', ...pop(t, b.chipAt || 2)}}><Chip bg={YEL} color={INK} size={44}>{b.chip}</Chip></div>}
    <Source text={b.src} />
  </>;
};

// dated timeline
const Timeline = ({t, b}: any) => {
  const ev = b.ev as any[]; const h = 200 + ev.length * 200; const y0 = cy(h);
  return <><PCard x={50} y={y0} w={980} h={h} v="A" c={b.c} img={b.img} style={slideUp(t)}>
    <div style={{position: 'absolute', left: 44, top: 40}}><Chip bg={b.c} size={40}>{b.title}</Chip></div>
    <div style={{position: 'absolute', left: 120, top: 150, width: 6, height: (ev.length - 1) * 200 * k(t, 0.3, ev.length * 0.6), background: `linear-gradient(180deg, ${rgba('#ffffff', 0.7)}, ${b.c})`, borderRadius: 3}} />
    {ev.map(([d, l, c]: any, i: number) => { const at = b.at ? b.at[i] : 0.3 + i * 0.6; return <div key={i} style={{position: 'absolute', left: 80, top: 120 + i * 200, display: 'flex', alignItems: 'center', gap: 34, ...slideX(t, at, 60)}}>
      <div style={{width: 86, height: 86, borderRadius: 43, background: c || b.c, boxShadow: `0 0 26px ${c || b.c}`, border: '4px solid white'}} />
      <div><div style={{fontSize: 36, fontWeight: 700, color: YEL}}>{d}</div><div style={{fontSize: 54, fontWeight: 900, color: 'white'}}>{l}</div></div>
    </div>; })}
  </PCard><Source text={b.src} /></>;
};

// relationship diagram (nodes + labelled dashed links)
const Rel = ({t, b}: any) => {
  const N = b.nodes as any[]; const L = b.links as any[]; const top = cy(b.h || 900);
  const pos = (i: number) => [N[i][2], top + N[i][3]];
  return <>
    {b.title && <div style={{position: 'absolute', left: 60, top: top - 90, ...slideUp(t)}}><Chip bg={b.titleBg || RED} size={38}>{b.title}</Chip></div>}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs><marker id="arr" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="white" /></marker></defs>
      {L.map(([a, z, lab, at, c]: any, i: number) => { const [x0, y0] = pos(a), [x1, y1] = pos(z); const op = k(t, at, 0.5);
        const up = y1 < y0; const ys = up ? y0 - 70 : y0 + 70, ye = up ? y1 + 70 : y1 - 70;
        return <g key={i} opacity={op}><line x1={x0} y1={ys} x2={x0 + (x1 - x0) * op} y2={ys + (ye - ys) * op} stroke={c || 'white'} strokeWidth="5" strokeDasharray="12 9" markerEnd="url(#arr)" />
          <text x={(x0 + x1) / 2 + 20} y={(y0 + y1) / 2 + 12} fill={c || YEL} fontSize="34" fontWeight="900">{lab}</text></g>; })}
    </svg>
    {N.map(([name, sub, x, y, c, at]: any, i: number) => <div key={i} style={{...glassStyle({left: x - 220, top: top + y - 70, width: 440, height: 140, border: `2px solid ${c}`, boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 26px ${rgba(c, 0.45)}`}), ...pop(t, at)}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 10, height: 140, background: c}} />
      <Txt x={34} y={22} size={44}>{name}</Txt><Txt x={36} y={84} size={28} weight={700} color="#D6DEEC">{sub}</Txt></div>)}
    {b.chip && t >= b.chipAt && <div style={{position: 'absolute', left: 0, width: W, top: top + (b.h || 900) + 10, textAlign: 'center', ...pop(t, b.chipAt)}}><Chip bg={b.chipBg || YEL} color={b.chipBg ? 'white' : INK} size={40}>{b.chip}</Chip></div>}
    <Source text={b.src} />
  </>;
};

// ===== US V9 components (V4 style: centred, brand colours, photo cards) =====
const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const fmt = (v: number, d = 2) => v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
const Pill: React.FC<{x: number; y: number; bg: string; color?: string; size?: number; children?: any; style?: any}> = ({x, y, bg, color = 'white', size = 34, children, style}) =>
  <div style={{position: 'absolute', left: x, top: y, padding: '8px 22px', borderRadius: 16, background: bg, color, fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', ...style}}>{children}</div>;
const Logo: React.FC<{sym: string; x: number; y: number; s: number}> = ({sym, x, y, s}) => <div style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s * 0.18, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(0,0,0,0.35)', overflow: 'hidden'}}>
  <Img src={staticFile('logo/logo_' + sym + '_av.png')} style={{maxWidth: s * 0.86, maxHeight: s * 0.86}} /></div>;
const Spark: React.FC<{vals: number[]; w: number; h: number; prog: number; color?: string; sw?: number}> = ({vals, w, h, prog, color, sw = 5}) => {
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.12 || 1;
  const P = vals.map((v, i) => [i * w / (vals.length - 1), h - (v - lo + pad) / (hi - lo + 2 * pad) * h]);
  const n = prog * (P.length - 1), kk = Math.floor(n); const pts = P.slice(0, kk + 1);
  if (kk < P.length - 1) {const f = n - kk; pts.push([lerp(P[kk][0], P[kk + 1][0], f), lerp(P[kk][1], P[kk + 1][1], f)]);}
  const c = color || (vals[vals.length - 1] < vals[0] ? RED : GRN); const last = P[P.length - 1]; const id = `g${w}${h}${Math.round(vals[0])}`;
  return <svg width={w} height={h} style={{overflow: 'visible'}}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity="0.35" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
    {pts.length > 1 && <path d={`M${pts.map(p => p.join(',')).join(' L')} L${pts[pts.length - 1][0]},${h} L0,${h} Z`} fill={`url(#${id})`} />}
    {pts.length > 1 && <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />}
    {prog >= 1 && <circle cx={last[0]} cy={last[1]} r={sw + 4} fill={c} />}
  </svg>;
};

const TitleU = ({t}: any) => <>
  <Txt x={0} w={W} y={640} size={150} color={YEL} align="center" style={{...slideUp(t, 0.15), textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>11月20日</Txt>
  <Txt x={0} w={W} y={820} size={150} align="center" style={{...slideUp(t, 0.3), textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>美股早报</Txt>
  <div style={{position: 'absolute', left: 0, width: W, top: 1030, textAlign: 'center', ...slideUp(t, 0.5)}}>
    <span style={{...glassStyle({position: 'relative', display: 'inline-block', padding: '12px 36px', fontSize: 40, fontWeight: 700}), borderRadius: 40}}>20 Nov 2026 · 周五收盘</span></div>
</>;

const HookU = ({t}: any) => {
  const rows = [['GTA 6 首日零售销售', 'US$37.9 亿', '公司估算 · Take-Two 公告', '#F5A623', 'gta_art.png', GRN], ['标普 500 这一星期', '−8.6%', '去年 4 月以来最差的一周', '#FF5A5F', 'bg_wallstreet_13801277.jpg', RED]];
  return <>
    {rows.map(([n, a, sub, c, img, ac], i) => <PCard key={i} x={60} y={330 + i * 400} w={960} h={340} v="A" c={c} img={img} style={slideX(t, 0.1 + i * 0.9, i ? -600 : 600)}>
      <div style={{position: 'absolute', left: 50, top: 36}}><Chip bg={c} color={i ? 'white' : INK} size={36}>{n}</Chip></div>
      <Txt x={50} y={118} size={110} color={ac} style={{textShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>{a}</Txt>
      <Txt x={50} y={262} size={32} weight={700} color="#DDE4F0">{sub}</Txt>
    </PCard>)}
    <Txt x={0} w={W} y={1150} size={70} color={YEL} align="center" style={{...slideUp(t, 2.4), textShadow: '0 6px 24px rgba(0,0,0,0.8)'}}>都救不了这个星期</Txt>
    <Source text="来源：Take-Two 8-K（11/20）；Yahoo Finance 指数日线" />
  </>;
};

const SiteU = ({t, b}: any) => { const y0 = cy(190 + 30 + 600); return <>
  <Glass x={40} y={y0} w={1000} h={190} style={slideUp(t)}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 12, height: 190, background: b.c}} />
    <Logo sym={b.logo} x={40} y={30} s={130} />
    <Txt x={200} y={30} size={62}>{b.name}</Txt>
    <Txt x={202} y={114} size={34} weight={700} color="#D6DEEC">{b.line}</Txt>
  </Glass>
  <div style={{...glassStyle({left: 40, top: y0 + 220, width: 1000, height: 600, padding: 0, border: `2px solid ${rgba(b.c, 0.7)}`, boxShadow: `0 28px 60px rgba(0,0,0,0.55), 0 0 36px ${rgba(b.c, 0.35)}`}), ...slideUp(t, 0.2)}}>
    <Img src={staticFile('img/' + b.img)} style={{position: 'absolute', left: 0, top: 0, width: 1000, height: 600, objectFit: 'cover', objectPosition: b.pos || 'top left', transform: `scale(${1 + 0.04 * k(t, 0.3, 6)})`, transformOrigin: 'top left'}} />
  </div>
  <Source text={b.src || ('画面：' + b.name + ' 官网')} />
</>; };

const Dashboard = ({t, b, R}: any) => {
  const nq = R(b.nq), dj = R(b.dj); const Y0 = cy(860);
  const card = (x: number, y: number, w: number, h: number, name: string, pct: number, lvl: number, prev: number, vals: number[], t0: number, big: boolean, hiAt?: number, note = '') => {
    if (t < t0 - 0.05) return null; const hi = hiAt !== undefined && t > hiAt;
    return <Glass x={x} y={y} w={w} h={h} style={{...slideUp(t, t0), ...(hi ? {border: `4px solid ${HL}`, boxShadow: `0 0 40px rgba(255,214,0,0.35), 0 28px 60px rgba(0,0,0,0.5)`} : {})}}>
      <Txt x={36} y={28} size={big ? 42 : 36}>{name}</Txt>
      <Txt x={34} y={big ? 92 : 80} size={big ? 140 : 84} color={RED}>{fmt(lerp(0, pct, k(t, t0 + 0.2, 1.1)))}%</Txt>
      <Txt x={36} y={big ? 262 : 186} size={big ? 54 : 40}>{fmt(lerp(prev, lvl, k(t, t0 + 0.2, 1.1)))}</Txt>
      <Txt x={38} y={big ? 330 : 240} size={28} weight={400} color={MUTED}>前收 {fmt(prev)}{note}</Txt>
      <div style={{position: 'absolute', left: big ? 600 : 36, top: big ? 120 : 290}}><Spark vals={vals} w={big ? 330 : w - 72} h={big ? 200 : 100} prog={k(t, t0 + 0.4, 1.4)} /></div>
      {hi && <Pill x={w - 270} y={18} bg={HL} color={INK} size={28} style={{padding: '4px 16px'}}>三者中跌最多</Pill>}
    </Glass>;
  };
  return <>
    {card(50, Y0, 980, 400, 'S&P 500  标普 500', -3.70, 6910.39, 7175.83, b.spx, 0, true)}
    {card(50, Y0 + 440, 480, 420, 'NASDAQ 综合', -5.28, 22617.73, 23879.20, b.comp, nq, false, nq + 1.6, ' · 年内转跌')}
    {card(550, Y0 + 440, 480, 420, 'DOW 道琼斯', -1.93, 48147.33, 49097.06, b.dji, dj, false)}
    <Source text="数据：Yahoo Finance 指数日线 · 走势线为近 8 个交易日" />
  </>;
};

const Vix = ({t}: any) => {
  const val = lerp(28.44, 35.89, k(t, 0.3, 1.4)); const cx = 490, cyy = 520, R = 360, th = 92; const Y0 = cy(900);
  const seg = ['#3DD68C', '#A6DA6A', '#FFD23F', '#FF9F43', '#FF5A5F'];
  const arc = (a0: number, a1: number) => { const p = (a: number, r: number) => [cx + r * Math.cos(a), cyy + r * Math.sin(a)];
    const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, R - th), [x3, y3] = p(a0, R - th);
    return `M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} L${x2},${y2} A${R - th},${R - th} 0 0 0 ${x3},${y3} Z`; };
  const ang = (v: number) => Math.PI + (Math.min(Math.max(v, 10), 50) - 10) / 40 * Math.PI;
  const rot = -90 + (Math.min(Math.max(val, 10), 50) - 10) / 40 * 180;
  return <>
    <Glass x={50} y={Y0} w={980} h={900} style={slideUp(t)}>
      <Txt x={44} y={36} size={50}>恐慌指数 VIX</Txt>
      <svg width={980} height={900} style={{position: 'absolute', left: 0, top: 40}}>
        {seg.map((c, i) => <path key={i} d={arc(Math.PI + i * Math.PI / 5 + 0.012, Math.PI + (i + 1) * Math.PI / 5 - 0.012)} fill={c} opacity={0.95} />)}
        {[10, 20, 30, 40, 50].map(v => <text key={v} x={cx + (R + 40) * Math.cos(ang(v))} y={cyy + (R + 40) * Math.sin(ang(v)) + 10} fill={MUTED} fontSize={30} fontWeight={700} textAnchor="middle" fontFamily="PH">{v}</text>)}
        <g transform={`translate(${cx},${cyy}) rotate(${rot})`}><path d={`M0,${-(R - 40)} C 18,-120 34,-20 34,10 A34,34 0 1 1 -34,10 C -34,-20 -18,-120 0,${-(R - 40)} Z`} fill="#9AA3B5" stroke="rgba(255,255,255,0.6)" strokeWidth={2} /></g>
        <circle cx={cx} cy={cyy + 10} r={14} fill="#E6EAF2" />
      </svg>
      <Txt x={0} w={980} y={630} size={lerp(120, 160, k(t, 1.5, 0.4))} color={t > 1.5 ? RED : 'white'} align="center">{val.toFixed(2)}</Txt>
      <Txt x={0} w={980} y={830} size={32} weight={400} color={MUTED} align="center">前收 28.44　·　2025 年 4 月以来最高收盘</Txt>
    </Glass>
    <Source text="数据：Yahoo Finance（CBOE VIX）" />
  </>;
};

const Correction = ({t}: any) => {
  const base = 6500, hr = 7818.93, hn = 6910.39; const Y0 = cy(900);
  return <>
    <PCard x={50} y={Y0} w={980} h={760} v="B" c={RED} style={slideUp(t)}>
      <Txt x={50} y={44} size={56}>标普 500 · 距收盘纪录</Txt>
      {[['收盘纪录 10/6', hr, 'rgba(220,228,245,0.85)', 0.2], ['11/20 收盘', hn, RED, 0.6]].map(([lab, v, c, st]: any, j) =>
        <div key={j}><Txt x={50} y={170 + j * 170} size={38}>{lab}</Txt><Txt x={930} y={170 + j * 170} size={42} style={{transform: 'translateX(-100%)'}}>{fmt(v)}</Txt>
          <div style={{position: 'absolute', left: 50, top: 230 + j * 170, height: 56, borderRadius: 14, background: c, boxShadow: j ? `0 0 24px ${rgba(RED, 0.6)}` : 'none', width: Math.max(20, 880 * (v - base) / (hr - base) * k(t, st, 0.8))}} /></div>)}
      <Txt x={0} w={980} y={540} size={130} color="white" align="center" style={{opacity: k(t, 1.3), textShadow: `0 0 40px ${rgba(RED, 0.9)}`}}>{lerp(0, -11.6, k(t, 1.3, 0.8)).toFixed(1)}%</Txt>
    </PCard>
    <div style={{position: 'absolute', left: 0, width: W, top: Y0 + 800, textAlign: 'center', ...pop(t, 2.0)}}><Chip bg={RED} size={50}>跌超过 10% = 技术性调整</Chip></div>
    <Source text="数据：Yahoo Finance；标普收盘口径" />
  </>;
};

const ASSETS = [
  {en: 'GOLD', zh: '黄金现货', price: '≈ $3,530', unit: '美元/盎司 · 现货', day: '−2.0%', wk: '一周 −9.0%', img: 'gold_pexels_7361127.jpg', key: 'gold', c: '#E0B23A'},
  {en: 'OIL · WTI', zh: 'WTI 原油', price: '$83.98', unit: '美元/桶 · 结算价', day: '+0.93%', wk: '一周 −5.17%', img: 'oil_pexels_19130305.jpg', key: 'wti', c: '#8C6B4F'},
  {en: 'BITCOIN', zh: '比特币', price: '≈ $58,800', unit: '美元 · UTC 日线', day: '−5.0%', wk: '一周 −13.8%', img: 'crypto_pexels_35544540.jpg', key: 'btc', c: '#F7931A'}];
const AVALS: any = {gold: [3883.11, 3862.96, 3849.98, 3740.20, 3605.48, 3533.11], wti: [88.56, 85.72, 86.01, 83.26, 83.21, 83.98], btc: [68249.27, 64128.05, 65305.06, 64855.84, 64893.95, 62987.27, 61901.82, 58798.98]};
const Assets = ({t, R}: any) => {
  const rv = [0.2, R(1), R(2)]; const Y0 = cy(960);
  return <>
    {ASSETS.map((a, i) => t < rv[i] - 0.05 ? null : <PCard key={i} x={50} y={Y0 + i * 330} w={980} h={300} v="A" c={a.c} img={a.img} style={slideX(t, rv[i], i % 2 ? -600 : 600)}>
      <Txt x={40} y={26} size={30} color={a.c}>{a.en}</Txt>
      <Txt x={40} y={66} size={46}>{a.zh}</Txt>
      <Txt x={40} y={136} size={58}>{a.price}</Txt>
      <Txt x={42} y={216} size={26} weight={400} color="#D6DCE8">{a.unit}</Txt>
      <Txt x={940} y={24} size={76} color={a.day.startsWith('+') ? GRN : RED} style={{transform: 'translateX(-100%)'}}>{a.day}</Txt>
      <div style={{position: 'absolute', left: 480, top: 140}}><Spark vals={AVALS[a.key]} w={420} h={100} prog={k(t, rv[i] + 0.3, 1.2)} sw={6} /></div>
      <Pill x={700} y={246} bg="rgba(200,30,40,0.9)" size={26} style={{padding: '4px 18px'}}>{a.wk}</Pill>
    </PCard>)}
    <Source text="数据：Alpha Vantage；Yahoo Finance · 走势线为近 6–8 个交易日" />
  </>;
};

const Fed = ({t, b, R}: any) => {
  const p = lerp(0, 90, k(t, 0.2, 1.2)); const Y0 = cy(930); const cAt = b.cAt !== undefined ? R(b.cAt) : 1.8;
  return <>
    <PCard x={50} y={Y0} w={980} h={500} v="A" c="#3C7DFF" img="fed_pexels_6534073.jpg" style={slideUp(t)}>
      <div style={{position: 'absolute', left: 44, top: 34}}><Chip bg="#3C7DFF" size={36}>联储局 12 月会议 · 利率期货定价</Chip></div>
      <Txt x={44} y={130} size={44}>加息 0.25 个百分点</Txt>
      <Txt x={936} y={104} size={110} color={RED} style={{transform: 'translateX(-100%)'}}>{'>'}{p.toFixed(0)}%</Txt>
      <div style={{position: 'absolute', left: 44, top: 250, width: 892, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.14)'}}><div style={{height: 56, borderRadius: 28, width: 892 * p / 100, background: `linear-gradient(90deg, #ff8a8a, ${RED})`}} /></div>
      <Txt x={44} y={350} size={40}>其他结果</Txt>
      <Txt x={936} y={344} size={60} color={MUTED} style={{transform: 'translateX(-100%)'}}>{'<'}{(10 * k(t, 0.2, 1.2)).toFixed(0)}%</Txt>
      <div style={{position: 'absolute', left: 44, top: 420, width: 892, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.14)'}}><div style={{height: 36, borderRadius: 18, width: 892 * 0.1 * k(t, 0.2, 1.2), background: '#9AA3B5'}} /></div>
    </PCard>
    {t > 0.9 && <Glass x={50} y={Y0 + 530} w={980} h={250} style={slideUp(t, 1.0)}>
      <Txt x={44} y={30} size={36}>10 年期美债收益率</Txt>
      <Txt x={44} y={90} size={76}>4.91%</Txt>
      <Txt x={46} y={190} size={26} weight={400} color={MUTED}>11/20 收盘 · 近 8 个交易日</Txt>
      <div style={{position: 'absolute', left: 400, top: 50}}><Spark vals={b.tnx} w={530} h={150} prog={k(t, 1.2, 1.4)} color="#6FB7FF" /></div>
    </Glass>}
    {t > cAt - 0.05 && <div style={{position: 'absolute', left: 0, width: W, top: Y0 + 820, textAlign: 'center', ...pop(t, cAt)}}><Chip bg={YEL} color={INK} size={52}>市场预期 ≠ 联储局决定</Chip></div>}
    <Source text="来源：CME FedWatch；Yahoo Finance（^TNX）" />
  </>;
};

const CHIPS = [['nvda', 'Nvidia', '−14.01%', 14.01], ['mu', '美光 Micron', '−13.89%', 13.89], ['amd', 'AMD', '−13.25%', 13.25], ['avgo', '博通 Broadcom', '−12.2%', 12.2]];
const ChipsU = ({t, b}: any) => { const Y0 = cy(960); return <>
  <div style={{position: 'absolute', left: 60, top: Y0, ...slideUp(t)}}><Chip bg={b.c} color={INK} size={44} style={{padding: '10px 30px', boxShadow: `0 0 30px ${rgba(b.c, 0.6)}`}}>周五芯片股跌幅</Chip></div>
  {CHIPS.map(([s, n, txt, v]: any, i) => <PCard key={i} x={50} y={Y0 + 110 + i * 200} w={980} h={175} v={i ? 'B' : 'A'} c={i ? '#8C97AE' : b.c} img="chip_pexels_6636463.jpg" style={slideX(t, 0.15 * i)}>
    <Logo sym={s} x={28} y={28} s={120} />
    <Txt x={180} y={26} size={42}>{n}</Txt>
    <Txt x={940} y={24} size={50} color={RED} style={{transform: 'translateX(-100%)'}}>{txt}</Txt>
    <div style={{position: 'absolute', left: 180, top: 110, height: 38, borderRadius: 12, width: 740 * v / 15 * k(t, 0.15 * i + 0.2, 1.0), background: `linear-gradient(90deg, #ff9a9a, ${RED})`}} />
  </PCard>)}
  <div style={{position: 'absolute', left: 0, width: W, top: Y0 + 920, textAlign: 'center', ...pop(t, 2.0)}}><Chip bg={RED} size={48}>整个半导体板块一起被卖</Chip></div>
  <Source text="11月20日收盘 · 数据：moomoo" y={1380} />
</>; };

// generic candlestick: b.d=[[label,o,h,l,c]], b.rv reveal times, b.ref=[price,label], b.pct labels under dates
const PriceU = ({t, b}: any) => {
  const D = b.d as any[]; const n = D.length; const rv: number[] = b.rv || D.map((_: any, i: number) => 0.2 + i * 0.16);
  const all = D.flatMap((x: any) => [x[2], x[3]]).concat(b.ref ? [b.ref[0]] : []);
  const lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.16;
  const G = cy(1080); const y0 = G + 250, h = 560, x0 = 110, w = 860, cw = w / n, bw = Math.min(cw * 0.56, 130);
  const Y = (v: number) => y0 + h - (v - lo + pad) / (hi - lo + 2 * pad) * h; const dec = b.dec ?? 2;
  const f = (v: number) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  const chipAt = b.chipAt ?? (rv[n - 1] + 0.8);
  return <>
    <PCard x={40} y={G} w={1000} h={1080} v="B" c={b.c} style={slideUp(t)}>
      {b.logo && <Logo sym={b.logo} x={40} y={34} s={90} />}
      <Txt x={b.logo ? 150 : 44} y={36} size={50}>{b.title}</Txt>
      <Txt x={b.logo ? 152 : 46} y={102} size={28} weight={400} color="#D6DEEC">{b.sub}</Txt>
    </PCard>
    {b.chip && t > chipAt - 0.05 && <div style={{position: 'absolute', right: 80, top: G + 160, ...pop(t, chipAt)}}><Chip bg={b.chipBg || RED} color={b.chipBg === GRN ? INK : 'white'} size={42}>{b.chip}</Chip></div>}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {[0, 1, 2, 3].map(i => <line key={i} x1={x0} x2={x0 + w} y1={y0 + i * h / 3} y2={y0 + i * h / 3} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />)}
      {b.ref && <g opacity={k(t, 0.3)}><line x1={x0} x2={x0 + w} y1={Y(b.ref[0])} y2={Y(b.ref[0])} stroke="#C8D0E2" strokeWidth="3" strokeDasharray="14 12" />
        <text x={x0 + w} y={Y(b.ref[0]) + 40} fill="#E2E8F3" fontSize="30" fontWeight="700" textAnchor="end">{b.ref[1]}</text></g>}
      {D.map((x, i) => {
        const a = k(t, rv[i], 0.35); if (a <= 0) return null; const up = x[4] >= x[1]; const c = up ? GRN : RED; const cx = x0 + cw * (i + 0.5);
        const showC = b.allClose || i >= n - 2;
        return <g key={i} opacity={a}>
          <line x1={cx} x2={cx} y1={Y(x[2])} y2={Y(x[3])} stroke={c} strokeWidth="4" />
          <rect x={cx - bw / 2} width={bw} y={Y(Math.max(x[1], x[4]))} height={Math.max(4, Math.abs(Y(x[1]) - Y(x[4])))} fill={c} rx="4" stroke={i === n - 1 ? 'white' : 'none'} strokeWidth="3" />
          <circle cx={cx} cy={Y(x[4])} r="9" fill="white" stroke={c} strokeWidth="4" />
          <text x={cx} y={y0 + h + 52} fill="#C9D2E3" fontSize="28" fontWeight="700" textAnchor="middle">{x[0]}</text>
          {b.pct && <text x={cx} y={y0 + h + 100} fill={b.pct[i].startsWith('+') ? GRN : RED} fontSize="32" fontWeight="900" textAnchor="middle">{b.pct[i]}</text>}
          {showC && <text x={cx} y={Y(x[2]) - 22} fill={i === n - 1 ? YEL : 'white'} fontSize={b.small ? 28 : 34} fontWeight="900" textAnchor="middle">{f(x[4])}</text>}
          {b.open && <text x={cx - bw / 2 - 14} y={Y(x[1]) + 10} fill="#E2E8F3" fontSize="28" fontWeight="700" textAnchor="end">开 {f(x[1])}</text>}
        </g>;
      })}
      {b.lowMark && (() => { const last = D[n - 1]; const cx = x0 + cw * (n - 0.5); const yy = Y(last[3]); const a = k(t, rv[n - 1] + 0.8); return <g opacity={a}>
        <text x={cx - bw / 2 - 14} y={yy + 10} fill={YEL} fontSize="30" fontWeight="900" textAnchor="end">{`盘中低 ${f(last[3])}`}</text></g>; })()}
    </svg>
    <Source text={b.src} y={1380} />
  </>;
};

const SplitU = ({t, b, R}: any) => {
  const comp = [
    {sym: 'crwd', name: 'CrowdStrike', l1: '端点安全 · Endpoint', l2: '保护企业的电脑、伺服器和设备', img: 'crwd_prod2.png', col: '#E81F25', badge: '管设备', side: -1, st: 0.1},
    {sym: 'zs', name: 'Zscaler', l1: '云端网络安全 · Zero Trust', l2: '保护员工连上网络和应用的过程', img: 'zs_prod2.png', col: '#1E6EE6', badge: '管连线', side: 1, st: b.zsAt}];
  const r2 = b.pillAt;
  return <>
    {comp.map((c, i) => {const kk = k(t, c.st, 0.6); if (kk <= 0) return null; const y = 280 + i * 620;
      return <div key={i} style={{...glassStyle({left: 50, top: y, width: 980, height: 500, border: `2px solid ${rgba(c.col, 0.7)}`, boxShadow: `0 28px 60px rgba(0,0,0,0.55), 0 0 36px ${rgba(c.col, 0.35)}`}), opacity: kk, transform: `translateX(${c.side * 900 * (1 - kk)}px)`}}>
        <Img src={staticFile('img/' + c.img)} style={{position: 'absolute', left: -30, top: -30, width: 1040, height: 560, objectFit: 'cover', filter: 'blur(16px) brightness(0.5)'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, rgba(6,10,22,0.7), rgba(6,10,22,0.35) 60%, ${rgba(c.col, 0.3)})`}} />
        <Logo sym={c.sym} x={30} y={30} s={130} />
        <Txt x={190} y={22} size={60}>{c.name}</Txt>
        <div style={{position: 'absolute', left: 190, top: 104, width: 6, height: 36, borderRadius: 3, background: c.col}} />
        <Txt x={208} y={98} size={36}>{c.l1}</Txt>
        <Txt x={192} y={150} size={28} weight={700} color="#D6DEEC">{c.l2}</Txt>
        <Img src={staticFile('img/' + c.img)} style={{position: 'absolute', left: 25, top: 205, width: 930, height: 275, objectFit: 'contain', background: c.sym === 'crwd' ? '#000' : '#0B1D3A', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.35)'}} />
        {t > r2 && <Pill x={740} y={40} bg={c.col} size={40} style={{...slideUp(t, r2 + i * 0.3, 20), boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>{c.badge}</Pill>}
      </div>;})}
    {t > r2 && <div style={{position: 'absolute', left: 120, top: 800, width: 840, height: 80, borderRadius: 40, padding: 4, background: 'linear-gradient(90deg, #E81F25, #1E6EE6)', boxShadow: '0 16px 36px rgba(0,0,0,0.5)', ...slideUp(t, r2, 20)}}>
      <div style={{width: 832, height: 72, borderRadius: 36, background: 'rgba(10,20,40,0.92)', position: 'relative'}}>
        <Txt x={34} y={14} size={36}>设备 + 连线 → 更接近一站式平台</Txt>
        <Pill x={640} y={12} bg={HL} color={INK} size={28} style={{padding: '4px 16px'}}>我们的观察</Pill>
      </div></div>}
    <Source text="画面：CrowdStrike、Zscaler 官网产品页" />
  </>;
};

const DualU = ({t, b}: any) => {
  const labels: string[] = b.labels;
  const rows = [
    {sym: 'crwd', name: 'CrowdStrike', ohlc: b.crwd, close: 229.44, day: '−5.76%', ahClose: 218.35, ahPct: '−4.8%', col: '#E81F25'},
    {sym: 'zs', name: 'Zscaler', ohlc: b.zs, close: 194.82, day: '−5.29%', ahClose: 226.68, ahPct: '+16.4%', col: '#1E6EE6'}];
  const Y0 = cy(1030);
  return <>
    {rows.map((r, i) => {
      const y = Y0 + i * 530; const n = r.ohlc.length; const all = [...r.ohlc.flat(), r.ahClose];
      const lo = Math.min(...all) * 0.985, hi = Math.max(...all) * 1.015;
      const X0 = 70, X1 = 800, Y1 = 440, YT = 145;
      const X = (j: number) => X0 + j * (X1 - X0) / 8; const Y = (v: number) => Y1 - (v - lo) / (hi - lo) * (Y1 - YT);
      const ahCol = r.ahPct.startsWith('+') ? GRN : RED; const ah = k(t, 1.6, 0.6); const lastC = r.ohlc[n - 1][3];
      return <PCard key={i} x={50} y={y} w={980} h={500} v="B" c={r.col} style={slideX(t, i * 0.3)}>
        <Logo sym={r.sym} x={30} y={24} s={96} />
        <Txt x={146} y={22} size={46}>{r.name}</Txt>
        <Txt x={148} y={82} size={30} weight={700} color="#D6DEEC">11/20 收盘 ${r.close.toFixed(2)}　<span style={{color: '#FF8A8A'}}>{r.day}</span></Txt>
        <svg width={980} height={480} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {[0, 1, 2, 3].map(g => <line key={g} x1={X0} x2={X1 + 120} y1={YT + g * (Y1 - YT) / 3} y2={YT + g * (Y1 - YT) / 3} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />)}
          {r.ohlc.map(([o, h, l, c]: number[], j: number) => {const kk = k(t, 0.2 + i * 0.2 + j * 0.1, 0.35); if (kk <= 0) return null; const col2 = c >= o ? GRN : RED; const cx = X(j);
            const top = Y(Math.max(o, c)), bot = Y(Math.min(o, c));
            return <g key={j} opacity={kk}><line x1={cx} x2={cx} y1={Y(h)} y2={Y(l)} stroke={col2} strokeWidth={3} />
              <rect x={cx - 26} y={top} width={52} height={Math.max(3, bot - top)} fill={col2} rx={4} opacity={0.9} />
              <circle cx={cx} cy={Y(c)} r={7} fill="white" stroke={INK} strokeWidth={2} />
              <text x={cx} y={Y1 + 34} fill="#C9D2E3" fontSize={20} textAnchor="middle" fontFamily="PH">{labels[j]}</text></g>;})}
          {ah > 0 && <line x1={X(n - 1)} y1={Y(lastC)} x2={lerp(X(n - 1), X(8), ah)} y2={lerp(Y(lastC), Y(r.ahClose), ah)} stroke={ahCol} strokeWidth={6} strokeDasharray="12 10" />}
          {ah >= 1 && <><circle cx={X(8)} cy={Y(r.ahClose)} r={11} fill={ahCol} stroke="white" strokeWidth={3} />
            <text x={X(8) + 20} y={Y(r.ahClose) + 9} fill="white" fontSize={28} fontWeight={900} fontFamily="PH">{r.ahClose.toFixed(2)}</text></>}
          <text x={X(8)} y={Y1 + 34} fill={ahCol} fontSize={22} fontWeight={700} textAnchor="middle" fontFamily="PH">盘后</text>
        </svg>
        {t > 1.8 && <Pill x={560} y={26} bg={ahCol === GRN ? 'rgba(30,160,100,0.95)' : 'rgba(200,30,40,0.95)'} size={32} style={slideUp(t, 1.8, 15)}>盘后收 ${r.ahClose.toFixed(2)}  {r.ahPct}</Pill>}
      </PCard>;})}
    <Source text="数据：moomoo（近 8 日日 K 线及 11/20 盘后收市报价）" y={1380} />
  </>;
};

const RetailU = ({t, b}: any) => { const Y0 = cy(820); return <>
  {[['零售销售额', '玩家在平台和零售商花的钱（公司估算）', HL], ['≠ 公司营收', '平台和零售商要分一部分', '#FF8A8A'], ['≠ 利润', '还要扣开发、营销等成本', '#FF8A8A']].map(([a, b2, c], i) =>
    t > 0.3 + i * 0.9 - 0.05 ? <PCard key={i} x={50} y={Y0 + i * 290} w={980} h={250} v={i ? 'B' : 'A'} c={i ? '#FF5A5F' : b.c} img="gta_art.png" style={slideX(t, 0.3 + i * 0.9, i % 2 ? -600 : 600)}>
      <Txt x={50} y={40} size={66} color={c}>{a}</Txt><Txt x={52} y={150} size={38} weight={700} color="#E2E8F3">{b2}</Txt></PCard> : null)}
  <Source text="Take-Two 8-K（11/20）；按公司估算至 11/19 止" />
</>; };

const TTWO = ({t, b, R}: any) => {
  const rv = [0, R(b.s1), R(b.s1) + (R(b.s2) - R(b.s1)) * 0.55, R(b.s2)];
  const labels = ['11/17', '11/18', '11/19', '11/20'], vals = [203.93, 216.61, 208.65, 210.00], ev = ['前一天', '评测公开\n+6.22%', '正式发售\n−3.67%', '公布销售\n+0.65%'];
  const lo = 195, hi = 225, n = 4; const G = cy(1110);
  const X0 = 120, X1 = 900, Y0 = 210, Y1 = 760; const X = (i: number) => X0 + i * (X1 - X0) / (n - 1); const Y = (v: number) => Y1 - (v - lo) / (hi - lo) * (Y1 - Y0);
  const P = vals.map((v, i) => [X(i), Y(v)]); const hm = R(b.s2) + 2.2; const kk = k(t, hm, 0.5);
  return <>
    <PCard x={40} y={G} w={1000} h={1110} v="B" c={b.c} style={slideUp(t, 0, 30)}>
      <Txt x={40} y={34} size={56}>Take-Two（TTWO）三天的故事</Txt>
      <Txt x={42} y={110} size={30} weight={400} color="#D6DEEC">每日收盘价 · 美元；虚线 = 11/20 盘中最高</Txt>
      <svg width={1000} height={1110} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2, 3, 4].map(g => {const gv = lo + (hi - lo) * g / 4; return <g key={g}><line x1={X0} x2={X1} y1={Y(gv)} y2={Y(gv)} stroke="rgba(255,255,255,0.12)" strokeWidth={2} /><text x={X0 - 14} y={Y(gv) + 9} fill={MUTED} fontSize={24} textAnchor="end" fontFamily="PH">{gv.toFixed(0)}</text></g>;})}
        {P.slice(1).map((p, i) => {const f = k(t, rv[i + 1], 0.5); if (f <= 0) return null; const up = vals[i + 1] >= vals[i];
          return <line key={i} x1={P[i][0]} y1={P[i][1]} x2={lerp(P[i][0], p[0], f)} y2={lerp(P[i][1], p[1], f)} stroke={up ? GRN : RED} strokeWidth={9} strokeLinecap="round" />;})}
        {t > hm && <g><line x1={P[3][0]} x2={P[3][0]} y1={P[3][1]} y2={lerp(P[3][1], Y(218.69), kk)} stroke={HL} strokeWidth={5} strokeDasharray="10 10" />{kk > 0.9 && <><circle cx={P[3][0]} cy={Y(218.69)} r={11} fill="none" stroke={HL} strokeWidth={5} /><text x={P[3][0] - 22} y={Y(218.69) + 10} fill={HL} fontSize={32} fontWeight={900} textAnchor="end" fontFamily="PH">盘中 $218.69</text></>}</g>}
        {P.map((p, i) => t < rv[i] ? null : <g key={i}>
          <text x={p[0]} y={Y1 + 50} fill={MUTED} fontSize={26} textAnchor="middle" fontFamily="PH">{labels[i]}</text>
          {ev[i].split('\n').map((e, j) => <text key={j} x={p[0]} y={Y1 + 100 + j * 44} fill={j === 0 ? 'white' : (e.includes('+') ? GRN : RED)} fontSize={32} fontWeight={900} textAnchor="middle" fontFamily="PH">{e}</text>)}
          <circle cx={p[0]} cy={p[1]} r={10} fill="white" />
          <text x={p[0]} y={p[1] - 26} fill="white" fontSize={26} fontWeight={900} textAnchor="middle" fontFamily="PH">{vals[i].toFixed(2)}</text>
        </g>)}
      </svg>
    </PCard>
    <Source text="数据：moomoo / Alpha Vantage 日线；评测日见路透社" y={1380} />
  </>;
};

const WeekU = ({t}: any) => { const Y0 = cy(680); return <>
  {[['标普 500', 8.6, '−8.6%', '去年 4 月以来最差的一周', 'bg_wallstreet_13802097.jpg'], ['纳斯达克综合指数', 10.0, '约 −10%', '', 'bg_market_8348727.jpg']].map(([n, v, txt, note, img]: any, i) => {
    const kk = k(t, 0.3 + i * 0.7, 1.0);
    return <PCard key={i} x={50} y={Y0 + i * 340} w={980} h={300} v="A" c={RED} img={img} style={slideUp(t, 0.3 + i * 0.7)}>
      <Txt x={50} y={34} size={50}>{n}</Txt>
      <Txt x={930} y={110} size={80} color={RED} style={{transform: 'translateX(-100%)', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>{kk > 0.95 ? txt : `−${(v * kk).toFixed(1)}%`}</Txt>
      <div style={{position: 'absolute', left: 50, top: 140, height: 64, borderRadius: 16, width: 520 * v / 11 * kk, background: `linear-gradient(90deg, #ff9a9a, ${RED})`, boxShadow: `0 0 24px ${rgba(RED, 0.6)}`}} />
      {note && <Txt x={52} y={230} size={32} weight={700} color="#E2E8F3">{note}</Txt>}
    </PCard>;})}
  <Source text="周五收盘 vs 上周五收盘 · Yahoo Finance" />
</>; };

const ICON: any = {
  bag: <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>,
  dinner: <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="6" /><path d="M3 4v6a2 2 0 0 0 2 2V20" /><path d="M5 4v4" /><path d="M21 4c-1.5 0-2 2-2 4s1 3 2 3v9" /></svg>,
  clock: <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>};
const CalendarU = ({t, R}: any) => {
  const rows = [['周三', '25', ['10月 PCE 通胀数据', 'Q3 GDP 第二次估算'], 'shopping_pexels_39962496.jpg', '#3C7DFF', 'BEA', 'bag'],
                ['周四', '26', ['感恩节', '美股休市'], 'thanksgiving_pexels_5876728.jpg', '#E5484D', 'NYSE', 'dinner'],
                ['周五', '27', ['提早收市', '美东时间下午 1 点'], 'nyse_pexels_28962712.jpg', '#E09B1A', 'NYSE', 'clock']];
  const rv = [R(1), R(2), R(3)]; const Y0 = cy(960);
  return <>
    {rows.map(([wd, dd, ls, img, c, src, ic]: any, i) => {
      if (t < rv[i] - 0.05) return null; const y = Y0 + i * 330;
      return <div key={i} style={{...glassStyle({left: 50, top: y, width: 980, height: 300, border: `1.5px solid ${rgba(c, 0.6)}`}), ...slideX(t, rv[i])}}>
        <Img src={staticFile('img/' + img)} style={{position: 'absolute', left: -20, top: -20, width: 1020, height: 340, objectFit: 'cover', filter: 'blur(3px) brightness(0.85) saturate(1.2)'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(6,10,22,0.55) 0%, rgba(6,10,22,0.7) 35%, ${rgba(c, 0.25)} 100%)`}} />
        <div style={{...glassStyle({left: 30, top: 30, width: 210, height: 240, borderRadius: 22}), background: 'linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.12))'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 210, height: 56, background: c, color: 'white', fontSize: 30, fontWeight: 900, textAlign: 'center', lineHeight: '56px', letterSpacing: 4}}>NOV</div>
          <Txt x={0} w={210} y={58} size={118} align="center">{dd}</Txt>
          <Txt x={0} w={210} y={190} size={34} align="center" color="#E8EDF7">{wd}</Txt>
        </div>
        <div style={{position: 'absolute', left: 280, top: 40, width: 96, height: 96, borderRadius: 48, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${c}`}}><div style={{transform: 'scale(0.8)'}}>{ICON[ic]}</div></div>
        {ls.map((l: string, j: number) => <Txt key={j} x={400} y={44 + j * 74} size={j === 0 ? 52 : 40} weight={j === 0 ? 900 : 700} color={j === 0 ? 'white' : '#E2E8F3'} style={{textShadow: '0 2px 10px rgba(0,0,0,0.6)'}}>{l}</Txt>)}
        <Txt x={950} y={250} size={24} weight={400} color="#D0D8E6" style={{transform: 'translateX(-100%)'}}>{src}</Txt>
      </div>;})}
    <Source text="来源：BEA 发布时间表；NYSE 假期安排｜画面：Pexels" />
  </>;
};


// ===== Tapau 财经 branding =====
const SHOW = '美股早报', DATE = '11/20';
const BrandIntro = ({t}: any) => {
  const sIn = interpolate(t, [0, 0.5], [0.55, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
  const sweep = interpolate(t, [0.55, 1.15], [-500, 900], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const out = interpolate(t, [1.8, 2.1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ring = k(t, 0.3, 0.9);
  return <AbsoluteFill style={{opacity: out}}>
    <div style={{position: 'absolute', left: 540 - 380, top: 760 - 380, width: 760, height: 760, borderRadius: 380, border: `6px solid ${rgba('#FFC83D', 0.8 * (1 - ring))}`, transform: `scale(${0.8 + 0.5 * ring})`}} />
    <div style={{position: 'absolute', left: 540 - 330, top: 760 - 330, width: 660, height: 660, borderRadius: 48, overflow: 'hidden', transform: `scale(${sIn})`, opacity: k(t, 0, 0.25), boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,200,61,0.45)'}}>
      <Img src={staticFile('img/tapau_logo.png')} style={{width: 660, height: 660}} />
      <div style={{position: 'absolute', top: -200, left: sweep, width: 140, height: 1100, transform: 'rotate(20deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))'}} />
    </div>
    <Txt x={0} w={W} y={1130} size={44} weight={700} align="center" color="#DDE4F0" style={slideUp(t, 0.5)}>每天一包，财经新闻 tapau 给你</Txt>
  </AbsoluteFill>;
};
const Hand: React.FC = () => <Img src={staticFile('img/hand_3d_white.png')} style={{width: 230, height: 230, filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.5))'}} />; // Microsoft Fluent Emoji 3D (MIT), recoloured white
const IC: any = {
  heart: 'M12 20.5s-7.3-4.4-9.3-8.9C1.3 8.4 3.3 4.6 7 4.6c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.7 0 5.7 3.8 4.3 7C19.3 16.1 12 20.5 12 20.5z',
  save: 'M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1z',
  share: 'M21.5 2.5 10.6 13.4 M21.5 2.5 14.8 21.5 10.6 13.4 2.5 9.2z'};
const OutroU = ({t, R}: any) => {
  const tap = R(1) + 0.9; const CY0 = 215, CW = 880, CX = (W - CW) / 2, CH = 1030;
  const bx = 540, by = CY0 + 660 + 70; // button centre
  const fx = interpolate(t, [tap - 0.7, tap], [930, bx + 120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const fy = interpolate(t, [tap - 0.7, tap], [1400, by + 10], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const pressed = t > tap - 0.02 && t < tap + 0.16; const done = t >= tap + 0.1; const chk = k(t, tap + 0.12, 0.4);
  const fingerOp = t < tap - 0.72 ? 0 : t > tap + 0.6 ? Math.max(0, 1 - (t - tap - 0.6) / 0.3) : 1;
  const icons = [['heart', '点赞', '#FF3B5C', true], ['save', '收藏', '#FFC83D', true], ['share', '分享', '#4C8DFF', false]];
  return <>
    <div style={{...glassStyle({left: CX, top: CY0, width: CW, height: CH, borderRadius: 44, border: '2px solid rgba(255,200,61,0.55)', boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 0 60px rgba(255,200,61,0.25), inset 0 2px 0 rgba(255,255,255,0.6)'}), ...slideUp(t, 0)}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 30%)'}} />
    </div>
    <div style={{position: 'absolute', left: 540 - 260, top: CY0 + 50, width: 520, height: 520, borderRadius: 40, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.7)', boxShadow: '0 24px 50px rgba(0,0,0,0.5), 0 0 50px rgba(255,200,61,0.35)', ...pop(t, 0.1)}}>
      <Img src={staticFile('img/tapau_logo.png')} style={{width: 520, height: 520}} />
      <div style={{position: 'absolute', top: -100, left: interpolate(t, [0.5, 1.2], [-300, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), width: 110, height: 800, transform: 'rotate(20deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0))'}} />
    </div>
    {/* follow button */}
    <div style={{position: 'absolute', left: bx - 300, top: by - 70, width: 600, height: 140, transform: `scale(${pressed ? 0.94 : 1})`, ...slideUp(t, 0.35)}}>
      {[0, 1].map(j => { const rp = k(t, tap + j * 0.15, 0.7); return rp > 0 && rp < 1 ? <div key={j} style={{position: 'absolute', left: 300 - 360 * rp, top: 70 - 200 * rp, width: 720 * rp, height: 400 * rp, borderRadius: 999, border: `4px solid ${rgba(done ? '#3DD68C' : '#FFC83D', 0.9 * (1 - rp))}`}} /> : null; })}
      <div style={{position: 'absolute', inset: 0, borderRadius: 70, border: '2px solid rgba(255,255,255,0.7)',
        background: done ? 'linear-gradient(180deg, #8AF5C3 0%, #34CF85 45%, #179E5F 100%)' : 'linear-gradient(180deg, #FFF0A8 0%, #FFC83D 45%, #E59D00 100%)',
        boxShadow: `0 18px 36px rgba(0,0,0,0.45), 0 0 40px ${done ? 'rgba(61,214,140,0.55)' : 'rgba(255,200,61,0.55)'}, inset 0 3px 0 rgba(255,255,255,0.75), inset 0 -8px 14px rgba(0,0,0,0.18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 8, height: 50, borderRadius: 40, background: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))'}} />
        {done ? <svg width="76" height="76" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="white" /><path d="M22 41 L35 54 L59 28" fill="none" stroke="#179E5F" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - chk)} /></svg>
          : <svg width="64" height="64" viewBox="0 0 64 64"><path d="M32 12 V52 M12 32 H52" stroke={INK} strokeWidth="9" strokeLinecap="round" /></svg>}
        <div style={{fontSize: 66, fontWeight: 900, color: done ? 'white' : INK, textShadow: done ? '0 2px 8px rgba(0,0,0,0.25)' : 'none', letterSpacing: 4}}>{done ? '已关注' : '关注'}</div>
      </div>
    </div>
    {/* icons */}
    {icons.map(([ic, lab, c, fillIt]: any, i: number) => { const on = k(t, tap + 0.55 + i * 0.22, 0.3); const cx = 540 + (i - 1) * 250, top = CY0 + 840;
      return <div key={i} style={{position: 'absolute', left: cx - 75, top, width: 150, textAlign: 'center', ...pop(t, 0.6 + i * 0.12)}}>
        <div style={{width: 130, height: 130, margin: '0 auto', borderRadius: 65, ...glassStyle({position: 'relative', borderRadius: 65, background: `linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06)), ${rgba(c, 0.18 + 0.3 * on)}`, border: `2px solid ${rgba(c, 0.4 + 0.5 * on)}`, boxShadow: `0 14px 30px rgba(0,0,0,0.4), 0 0 ${30 * on}px ${rgba(c, 0.7)}, inset 0 2px 0 rgba(255,255,255,0.6)`}), display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.12 * Math.sin(Math.PI * on)})`}}>
          <svg width="66" height="66" viewBox="0 0 24 24"><path d={IC[ic]} fill={fillIt ? rgba(c, on) : 'none'} stroke={on > 0.5 ? c : 'white'} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" /></svg>
        </div>
        <div style={{fontSize: 36, fontWeight: 900, color: 'white', marginTop: 12}}>{lab}</div></div>; })}
    <div style={{position: 'absolute', left: fx - 90, top: fy - 18, opacity: fingerOp, transform: `scale(${pressed ? 0.9 : 1}) rotate(-10deg)`, transformOrigin: '90px 18px'}}><Hand /></div>
    <Glass x={140} y={1290} w={800} h={84} style={slideUp(t, 0.5)}><Txt x={0} w={800} y={21} size={36} weight={700} align="center">内容仅为新闻整理，不构成投资建议</Txt></Glass>
  </>;
};
// ===== moomoo ad insert (广告) =====
const MOO = '#FF6A00';
const AdHero = ({t}: any) => { const Y = cy(820); return <>
  <PCard x={60} y={Y} w={960} h={820} v="A" c={MOO} img="bg_market_7579943.jpg" style={pop(t, 0)}>
    <Img src={staticFile('img/moomoo_logo_white.png')} style={{position: 'absolute', left: 230, top: 70, width: 500, ...slideUp(t, 0.1)}} />
    <Txt x={0} w={960} y={250} size={170} align="center" style={{transform: `scale(${interpolate(t, [0.25, 0.7], [0.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))})})`, opacity: k(t, 0.25), textShadow: `0 0 50px ${rgba(MOO, 0.95)}, 0 8px 24px rgba(0,0,0,0.6)`}}>新客福利</Txt>
    <div style={{position: 'absolute', left: 0, width: 960, top: 500, textAlign: 'center', ...pop(t, 0.8)}}><Chip bg={MOO} size={46} style={{padding: '12px 32px', boxShadow: `0 0 30px ${rgba(MOO, 0.7)}`}}>最高合计 RM1,500 · 180 天零佣金</Chip></div>
    <Txt x={0} w={960} y={640} size={38} weight={700} align="center" color="#E2E8F3" style={slideUp(t, 1.0)}>新开户期限：2026/12/31（以官网为准）</Txt>
    {[0, 1, 2, 3, 4, 5].map(i => { const a = k(t, 0.4 + i * 0.08, 0.6); return <div key={i} style={{position: 'absolute', left: 120 + i * 150, top: 220 + (i % 2) * 260 - 60 * a, width: 18, height: 18, borderRadius: 9, background: i % 2 ? YEL : MOO, opacity: a * (1 - k(t, 1.4, 0.6)), boxShadow: `0 0 14px ${i % 2 ? YEL : MOO}`}} />; })}
  </PCard>
  <Source text={AD_SRC} />
</>; };
const AD_SRC = '广告｜推荐码开户，频道主获推荐奖励｜以 moomoo 条款为准｜非投资建议';
const AdTiers = ({t, b}: any) => {
  const rows = [['≥ RM1,000', 'RM100', '现金券 + 交易券'], ['≥ RM3,000', '+ RM100', 'Apple 股票'], ['≥ RM10,000', '+ RM300', 'Apple 股票'], ['≥ RM40,000', '+ RM1,000', 'Apple 股票']];
  const H = 1000, Y = cy(H); const rv: number[] = b.rv;
  return <>
    <PCard x={50} y={Y} w={980} h={H} v="B" c={MOO} style={slideUp(t)}>
      <Txt x={44} y={36} size={52}>新客入金奖励</Txt>
      <Txt x={46} y={108} size={30} weight={700} color="#FFD9B8">净入金 · 新开户用户</Txt>
      <div style={{position: 'absolute', left: 92, top: 220, width: 6, height: 600 * k(t, rv[0], rv[3] - rv[0] + 0.5), background: `linear-gradient(180deg, #fff, ${MOO})`, borderRadius: 3}} />
      {rows.map(([dep, amt, what], i) => { const on = k(t, rv[i], 0.45); return <div key={i} style={{position: 'absolute', left: 60, top: 180 + i * 200, width: 880, height: 170, opacity: 0.25 + 0.75 * on, transform: `translateX(${(1 - on) * 40}px)`}}>
        <div style={{position: 'absolute', left: 14, top: 58, width: 44, height: 44, borderRadius: 22, background: on > 0.5 ? MOO : 'rgba(255,255,255,0.3)', border: '5px solid white', boxShadow: on > 0.5 ? `0 0 20px ${MOO}` : 'none'}} />
        <div style={{...glassStyle({left: 90, top: 10, width: 780, height: 150, borderRadius: 24, background: i === 0 ? `linear-gradient(90deg, ${rgba(MOO, 0.75)}, ${rgba(MOO, 0.35)})` : 'linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))'})}}>
          <Txt x={30} y={46} size={48}>{dep}</Txt>
          <Txt x={750} y={22} size={58} color={i === 0 ? 'white' : YEL} style={{transform: 'translateX(-100%)'}}>{amt}</Txt>
          <Txt x={750} y={92} size={32} weight={700} color="#F0E4D8" style={{transform: 'translateX(-100%)'}}>{what}</Txt>
        </div></div>; })}
    </PCard>
    {t > b.chipAt - 0.05 && <div style={{position: 'absolute', left: 0, width: W, top: Y + H - 70, textAlign: 'center', ...pop(t, b.chipAt)}}><Chip bg={YEL} color={INK} size={50} style={{padding: '12px 34px', boxShadow: `0 0 30px ${rgba(YEL, 0.6)}`}}>合计最高 RM1,500</Chip></div>}
    <Source text={AD_SRC} y={1380} />
  </>;
};
const AdQR = ({t}: any) => { const H = 1060, Y = cy(H); return <>
  <div style={{...glassStyle({left: 90, top: Y, width: 900, height: H, borderRadius: 44, border: `2px solid ${rgba(MOO, 0.8)}`, boxShadow: `0 40px 80px rgba(0,0,0,0.55), 0 0 60px ${rgba(MOO, 0.35)}, inset 0 2px 0 rgba(255,255,255,0.6)`}), ...slideUp(t)}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 30%)'}} />
    <Img src={staticFile('img/moomoo_logo_white.png')} style={{position: 'absolute', left: 260, top: 40, width: 380}} />
    <div style={{position: 'absolute', left: 170, top: 150, width: 560, height: 560, borderRadius: 30, background: 'white', padding: 20, boxShadow: `0 20px 40px rgba(0,0,0,0.45), 0 0 40px ${rgba(MOO, 0.5)}`, ...pop(t, 0.2)}}>
      <Img src={staticFile('img/juns_moomoo_qr.png')} style={{width: 520, height: 520}} /></div>
    <Txt x={0} w={900} y={740} size={36} weight={700} align="center" color="#E2E8F3" style={slideUp(t, 0.5)}>扫码开户，或输入推荐码</Txt>
    <div style={{position: 'absolute', left: 150, top: 810, width: 600, height: 130, borderRadius: 65, background: 'linear-gradient(180deg, #FFF0A8 0%, #FFC83D 45%, #E59D00 100%)', border: '2px solid rgba(255,255,255,0.7)', boxShadow: '0 16px 32px rgba(0,0,0,0.45), inset 0 3px 0 rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...pop(t, 0.7)}}>
      <div style={{fontSize: 80, fontWeight: 900, color: INK, letterSpacing: 10}}>ZKERAPNM</div></div>
    <Txt x={0} w={900} y={966} size={28} weight={700} align="center" color="#D6DEEC" style={slideUp(t, 0.9)}>moomoo App › 右上角搜索 › Referral Code</Txt>
  </div>
  <Source text={AD_SRC} y={1380} />
</>; };

const V: any = {adhero: AdHero, adtiers: AdTiers, adqr: AdQR, brandintro: BrandIntro, outrou: OutroU, titleu: TitleU, hooku: HookU, siteu: SiteU, dashboard: Dashboard, vix: Vix, correction: Correction, assets: Assets, fed: Fed, chipsu: ChipsU, priceu: PriceU, splitu: SplitU, dualu: DualU, retailu: RetailU, ttwo: TTWO, weeku: WeekU, calendaru: CalendarU, pie: Pie, timeline: Timeline, rel: Rel, reasonsv: ReasonsV, listv: ListV, comparev: CompareV, downgradev: DowngradeV, bignumv: BigNumV, doc: Doc, news: News, fin5: Fin5, title: Title, hook: Hook, market: Market, site: Site, nyt: NYT, statement: Statement, quip: Quip, fin: Fin, reasons: Reasons, bignum: BigNum, div: Div, price: Price, downgrade: Downgrade, compare: Compare, calendar: Calendar, outro: Outro};
const SHARP = ['outrou', 'title', 'titleu', 'hook', 'hooku', 'outro', 'quip'];

const Subs: React.FC<{zh: string; en: string}> = ({zh, en}) => <>
  <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.85) 100%)'}} />
  <div style={{position: 'absolute', left: 45, width: 990, top: 1450, textAlign: 'center'}}>
    <div style={{fontSize: zh.length > 34 ? 48 : 56, fontWeight: 900, color: YEL, lineHeight: 1.3, WebkitTextStroke: '10px #141824', paintOrder: 'stroke fill', textWrap: 'balance'} as any}>{zh}</div>
    <div style={{fontSize: 34, fontWeight: 700, color: 'white', lineHeight: 1.3, marginTop: 10, WebkitTextStroke: '7px #141824', paintOrder: 'stroke fill', textWrap: 'balance'} as any}>{en}</div>
  </div>
</>;

const Scene: React.FC<{sc: any}> = ({sc}) => {
  const f = useCurrentFrame(); const t = f / FPS; const T: number[] = sc.T;
  const st = (b: any) => (b.at0 !== undefined ? b.at0 : T[b.s] + (b.off || 0));
  let bi = 0; sc.beats.forEach((b: any, j: number) => {if (t >= st(b) - 0.05) bi = j;});
  const b = {c: sc.c || '#2BB3A0', ...sc.beats[bi]}; const tb = bi === 0 ? 0 : st(sc.beats[bi]); const tl = t - tb; const R = (i: number) => T[i] - tb;
  let si = 0; T.forEach((x, j) => {if (t >= x - 0.05) si = j;});
  const Comp = V[b.t]; const img = b.bg || sc.bg;
  const sharp = SHARP.includes(b.t);
  return <AbsoluteFill style={{fontFamily: 'PH', background: '#061022'}}>
    <Bg img={img} blur={sharp ? 0 : 9} dark={b.t.startsWith('hook') ? 0.5 : sharp ? 0.35 : 0.55} />
    <AbsoluteFill><Comp t={tl} b={b} R={R} /></AbsoluteFill>
    {sc.bar && <TopBar num={sc.num} text={sc.bar} c={sc.c} />}
    {sc.brand !== false && <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', gap: 10, alignItems: 'center'}}>
      <Img src={staticFile('img/tapau_logo.png')} style={{width: 54, height: 54, borderRadius: 27, border: '2px solid #FFC83D'}} />
      <div style={{background: YEL, color: INK, fontSize: 30, fontWeight: 900, padding: '5px 16px', borderRadius: 12}}>Tapau 财经 · {SHOW}</div>
      <div style={{background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: 30, fontWeight: 900, padding: '5px 16px', borderRadius: 12}}>{DATE}</div></div>}
    {sc.subs[si][0] && <Subs zh={sc.subs[si][0]} en={sc.subs[si][1]} />}
  </AbsoluteFill>;
};

const Recap: React.FC = () => <AbsoluteFill style={{background: '#061022'}}>
  <style>{fonts}</style>
  <Audio src={staticFile('mix.m4a')} />
  <Series>{(SCENES as any[]).map((sc, i) => <Series.Sequence key={i} durationInFrames={sc.frames}><Scene sc={sc} /></Series.Sequence>)}</Series>
</AbsoluteFill>;

const total = (SCENES as any[]).reduce((a, s) => a + s.frames, 0);
export const Root: React.FC = () => <>
  <Composition id="Recap" component={Recap} durationInFrames={total} fps={FPS} width={W} height={H} />
  <Composition id="Sample" component={SampleComp as any} durationInFrames={150} fps={FPS} width={W} height={H} defaultProps={{card: 'reasons', v: 'A', sec: 4}} />
</>;
