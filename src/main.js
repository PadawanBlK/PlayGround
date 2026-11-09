import * as THREE from 'three';
import './style.css';

const $ = (s) => document.querySelector(s);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aaba9);
scene.fog = new THREE.FogExp2(0x9aaba9, 0.0085);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 260);
const renderer = new THREE.WebGLRenderer({ canvas: $('#world'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65)); renderer.setSize(innerWidth, innerHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
scene.add(new THREE.HemisphereLight(0xc9d9db, 0x26342b, 1.55));
const sun = new THREE.DirectionalLight(0xffe4b4, 3.2); sun.position.set(-36, 58, 24); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-55; sun.shadow.camera.right=55; sun.shadow.camera.top=55; sun.shadow.camera.bottom=-55; scene.add(sun);
const fill = new THREE.DirectionalLight(0x7d9eae, 1.1); fill.position.set(30,18,-40); scene.add(fill);
const clock = new THREE.Clock();
const mat = (color, roughness=.85, extra={}) => new THREE.MeshStandardMaterial({color, roughness, ...extra});
const groundMat = mat(0x53624a), grassMat = [0x78805a,0x89906a,0x697958,0x9a956a].map(c=>mat(c)), barkMat=mat(0x493d31), leafMats=[0x304c3e,0x3c5a45,0x52654a,0x657051].map(c=>mat(c)), stoneMat=mat(0x777b72), stoneDark=mat(0x535c58), roofMat=mat(0x49443a), woodMat=mat(0x6e5137), roadMat=mat(0x877b60), waterMat=mat(0x4c777a,.28,{transparent:true,opacity:.8,metalness:.1}), goldMat=mat(0xc8a65d,.4,{emissive:0x37250a});
const terrainGeo = new THREE.PlaneGeometry(190,190,92,92); terrainGeo.rotateX(-Math.PI/2);
const pos=terrainGeo.attributes.position;
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);let h=1.5*Math.sin(x*.075)*Math.cos(z*.063)+.7*Math.sin(x*.2+z*.13)+.5*Math.cos(z*.19);h+=Math.max(0,1-Math.hypot(x-32,z+60)/40)*9;h+=Math.max(0,1-Math.hypot(x+68,z-20)/35)*7;pos.setY(i,h)}
terrainGeo.computeVertexNormals(); const terrain=new THREE.Mesh(terrainGeo,groundMat); terrain.receiveShadow=true;scene.add(terrain);
function groundY(x,z){return 1.5*Math.sin(x*.075)*Math.cos(z*.063)+.7*Math.sin(x*.2+z*.13)+.5*Math.cos(z*.19)+Math.max(0,1-Math.hypot(x-32,z+60)/40)*9+Math.max(0,1-Math.hypot(x+68,z-20)/35)*7}
function addMesh(geo,material,x,y,z,group=scene){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
function box(group,x,y,z,sx,sy,sz,material){return addMesh(new THREE.BoxGeometry(sx,sy,sz),material,x,y,z,group)}
function makeTree(x,z,scale=1){const y=groundY(x,z),g=new THREE.Group();g.position.set(x,y,z);scene.add(g);let trunk=addMesh(new THREE.CylinderGeometry(.13*scale,.24*scale,2.1*scale,7),barkMat,0,1*scale,0,g);trunk.castShadow=true;for(let i=0;i<4;i++){let cone=addMesh(new THREE.ConeGeometry((1.12-i*.16)*scale,2.5*scale,7),leafMats[(Math.random()*leafMats.length)|0],0,(1.6+i*.55)*scale,0,g);cone.position.x=(Math.random()-.5)*.24*scale;}return g}
function makeRock(x,z,s=1){let rock=addMesh(new THREE.DodecahedronGeometry(s,0),Math.random()>.5?stoneMat:stoneDark,x,groundY(x,z)+s*.35,z);rock.scale.set(1.2,.72,.95);rock.rotation.set(Math.random()*.4,Math.random()*3,.2)}
// A winding road and cold river give the valley its shape.
for(let i=0;i<80;i++){const z=48-i*1.22,x=-7+Math.sin(i*.07)*5+(i/80)*12;let y=groundY(x,z)+.06;let pebble=addMesh(new THREE.CircleGeometry(1.2+(Math.random()*1.2),7),roadMat,x,y,z);pebble.rotation.x=-Math.PI/2;pebble.scale.set(1.15,.85,1);pebble.receiveShadow=true;}
const river=addMesh(new THREE.PlaneGeometry(15,100,1,1),waterMat,28,-.45,17);river.rotation.x=-Math.PI/2;river.rotation.z=-.13;river.receiveShadow=false;
// Distant mountain silhouettes.
for(let i=0;i<17;i++){const x=-100+i*13,z=-99-Math.random()*12,h=24+Math.random()*22;let m=addMesh(new THREE.ConeGeometry(12+Math.random()*10,h,5),mat(i%2?0x687a78:0x71817e),x,h*.34,z);m.rotation.y=Math.random()*2;m.castShadow=false;}
// Scatter pines in drifts, leaving the central trail open.
for(let i=0;i<300;i++){let x=(Math.random()-.5)*172,z=(Math.random()-.5)*170;if(Math.abs(x-(-7+Math.sin((48-z)*.057)*5))<7 && z<48&&z>-50)continue;if(Math.hypot(x-28,z-15)<13)continue;makeTree(x,z,.65+Math.random()*.8)}
for(let i=0;i<65;i++){const x=(Math.random()-.5)*165,z=(Math.random()-.5)*160;if(Math.hypot(x-28,z-15)>10)makeRock(x,z,.3+Math.random()*1.2)}
// Hearthglen: a handful of timber-and-stone homes beneath the eastern ridge.
function makeHouse(x,z,scale=1){const g=new THREE.Group();g.position.set(x,groundY(x,z),z);scene.add(g);box(g,0,1.35,0,4.7*scale,2.7*scale,4*scale,mat(0x817d69));box(g,0,.75,0,4.9*scale,1.1*scale,4.2*scale,woodMat);let roof=addMesh(new THREE.ConeGeometry(3.65*scale,2.3*scale,4),roofMat,0,3.8*scale,0,g);roof.rotation.y=Math.PI/4;roof.scale.z=.78;box(g,0,.85*scale,2.08*scale,.8*scale,1.65*scale,.08,mat(0x342d25));let window=box(g,-1.25*scale,1.65*scale,2.08*scale,.65*scale,.64*scale,.09,goldMat);window.material.emissiveIntensity=.9;}
makeHouse(24,12,1.1);makeHouse(31,18,.85);makeHouse(21,21,.78);makeHouse(36,10,.9);makeHouse(28,27,1.05);
for(let i=0;i<5;i++){let x=22+i*3,z=7+Math.sin(i)*2;let post=box(scene,x,groundY(x,z)+1.4,z,.15,2.8,.15,barkMat);let lantern=addMesh(new THREE.BoxGeometry(.4,.55,.4),goldMat,x,groundY(x,z)+2.4,z);}
// A broken standing-stone ring and a ruined watchtower reward the curious.
for(let i=0;i<9;i++){let a=i*Math.PI*2/9,x=-30+Math.cos(a)*7,z=-26+Math.sin(a)*7,h=2.2+Math.random()*2.2;let s=box(scene,x,groundY(x,z)+h/2,z,.8,h,.55,stoneDark);s.rotation.y=a*.3;}
for(let i=0;i<4;i++){let x=61+i*1.3,z=-55+Math.sin(i*2)*2,h=4+Math.random()*2;let p=box(scene,x,groundY(x,z)+h/2,z,.75,h,.7,stoneMat);p.rotation.z=(Math.random()-.5)*.4;}
// Butterflies, drifting motes and campfire-like quest glow.
const motes=[];for(let i=0;i<90;i++){const o=addMesh(new THREE.SphereGeometry(.035+Math.random()*.035,5,4),new THREE.MeshBasicMaterial({color:i%3===0?0xffd68a:0xc2d7ad,transparent:true,opacity:.62}), (Math.random()-.5)*110,1+Math.random()*9,(Math.random()-.5)*110);o.castShadow=false;motes.push({o,base:o.position.y,phase:Math.random()*6.28})}

const races=[
 {name:'Nord',symbol:'ᚠ',tone:0xd9ad86,hair:0x624732,accent:0xb8c3c0,lore:'Hardy folk of the north. Cold-blooded courage and a voice that carries through any storm.',bonus:'FROST RESISTANCE'},
 {name:'Imperial',symbol:'♜',tone:0xc9916e,hair:0x342b24,accent:0xa98b5f,lore:'Born to the crossroads of empire. Silver-tongued, keen-eyed, and never short on luck.',bonus:'FORTUNE FINDER'},
 {name:'Breton',symbol:'✧',tone:0xe2c3a0,hair:0x513b2c,accent:0x796c9a,lore:'A people touched by old magic. Quick to learn the arcane arts and stubborn against them.',bonus:'ARCANE WARD'},
 {name:'Redguard',symbol:'⚔',tone:0x87523b,hair:0x201c1a,accent:0x9c6545,lore:'Desert-born wanderers with a blade in hand and an unshakable sense of purpose.',bonus:'BLADE MASTERY'},
 {name:'Altmer',symbol:'☼',tone:0xf0d4a3,hair:0xe0c476,accent:0xe0bf71,lore:'The high elves, keepers of ancient craft. Their well of magicka runs deeper than most.',bonus:'DEEP MAGICKA'},
 {name:'Dunmer',symbol:'◒',tone:0x8e7168,hair:0x211c28,accent:0x8062a0,lore:'Ash-skinned survivors from the east. Fire runs in their veins; shadows are old friends.',bonus:'FIRE RESISTANCE'},
 {name:'Bosmer',symbol:'❧',tone:0xc99572,hair:0x503825,accent:0x708052,lore:'Woodland kin, swift and sure beneath the canopy. No trail stays hidden for long.',bonus:'WILD SENSE'},
 {name:'Orc',symbol:'◈',tone:0x78966a,hair:0x302a23,accent:0x83775d,lore:'Strong-hearted clansfolk, makers of unbreakable steel and even stronger promises.',bonus:'IRON SKIN'},
 {name:'Khajiit',symbol:'☾',tone:0xc18a60,hair:0x9a7954,accent:0x87704e,lore:'Moon-blessed travelers with quick paws, keen senses, and a story for every inn.',bonus:'NIGHT EYES'},
 {name:'Argonian',symbol:'≋',tone:0x668d79,hair:0x415e51,accent:0x62a59c,lore:'Marsh-born and mysterious. At home in water, and resilient beyond imagining.',bonus:'WATER-BREATHER'}
];
let selectedRace=0; const raceList=$('#race-list');
function renderRaces(){raceList.innerHTML=races.map((r,i)=>`<button class="race-card ${i===selectedRace?'active':''}" data-race="${i}" aria-label="${r.name}"><span class="race-symbol">${r.symbol}</span><span class="race-name">${r.name.toUpperCase()}</span></button>`).join('');raceList.querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedRace=+b.dataset.race;renderRaces();updateCharacter();});}
renderRaces();

