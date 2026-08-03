/* ============ single moving 3D material backdrop, scroll-driven ============ */
(function(){
  var grain = document.querySelector('#bg3d .grain');
  if (grain){
    var c = document.createElement('canvas'); c.width = 140; c.height = 140;
    var cx = c.getContext('2d'); var id = cx.createImageData(140,140);
    for (var i = 0; i < id.data.length; i += 4){ var v = Math.random()*255; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=255; }
    cx.putImageData(id,0,0);
    grain.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    grain.style.backgroundSize = '140px 140px';
  }

  var stage = document.querySelector('.mat-stage');
  var objs = Array.prototype.slice.call(document.querySelectorAll('.mat-obj'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('no-motion');
  if (!stage || !objs.length) return;
  objs[0].classList.add('active');
  if (reduce) return;

  var progress = 0, spin = 0, activeIdx = 0;
  var seg = 1 / objs.length;
  function onScroll(){
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function updateActive(){
    var idx = Math.min(objs.length - 1, Math.floor(progress / seg));
    if (idx !== activeIdx){ objs[activeIdx].classList.remove('active'); objs[idx].classList.add('active'); activeIdx = idx; }
  }

  function tick(){
    spin += 0.06;
    var tiltX = Math.sin(spin * 0.012) * 5 + (progress - 0.5) * 6;
    var rotY = Math.sin(spin * 0.008) * 10 + (progress - 0.5) * 18;
    stage.style.transform = 'translate(-50%,-50%) rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
    updateActive();
    requestAnimationFrame(tick);
  }
  tick();
})();
