// Simplemaps + CSV choropleth for your columns

(function () {
    // State name ↔ code maps
    const NAME_TO_CODE = {
      "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","District of Columbia":"DC",
      "Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA",
      "Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE",
      "Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK",
      "Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT",
      "Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"
    };
    const CODE_TO_NAME = Object.fromEntries(Object.entries(NAME_TO_CODE).map(([k,v])=>[v,k]));
  
    const selMetric = document.getElementById("metric");
    const legendEl  = document.getElementById("legend");
  
    // robust numeric parser
    const num = (x) => {
      if (x == null) return NaN;
      const s = String(x).trim().replace(/[,\s%]/g, "");
      const v = +s;
      return Number.isFinite(v) ? v : NaN;
    };
    const niceLabel = (k) => k.replace(/_/g, " ").replace(/\b\w/g, c=>c.toUpperCase());
  
    function init() {
      d3.csv("data/trees.csv").then(rows => {
        if (!rows.length) throw new Error("CSV has no rows.");
  
        // normalize headers → lowercase keys
        rows = rows.map(r => {
          const o = {};
          for (const [k,v] of Object.entries(r)) o[k.trim().toLowerCase()] = v;
          return o;
        });
  
        // derive code from 'state' full name if needed
        rows.forEach(r => {
          if (!r.code && r.state) {
            const code = NAME_TO_CODE[r.state.trim()];
            if (code) r.code = code;
          }
        });
  
        // find numeric columns (skip id-like columns)
        const skip = new Set(["state","code","name","region"]);
        const keys  = Object.keys(rows[0]).filter(k => !skip.has(k));
        const numericKeys = keys.filter(k => rows.some(row => Number.isFinite(num(row[k]))));
        if (!numericKeys.length) throw new Error("No numeric columns found.");
  
        // populate dropdown
        selMetric.innerHTML = numericKeys.map(k => `<option value="${k}">${niceLabel(k)}</option>`).join("");
  
        // default metric → canopy percentage if present
        const defaultMetric = numericKeys.includes("canopy_cover_pct") ? "canopy_cover_pct" : numericKeys[0];
        selMetric.value = defaultMetric;
  
        render(defaultMetric);
        selMetric.addEventListener("change", () => render(selMetric.value));
  
        function render(metric) {
          // values + lookup by USPS code
          const values = [];
          const byCode = new Map();
          rows.forEach(r => {
            const code = (r.code || "").trim().toUpperCase();
            if (!code) return;
            const v = num(r[metric]);
            if (Number.isFinite(v)) values.push(v);
            byCode.set(code, { v, r });
          });
  
          // quantile color scale
          const scheme = ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'];
          const color = d3.scaleQuantile().domain(values).range(scheme);

  
          // fill Simplemaps config
          simplemaps_usmap_mapdata.state_specific = simplemaps_usmap_mapdata.state_specific || {};
          for (const code in CODE_TO_NAME) {
            const name = CODE_TO_NAME[code];
            const cur = simplemaps_usmap_mapdata.state_specific[code] || {};
            const rec = byCode.get(code);
            const v = rec ? rec.v : NaN;
          
            cur.name = name;                                    // title uses this
            cur.color = Number.isFinite(v) ? color(v) : "#eeeeee";
            cur.hover_color = cur.color;                        // same color on hover
            cur.description = Number.isFinite(v)
              ? `${niceLabel(metric)}: ${d3.format(".3~g")(v)}` // no duplicate name
              : `No data`;
          
            simplemaps_usmap_mapdata.state_specific[code] = cur;
          }
  
          // render / refresh
          if (window.simplemaps_usmap && typeof simplemaps_usmap.load === "function") {
            if (document.getElementById("map_holder")) simplemaps_usmap.refresh();
            else simplemaps_usmap.load();
          }
  
          drawLegend(values, color, niceLabel(metric));
        }
  
        function drawLegend(values, color, title) {
          if (!legendEl || !values.length) return;
          legendEl.innerHTML = "";
          const wrap = document.createElement("div");
          const ttl = document.createElement("div");
          ttl.className = "legend-title";
          ttl.textContent = title;
          wrap.appendChild(ttl);
  
          const bins = [d3.min(values), ...color.quantiles(), d3.max(values)];
          const bar = document.createElement("div");
          bar.className = "legend-bar";
          for (let i=0; i<bins.length-1; i++) {
            const seg = document.createElement("span");
            seg.className = "legend-seg";
            seg.style.background = color((bins[i]+bins[i+1])/2);
            seg.title = `${d3.format(".3~g")(bins[i])} – ${d3.format(".3~g")(bins[i+1])}`;
            bar.appendChild(seg);
          }
          wrap.appendChild(bar);
  
          const ticks = document.createElement("div");
          ticks.className = "legend-ticks";
          bins.forEach(b => {
            const t = document.createElement("span");
            t.textContent = d3.format(".3~g")(b);
            ticks.appendChild(t);
          });
          wrap.appendChild(ticks);
  
          legendEl.appendChild(wrap);
        }
      })
      .catch(err => {
        alert("Failed to load CSV: " + (err?.message || err));
        console.error(err);
      });
    }
  
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  })();  