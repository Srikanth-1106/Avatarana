import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Sponsor { name: string; logo?: string; url?: string; }
interface Props { sponsors: Sponsor[]; onComplete?: () => void; duration?: number; }

export default function SponsorSplash({ sponsors, onComplete, duration = 9000 }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const planetRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef      = useRef<number>(0);
  const startRef    = useRef<number>(Date.now());
  const progressRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [phase,   setPhase]   = useState(0);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  
  // Responsive dimensions across all screen sizes
  let OR = 520, PS = 110, SUN = 200;
  if (isMobile) {
    OR = 150; PS = 60; SUN = 100;   // Small phones (< 480px)
    if (window.innerWidth >= 480) {
      OR = 180; PS = 70; SUN = 120;   // Medium phones (480-768px)
    }
  } else if (isTablet) {
    OR = 350; PS = 90; SUN = 160;    // Tablets (768-1024px)
  } else if (isDesktop && window.innerWidth >= 1440) {
    OR = 600; PS = 130; SUN = 240;   // Large screens (1440px+)
  }
  
  const N    = sponsors.length;         // ALL sponsors, no cap
  const TILT = 0.4;                     // ellipse tilt
  const SCENE_TOP_OFFSET = '50%';

  // Phase sequence
  useEffect(() => {
    const t = [setTimeout(()=>setPhase(1),200), setTimeout(()=>setPhase(2),700), setTimeout(()=>setPhase(3),1200)];
    return () => t.forEach(clearTimeout);
  }, []);

  // Canvas: deep dark-red space + stars only
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Star = {x:number;y:number;r:number;a:number;ts:number;to:number};
    let stars: Star[] = [];
    const makeStars = () => {
      stars = Array.from({length:200}, () => ({
        x: Math.random()*cv.width, y: Math.random()*cv.height,
        r: 0.3+Math.random()*1.6, a: 0.1+Math.random()*0.65,
        ts: 0.008+Math.random()*0.022, to: Math.random()*Math.PI*2,
      }));
    };
    makeStars();
    window.addEventListener('resize', makeStars);

    let tick = 0;
    const loop = () => {
      tick++;
      const w = cv.width, h = cv.height, cx = w/2, cy = h/2;
      ctx.clearRect(0,0,w,h);
      // Background
      const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.9);
      bg.addColorStop(0,'#1c0608'); bg.addColorStop(.5,'#0d0203'); bg.addColorStop(1,'#050101');
      ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
      // Soft red center haze
      const haze = ctx.createRadialGradient(cx,cy,0,cx,cy,OR*1.4);
      haze.addColorStop(0,'rgba(218,93,101,0.07)'); haze.addColorStop(1,'transparent');
      ctx.fillStyle=haze; ctx.fillRect(0,0,w,h);
      // Stars
      for (const s of stars) {
        const p = .6+.4*Math.sin(tick*s.ts+s.to);
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*p,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${s.a*p})`; ctx.fill();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize); window.removeEventListener('resize',makeStars); };
  }, [OR]);

  // Planet orbit — JS RAF directly updates DOM refs for zero React overhead
  useEffect(() => {
    if (phase < 3) return;
    let raf: number;
    const SPEED = 0.00028; // ultra slow — every sponsor clearly readable at front

    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      const absorbStart = duration - 2200;
      const absorbing   = elapsed > absorbStart;
      const absorbP     = absorbing ? Math.min(1, (elapsed - absorbStart) / 2000) : 0;
      const angle       = elapsed * SPEED * (1000/60) * 0.001 * 60; // time-based angle

      for (let i = 0; i < N; i++) {
        const el = planetRefs.current[i]; if (!el) continue;
        const a   = angle + (Math.PI * 2 * i / N);
        const r   = OR * (1 - absorbP * absorbP);           // shrink orbit
        const x   = r  * Math.cos(a);
        const y   = r  * TILT * Math.sin(a);                // flatten for 3D perspective
        const depth  = (Math.sin(a) + 1) / 2;        // 0=far back, 1=front
        // Dramatic zoom: back=tiny, front=large so name is clearly readable
        const scale   = absorbing
          ? (1 - absorbP) * (0.45 + depth * 0.9)
          : 0.45 + depth * 0.9;                       // range 0.45 → 1.35
        const opacity = absorbing ? 1 - absorbP : 0.35 + depth * 0.65; // 0.35→1.0

        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
        el.style.opacity   = String(Math.max(0, opacity));
        el.style.zIndex    = String(Math.round(depth * 20));
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [phase, N, OR, TILT, duration]);

  // Progress bar
  useEffect(() => {
    const bar = progressRef.current; if (!bar) return;
    bar.style.transition = `width ${duration}ms linear`;
    void bar.offsetWidth; bar.style.width = '100%';
  }, [duration]);

  const dismiss = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setVisible(false); 
    setTimeout(()=>onComplete?.(), 500); 
  }, [onComplete]);
  useEffect(() => { const t = setTimeout(dismiss, duration); return () => clearTimeout(t); }, [duration, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div key="ss"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.8}}
          style={{position:'fixed',inset:0,zIndex:99999,overflow:'hidden',willChange:'opacity'}}>          

          {/* Space background */}
          <canvas ref={canvasRef} style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none',willChange:'contents'}}/>

          {/* Title */}
          <motion.div
            initial={{opacity:0,y:-24}} animate={phase>=1?{opacity:1,y:0}:{}} transition={{duration:.9,ease:[.22,1,.36,1]}}
            style={{position:'absolute',top:isMobile?16:isTablet?28:40,left:0,right:0,textAlign:'center',zIndex:10,pointerEvents:'none',paddingX:isMobile?12:20}}>
            <p style={{margin:0,color:'rgba(255,200,200,0.4)',fontSize:isMobile?8:isTablet?10:11,letterSpacing:isMobile?4:6,fontWeight:600,textTransform:'uppercase'}}>
              ✦ &nbsp;Avatarana 2026&nbsp; ✦
            </p>
            <h2 style={{margin:'6px 0 0',fontWeight:900,letterSpacing:-1,
              fontSize:isMobile?'1.2rem':isTablet?'1.8rem':'2.5rem',lineHeight:1.07,
              background:'linear-gradient(135deg,#fff 0%,#ffccd0 40%,#DA5D65 80%)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
              filter:'drop-shadow(0 0 22px rgba(218,93,101,0.65))'}}>
              Our Proud Sponsors
            </h2>
            <div style={{width:isMobile?40:isTablet?65:90,height:2,margin:'6px auto 0',borderRadius:4,
              background:'linear-gradient(90deg,transparent,#DA5D65,#ff8fa3,transparent)'}}/>
          </motion.div>

          {/* Solar System scene — centered in space below the title */}
          <div style={{position:'absolute',top:SCENE_TOP_OFFSET,left:'50%',width:0,height:0,zIndex:50,willChange:'contents'}}>

            {/* PLANETS — JS positions via refs, anchored at center */}
            {Array.from({length:N},(_,i) => (
              <motion.div key={i}
                ref={el => { planetRefs.current[i] = el; }}
                initial={{opacity:0,scale:0}}
                animate={phase>=3?{opacity:1,scale:1}:{}}
                transition={{delay:i*.11,duration:.65,ease:[.34,1.56,.64,1]}}
                style={{position:'absolute',top:0,left:0,width:PS,height:PS,borderRadius:'50%'}}>
                <Planet s={sponsors[i]} size={PS} idx={i}/>
              </motion.div>
            ))}

            {/* SUN — Avatarana logo, no rings, just glow */}
            <motion.div
              initial={{opacity:0,scale:.3}} animate={phase>=2?{opacity:1,scale:1}:{}}
              transition={{duration:1.1,ease:[.34,1.56,.64,1]}}
              style={{
                position:'absolute',
                top: 0, left: 0,
                marginTop: `-${SUN/2}px`,
                marginLeft: `-${SUN/2}px`,
                zIndex:30,
              }}>

              {/* Corona glow (CSS only, no rings) */}
              <div style={{position:'absolute',top:'50%',left:'50%',
                width:SUN*1.9,height:SUN*1.9,transform:'translate(-50%,-50%)',borderRadius:'50%',
                background:'radial-gradient(circle,rgba(218,93,101,0.22) 0%,rgba(218,93,101,0.1) 40%,transparent 70%)',
                animation:'coronaA 3s ease-in-out infinite',pointerEvents:'none'}}/>
              <div style={{position:'absolute',top:'50%',left:'50%',
                width:SUN*1.45,height:SUN*1.45,transform:'translate(-50%,-50%)',borderRadius:'50%',
                background:'radial-gradient(circle,rgba(255,180,180,0.18) 0%,rgba(218,93,101,0.2) 50%,transparent 75%)',
                animation:'coronaB 2.4s ease-in-out infinite',pointerEvents:'none'}}/>

              {/* Sun body */}
              <div style={{
                width:SUN,height:SUN,borderRadius:'50%',
                background:'radial-gradient(circle at 38% 36%,#fff8f5,#ffb3b8,#DA5D65,#8b1a1a)',
                boxShadow:`0 0 ${SUN*.25}px rgba(218,93,101,1),0 0 ${SUN*.55}px rgba(218,93,101,0.6),0 0 ${SUN}px rgba(218,93,101,0.3),0 0 ${SUN*1.6}px rgba(218,93,101,0.12)`,
                display:'flex',alignItems:'center',justifyContent:'center',
                animation:'sunPulse 3s ease-in-out infinite',overflow:'hidden',
                position:'relative',
              }}>
                {/* Logo perfectly centered in the sun */}
                <img src="/logo.png" alt="Avatarana"
                  loading="eager"
                  style={{
                    position:'absolute',top:'50%',left:'50%',
                    transform:'translate(-50%,-50%)',
                    width:'82%',height:'82%',objectFit:'contain',
                    filter:'drop-shadow(0 0 6px rgba(255,255,255,0.8)) brightness(1.15)',
                  }}
                  onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
              </div>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div style={{position:'absolute',bottom:0,left:0,width:'100%',height:3,background:'rgba(255,255,255,0.07)',zIndex:20}}>
            <div ref={progressRef} style={{height:'100%',width:'0%',
              background:'linear-gradient(90deg,#8b1a1a,#DA5D65,#ff8fa3)',
              boxShadow:'0 0 12px rgba(218,93,101,0.9)',borderRadius:'0 2px 2px 0'}}/>
          </div>

          {/* Skip */}
          <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2}}
            onClick={dismiss} id="sponsor-splash-skip"
            onMouseEnter={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='#DA5D65';}}
            onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.4)';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)';}}
            style={{position:'absolute',bottom:20,right:24,background:'none',border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:20,color:'rgba(255,255,255,0.4)',fontSize:14,padding:'8px 20px',
              cursor:'pointer',letterSpacing:1.5,zIndex:9999999,fontWeight:600,transition:'all .25s ease',
              pointerEvents:'auto', userSelect:'none'}}>
            Skip →
          </motion.button>

          <style>{`
            @keyframes sunPulse {
              0%,100%{box-shadow:0 0 30px rgba(218,93,101,1),0 0 60px rgba(218,93,101,0.6),0 0 110px rgba(218,93,101,0.28);}
              50%    {box-shadow:0 0 45px rgba(218,93,101,1),0 0 90px rgba(218,93,101,0.75),0 0 160px rgba(218,93,101,0.4),0 0 220px rgba(218,93,101,0.15);}
            }
            @keyframes coronaA {0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(1);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.14);}}
            @keyframes coronaB {0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.09);}}
            @keyframes planetGlow {0%,100%{filter:brightness(1);}50%{filter:brightness(1.15);}}
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Planet ──────────────────────────────────────────────────────────────────
// All red/white themed, matching Avatarana palette
const PLANET_THEMES = [
  {base:'radial-gradient(circle at 35% 33%,#ff8888,#DA5D65,#8b1a1a,#3d0505)',glow:'rgba(218,93,101,0.85)'},
  {base:'radial-gradient(circle at 35% 33%,#ff9999,#cc3344,#6b0f10,#2a0303)',glow:'rgba(204,51,68,0.8)'},
  {base:'radial-gradient(circle at 35% 33%,#ffaaaa,#b02030,#5c0e0e,#220202)',glow:'rgba(176,32,48,0.8)'},
  {base:'radial-gradient(circle at 35% 33%,#ff7777,#c23040,#701515,#2d0404)',glow:'rgba(194,48,64,0.8)'},
  {base:'radial-gradient(circle at 35% 33%,#ffbbaa,#DA5D65,#801818,#300404)',glow:'rgba(218,93,101,0.8)'},
  {base:'radial-gradient(circle at 35% 33%,#ff8888,#bb2233,#600f0f,#200202)',glow:'rgba(187,34,51,0.8)'},
  {base:'radial-gradient(circle at 35% 33%,#ffaaaa,#cc4455,#701010,#2a0303)',glow:'rgba(204,68,85,0.8)'},
  {base:'radial-gradient(circle at 35% 33%,#ff9999,#c03040,#681414,#260303)',glow:'rgba(192,48,64,0.8)'},
];

