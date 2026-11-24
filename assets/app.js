(function(){
"use strict";
var D=window.D, ICO=window.ICO, T=D.now.slice(0,10);
var $=function(id){return document.getElementById(id);};
var nf=new Intl.NumberFormat("fr-FR");
function fm(n){return nf.format(n).replace(/\u202f|\u00a0/g,"\u00a0");}
function f1(x){return (Math.round(x*10)/10).toString().replace(".",",");}
function dobj(s){var p=s.slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function days(a,b){return Math.round((dobj(b)-dobj(a))/864e5);}
function dd(s){var p=s.slice(0,10).split("-");return p[2]+"/"+p[1]+"/"+p[0];}
function ds(s){var p=s.slice(0,10).split("-");return p[2]+"/"+p[1];}
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],JRS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
function longD(s){var d=dobj(s);return JRS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear();}
function shortD(s){var d=dobj(s);return JRS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()];}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function ic(n,c){return '<svg class="i'+(c?" "+c:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||"")+"</svg>";}
function pl(n,s,p){return n+" "+(n>1?(p||s+"s"):s);}
function pct(a,b){return b?Math.round(1000*a/b)/10:0;}
var TECH={};D.techs.forEach(function(t){TECH[t.id]=t;});
function av(id){var t=TECH[id];return '<span class="av '+t.c+'" title="'+esc(t.nom)+'">'+id+"</span>";}
function tfirst(id){return TECH[id].nom;}
var APP={};D.app.forEach(function(a){APP[a.id]=a;});
var SAV="+225 07 08 08 36 26";
var C={acc:"#004AAD",sky:"#38B6FF",ink:"#3A3A3B",red:"#C8352B",amb:"#D99A1E",grn:"#18794E",gry:"#D4D4D0",line:"#E3E8EF",mut:"#6B6B6B"};
var MOB=function(){return window.matchMedia("(max-width:700px)").matches;};

/* ---------- état des visites ---------- */
function vst(a){if(a.visite)return "faite";if(a.prevu<T)return "retard";return "avenir";}
var WEEKS=[["2026-11-02","2026-11-07","2 au 7"],["2026-11-09","2026-11-14","9 au 14"],["2026-11-16","2026-11-21","16 au 21"],["2026-11-23","2026-11-30","23 au 30"]];
function wk(s){for(var i=0;i<WEEKS.length;i++){if(s>=WEEKS[i][0]&&s<=WEEKS[i][1])return i;}return 3;}

/* ---------- filtres ---------- */
var F={zone:"",tech:"",marque:""};
var MARQUES=[];D.app.forEach(function(a){if(MARQUES.indexOf(a.marque)<0)MARQUES.push(a.marque);});
MARQUES.sort(function(a,b){return D.app.filter(function(x){return x.marque===b;}).length-D.app.filter(function(x){return x.marque===a;}).length;});
function keep(a){return (!F.zone||a.zone===F.zone)&&(!F.tech||a.tech===F.tech)&&(!F.marque||a.marque===F.marque);}
function apps(){return D.app.filter(keep);}
function anyF(){return F.zone||F.tech||F.marque;}
function fdesc(){var p=[];if(F.zone)p.push(D.zones[F.zone]);if(F.tech)p.push(tfirst(F.tech));if(F.marque)p.push(F.marque);return p.join(", ");}

function menu(key,btn,box,lab,items,allLab){
  function draw(){
    box.innerHTML=items().map(function(it){return '<button class="mi'+(F[key]===it[0]?" on":"")+'" data-k="'+esc(it[0])+'"><span>'+esc(it[1])+(it[2]?'<small>'+esc(it[2])+"</small>":"")+"</span>"+ic("check","ck")+"</button>";}).join("");
  }
  btn.addEventListener("click",function(e){e.stopPropagation();var on=box.classList.contains("on");closeMenus();if(!on){draw();box.classList.add("on");}});
  box.addEventListener("click",function(e){var b=e.target.closest(".mi");if(!b)return;F[key]=b.getAttribute("data-k");
    if(key==="zone"&&F.tech&&TECH[F.tech].zone!==F.zone&&F.zone)F.tech="";
    closeMenus();applyF();});
}
function closeMenus(){document.querySelectorAll(".menu.on").forEach(function(m){m.classList.remove("on");});}
document.addEventListener("click",closeMenus);
menu("zone",$("z-b"),$("z-m"),$("z-l"),function(){return [["","Toutes les zones",pl(D.app.length,"appareil")]].concat(Object.keys(D.zones).map(function(z){return [z,D.zones[z],pl(D.app.filter(function(a){return a.zone===z;}).length,"appareil")];}));});
menu("tech",$("t-b"),$("t-m"),$("t-l"),function(){return [["","Tous les techniciens",pl(D.techs.length,"technicien")]].concat(D.techs.filter(function(t){return !F.zone||t.zone===F.zone;}).map(function(t){return [t.id,t.nom,D.zones[t.zone]+", "+pl(D.app.filter(function(a){return a.tech===t.id;}).length,"appareil")];}));});
menu("marque",$("m-b"),$("m-m"),$("m-l"),function(){return [["","Toutes les marques",""]].concat(MARQUES.map(function(m){return [m,m,pl(D.app.filter(function(a){return a.marque===m;}).length,"appareil")];}));});
$("f-x").addEventListener("click",function(){F={zone:"",tech:"",marque:""};applyF();});
function applyF(){
  $("z-l").textContent=F.zone?D.zones[F.zone]:"Toutes les zones";
  $("t-l").textContent=F.tech?tfirst(F.tech):"Tous les techniciens";
  $("m-l").textContent=F.marque||"Toutes les marques";
  $("z-b").classList.toggle("on",!!F.zone);$("t-b").classList.toggle("on",!!F.tech);$("m-b").classList.toggle("on",!!F.marque);
  $("f-x").style.display=anyF()?"":"none";
  CSEL=null;PAGE=1;render();
}

/* ---------- chiffres clés ---------- */
function kc(o){
  return '<div class="kc'+(o.key?" key":"")+'"><p class="l">'+ic(o.i)+esc(o.l)+'</p><div class="vr"><p class="v">'+o.v+(o.u?"<small>"+o.u+"</small>":"")+'</p></div><p class="s">'+o.s+"</p></div>";
}

/* ---------- Visites préventives ---------- */
var charts={};
function mk(id,cfg){if(charts[id])charts[id].destroy();charts[id]=new Chart($(id),cfg);return charts[id];}
Chart.defaults.font.family="Inter, system-ui, sans-serif";Chart.defaults.font.size=12;Chart.defaults.color=C.mut;
if(window.__CAPTURE)Chart.defaults.animation=false;
var VSEL=null;
function rParc(){
  var L=apps(),due=L.filter(function(a){return a.prevu<T;}),fa=due.filter(function(a){return a.visite;}),re=due.filter(function(a){return !a.visite;});
  var ar=L.filter(function(a){return a.statut==="arret";}),disp=pct(L.length-ar.length,L.length);
  var tx=pct(fa.length,due.length);
  $("lede-p").innerHTML=(anyF()?"<b>"+esc(fdesc())+"</b> : ":"")+pl(L.length,"appareil")+" sous contrat. "+fa.length+" visites faites sur "+due.length+" dues à ce jour"+(re.length?', <span class="r">'+pl(re.length,"visite")+" en retard</span>":", aucune en retard")+". "+(ar.length?pl(ar.length,"appareil")+" à l'arrêt.":"Aucun appareil à l'arrêt.");
  $("kpis-p").innerHTML=kc({key:1,i:"gauge",l:"Disponibilité du parc",v:f1(disp)+"\u00a0%",s:"<b>"+(L.length-ar.length)+"</b> appareils en service sur "+L.length})+
    kc({i:"circle-check-big",l:"Visites préventives faites",v:f1(tx)+"\u00a0%",s:"<b>"+fa.length+"</b> sur "+due.length+" dues, "+L.length+" prévues dans le mois"})+
    kc({i:"triangle-alert",l:"Visites en retard",v:re.length,s:re.length?"à replanifier cette semaine":"tout est à jour"});
  // jauge
  mk("c-gauge",{type:"doughnut",data:{labels:["En service","À l'arrêt"],datasets:[{data:[L.length-ar.length,ar.length],backgroundColor:[C.acc,C.red],borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,rotation:-90,circumference:180,cutout:"74%",plugins:{legend:{display:false},tooltip:{enabled:true}}}});
  $("gv").innerHTML="<b>"+f1(disp)+"\u00a0%</b><small>objectif indicatif 98\u00a0%</small>";
  $("arrets").innerHTML=ar.length?ar.map(function(a){return '<button class="li" data-app="'+a.id+'"><div class="who"><span class="av cl">'+ic("triangle-alert")+'</span><div><p class="nm">'+esc(a.site)+'</p><p class="mt2">'+esc(a.lib)+", "+esc(a.marque)+" : "+esc(a.motif)+'</p></div></div><div class="rr"><span class="pill r">À l\'arrêt</span></div></button>';}).join(""):'<p class="empty">Aucun appareil à l\'arrêt dans ce périmètre.</p>';
  // barres par technicien
  var TL=D.techs.filter(function(t){return L.some(function(a){return a.tech===t.id;});});
  function cnt(t,s){return L.filter(function(a){return a.tech===t.id&&vst(a)===s;}).length;}
  mk("c-tech",{type:"bar",data:{labels:TL.map(function(t){return MOB()?t.id:t.nom.split(" ").slice(-1)[0];}),datasets:[
    {label:"Faites",data:TL.map(function(t){return cnt(t,"faite");}),backgroundColor:C.acc,borderRadius:4,maxBarThickness:34},
    {label:"En retard",data:TL.map(function(t){return cnt(t,"retard");}),backgroundColor:C.red,borderRadius:4,maxBarThickness:34},
    {label:"À venir",data:TL.map(function(t){return cnt(t,"avenir");}),backgroundColor:"#C9DDF5",borderRadius:4,maxBarThickness:34}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{stacked:true,grid:{display:false},ticks:{autoSkip:false,maxRotation:0,font:{size:MOB()?11:12}}},y:{stacked:true,grid:{color:C.line},border:{display:false},ticks:{precision:0}}}}});
  $("l-tech").innerHTML='<span><i style="background:'+C.acc+'"></i>Faites</span><span><i style="background:'+C.red+'"></i>En retard</span><span><i style="background:#C9DDF5"></i>À venir</span>';
  // planning
  var h='<div class="pg-r pg-h"><span>'+(MOB()?"":"Technicien")+"</span>"+WEEKS.map(function(w,i){return '<span class="pg-w'+(T>=w[0]&&T<=w[1]?" now":"")+'">'+(MOB()?"S"+(i+1):"Du "+w[2])+(MOB()?"":"")+"</span>";}).join("")+"</div>";
  TL.forEach(function(t){
    h+='<div class="pg-r"><span class="pg-t">'+av(t.id)+'<span><b>'+esc(t.nom)+"</b><small>"+esc(D.zones[t.zone])+"</small></span></span>";
    WEEKS.forEach(function(w,i){
      var V=L.filter(function(a){return a.tech===t.id&&wk(a.prevu)===i;});
      if(!V.length){h+='<span class="pg-c empty0">0</span>';return;}
      var f=V.filter(function(a){return a.visite;}).length,r=V.filter(function(a){return vst(a)==="retard";}).length;
      var cls=r?"late":(w[1]<T?"done":(w[0]<=T?"cur":"fut"));
      var on=VSEL&&VSEL[0]===t.id&&VSEL[1]===i;
      h+='<button class="pg-c '+cls+(on?" on":"")+'" data-t="'+t.id+'" data-w="'+i+'"><b>'+(w[0]>T?V.length:f+"/"+V.length)+"</b>"+(r?"<small>"+r+" en retard</small>":(w[0]>T?"<small>prévues</small>":(w[1]>=T&&f<V.length?"<small>"+(V.length-f)+" à venir</small>":"")))+"</button>";
    });
    h+="</div>";
  });
  $("pgrid").innerHTML=h;
  // liste
  var VL,ttl;
  if(VSEL){VL=L.filter(function(a){return a.tech===VSEL[0]&&wk(a.prevu)===VSEL[1];});ttl=TECH[VSEL[0]].nom+", semaine du "+WEEKS[VSEL[1]][2]+" novembre";}
  else{VL=re;ttl="Visites en retard";}
  VL=VL.slice().sort(function(a,b){var o={retard:0,avenir:1,faite:2};return (o[vst(a)]-o[vst(b)])||a.prevu.localeCompare(b.prevu);});
  $("vl-t").textContent=ttl+" ("+VL.length+")";$("vl-x").hidden=!VSEL;
  $("vlist").innerHTML=VL.length?VL.map(function(a){var s=vst(a);
    var p=s==="faite"?'<span class="pill g">'+ic("check")+"Faite le "+ds(a.visite)+"</span>":s==="retard"?'<span class="pill r">'+days(a.prevu,T)+" j de retard</span>":'<span class="pill n">Prévue le '+ds(a.prevu)+"</span>";
    return '<button class="li" data-app="'+a.id+'"><div class="who">'+av(a.tech)+'<div><p class="nm">'+esc(a.site)+'</p><p class="mt2">'+esc(a.lib)+", "+esc(a.marque)+", "+esc(a.commune)+(s==="retard"?", prévue le "+ds(a.prevu):"")+'</p></div></div><div class="rr">'+p+"</div></button>";}).join(""):'<p class="empty">Aucune visite en retard dans ce périmètre.</p>';
  // communes
  var CO={};L.forEach(function(a){var c=CO[a.commune]||(CO[a.commune]={n:a.commune,due:0,f:0,tot:0});c.tot++;if(a.prevu<T){c.due++;if(a.visite)c.f++;}});
  var CL=Object.keys(CO).map(function(k){return CO[k];}).sort(function(a,b){return b.tot-a.tot;});
  $("hb-com").innerHTML=CL.map(function(c){var p=c.due?Math.round(100*c.f/c.due):100;return '<div class="r'+(p<85?" low":"")+'"><span class="n">'+esc(c.n)+" <small>"+c.tot+'</small></span><span class="t"><i style="width:'+p+'%"></i></span><span class="v">'+c.f+"/"+c.due+"</span></div>";}).join("");
}
$("pgrid").addEventListener("click",function(e){var b=e.target.closest(".pg-c[data-t]");if(!b)return;var k=[b.getAttribute("data-t"),+b.getAttribute("data-w")];VSEL=(VSEL&&VSEL[0]===k[0]&&VSEL[1]===k[1])?null:k;rParc();if(VSEL&&MOB())$("vl-t").scrollIntoView({behavior:"smooth",block:"start"});});
$("vl-x").addEventListener("click",function(){VSEL=null;rParc();});

/* ---------- carnet d'entretien ---------- */
var CSEL=null,CSEG="tous",PAGE=1;
function qrSvg(a,px){
  var n=a.qn,s=a.qr,r="";
  for(var y=0;y<n;y++)for(var x=0;x<n;x++)if(s.charAt(y*n+x)==="1")r+="M"+x+" "+y+"h1v1h-1z";
  return '<svg viewBox="-2 -2 '+(n+4)+" "+(n+4)+'" width="'+px+'" height="'+px+'" shape-rendering="crispEdges" role="img" aria-label="Code QR du carnet '+a.id+'"><rect x="-2" y="-2" width="'+(n+4)+'" height="'+(n+4)+'" fill="#fff"/><path d="'+r+'" fill="#1F2330"/></svg>';
}
function stPill(a){return a.statut==="arret"?'<span class="pill r">À l\'arrêt</span>':a.statut==="surv"?'<span class="pill a">Sous surveillance</span>':'<span class="pill g">En service</span>';}
function carnetHTML(a,pub){
  var H=a.h,pn=H.filter(function(x){return x.k==="panne";}),pc=H.filter(function(x){return x.k==="piece";});
  var h='<div class="cn">';
  h+='<div class="cn-top"><img src="assets/logo-sodebat.png?v=20261125a" alt="SODEBAT"><span>Carnet d\'entretien</span></div>';
  h+='<div class="cn-id"><p class="cn-n">'+esc(a.id)+'</p><h3>'+esc(a.site)+'</h3><p class="cn-s">'+esc(a.lib)+", "+esc(a.commune)+'</p><div class="cn-p">'+stPill(a)+"</div></div>";
  if(a.statut==="arret")h+='<div class="cn-al">'+ic("triangle-alert")+"<span>"+esc(a.motif)+". Intervention en cours.</span></div>";
  h+='<div class="cn-g"><div><small>Dernière visite</small><b>'+dd(a.derniere)+'</b></div><div><small>Prochaine visite</small><b>'+dd(a.prochaine)+'</b></div><div><small>Pannes sur 12 mois</small><b>'+pn.length+'</b></div><div><small>Pièces changées</small><b>'+pc.length+"</b></div></div>";
  h+='<dl class="cn-d"><dt>Type</dt><dd>'+esc(a.type)+"</dd><dt>Marque</dt><dd>"+esc(a.marque)+"</dd><dt>Année</dt><dd>"+a.annee+"</dd><dt>Niveaux desservis</dt><dd>"+a.niveaux+"</dd><dt>Charge</dt><dd>"+esc(a.charge)+"</dd><dt>Technologie</dt><dd>"+esc(a.techno)+"</dd><dt>Technicien</dt><dd>"+esc(TECH[a.tech].nom)+"</dd></dl>";
  h+='<p class="cn-h">Historique</p>';
  var ev=[{d:a.derniere,k:"visite",t:"Visite préventive"}].concat(H).sort(function(x,y){return y.d.localeCompare(x.d);});
  h+='<ul class="cn-l">'+ev.map(function(x){var i=x.k==="panne"?"triangle-alert":x.k==="piece"?"wrench":x.k==="arret"?"clock":"circle-check-big";var l=x.k==="panne"?"Panne":x.k==="piece"?"Pièce changée":x.k==="arret"?"Arrêt":"Visite";
    return '<li class="'+x.k+'">'+ic(i)+'<div><b>'+l+" : "+esc(x.t)+"</b><small>"+dd(x.d)+(x.dur?", remis en service en "+(x.dur>=24?x.dur/24+" j":String(x.dur).replace(".",",")+" h"):"")+"</small></div></li>";}).join("")+"</ul>";
  h+='<a class="cn-sav" href="tel:+2250708083626">'+ic("phone")+"<span>Signaler une panne<small>SAV 24 h sur 24 : "+SAV+"</small></span></a>";
  h+='<p class="cn-f">Données d\'exemple</p></div>';
  return h;
}
function cFilter(){
  var L=apps(),q=($("q-c").value||"").toLowerCase().trim();
  if(CSEG!=="tous")L=L.filter(function(a){return CSEG==="arret"?a.statut==="arret":CSEG==="pannes"?a.pannes>=3:a.type===CSEG;});
  if(q)L=L.filter(function(a){return (a.id+" "+a.site+" "+a.lib+" "+a.commune+" "+a.marque).toLowerCase().indexOf(q)>=0;});
  return L;
}
function rCarnet(){
  var A=apps();
  var segs=[["tous","Tous",A.length],["Ascenseur","Ascenseurs"],["Monte-charge","Monte-charges"],["Escalator","Escalators"],["Monte-malades","Monte-malades"],["pannes","Pannes répétées"],["arret","À l'arrêt"]];
  segs.forEach(function(s){if(s[2]==null)s[2]=A.filter(function(a){return s[0]==="arret"?a.statut==="arret":s[0]==="pannes"?a.pannes>=3:a.type===s[0];}).length;});
  $("seg-c").innerHTML=segs.filter(function(s){return s[2]||s[0]===CSEG;}).map(function(s){return '<button data-s="'+s[0]+'"'+(CSEG===s[0]?' class="on"':"")+">"+s[1]+' <span class="c">'+s[2]+"</span></button>";}).join("");
  var L=cFilter();
  var sites={};A.forEach(function(a){sites[a.site]=1;});
  $("lede-c").innerHTML=(anyF()?"<b>"+esc(fdesc())+"</b> : ":"")+pl(A.length,"appareil")+" sur "+pl(Object.keys(sites).length,"site")+". Chaque appareil a sa fiche et son code QR collé en cabine. Choisissez un appareil pour voir ce que voit le gestionnaire de l'immeuble.";
  if(!CSEL||!keep(APP[CSEL]))CSEL=(L.filter(function(a){return a.statut==="arret";})[0]||L[0]||A[0]||D.app[0]).id;
  var N=MOB()?8:12,show=L.slice(0,N*PAGE);
  $("t-app").innerHTML="<thead><tr><th>Appareil</th><th>Marque</th><th class=\"r\">Année</th><th class=\"r\">Pannes 12 mois</th><th>Dernière visite</th><th>État</th></tr></thead><tbody>"+
    (show.length?show.map(function(a){return '<tr data-app="'+a.id+'"'+(a.id===CSEL?' class="on"':"")+'><td class="w"><div class="who"><span class="av cl">'+ic(a.type==="Escalator"?"arrow-up-right":a.type==="Monte-charge"?"package":"building-2")+'</span><div><p class="nm">'+esc(a.site)+'</p><p class="mt2">'+esc(a.id)+", "+esc(a.lib)+", "+esc(a.commune)+'</p></div></div></td><td data-l="Marque">'+esc(a.marque)+'</td><td class="r" data-l="Année">'+a.annee+'</td><td class="r num" data-l="Pannes 12 mois">'+(a.pannes?a.pannes:'<span class="zero">0</span>')+'</td><td data-l="Dernière visite">'+dd(a.derniere)+'</td><td data-l="État">'+stPill(a)+"</td></tr>";}).join(""):'<tr><td class="w"><p class="empty">Aucun appareil ne correspond.</p></td></tr>')+"</tbody>";
  var rest=L.length-show.length;$("more-c").style.display=rest>0?"":"none";$("more-c").textContent="Afficher "+Math.min(rest,N)+" de plus ("+rest+" restants)";
  $("k-carnet").textContent=A.length;
  showCarnet();
}
function showCarnet(){
  var a=APP[CSEL];$("ph").innerHTML=carnetHTML(a);$("ph").scrollTop=0;
  $("qr").innerHTML=qrSvg(a,132)+'<p>'+esc(a.id)+"</p>";
  $("qr-a").href="?carnet="+a.id;
}
$("seg-c").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;CSEG=b.getAttribute("data-s");PAGE=1;rCarnet();});
$("q-c").addEventListener("input",function(){PAGE=1;rCarnet();});
$("more-c").addEventListener("click",function(){PAGE++;rCarnet();});
$("t-app").addEventListener("click",function(e){var r=e.target.closest("tr[data-app]");if(!r)return;CSEL=r.getAttribute("data-app");
  document.querySelectorAll("#t-app tr.on").forEach(function(x){x.classList.remove("on");});r.classList.add("on");showCarnet();
  if(MOB())openApp(CSEL);});

/* ---------- volet appareil ---------- */
function openDr(k,h){$("dr-k").innerHTML=k;$("dr-b").innerHTML=h;$("drawer").classList.add("on");$("scrim").classList.add("on");$("drawer").setAttribute("aria-hidden","false");}
function closeDr(){$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");}
$("dr-x").addEventListener("click",closeDr);$("scrim").addEventListener("click",closeDr);
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeDr();});
function openApp(id){var a=APP[id];openDr(ic("file-text")+"Carnet "+esc(a.id),'<div class="dr-cn">'+carnetHTML(a)+'</div><div class="dr-qr">'+qrSvg(a,96)+'<div><b>Code QR de la cabine</b><p>Ouvre ce carnet sur le téléphone du gestionnaire.</p><a class="lnk" href="?carnet='+a.id+'" target="_blank" rel="noopener">Ouvrir<i data-i="arrow-up-right"></i></a></div></div>');paintIcons($("dr-b"));}
document.addEventListener("click",function(e){var b=e.target.closest("[data-app]");if(!b||b.tagName==="TR")return;openApp(b.getAttribute("data-app"));});

