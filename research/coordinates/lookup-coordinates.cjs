const fs=require('fs');
const rows=`大邱國際機場|대구 동구 공항로 221|機場
伊爾迪斯麗晶飯店|대구 중구 달구벌대로 2033|住宿
Greenvill汗蒸幕|대구광역시 중구 남산동 665|使用者確認地址
西門市場|대구 중구 큰장로26길 45|市場
青蘿之丘|대구 중구 달구벌대로 2029|景點
桂山聖堂|대구 중구 서성로 10|景點
藥令博物館|대구 중구 달구벌대로415길 49|景點
東城路商圈|대구 동성로|街區參考
Spark Land|대구 중구 동성로6길 61|景點
BUTTERBAKE|대구 중구 동성로 22-1|餐飲
Ordinary House|대구 중구 동성로2길 21-8|餐飲
巨松燉排骨本店|대구 중구 남성로 40|餐飲
樂天超市南山店|대구 중구 달구벌대로 1936|候選店營業待核
emart24青蘿之丘店|대구 이마트24 청라언덕점|分店地址待核
金光石壁畫路|대구 김광석다시그리기길|入口需確認
七星夜市|대구 북구 칠성동1가 276-1|河畔參考區
E-World|대구 달서구 두류공원로 200|園區
83塔|대구 83타워|園內景點
前山公園|대구 앞산공원|公園參考
前山纜車下站|대구 남구 앞산순환로 574-114|纜車
前山展望台|대구 앞산전망대|山頂景點
花園樓Mansion 5 Suseong|대구 수성구 청수로 73|餐飲
國一牛骨湯飯|대구 중구 국채보상로 571|餐飲
東大邱站|대구 동대구역|鐵路站
東大邱複合換乘中心|대구 동구 동부로 149|客運月台入口待核
慶州高速巴士客運站|경북 경주시 태종로 688|依車票確認站別
慶州市外巴士客運站|경주 시외버스터미널|依車票確認站別
佛國寺|경북 경주시 불국로 385|寺院非入口保證
統一殿|경북 경주시 칠불암길 6|景點
統一殿銀杏大道|경주 통일전 은행나무길|道路參考
皇理團路|경북 경주시 포석로 1080|街區參考餐廳未定
大陵苑|경북 경주시 계림로 9|園區
瞻星臺|경북 경주시 첨성로 140-25|景點
東宮與月池|경북 경주시 원화로 102|園區
八公山纜車下站|대구 동구 팔공산로185길 51|纜車
Solmaru山頂餐廳|대구 팔공산 솔마루|山頂餐廳
山中食堂|대구 팔공산 산중식당|分店待核
桐華寺|대구 동구 동화사1길 1|寺院
新世界百貨大邱店|대구 동구 동부로 149|建物
大邱水族館9樓|대구 동구 동부로 149|共用百貨座標9樓
新世界B1食品超市|대구 동구 동부로 149|共用百貨座標B1
花亭炭火排骨Venture Valley店|대구 동구 동부로30길 76|餐飲
點點心新世界9樓|대구 동구 동부로 149|共用百貨座標9樓
兔子亭新世界8樓|대구 동구 동부로 149|共用百貨座標8樓
Sapa Kitchen|대구 동구 동부로34길 10|餐飲
星巴克鐘路古宅店|대구 중구 중앙대로77길 22|餐飲
慶尚監營公園|대구 경상감영공원|公園
新羅食堂本店|대구 중구 중앙대로 406-8|餐飲
藥田蔘雞湯|대구 중구 달구벌대로415길 54|餐飲
現代百貨大邱店|대구 중구 달구벌대로 2077|百貨
近代胡同豆沙麵包總店|대구 중구 남성로 7-1|餐飲
MUSINSA STANDARD東城路|대구 중구 동성로 25|門市
Olive Young原稿門市|대구 중구 동성로5길 33|分店與營業待核
藥令市|대구 약령시|街區
青蘿之丘站|대구 청라언덕역|轉乘站
半月堂站|대구 반월당역|轉乘站
中央路站|대구 중앙로역|轉乘站
西門市場站|대구 서문시장역|轉乘站
七星市場站|대구 칠성시장역|轉乘站
頭流站|대구 두류역|轉乘站
大邱站|대구 대구역|轉乘站
峨洋橋站|대구 아양교역|轉乘站
Top Mart大邱店|대구 탑마트 대구점|原文已排除停業資訊待核
啟明大學|대구 계명대학교|原文已排除多校區
壽城池|대구 수성못|原文已排除
安吉朗|대구 안지랑곱창골목|原文已排除街區`.split('\n').map((line,i)=>{const [name,query,note]=line.split('|');return{id:i+1,name,query,note}});
const endpoint='https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
async function lookup(row){
 const url=new URL(endpoint);Object.entries({SingleLine:row.query,f:'json',outFields:'Match_addr,Addr_type,PlaceName',maxLocations:'1',sourceCountry:'KOR',outSR:'4326'}).forEach(([k,v])=>url.searchParams.set(k,v));
 try{const r=await fetch(url);if(!r.ok)throw Error(r.status);const data=await r.json();const c=data.candidates?.[0];Object.assign(row,{source:url.href,candidate:c||null});}catch(e){row.error=String(e)}
}
(async()=>{for(let i=0;i<rows.length;i+=5)await Promise.all(rows.slice(i,i+5).map(lookup));fs.writeFileSync('coordinates-research.json',JSON.stringify({date:'2026-10-24',coordinateSystem:'WGS84 (EPSG:4326)',provider:'Esri ArcGIS World Geocoding Service',places:rows},null,2));console.log(rows.map(r=>`${r.id}|${r.name}|${r.candidate?.location.y??''},${r.candidate?.location.x??''}|${r.candidate?.score??''}|${r.candidate?.attributes.Addr_type??''}|${r.candidate?.address??r.error??'no result'}|${r.note}`).join('\n'))})();