// A compact, fully procedural adventurer keeps character creation and play asset-free.
function makeHumanoid(raceIndex, npc=false){
 const r=races[raceIndex],root=new THREE.Group();
 const skin=mat(r.tone),cloth=mat(npc?0x675f4b:0x39463d),leather=mat(0x5d4431),metal=mat(0x9a8b68,.48),hair=mat(r.hair),eyes=mat(0x40382e,.3,{emissive:0x17120c});
 const part=(geo,m,x,y,z)=>addMesh(geo,m,x,y,z,root);
 part(new THREE.CylinderGeometry(.18,.22,.72,8),cloth,0,.92,0);
 part(new THREE.SphereGeometry(.24,12,10),skin,0,1.48,0);
 part(new THREE.SphereGeometry(.245,10,8),hair,0,1.62,-.04).scale.set(1,.68,1);
 for(const side of [-1,1]){
  part(new THREE.SphereGeometry(.035,6,6),eyes,side*.09,1.51,.207);
  part(new THREE.CylinderGeometry(.07,.1,.62,7),cloth,side*.29,.94,0).rotation.z=side*-.12;
  part(new THREE.SphereGeometry(.115,8,7),leather,side*.29,.59,.015);
  part(new THREE.CylinderGeometry(.09,.12,.58,7),cloth,side*.105,.38,0).rotation.z=side*.035;
  part(new THREE.SphereGeometry(.12,8,7),leather,side*.105,.09,.04).scale.set(1,.42,1);
 }
 const cloak=part(new THREE.ConeGeometry(.38,.75,5),mat(r.accent),0,1.06,-.2);cloak.rotation.x=-.12;cloak.scale.z=.35;
 part(new THREE.BoxGeometry(.4,.1,.1),metal,0,1.18,.19);
 if(r.name==='Khajiit'){for(const side of [-1,1]){const ear=part(new THREE.ConeGeometry(.075,.28,5),hair,side*.14,1.83,-.015);ear.rotation.z=side*-.22;part(new THREE.SphereGeometry(.022,5,5),mat(0xc8a58d),side*.235,1.44,.05)}}
 if(r.name==='Argonian'){for(let i=0;i<3;i++){let crest=part(new THREE.ConeGeometry(.055,.18,5),mat(r.accent),0,1.81-i*.06,-.04-i*.07);crest.rotation.x=-.35}}
 if(r.name==='Orc'){for(const side of [-1,1]){let tusk=part(new THREE.ConeGeometry(.035,.12,5),mat(0xe4d6b9),side*.1,1.36,.2);tusk.rotation.z=Math.PI}}
 const staff=part(new THREE.CylinderGeometry(.025,.045,1.35,6),leather,.5,.75,.03);staff.rotation.z=-.1;
 const orb=part(new THREE.SphereGeometry(.09,8,7),goldMat,.52,1.42,.03);orb.material=goldMat;
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});root.userData={skin,cloth,cloak};return root;
}
let selectedCharacter=makeHumanoid(selectedRace);scene.add(selectedCharacter);
function updateCharacter(){if(selectedCharacter)scene.remove(selectedCharacter);selectedCharacter=makeHumanoid(selectedRace);scene.add(selectedCharacter);$('#preview-race').textContent=races[selectedRace].name.toUpperCase();$('#race-lore').textContent=`${races[selectedRace].lore}  ${races[selectedRace].bonus}.`;}
updateCharacter();

