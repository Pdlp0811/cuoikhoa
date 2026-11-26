import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dna, FlaskConical, Satellite, Swords, Clock3, Sprout, Waves, ThermometerSun, Droplets, MapPin, FileText } from "lucide-react";
import heroImg from "@/assets/hero-mekong-satellite.jpg";
import earthImg from "@/assets/earth-orbit-satellite.jpg";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useClimate } from "@/lib/use-climate";
import { useFarm } from "@/lib/farm-store";
import { ProvBadge } from "@/components/agri/ui";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriShift – Your Farm, Your Future | Mô phỏng trang trại tương lai" },
      {
        name: "description",
        content:
          "AgriShift helps Vietnamese farmers test climate scenarios and crop rotations with real NASA POWER data before they plant.",
      },
      { property: "og:title", content: "AgriShift – Your Farm, Your Future" },
      { property: "og:description", content: "Test before you plant: NASA-powered climate scenarios and crop rotation comparisons for Vietnamese farms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function LiveReadout() {
  const t = useT();
  const { profile } = useFarm();
  const c = useClimate();
  const months = c.clim?.months ?? [];
  const meanT = months.length ? months.reduce((a, m) => a + (m.t2m ?? 0), 0) / 12 : null;
  const rain = months.length ? months.reduce((a, m) => a + (m.rainMm ?? 0), 0) : null;
  const soil = months.length ? months.reduce((a, m) => a + (m.gwetRoot ?? 0), 0) / 12 : null;
  const cells = [
    { icon: <ThermometerSun />, tone: "text-heat", bar: "bg-heat", value: meanT != null ? `${meanT.toFixed(1)}°` : "—", label: t("Nhiệt TB", "Mean temp"), pct: meanT != null ? Math.min(100, (meanT / 35) * 100) : 0 },
    { icon: <Droplets />, tone: "text-rain", bar: "bg-rain", value: rain ? Math.round(rain).toLocaleString("en-US") : "—", label: t("mm mưa/năm", "mm rain/yr"), pct: rain ? Math.min(100, (rain / 2500) * 100) : 0 },
    { icon: <Waves />, tone: "text-emerald", bar: "bg-emerald", value: soil ? soil.toFixed(2) : "—", label: t("Ẩm đất rễ", "Root soil wet."), pct: soil ? soil * 100 : 0 },
  ];
  return (
    <div className="relative w-full max-w-sm animate-rise rounded-2xl border border-deep-foreground/15 bg-deep/70 p-6 text-deep-foreground shadow-elevated backdrop-blur-xl [animation-delay:200ms] md:p-6">
      <span className="hud-corner tl" />
      <span className="hud-corner tr" />
      <span className="hud-corner bl" />
      <span className="hud-corner br" />
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-emerald">
          <span className="size-2 rounded-full bg-emerald animate-pulse-ring" /> {t("Đọc trực tiếp", "Live readout")}
        </p>
        {c.status === "ok" && <ProvBadge kind="real" />}
        {c.status === "demo" && <ProvBadge kind="demo" />}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-deep-muted">
        <MapPin className="size-3.5" /> {profile.locationName} · <span className="font-mono text-xs">{profile.lat.toFixed(2)}°N {profile.lon.toFixed(2)}°E</span>
      </p>
      {c.status === "loading" || c.status === "idle" ? (
        <div className="mt-4 space-y-2">
          <p className="font-mono text-xs text-deep-muted">{t("Đang kết nối NASA POWER…", "Connecting to NASA POWER…")}</p>
          <div className="h-1 overflow-hidden rounded-full bg-deep-foreground/10">
            <div className="h-full w-1/3 animate-[ticker_1.4s_linear_infinite] rounded-full bg-gradient-emerald" />
          </div>
        </div>
      ) : c.status === "error" ? (
        <p className="mt-4 text-sm text-deep-muted">{t("Chưa lấy được dữ liệu NASA. Thử lại trong trang Trang trại.", "NASA data unavailable right now. Retry from the Farm page.")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {cells.map((x) => (
            <div key={x.label} className="rounded-xl border border-deep-foreground/10 bg-deep-foreground/[0.03] p-2.5">
              <span className={`[&_svg]:size-4 ${x.tone}`}>{x.icon}</span>
              <p className="mt-1 font-display text-2xl tabular-nums">{x.value}</p>
              <p className="text-[10.5px] leading-tight text-deep-muted">{x.label}</p>
              <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-deep-foreground/10">
                <div className={`h-full ${x.bar} transition-[width] duration-1000`} style={{ width: `${x.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {c.clim && c.clim.source === "nasa" && (
        <p className="mt-4 border-t border-deep-foreground/10 pt-3 font-mono text-[10px] text-deep-muted">
          NASA POWER · {c.clim.startYear}–{c.clim.endYear} · {t("trung bình 10 năm", "10-year mean")}
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children, tone = "text-emerald" }: { children: ReactNode; tone?: string }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] ${tone}`}>
      <span className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}

function Telemetry() {
  const items = [
    "T2M", "T2M_MIN", "T2M_MAX", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN", "GWETROOT", "GWETTOP", "MERRA-2", "0.5° × 0.625°", "COMMUNITY=AG", "10-YR CLIMATOLOGY",
  ];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border bg-deep/80 py-3" aria-hidden="true">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-deep to-transparent" />
      <div className="flex w-max animate-ticker gap-10 font-mono text-[11px] uppercase tracking-[0.2em] text-deep-muted">
        {row.map((x, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={i % 3 === 0 ? "text-emerald" : ""}>{x}</span>
            <span className="size-1 rounded-full bg-deep-foreground/25" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const t = useT();
  const modules = [
    {
      to: "/time-machine" as const,
      icon: <Clock3 />,
      title: "Climate Time Machine",
      sub: t("Cỗ máy thời gian khí hậu", "Hypothetical climate simulator"),
      body: t(
        "Kéo thanh nhiệt độ (0 đến +4°C) và lượng mưa (−40% đến +40%) để xem khí hậu nền từ NASA thay đổi ra sao và cây trồng nào gặp rủi ro.",
        "Drag temperature (0 to +4°C) and rainfall (−40% to +40%) to see how the NASA baseline shifts and which crops face risk.",
      ),
    },
    {
      to: "/scenarios" as const,
      icon: <FlaskConical />,
      title: "What If Builder",
      sub: t("Thử phương án luân canh", "Test rotation strategies"),
      body: t(
        "So sánh lúa liên tục, lúa – đậu xanh và lúa – ngô: ưu, nhược điểm, nhu cầu nước, đất và rủi ro khí hậu kèm lý do chấm điểm.",
        "Compare continuous rice, rice–mung bean and rice–maize: pros, cons, water, soil and climate risks with scoring rationale.",
      ),
    },
    {
      to: "/crops" as const,
      icon: <Dna />,
      title: "Crop DNA",
      sub: t("Hồ sơ cây trồng có nguồn", "Sourced crop profiles"),
      body: t(
        "Lúa, đậu xanh, đậu nành, ngô — nhu cầu nước, thời gian sinh trưởng, độ nhạy hạn/úng, yêu cầu đất. Mỗi giá trị ghi rõ có nguồn hay minh họa.",
        "Rice, mung bean, soybean, maize — water, duration, drought/flood sensitivity, soil needs. Every value marked sourced or illustrative.",
      ),
    },
    {
      to: "/battle" as const,
      icon: <Swords />,
      title: "Farm Battle",
      sub: t("Đối đầu minh bạch", "Transparent showdown"),
      body: t(
        "Biểu đồ radar, bảng so sánh và trọng số tự điều chỉnh. Xem chính xác mỗi tiêu chí đóng góp bao nhiêu điểm.",
        "Radar charts, comparison tables and adjustable weights. See exactly how many points each criterion contributes.",
      ),
    },
  ];
  const steps = [
    { icon: <MapPin />, vi: "Chọn vị trí trang trại", en: "Pick farm location" },
    { icon: <Satellite />, vi: "Truy xuất dữ liệu NASA", en: "Retrieve NASA data" },
    { icon: <ThermometerSun />, vi: "Phân tích khí hậu", en: "Analyse climate" },
    { icon: <FlaskConical />, vi: "Tạo kịch bản giả định", en: "Build a scenario" },
    { icon: <Swords />, vi: "So sánh luân canh", en: "Compare rotations" },
    { icon: <FileText />, vi: "Xuất báo cáo", en: "Generate report" },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative -mt-16 min-h-[94vh] overflow-hidden pt-16 text-deep-foreground">
        <img src={heroImg} alt={t("Ảnh vệ tinh ruộng lúa Đồng bằng sông Cửu Long", "Satellite view of Mekong Delta rice fields")} width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover animate-[hero-zoom_30s_ease-out_both]" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 animate-scan bg-gradient-to-b from-transparent via-emerald/[0.06] to-transparent" />
        {/* Target reticle over the paddy */}
        <div aria-hidden="true" className="pointer-events-none absolute right-[14%] top-[18%] hidden size-40 xl:block">
          <div className="absolute inset-0 rounded-full border border-emerald/40 animate-pulse-ring" />
          <div className="absolute inset-6 rounded-full border border-dashed border-cyan/40 animate-orbit" />
          <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald shadow-glow" />
          <span className="absolute -left-36 top-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald">TARGET · MEKONG</span>
        </div>
        <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-4 pb-20 pt-24 sm:px-6 md:pt-36 lg:grid-cols-[1.4fr_1fr]">
          <div className="stagger">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-emerald">
              <span className="rounded-md border border-emerald/40 bg-emerald/10 p-1"><Satellite className="size-3.5" /></span> NASA Earth Observation · Việt Nam
            </p>
            <h1 className="mt-6 text-5xl font-medium leading-[0.95] sm:text-7xl lg:text-[6.5rem]">
              Your Farm,
              <br />
              <span className="text-gradient-emerald">Your Future.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-deep-foreground/85">
              {t(
                "Trang trại của bạn, tương lai của bạn. Thử trước khi gieo — mô phỏng khí hậu và so sánh phương án luân canh bằng dữ liệu NASA thật cho đúng thửa ruộng của bạn.",
                "Test before you plant — simulate climate conditions and compare crop rotations using real NASA data for your exact field.",
              )}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/farm">
                  Explore Your Farm <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="deep" size="xl">
                <Link to="/time-machine">{t("Mở Cỗ máy thời gian", "Open the Time Machine")}</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-deep-foreground/10 pt-6">
              {[
                ["10", t("năm dữ liệu", "years of data")],
                ["7", t("thông số NASA", "NASA parameters")],
                ["4", t("cây trồng", "crops modelled")],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-medium text-deep-foreground">{n}</dt>
                  <dd className="mt-1 font-mono text-[10px] uppercase tracking-wider text-deep-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex lg:justify-end">
            <LiveReadout />
          </div>
        </div>
      </section>

      <Telemetry />

      {/* PROBLEM */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 md:py-32 lg:grid-cols-[1fr_1.2fr]">
          <div className="reveal">
            <SectionLabel>{t("Vấn đề", "The problem")}</SectionLabel>
            <h2 className="mt-5 text-4xl font-medium leading-[1.05] md:text-5xl">
              {t("Khí hậu thay đổi nhanh hơn kinh nghiệm canh tác truyền thống.", "Climate is shifting faster than traditional farming experience.")}
            </h2>
          </div>
          <div className="reveal space-y-8 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              {t(
                "Đồng bằng sông Cửu Long và Đồng bằng sông Hồng là vựa lúa của Việt Nam, nhưng nắng nóng, hạn mặn và mưa thất thường ngày càng đe dọa mùa vụ. Các đợt hạn mặn lịch sử năm 2015–2016 và 2019–2020 cho thấy một quyết định gieo trồng sai có thể mất cả vụ.",
                "The Mekong and Red River deltas are Vietnam's rice bowls, yet heat, drought, salinity and erratic rain increasingly threaten harvests. The historic droughts of 2015–2016 and 2019–2020 showed how one wrong planting decision can cost a season.",
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: <ThermometerSun />, tone: "text-heat", line: "bg-heat", title: t("Nắng nóng", "Heat"), body: t("Trên ~35°C lúc trổ bông, lúa có thể lép hạt.", "Above ~35°C at flowering, rice spikelets can turn sterile.") },
                { icon: <Droplets />, tone: "text-rain", line: "bg-rain", title: t("Nước", "Water"), body: t("Lúa ngập dùng nhiều nước nhất trong các cây trồng chính.", "Flooded rice is the most water-intensive staple.") },
                { icon: <Sprout />, tone: "text-emerald", line: "bg-emerald", title: t("Thích ứng", "Adaptation"), body: t("Luân canh với cây họ đậu có thể giảm áp lực nước và cải thiện đất.", "Rotating with legumes may ease water stress and improve soil.") },
              ].map((c) => (
                <div key={c.title} className="glass relative overflow-hidden rounded-2xl border border-border p-5 shadow-card">
                  <span className={`absolute inset-x-0 top-0 h-px ${c.line} opacity-70`} />
                  <span className={`inline-flex rounded-lg border border-border bg-muted/50 p-2 [&_svg]:size-5 ${c.tone}`}>{c.icon}</span>
                  <p className="mt-4 font-semibold text-foreground">{c.title}</p>
                  <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
          <div className="reveal mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>{t("Bốn mô-đun", "Four modules")}</SectionLabel>
              <h2 className="mt-4 text-4xl font-medium md:text-5xl">{t("Phòng thí nghiệm cho thửa ruộng của bạn", "A laboratory for your field")}</h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("Mỗi mô-đun dùng cùng một hồ sơ trang trại và cùng dữ liệu NASA nền.", "Every module shares one farm profile and the same NASA baseline.")}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {modules.map((m, i) => (
              <Link
                key={m.to}
                to={m.to}
                className="reveal glass edge-glow group relative overflow-hidden rounded-3xl border border-border p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-elevated md:p-8"
              >
                <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-emerald/10 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />
                <div className="relative flex items-start justify-between">
                  <span className="rounded-2xl bg-gradient-emerald p-3 text-primary-foreground shadow-glow [&_svg]:size-6">{m.icon}</span>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">MOD · 0{i + 1}</span>
                </div>
                <h3 className="relative mt-7 text-2xl font-medium md:text-3xl">{m.title}</h3>
                <p className="relative mt-1 font-mono text-[11px] uppercase tracking-wider text-emerald">{m.sub}</p>
                <p className="relative mt-4 leading-relaxed text-muted-foreground">{m.body}</p>
                <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t("Mở mô-đun", "Open module")} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NASA */}
      <section className="relative overflow-hidden border-y border-border bg-deep-surface text-deep-foreground">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-28 sm:px-6 lg:grid-cols-2">
          <div className="reveal relative">
            <div className="relative overflow-hidden rounded-3xl border border-deep-foreground/10 shadow-elevated">
              <img src={earthImg} alt={t("Vệ tinh quan sát Trái Đất trên Đông Nam Á", "Earth observation satellite above Southeast Asia")} width={1600} height={1008} loading="lazy" className="animate-float" />
              <span className="hud-corner tl" />
              <span className="hud-corner tr" />
              <span className="hud-corner bl" />
              <span className="hud-corner br" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 animate-scan bg-gradient-to-b from-transparent via-cyan/10 to-transparent" />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-deep-foreground/15 bg-deep/85 p-4 font-mono text-[11px] text-deep-muted shadow-elevated backdrop-blur">
              <span className="text-emerald">GET</span> power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,PRECTOTCORR,GWETROOT…&community=AG
              <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-emerald animate-blink" />
            </div>
          </div>
          <div className="reveal">
            <SectionLabel>{t("Dữ liệu NASA", "NASA data")}</SectionLabel>
            <h2 className="mt-5 text-4xl font-medium md:text-5xl">{t("Từ quỹ đạo đến thửa ruộng", "From orbit to your field")}</h2>
            <p className="mt-5 leading-relaxed text-deep-muted">
              {t(
                "AgriShift gọi trực tiếp API NASA POWER (Prediction Of Worldwide Energy Resources) cho tọa độ của bạn và lấy 10 năm dữ liệu gần nhất. Mỗi biểu đồ ghi rõ nguồn, khoảng thời gian, đơn vị và trạng thái truy xuất.",
                "AgriShift calls the NASA POWER (Prediction Of Worldwide Energy Resources) API for your coordinates and pulls the last 10 years. Every chart shows source, date range, units and retrieval status.",
              )}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["T2M · T2M_MAX", t("Nhiệt độ trung bình & cao nhất hằng ngày", "Mean & daily max temperature")],
                ["PRECTOTCORR", t("Lượng mưa đã hiệu chỉnh", "Bias-corrected precipitation")],
                ["ALLSKY_SFC_SW_DWN", t("Bức xạ mặt trời", "Solar radiation")],
                ["GWETROOT · GWETTOP", t("Độ ẩm đất (tái phân tích MERRA-2)", "Soil wetness (MERRA-2 reanalysis)")],
              ].map(([code, label]) => (
                <li key={code} className="group rounded-xl border border-deep-foreground/10 bg-deep-foreground/[0.04] p-4 transition hover:border-emerald/40 hover:bg-emerald/5">
                  <p className="flex items-center gap-2 font-mono text-xs text-emerald">
                    <span className="size-1.5 rounded-full bg-emerald transition group-hover:shadow-glow" />
                    {code}
                  </p>
                  <p className="mt-1.5 text-sm">{label}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <div className="reveal">
            <SectionLabel>{t("Hành trình 6 bước", "6-step journey")}</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-4xl font-medium md:text-5xl">{t("Thử trước khi gieo.", "Test before you plant.")}</h2>
          </div>
          <ol className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <span aria-hidden="true" className="absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-transparent via-emerald/40 to-transparent lg:block" />
            {steps.map((s, i) => (
              <li key={s.en} className="reveal glass relative rounded-2xl border border-border p-5 shadow-card transition hover:border-emerald/40">
                <div className="flex items-center justify-between">
                  <span className="relative flex size-9 items-center justify-center rounded-full border border-emerald/40 bg-deep text-emerald [&_svg]:size-4">{s.icon}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                </div>
                <p className="mt-4 text-sm font-medium leading-snug">{t(s.vi, s.en)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="reveal rounded-2xl border border-real/30 bg-real-soft/70 p-5 backdrop-blur">
              <ProvBadge kind="real" />
              <p className="mt-3 text-sm leading-relaxed">{t("Khí hậu nền: nhiệt độ, mưa, bức xạ, độ ẩm đất được lấy trực tiếp từ NASA POWER.", "Baseline climate: temperature, rain, radiation and soil wetness come straight from NASA POWER.")}</p>
            </div>
            <div className="reveal rounded-2xl border border-sim/40 bg-sim-soft/70 bg-sim-hatch p-5 backdrop-blur">
              <ProvBadge kind="sim" />
              <p className="mt-3 text-sm leading-relaxed">{t("Kịch bản +°C / ±% mưa là phép thử giả định, không phải dự báo của NASA.", "+°C / ±% rain scenarios are hypothetical tests, not NASA forecasts.")}</p>
            </div>
            <div className="reveal glass rounded-2xl border border-border p-5">
              <ProvBadge kind="illustrative" />
              <p className="mt-3 text-sm leading-relaxed">{t("Một số hệ số chấm điểm là giả định minh họa và luôn được đánh dấu rõ.", "Some scoring coefficients are illustrative assumptions and are always marked.")}</p>
            </div>
          </div>
          <div className="glass edge-glow relative mt-16 overflow-hidden rounded-3xl border border-border p-10 text-center shadow-elevated md:p-14">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
            <div className="relative">
              <h3 className="text-3xl font-medium md:text-4xl">{t("Sẵn sàng thử nghiệm thửa ruộng của bạn?", "Ready to test your field?")}</h3>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{t("Chọn vị trí trên bản đồ vệ tinh — mất chưa đến một phút.", "Pick a spot on the satellite map — it takes under a minute.")}</p>
              <div className="mt-8 flex justify-center">
                <Button asChild variant="hero" size="xl">
                  <Link to="/farm">
                    Explore Your Farm <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