/* ---------- chantiers ---------- */
var CHSEL=null;
function over(s){return days(s.r0,s.r1)-days(s.p0,s.p1);}
function chKeep(c){return !F.zone||c.zone===F.zone;}
function chState(c){var s=c.steps.filter(function(x){return x.st==="encours";})[0];return s?s.n:(c.steps.every(function(x){return x.st==="fait";})?"Réceptionné":c.steps[0].n);}
function rChantiers(){
  var L=D.chantiers.filter(chKeep).sort(function(a,b){return b.retard-a.retard||a.fin_p.localeCompare(b.fin_p);});
  var lr=L.filter(function(c){return c.retard>0;});
  var mx=lr.length?lr[0]:null;
  $("lede-ch").innerHTML=(F.zone?"<b>"+esc(D.zones[F.zone])+"</b> : ":"")+pl(L.length,"chantier")+" en cours. "+(lr.length?'<span class="r">'+pl(lr.length,"chantier")+" en retard</span>, le plus long chez "+esc(mx.client)+" ("+mx.retard+" jours, "+esc(mx.steps.filter(function(s){return over(s)>0;})[0].n.toLowerCase())+").":"Aucun retard.");
  var sem=L.length?L.reduce(function(s,c){return s+c.site_sem;},0)/L.length:0;
  $("kpis-ch").innerHTML=kc({key:1,i:"layers",l:"Chantiers en cours",v:L.length,s:"<b>"+L.filter(function(c){return c.type==="Installation";}).length+"</b> installations, "+L.filter(function(c){return c.type!=="Installation";}).length+" modernisations et mises en conformité"})+
    kc({i:"hourglass",l:"Chantiers en retard",v:lr.length,s:mx?"retard maximal <b>"+mx.retard+" jours</b>":"tout est dans les temps"})+
    kc({i:"clock",l:"Temps moyen sur site",v:f1(sem),u:"semaines",s:"de la gaine à la mise en service"});
  // Gantt
  var st=dobj("2026-08-31"),en=dobj("2027-02-01"),span=(en-st)/864e5;
  function x(s){return Math.max(0,Math.min(100,100*(dobj(s)-st)/864e5/span));}
  var mo=[["2026-09-01","Sept."],["2026-10-01","Oct."],["2026-11-01","Nov."],["2026-12-01","Déc."],["2027-01-01","Janv."]];
  var g='<div class="gt-h"><span></span><div class="gt-ax">'+mo.map(function(m){return '<span style="left:'+x(m[0])+'%">'+m[1]+"</span>";}).join("")+"</div></div>";
  L.forEach(function(c){
    g+='<button class="gt-r'+(CHSEL===c.id?" on":"")+'" data-ch="'+c.id+'"><span class="gt-n"><b>'+esc(c.client)+"</b><small>"+esc(c.id)+", "+esc(chState(c))+'</small></span><div class="gt-t">'+
      mo.map(function(m){return '<i class="gt-m" style="left:'+x(m[0])+'%"></i>';}).join("")+
      '<i class="gt-p" style="left:'+x(c.steps[0].p0)+"%;width:"+(x(c.fin_p)-x(c.steps[0].p0))+'%"></i>'+
      c.steps.map(function(s,k){return '<i class="gt-s '+s.st+(over(s)>0?" late":"")+'" style="left:'+x(s.r0)+"%;width:"+Math.max(.6,x(s.r1)-x(s.r0))+'%" title="'+esc(s.n)+'"></i>';}).join("")+
      '<i class="gt-today" style="left:'+x(T)+'%"></i></div><span class="gt-v">'+(c.retard>0?'<span class="pill r">+'+c.retard+" j</span>":'<span class="pill g">À l\'heure</span>')+"</span></button>";
  });
  $("gantt").innerHTML=g;
  // cartes
  $("ch-cards").innerHTML=L.map(function(c){
    var done=c.steps.filter(function(s){return s.st==="fait";}).length;
    return '<button class="card aoc" data-ch="'+c.id+'"><div class="aoc-h"><span class="pill b">'+esc(c.type)+'</span>'+(c.retard>0?'<span class="pill r">'+c.retard+" jours de retard</span>":'<span class="pill g">Dans les temps</span>')+'</div><p class="aoc-t">'+esc(c.client)+'</p><p class="aoc-o">'+esc(c.objet)+", usine "+esc(c.usine)+", "+esc(c.commune)+'</p>'+
      '<div class="stp7">'+c.steps.map(function(s){return '<i class="'+s.st+(over(s)>0?" late":"")+'" title="'+esc(s.n)+'"></i>';}).join("")+'</div>'+
      '<div class="aoc-m"><div><small>Étape</small><b>'+esc(chState(c))+'</b></div><div><small>Réception prévue</small><b>'+ds(c.fin_p)+'</b></div><div><small>Recalée</small><b'+(c.retard>0?' class="bad"':"")+">"+ds(c.fin_r)+"</b></div></div>"+
      '<p class="aoc-f">'+(done>1?done+" étapes sur 7 terminées":done+" étape sur 7 terminée")+ic("arrow-right")+"</p></button>";
  }).join("")||'<p class="empty">Aucun chantier dans cette zone.</p>';
  $("k-ch").textContent=D.chantiers.filter(function(c){return c.retard>0;}).length||"";
}
function openCh(id){
  var c=D.chantiers.filter(function(x){return x.id===id;})[0];
  var h='<div class="tags"><span class="pill b">'+esc(c.type)+"</span>"+(c.retard>0?'<span class="pill r">'+c.retard+" jours de retard</span>":'<span class="pill g">Dans les temps</span>')+"</div><h3>"+esc(c.client)+'</h3><p class="why">'+esc(c.objet)+'</p><dl class="props"><dt>Numéro</dt><dd>'+esc(c.id)+"</dd><dt>Usine</dt><dd>"+esc(c.usine)+"</dd><dt>Commune</dt><dd>"+esc(c.commune)+"</dd><dt>Réception</dt><dd>prévue le "+dd(c.fin_p)+(c.retard>0?", recalée au "+dd(c.fin_r):"")+"</dd><dt>Temps sur site</dt><dd>"+f1(c.site_sem)+" semaines</dd></dl>";
  h+='<p class="lbl">Étapes</p><table class="stt"><thead><tr><th>Étape</th><th>Prévu</th><th>Réel ou recalé</th></tr></thead><tbody>'+c.steps.map(function(s){var r=over(s),dec=days(s.p1,s.r1);
    return '<tr class="'+s.st+'"><td><span class="sd2 '+s.st+'"></span>'+esc(s.n)+'</td><td>'+ds(s.p0)+" au "+ds(s.p1)+'</td><td'+(dec>0?' class="bad"':"")+">"+ds(s.r0)+" au "+ds(s.r1)+(r>0?" (+"+r+" j)":"")+"</td></tr>";}).join("")+"</tbody></table>";
  if(c.retard>0){var ls=c.steps.filter(function(s){return over(s)>0;})[0];
    h+='<p class="lbl" style="margin-top:18px">Message préparé pour le client</p><div class="msg" id="ch-msg">Bonjour,\n\nPoint sur votre chantier '+c.id+" ("+c.objet.toLowerCase()+") : l'étape « "+ls.n.toLowerCase()+" » a pris "+over(ls)+" jours de plus que prévu. La réception est recalée au "+dd(c.fin_r)+" au lieu du "+dd(c.fin_p)+".\n\nNotre chef de chantier reste à votre disposition.\n\nSODEBAT Ascenseurs Côte d'Ivoire</div><button class=\"btn\" id=\"ch-cp\">"+ic("copy")+"Copier le message</button><p class=\"dnote\">Rien ne part d'ici : le message est relu et envoyé par le responsable du chantier.</p>";}
  openDr(ic("layers")+"Chantier "+esc(c.id),h);
  var cp=$("ch-cp");if(cp)cp.addEventListener("click",function(){copy($("ch-msg").textContent);});
}
document.addEventListener("click",function(e){var b=e.target.closest("[data-ch]");if(!b)return;openCh(b.getAttribute("data-ch"));});
function copy(t){try{navigator.clipboard.writeText(t);}catch(e){}toast("Message copié. À relire avant envoi.");}
function toast(t){var x=$("toast");x.textContent=t;x.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(function(){x.classList.remove("on");},2600);}