const player={x:0,z:43,yaw:0,pitch:.16,speed:5.4,health:100,gold:12,magicka:100};
selectedCharacter.position.set(player.x,groundY(player.x,player.z),player.z);
const npc=makeHumanoid(1,true);npc.position.set(1,groundY(1,29),29);scene.add(npc);
const keeper=makeHumanoid(0,true);keeper.position.set(29,groundY(29,25),25);keeper.userData.keeper=true;scene.add(keeper);
const interactPrompt=$('#interact-prompt'),dialogue=$('#dialogue'),toast=$('#toast');
let started=false,paused=false,journalOpen=false,questStage=0,toastTimer=0,dialogueDone=false;
const keys=new Set(),projectiles=[],enemies=[];
function makeWisp(x,z){const g=new THREE.Group();g.position.set(x,groundY(x,z)+1.2,z);scene.add(g);let core=addMesh(new THREE.IcosahedronGeometry(.42,1),new THREE.MeshStandardMaterial({color:0x8bc4d1,emissive:0x236b83,emissiveIntensity:1.6,roughness:.25}),0,0,0,g);for(let i=0;i<3;i++){let ring=addMesh(new THREE.TorusGeometry(.62+i*.1,.025,5,24),mat(0x9de2dc,.3,{emissive:0x387e79,emissiveIntensity:1}),0,0,0,g);ring.rotation.set(i*.8,i*1.1,0)}g.userData={hp:3,home:new THREE.Vector3(x,groundY(x,z)+1.2,z),phase:Math.random()*5,alive:true};enemies.push(g);return g}
makeWisp(-30,-26);makeWisp(48,-45);
function announce(text){toast.textContent=text;toast.classList.add('show');toastTimer=2.8}
function setQuest(title,objective){$('#quest-title').textContent=title;$('#quest-objective').textContent=objective}
function startGame(){
 if(started)return;started=true;$('#creation').classList.add('hidden');$('#hud').classList.remove('hidden');$('#mobile-controls').classList.remove('hidden');
 const name=$('#hero-name').value.trim()||'Wanderer';$('#dialogue-name').textContent=`${name.toUpperCase()} · ${races[selectedRace].name.toUpperCase()}`;
 $('#race-badge').textContent=races[selectedRace].bonus;$('#location-name').textContent='THE NORTHERN REACH';
 selectedCharacter.position.set(player.x,groundY(player.x,player.z),player.z);announce('THE NORTH REMEMBERS');drawMap();
}
$('#begin').addEventListener('click',startGame);
function endDialogue(){dialogue.classList.add('hidden');}
$('#dialogue-close').addEventListener('click',endDialogue);
function interact(){if(!started||paused||!interactTarget)return;
 if(interactTarget===npc){dialogue.classList.remove('hidden');$('#dialogue-name').textContent='MARA THE WAYFARER';if(!dialogueDone){$('#dialogue-text').textContent='The mountain has started singing again. Follow the old road to Hearthglen and ask the keeper about the Shattered Crown.';dialogueDone=true;questStage=Math.max(questStage,1);setQuest('THE SHATTERED CROWN','Reach Hearthglen and speak with the village keeper.');announce('QUEST UPDATED · THE SHATTERED CROWN')}else{$('#dialogue-text').textContent='Keep to the old road, friend. The pines are listening.'}return}
 if(interactTarget.userData?.alive&&interactTarget.userData?.hp!==undefined){announce('THE WISP RESISTS · USE WARDING FLAME');return}
 if(interactTarget.userData?.keeper){dialogue.classList.remove('hidden');$('#dialogue-name').textContent='ELDER ROWAN · HEARTHGLEN';if(questStage<2){$('#dialogue-text').textContent='The standing stones beyond the western rise are stirring. Find what woke them, and bring back a shard of the old crown.';questStage=2;setQuest('THE SHATTERED CROWN','Defeat the restless wisp at the standing stones.');announce('NEW OBJECTIVE · THE STANDING STONES')}else if(questStage===3){$('#dialogue-text').textContent='You found it. The first fragment is yours, and the old song has quieted. More shards lie beyond the reach of this valley.';questStage=4;setQuest('THE SHATTERED CROWN','The first fragment is found. Your legend continues.');announce('QUEST COMPLETE · THE SHATTERED CROWN')}else{$('#dialogue-text').textContent='The stones lie quiet now. Keep the shard close; the mountain has not finished speaking.'}return}
 if(interactTarget.userData?.shard){interactTarget.visible=false;interactTarget.userData.shard=false;questStage=3;player.gold+=30;$('#gold-count').textContent=player.gold;setQuest('THE SHATTERED CROWN','Return to Elder Rowan in Hearthglen.');announce('CROWN SHARD FOUND · +30 SEPTIMS');return}
}
$('#journal-close').onclick=()=>{journalOpen=false;$('#journal').classList.add('hidden')};
$('#resume').onclick=()=>{$('#start-overlay').classList.add('hidden');paused=false};
$('#restart').onclick=()=>location.reload();
function toggleJournal(){if(!started)return;journalOpen=!journalOpen;$('#journal').classList.toggle('hidden',!journalOpen);}
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='KeyJ')toggleJournal();if(e.code==='Escape'&&started&&!journalOpen){paused=!paused;$('#start-overlay').classList.toggle('hidden',!paused)}if(e.code==='Space'&&started&&!paused)player.jump=5.8;if(e.code==='KeyQ')castSpell()});
addEventListener('keyup',e=>keys.delete(e.code));
let dragging=false,lastX=0,lastY=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(!started||paused)return;dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging||!started)return;player.yaw-=(e.clientX-lastX)*.004;player.pitch=THREE.MathUtils.clamp(player.pitch+(e.clientY-lastY)*.003,-.08,.65);lastX=e.clientX;lastY=e.clientY});
renderer.domElement.addEventListener('click',()=>{if(started&&!paused)castSpell()});
const joy=$('#joystick'),knob=joy.querySelector('.joy-knob');let joyVec={x:0,y:0};
joy.addEventListener('pointerdown',e=>{joy.setPointerCapture(e.pointerId);joy.dataset.active='1';moveJoy(e)});joy.addEventListener('pointermove',e=>{if(joy.dataset.active)moveJoy(e)});joy.addEventListener('pointerup',()=>{joy.dataset.active='';joyVec={x:0,y:0};knob.style.transform='translate(-50%,-50%)'});function moveJoy(e){let r=joy.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2),d=Math.hypot(x,y),k=Math.min(1,42/Math.max(1,d));joyVec={x:x*k/42,y:y*k/42};knob.style.transform=`translate(calc(-50% + ${joyVec.x*39}px),calc(-50% + ${joyVec.y*39}px))`}
$('#mobile-use').onclick=interact;$('#mobile-cast').onclick=castSpell;

