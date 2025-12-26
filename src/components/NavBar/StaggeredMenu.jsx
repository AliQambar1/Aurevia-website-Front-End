import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router'; 
import { gsap } from 'gsap';
import './StaggeredMenu.css';

export const StaggeredMenu = ({
  position = 'right',
  colors = ['#000000', '#1a1a1a'],
  items = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = true,
  className,
  logoUrl = '/logo.png',
  menuButtonColor = '#000000',
  openMenuButtonColor = '#000000',
  accentColor = '#000000',
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);

  const openTlRef = useRef(null);
  const busyRef = useRef(false);
  const toggleBtnRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 5 });
    if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });

    const tl = gsap.timeline({ paused: true });

    layers.forEach((layer, i) => {
      tl.to(layer, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0);
    
    tl.to(panel, { xPercent: 0, duration: 0.65, ease: 'power4.out' }, panelInsertTime);

    if (itemEls.length) {
      tl.to(itemEls, {
        yPercent: 0,
        rotate: 0,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.1
      }, panelInsertTime + 0.2);
      
      if (numberEls.length) {
        tl.to(numberEls, { '--sm-num-opacity': 1, duration: 0.6, stagger: 0.08 }, panelInsertTime + 0.3);
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => { busyRef.current = false; });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    const offscreen = position === 'left' ? -100 : 100;
    gsap.to(all, {
      xPercent: offscreen,
      duration: 0.4,
      ease: 'power3.inOut',
      stagger: 0.05,
      onComplete: () => { busyRef.current = false; }
    });
  }, [position]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    if (!icon) return;
    gsap.to(icon, { rotate: opening ? 225 : 0, duration: 0.6, ease: 'power4.out' });
  }, []);

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    const seq = opening ? ['Menu', '...', 'Close'] : ['Close', '...', 'Menu'];
    setTextLines(seq);
    gsap.fromTo(inner, { yPercent: 0 }, { yPercent: -66.6, duration: 0.5, ease: 'power4.out' });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    target ? playOpen() : playClose();
    animateIcon(target);
    animateText(target);
    target ? onMenuOpen?.() : onMenuClose?.();
  }, [playOpen, playClose, animateIcon, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) toggleMenu();
  }, [toggleMenu]);

  return (
    <div className={`staggered-menu-wrapper ${isFixed ? 'fixed-wrapper' : ''} ${className || ''}`} 
         style={{ '--sm-accent': accentColor }} data-position={position} data-open={open || undefined}>
      
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />)}
      </div>

      <header className="staggered-menu-header">
        <div className="sm-logo">
          <img src={logoUrl} alt="Logo" className="sm-logo-img" draggable={false} />
        </div>
        <button ref={toggleBtnRef} className="sm-toggle" onClick={toggleMenu} type="button">
          <span className="sm-toggle-textWrap">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((l, i) => <span className="sm-toggle-line" key={i}>{l}</span>)}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside ref={panelRef} className="staggered-menu-panel">
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" data-numbering={displayItemNumbering || undefined}>
            {items.map((it, idx) => (
              <li className="sm-panel-itemWrap" key={idx}>
                {/* ✅ Fixed: Handle both navigation and onClick */}
                {it.onClick ? (
                  // If there's an onClick (like Sign Out), use a button styled as a link
                  <button
                    className="sm-panel-item sm-panel-item-button"
                    onClick={(e) => {
                      e.preventDefault();
                      it.onClick();
                      closeMenu();
                    }}
                    type="button"
                  >
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </button>
                ) : (
                  // Regular navigation link
                  <Link 
                    className="sm-panel-item" 
                    to={it.link} 
                    onClick={closeMenu}
                  >
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;