/* ---------- pièces ---------- */
var PSEG="tous";
function pKeep(p){return !F.marque||p.usine===F.marque||(F.marque!=="SODIMAS"&&F.marque!=="IMEM");}
function rPieces(){
  var A=D.pieces.filter(pKeep),ru=A.filter(function(p){return p.etat==="rupture";}),ba=A.filter(function(p){return p.etat==="bas";}),cm=A.filter(function(p){return p.cmd>0;});
  $("lede-pc").innerHTML=(F.marque==="SODIMAS"||F.marque==="IMEM"?"<b>Usine "+esc(F.marque)+"</b> : ":"")+pl(A.length,"référence")+" suivie"+(A.length>1?"s":"")+" au magasin. "+(ru.length?'<span class="r">'+pl(ru.length,"rupture")+"</span> ("+ru.map(function(p){return esc(p.nom.toLowerCase())+" "+esc(p.usine);}).join(", ")+"), ":"")+(ru.length+ba.length)+" sous le seuil d'alerte, ruptures comprises.";
  $("kpis-pc").innerHTML=kc({key:1,i:"triangle-alert",l:"Références en rupture",v:ru.length,s:ru.length?"dont "+esc(ru[0].nom.toLowerCase()):"aucune"})+
    kc({i:"package",l:"Sous le seuil d'alerte",v:ru.length+ba.length,s:"ruptures comprises, sur "+A.length+" références"})+
    kc({i:"file-check",l:"Lignes à commander",v:cm.length,s:"bons usine prêts à valider"});
  mk("c-pc",{type:"doughnut",data:{labels:["En rupture","Sous le seuil","Stock suffisant"],datasets:[{data:[ru.length,ba.length,A.length-ru.length-ba.length],backgroundColor:[C.red,C.amb,C.acc],borderWidth:2,borderColor:"#fff"}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"66%",plugins:{legend:{display:false}}}});
  $("l-pc").innerHTML='<span><i style="background:'+C.red+'"></i>En rupture '+ru.length+'</span><span><i style="background:'+C.amb+'"></i>Sous le seuil '+ba.length+'</span><span><i style="background:'+C.acc+'"></i>Suffisant '+(A.length-ru.length-ba.length)+"</span>";
  var U={};cm.forEach(function(p){(U[p.usine]=U[p.usine]||[]).push(p);});
  $("cmd-u").innerHTML=Object.keys(U).sort().map(function(u){var l=U[u];return '<div class="mini-h"><span class="ic">'+ic("factory")+'</span><div><p class="t">Usine '+esc(u)+'</p><p class="s">'+pl(l.length,"ligne")+", délai le plus long "+Math.max.apply(null,l.map(function(p){return p.delai;}))+' semaines</p></div><span class="n">'+l.reduce(function(s,p){return s+p.cmd;},0)+'<small>pièces</small></span></div>';}).join("")||'<p class="empty">Rien à commander.</p>';
  var segs=[["tous","Toutes",A.length],["rupture","En rupture",ru.length],["bas","Sous le seuil",ba.length],["ok","Suffisant",A.length-ru.length-ba.length]];
  $("seg-pc").innerHTML=segs.map(function(s){return '<button data-s="'+s[0]+'"'+(PSEG===s[0]?' class="on"':"")+">"+s[1]+' <span class="c">'+s[2]+"</span></button>";}).join("");
  var q=($("q-pc").value||"").toLowerCase().trim();
  var L=A.filter(function(p){return (PSEG==="tous"||p.etat===PSEG)&&(!q||(p.ref+" "+p.nom+" "+p.fam).toLowerCase().indexOf(q)>=0);}).sort(function(a,b){var o={rupture:0,bas:1,ok:2};return o[a.etat]-o[b.etat]||a.ref.localeCompare(b.ref);});
  $("t-pc").innerHTML='<thead><tr><th>Pièce</th><th>Usine</th><th class="r">Stock</th><th>Niveau</th><th class="r">Conso. par mois</th><th class="r">Délai usine</th><th class="r">À commander</th></tr></thead><tbody>'+
    (L.map(function(p){var w=Math.min(100,Math.round(100*p.stock/Math.max(1,p.seuil*2)));
      return '<tr><td class="w"><div class="obj"><b>'+esc(p.nom)+"</b><small>"+esc(p.ref)+", "+esc(p.fam)+'</small></div></td><td data-l="Usine">'+esc(p.usine)+'</td><td class="r num" data-l="Stock">'+(p.stock?p.stock:'<span class="bad">0</span>')+'</td><td data-l="Niveau / seuil"><span class="lvl '+p.etat+'"><span class="tr"><i style="width:'+w+'%"></i><em style="left:50%"></em></span><small>seuil '+p.seuil+'</small></span></td><td class="r" data-l="Conso. par mois">'+String(p.conso).replace(".",",")+'</td><td class="r" data-l="Délai usine">'+p.delai+' sem.</td><td class="r num" data-l="À commander">'+(p.cmd?p.cmd:'<span class="zero">0</span>')+"</td></tr>";}).join("")||'<tr><td class="w"><p class="empty">Aucune pièce ne correspond.</p></td></tr>')+"</tbody>";
  $("k-pc").textContent=D.pieces.filter(function(p){return p.etat==="rupture";}).length||"";
}
$("seg-pc").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;PSEG=b.getAttribute("data-s");rPieces();});
$("q-pc").addEventListener("input",rPieces);
$("b-cmd").addEventListener("click",function(){
  var cm=D.pieces.filter(pKeep).filter(function(p){return p.cmd>0;}),U={};cm.forEach(function(p){(U[p.usine]=U[p.usine]||[]).push(p);});
  var h='<h3>Bons de commande usine</h3><p class="why">Préparés à partir des seuils. À valider par le responsable des achats avant envoi.</p>';
  Object.keys(U).sort().forEach(function(u){h+='<p class="lbl" style="margin-top:18px">Usine '+esc(u)+'</p><table class="stt"><thead><tr><th>Référence</th><th>Pièce</th><th class="r">Qté</th></tr></thead><tbody>'+U[u].map(function(p){return "<tr><td>"+esc(p.ref)+"</td><td>"+esc(p.nom)+'</td><td class="r"><b>'+p.cmd+"</b></td></tr>";}).join("")+"</tbody></table>";});
  h+='<button class="btn pri" id="cmd-ok" style="margin-top:18px">'+ic("check")+'Soumettre pour validation</button><p class="dnote">Aucune commande ne part sans l\'accord du responsable.</p>';
  openDr(ic("file-check")+"Commande usine",h);
  $("cmd-ok").addEventListener("click",function(){closeDr();toast("Bons transmis au responsable pour validation.");});
});