let interactTarget=null;
function updateTargets(){let candidates=[npc,...scene.children.filter(o=>o.userData?.keeper||o.userData?.shard)];interactTarget=null;let best=3.1;for(const o of candidates){if(!o.visible)continue;const d=Math.hypot(o.position.x-player.x,o.position.z-player.z);if(d<best){best=d;interactTarget=o}}if(enemies.some(e=>e.userData.alive&&Math.hypot(e.position.x-player.x,e.position.z-player.z)<2.2)&&questStage>=2)interactTarget=enemies.find(e=>e.userData.alive&&Math.hypot(e.position.x-player.x,e.position.z-player.z)<2.2);interactPrompt.classList.toggle('hidden',!interactTarget);if(interactTarget){$('#interact-text').textContent=interactTarget===npc?'Speak to Mara':interactTarget.userData?.keeper?'Speak to Elder Rowan':interactTarget.userData?.shard?'Take the crown shard':'Dispel the wisp'}}
function castSpell(){if(!started||paused||dialogue&&!dialogue.classList.contains('hidden')||player.magicka<12)return;player.magicka-=12;const origin=selectedCharacter.position.clone();origin.y+=1.2;const dir=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));let p=addMesh(new THREE.SphereGeometry(.17,10,8),new THREE.MeshBasicMaterial({color:0xffd989}),origin.x,origin.y,origin.z);p.userData={v:dir.multiplyScalar(17),life:2};projectiles.push(p);announce('WARDING FLAME');}
function drawMap(){const c=$('#minimap'),ctx=c.getContext('2d');ctx.clearRect(0,0,140,140);ctx.fillStyle='#20332b';ctx.fillRect(0,0,140,140);ctx.strokeStyle='#978767';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(20,120);ctx.bezierCurveTo(55,80,74,89,79,51);ctx.bezierCurveTo(83,31,104,28,125,13);ctx.stroke();ctx.fillStyle='#bba66e';for(const [x,y] of [[82,60],[104,54],[70,72],[60,68]]){ctx.fillRect(x,y,3,3)}ctx.strokeStyle='#618890';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(106,0);ctx.lineTo(99,47);ctx.stroke()}
drawMap();