function Planet({s,size,idx}:{s:Sponsor;size:number;idx:number}) {
  const [err, setErr] = useState(false);
  const [hov, setHov] = useState(false);
  const th = PLANET_THEMES[idx % PLANET_THEMES.length];
  const words = s.name.trim().split(/\s+/);
  const line1 = words.slice(0,2).join(' ');
  const line2 = words.length > 2 ? words.slice(2,4).join(' ') : '';
  const initials = words.slice(0,2).map((w:string)=>w[0]).join('').toUpperCase();

  const inner = (
    <div style={{position:'relative', width:size, height:size, flexShrink:0}}>
      {/* Planet globe */}
      <div
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{
          width:size, height:size, borderRadius:'50%', background:th.base,
          border:`2px solid ${hov?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.35)'}`,
          boxShadow: hov
            ? `0 0 0 3px ${th.glow},0 0 20px ${th.glow},0 0 45px ${th.glow},inset 0 2px 6px rgba(255,255,255,0.3)`
            : `0 0 14px ${th.glow},0 0 30px ${th.glow},inset 0 2px 4px rgba(255,255,255,0.2)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          overflow:'hidden', cursor:s.url?'pointer':'default',
          transition:'box-shadow .3s,border-color .3s',
          animation:`planetGlow ${2.5+(idx%3)*.4}s ease-in-out ${idx*.2}s infinite`,
        }}
      >
        {s.logo && !err
          ? <img src={s.logo} alt={s.name} loading="lazy" onError={()=>setErr(true)}
              style={{width:'80%',height:'80%',objectFit:'contain',borderRadius:'50%',
                filter:hov?'brightness(1.3)':'brightness(1.05)',transition:'filter .3s'}}/>
          : <span style={{color:'rgba(255,255,255,0.95)',fontSize:size<90?22:30,fontWeight:900,
              letterSpacing:1,textShadow:'0 2px 8px rgba(0,0,0,0.9)',userSelect:'none'}}>
              {initials}
            </span>
        }
      </div>

      {/* Readable name label below the planet — COUNTER-SCALED to remain crisp */}
      <div style={{
        position:'absolute', top: size+7, left:'50%',
        whiteSpace:'nowrap', textAlign:'center', pointerEvents:'none', zIndex:100,
        transform:'translateX(-50%)', scale: '1', willChange:'transform,opacity', /* Keep scale at 1 to avoid blur */
      }}>
        <div style={{
          display:'inline-block', background:'rgba(255,255,255,0.95)',
          borderRadius:10, padding:size<80?'2px 8px 3px':'3px 12px 4px',
          boxShadow:'0 2px 14px rgba(0,0,0,0.55)',
          border:'1px solid rgba(218,93,101,0.3)',
          backdropFilter:'blur(2px)',
        }}>
          <div style={{color:'#5a0808',fontSize:size<80?9:11,fontWeight:800,lineHeight:1.2,letterSpacing:0.4,
            textRendering:'geometricPrecision', WebkitFontSmoothing:'antialiased'}}>
            {line1}
            {line2 && <><br/><span style={{fontSize:size<80?8:10,fontWeight:700}}>{line2}</span></>}
          </div>
        </div>
      </div>
    </div>
  );

  return s.url
    ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',display:'block'}}>{inner}</a>
    : inner;
}