/* ---------- navigation ---------- */
var VIEWS={parc:["Visites préventives",rParc],carnet:["Carnet d'entretien",rCarnet],chantiers:["Chantiers",rChantiers],pieces:["Pièces détachées",rPieces]};
var CUR="parc";
function go(v){if(!VIEWS[v])v="parc";CUR=v;
  document.querySelectorAll(".view").forEach(function(s){s.classList.toggle("on",s.id==="v-"+v);});
  document.querySelectorAll("[data-v]").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-v")===v);});
  $("crumb-v").textContent=VIEWS[v][0];
  $("m-s").style.display=(v==="chantiers")?"none":"";$("t-s").style.display=(v==="chantiers"||v==="pieces")?"none":"";$("z-s").style.display=(v==="pieces")?"none":"";
  VIEWS[v][1]();paintIcons(document);
  if(location.hash!=="#"+v)history.replaceState(null,"","#"+v);
  window.scrollTo(0,0);
}
function render(){VIEWS[CUR][1]();paintIcons(document);
  var A=D.app,re=A.filter(function(a){return vst(a)==="retard";}).length;
  $("k-parc").textContent=re||"";$("m-parc").textContent=re||"";
  $("m-ch").textContent=D.chantiers.filter(function(c){return c.retard>0;}).length||"";
  $("m-pc").textContent=D.pieces.filter(function(p){return p.etat==="rupture";}).length||"";
}
document.querySelectorAll("[data-v]").forEach(function(b){b.addEventListener("click",function(){go(b.getAttribute("data-v"));render();});});
window.addEventListener("hashchange",function(){go(location.hash.slice(1));render();});
function paintIcons(root){root.querySelectorAll("i[data-i]").forEach(function(i){var n=i.getAttribute("data-i");var s=document.createElement("span");s.innerHTML=ic(n,i.className);var sv=s.firstChild;i.replaceWith(sv);});}