let lastDamage=0,locationFound=false;
function makeShard(x,z){const g=new THREE.Group();g.position.set(x,groundY(x,z)+.65,z);scene.add(g);let shard=addMesh(new THREE.OctahedronGeometry(.42,0),new THREE.MeshStandardMaterial({color:0x9fe5df,emissive:0x318e91,emissiveIntensity:1.9,metalness:.3,roughness:.2}),0,0,0,g);shard.rotation.z=.3;g.userData.shard=true;g.add(new THREE.PointLight(0x58c9c4,2,8));return g}
function damageWisp(enemy){if(!enemy.userData.alive)return;enemy.userData.hp--;enemy.scale.setScalar(.78);setTimeout(()=>{if(enemy.userData.alive)enemy.scale.setScalar(1)},100);if(enemy.userData.hp<=0){enemy.userData.alive=false;scene.remove(enemy);makeShard(enemy.position.x,enemy.position.z);questStage=3;setQuest('THE SHATTERED CROWN','Take the crown shard and return to Hearthglen.');announce('THE WISP IS DISPELLED')}}
function movePlayer(dt){
 if(!started||paused||journalOpen||!dialogue.classList.contains('hidden'))return;
 let f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joyVec.y;
 let side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joyVec.x;
 const len=Math.hypot(f,side);if(len>1){f/=len;side/=len}
 const speed=player.speed*(keys.has('ShiftLeft')?1.45:1),fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw),rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);
 const nx=player.x+(fx*f+rx*side)*speed*dt,nz=player.z+(fz*f+rz*side)*speed*dt;
 if(Math.abs(nx)<91&&Math.abs(nz)<91){player.x=nx;player.z=nz}
 const floor=groundY(player.x,player.z);player.jumpV??=0;if(player.jump){player.jumpV=player.jump;player.jump=0}player.jumpV-=15*dt;player.jumpHeight=Math.max(0,(player.jumpHeight||0)+player.jumpV*dt);if(player.jumpHeight===0)player.jumpV=0;
 selectedCharacter.position.set(player.x,floor+player.jumpHeight,player.z);selectedCharacter.rotation.y=Math.PI+player.yaw;
}
function updateWorld(dt,t){
 motes.forEach(({o,base,phase})=>{o.position.y=base+Math.sin(t*.8+phase)*.34;o.position.x+=Math.sin(t*.17+phase)*dt*.12});
 npc.rotation.y=Math.sin(t*.45)*.13;keeper.rotation.y=Math.PI+Math.sin(t*.4)*.1;
 for(const enemy of enemies){if(!enemy.userData.alive)continue;const d=Math.hypot(player.x-enemy.position.x,player.z-enemy.position.z);enemy.rotation.y=t*.4+enemy.userData.phase;enemy.position.y=enemy.userData.home.y+Math.sin(t*2+enemy.userData.phase)*.23;if(started&&questStage>=2&&d<13){const dx=player.x-enemy.position.x,dz=player.z-enemy.position.z,step=Math.min(dt*1.25,Math.max(0,d-1.6));enemy.position.x+=dx/d*step;enemy.position.z+=dz/d*step;if(d<1.6&&t-lastDamage>1.3){lastDamage=t;player.health=Math.max(0,player.health-(races[selectedRace].name==='Orc'?7:10));$('#health-value').textContent=player.health;$('#health-fill').style.width=`${player.health}%`;if(player.health===0){player.health=100;$('#health-value').textContent='100';$('#health-fill').style.width='100%';player.x=0;player.z=43;announce('YOU CATCH YOUR BREATH · RETURNED TO THE ROAD')}}}}
 for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.position.addScaledVector(p.userData.v,dt);p.userData.life-=dt;let hit=false;for(const enemy of enemies){if(enemy.userData.alive&&p.position.distanceTo(enemy.position)<1){damageWisp(enemy);hit=true;break}}if(hit||p.userData.life<=0){scene.remove(p);projectiles.splice(i,1)}}
 if(started&&!locationFound&&Math.hypot(player.x-26,player.z-18)<14){locationFound=true;$('#location-name').textContent='HEARTHGLEN';announce('LOCATION DISCOVERED · HEARTHGLEN')}
 updateTargets();
}
function updateCamera(){if(!started){const target=new THREE.Vector3(0,1.12,0);camera.position.set(3.2,2.1,5.4);camera.lookAt(target);selectedCharacter.position.set(0,groundY(0,0),0);selectedCharacter.rotation.y=-.12;return}
 const target=new THREE.Vector3(player.x,groundY(player.x,player.z)+1.15+(player.jumpHeight||0),player.z),distance=6.4;
 camera.position.set(target.x+Math.sin(player.yaw)*distance,target.y+2.35+player.pitch*2,target.z+Math.cos(player.yaw)*distance);camera.lookAt(target);
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toast.classList.remove('show')}movePlayer(dt);updateWorld(dt,t);updateCamera();renderer.render(scene,camera)}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight)}
addEventListener('resize',resize);animate();
