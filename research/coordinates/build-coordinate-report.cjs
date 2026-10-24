const fs=require('fs');
const data=JSON.parse(fs.readFileSync('coordinates-research.json','utf8'));
const rows=data.places;
const refinements=JSON.parse(fs.readFileSync('coordinates-refinements-2.json','utf8').replace(/^\uFEFF/,''));
const stations=JSON.parse(fs.readFileSync('coordinates-stations.json','utf8').replace(/^\uFEFF/,''));
for(const r of rows){const c=r.candidate;r.lat=c?.location.y;r.lng=c?.location.x;r.status=c?.score===100?'門牌比對':'待核';if(c?.attributes.Addr_type==='POI'&&c.score===100)r.status='地標比對';if(c?.attributes.Addr_type==='StreetName')r.status='街區參考';}
function fix(id,lat,lng,status,source,note){Object.assign(rows.find(r=>r.id===id),{lat,lng,status,source,...(note?{note}:{})});}
function ref(id,q,status,note,index=0){const r=refinements.find(r=>r.q===q),c=r.candidates[index];fix(id,c.location.y,c.location.x,status,r.source,note);}
fix(2,35.8666117838159,128.586073713096,'官方地點','https://chinese.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=95386','已實測中文標記；觀光公社座標');
ref(15,'대구 중구 달구벌대로 2238','門牌參考','官方旅遊資料列此址；街道入口仍待現場確認');
fix(18,35.8532380108522,128.566562041733,'官方地點','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=77261','83塔本體；不與E-World入口共用座標');
fix(20,35.8243584948926,128.587135911946,'官方地點','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=68080','觀光公社纜車參考點；不是山頂展望台');
ref(27,'경북 경주시 강변로 184','門牌比對','慶州市官方確認地址；與高速巴士站分開列出');
fix(37,35.990286858,128.693961864,'候選地標',JSON.parse(fs.readFileSync('coordinates-refinements.json','utf8').replace(/^\uFEFF/,'' )).find(r=>r.q==='산중식당').source,'同名店家可能存在，分店仍需確認');
fix(54,rows[6].lat,rows[6].lng,'街區參考',rows[6].source,'以藥令博物館作街區到訪參考，不代表整個藥令市');
const stationIds={55:'40229',56:'40130',57:'40131',58:'40336',59:'40133',60:'40226',61:'40132',62:'40137'};
for(const [id,key]of Object.entries(stationIds)){const s=stations.find(s=>s.id===key);fix(+id,s.lat,s.lng,'Naver車站',s.source,'車站中心參考；非指定出口');}
fix(65,35.8267975731041,128.612847307235,'官方地點','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=68482','原文已排除；觀光公社遊園區參考點，不代表湖中心');
for(const id of [21,30,36,66]){const r=rows.find(r=>r.id===id);r.rejectedCandidate=r.candidate;r.lat=null;r.lng=null;r.status='未確認';r.note+={21:'；首次匹配到不相關展望台，已拒用。官方纜車座標位於下站，不能代替山頂',30:'；首次匹配到安康邑同名道路，已拒用。不能將統一殿建物當成整條銀杏大道',36:'；首次匹配到市區同名店，已拒用。不能以纜車下站代替山頂餐廳',66:'；原文已排除；目前匹配到安吉朗區域，未核實指定街區入口'}[id];}
const subway=stations.find(s=>s.id==='40135');
rows.push({id:67,name:'東大邱地鐵站（1號線）',query:'동대구역 1호선',lat:subway.lat,lng:subway.lng,status:'Naver車站',note:'轉乘用，與東大邱鐵路站分開；非指定出口',source:subway.source});
const unresolved=[
 ['半月堂醫美診所','名稱、地址未提供，無法查唯一座標'],
 ['橋村炸雞','未指定配送或外帶門市；飯店收餐點不等於門市'],
 ['皇理團路午餐餐廳','僅指定街區，未指定店家'],
 ['E-World園內餐廳','未指定店家'],
 ['第五天晚餐餐廳','僅指定東城路或飯店沿途，未指定店家'],
 ['SPAO、TOP10、ALAND、ARTBOX','僅列品牌，未指定分店'],
 ['大樹屋蔘雞湯','僅在文字中作辨別用，非安排店家，未提供分店'],
 ['啟明大學其他校區','目前比對為城西校區，原文未指定校區且已排除'],
 ['八公山山區、慶州古城、飯店附近散步','屬範圍描述，沒有唯一座標'],
 ['佛國寺青雲橋、大雄寶殿','寺內參觀項目，尚未取得可核對的個別座標；不以佛國寺門牌冒充'],
 ['桃園機場T1','航班端點，非韓國景點；已另以台灣區域查詢，未返回可採用的航廈座標']
];
const output={date:'2026-10-24',coordinateSystem:'WGS84 (EPSG:4326)',method:'門牌與地標地理編碼、官方頁面座標；不等同逐一核實店家仍營業或步行入口',places:rows,unspecified:unresolved};
fs.writeFileSync('coordinates-reviewed.json',JSON.stringify(output,null,2));
const n=rows.filter(r=>r.lat!==null&&r.lat!==undefined).length;
let md=`# 行程地點與座標查詢結果\n\n查詢日期：2026-10-24。座標順序：緯度、經度（WGS84）。\n\n共 ${rows.length} 筆具名地點／設施，${n} 筆取得地點或參考座標，${rows.length-n} 筆未確認；另列未指定分店、區域與寺內項目。重複到訪合併，樓層設施保留獨立名稱。未修改網站、未發布。\n\n## 判讀方式\n\n- 門牌比對：Esri 可將行程地址匹配到門牌，**不代表已獨立確認該店仍位於此處**。\n- 官方地點／Naver車站：座標取自觀光公社或 Naver 車站頁。\n- 街區參考／門牌參考：僅供到訪範圍辨識，不能當作精確入口。\n- 候選地標／分店待核：不能直接視為已確認的店家位置。\n- 未確認：已查詢但結果不符；不列可能誤導的座標。\n- 建物內各樓層共用建物座標；寺院、公園、機場的門牌不保證是遊客入口。\n\n## 完整清單\n\n|編號|地點|緯度|經度|判讀|備註|來源|\n|---|---|---:|---:|---|---|---|\n`;
for(const r of rows)md+=`|${r.id}|${r.name}|${r.lat==null?'—':r.lat.toFixed(6)}|${r.lng==null?'—':r.lng.toFixed(6)}|${r.status}|${r.note}|[查詢來源](${r.source})|\n`;
md+='\n## 尚無唯一地點的項目\n\n|項目|狀態|\n|---|---|\n'+unresolved.map(([a,b])=>`|${a}|${b}|`).join('\n');
md+='\n\n## 地址核對補充\n\n- 慶州市外巴士站地址依[慶州市政府](https://www.gyeongju.go.kr/webzine/GJstory/vol154/html/sub1-4.html)列為 강변로 184。\n- 金光石路門牌依[大邱官方旅遊資料](https://tour.daegu.go.kr/file/d23e2a2b167e4ce6b10b3f8f31ffefec.pdf)列為 달구벌대로 2238，仍須確認入口。\n- 原始結果、錯誤候選、比對分數與修正來源保留於 JSON 檔，可追溯每筆取捨。\n';
fs.writeFileSync('coordinates-report.md',md);console.log(`${rows.length} places, ${n} coordinates, ${rows.length-n} unresolved`);