/* ---------- page publique du carnet (code QR) ---------- */
var qp=new URLSearchParams(location.search).get("carnet");
if(qp&&APP[qp]){
  document.body.classList.add("pubm");$("app").style.display="none";document.querySelector(".tabbar").style.display="none";
  $("pub").hidden=false;$("pub").innerHTML='<div class="pub-in">'+carnetHTML(APP[qp],true)+"</div>";
  document.title="Carnet d'entretien "+qp+", SODEBAT";paintIcons($("pub"));
}else{
  $("date").textContent=longD(T)+", 8 h";
  applyF();go(location.hash.slice(1)||"parc");render();
}
/* contrôle des chiffres */
window.__K=function(){var A=D.app,due=A.filter(function(a){return a.prevu<T;}),f=due.filter(function(a){return a.visite;}).length,ar=A.filter(function(a){return a.statut==="arret";}).length;
  return {appareils:A.length,dispo:pct(A.length-ar,A.length),dues:due.length,faites:f,taux:pct(f,due.length),retard:due.length-f,chantiers:D.chantiers.length,ch_retard:D.chantiers.filter(function(c){return c.retard>0;}).length,rupture:D.pieces.filter(function(p){return p.etat==="rupture";}).length,sous_seuil:D.pieces.filter(function(p){return p.etat!=="ok";}).length,a_cmd:D.pieces.filter(function(p){return p.cmd>0;}).length};};
})();
