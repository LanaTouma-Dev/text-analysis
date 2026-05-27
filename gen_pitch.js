const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Syriatel AI Team";
pres.title = "AI-Powered SMS Moderation System";

const C = {
  darkNavy: "0D1B3E",
  navy:     "1E2761",
  blue:     "3A7BD5",
  iceBlue:  "CADCFC",
  white:    "FFFFFF",
  lightBg:  "F0F4FF",
  textDark: "1A1A2E",
  textMid:  "4A5580",
  green:    "059669",
  red:      "DC2626",
};

const makeShadow = () => ({ type: "outer", color: "000000", blur: 5, offset: 2, angle: 135, opacity: 0.12 });

// ===========================================================================
// SLIDE 1 — TITLE
// ===========================================================================
const s1 = pres.addSlide();
s1.background = { color: C.darkNavy };

// Left accent bar
s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.22, h: 5.625,
  fill: { color: C.blue }, line: { color: C.blue }
});

// Decorative circle (background)
s1.addShape(pres.shapes.OVAL, {
  x: 7.2, y: -0.8, w: 4.5, h: 4.5,
  fill: { color: C.navy, transparency: 55 },
  line: { color: C.navy, transparency: 55 }
});

s1.addText("AI-Powered SMS\nModeration System", {
  x: 0.65, y: 0.9, w: 8.8, h: 2.6,
  fontSize: 42, fontFace: "Georgia", color: C.white,
  bold: true, align: "left"
});

s1.addText("Fully Local.  Fully Owned.  Built for Syriatel.", {
  x: 0.65, y: 3.55, w: 8.5, h: 0.65,
  fontSize: 17, fontFace: "Calibri", color: C.iceBlue,
  italic: true, align: "left"
});

s1.addText("Enterprise AI  •  Arabic-First  •  On-Premises", {
  x: 0.65, y: 4.85, w: 8, h: 0.45,
  fontSize: 11, fontFace: "Calibri", color: C.iceBlue,
  align: "left", charSpacing: 2
});

// ===========================================================================
// SLIDE 2 — THE PROBLEM
// ===========================================================================
const s2 = pres.addSlide();
s2.background = { color: C.lightBg };

s2.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 1.05,
  fill: { color: C.navy }, line: { color: C.navy }
});
s2.addText("THE PROBLEM", {
  x: 0.5, y: 0, w: 9, h: 1.05,
  fontSize: 28, fontFace: "Georgia", color: C.white,
  bold: true, align: "left", valign: "middle", margin: 0
});

s2.addText(
  "Syriatel's bulk messaging system sends millions of SMS messages per day " +
  "with no guardrails against offensive, harmful, or sensitive content leaving company infrastructure.",
  {
    x: 0.4, y: 1.15, w: 9.2, h: 0.65,
    fontSize: 13, fontFace: "Calibri", color: C.textDark, align: "left"
  }
);

// 10 category cards — 5 per row, 2 rows
const cats = [
  "Profanity",
  "Hate Speech",
  "Threats & Violence",
  "Sexual Content",
  "Political Sensitivity",
  "Religious Offense",
  "Personal Data Leak",
  "Fraud & Phishing",
  "Defamation",
  "Spam Patterns",
];

const cW = 1.82, cH = 0.88, cGap = 0.09, cStartX = 0.18;

cats.forEach((name, i) => {
  const col = i % 5;
  const row = i < 5 ? 0 : 1;
  const x = cStartX + col * (cW + cGap);
  const y = row === 0 ? 1.98 : 3.02;

  s2.addShape(pres.shapes.RECTANGLE, {
    x, y, w: cW, h: cH,
    fill: { color: C.white },
    line: { color: C.blue, width: 1.5 },
    shadow: makeShadow()
  });
  s2.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.05, h: cH,
    fill: { color: C.blue }, line: { color: C.blue }
  });
  s2.addText(name, {
    x: x + 0.12, y, w: cW - 0.15, h: cH,
    fontSize: 11, fontFace: "Calibri", color: C.textDark,
    bold: true, align: "left", valign: "middle"
  });
});

s2.addText("10 Risk Categories  —  AI-detected before any message leaves the company", {
  x: 0.4, y: 4.05, w: 9.2, h: 0.4,
  fontSize: 12, fontFace: "Calibri", color: C.textMid,
  align: "center", italic: true
});

s2.addText("No message is sent without being screened.", {
  x: 0.4, y: 4.5, w: 9.2, h: 0.38,
  fontSize: 13, fontFace: "Calibri", color: C.textDark,
  align: "center", bold: true
});

// ===========================================================================
// SLIDE 3 — THE ARCHITECTURE
// ===========================================================================
const s3 = pres.addSlide();
s3.background = { color: C.darkNavy };

s3.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.95,
  fill: { color: C.navy }, line: { color: C.navy }
});
s3.addText("THE ARCHITECTURE", {
  x: 0.5, y: 0, w: 9, h: 0.95,
  fontSize: 26, fontFace: "Georgia", color: C.white,
  bold: true, align: "left", valign: "middle", margin: 0
});

// Three pipeline boxes — horizontal row
// Box coords: x0=0.2, x1=3.0, x2=5.8 | w=2.5 | y=1.2 | h=0.95
// MARBERT center x = 5.8 + 1.25 = 7.05
const pipeData = [
  { label: "Spring Boot\n& RabbitMQ", sub: "Message Source",        color: "374151" },
  { label: "Django\nIngest",          sub: "Queue Consumer",         color: C.blue   },
  { label: "MARBERT\nClassifier",     sub: "10-head, on-prem GPU",   color: "065F46" },
];
const pBX  = [0.2, 3.0, 5.8];
const pBW  = 2.5, pBH = 0.95, pBY = 1.2;
const mCX  = pBX[2] + pBW / 2; // 7.05

pipeData.forEach((b, i) => {
  const x = pBX[i];
  s3.addShape(pres.shapes.RECTANGLE, {
    x, y: pBY, w: pBW, h: pBH,
    fill: { color: b.color }, line: { color: b.color }
  });
  s3.addText(b.label, {
    x, y: pBY + 0.05, w: pBW, h: 0.65,
    fontSize: 13, fontFace: "Calibri", color: C.white,
    bold: true, align: "center", valign: "middle"
  });
  s3.addText(b.sub, {
    x, y: pBY + 0.72, w: pBW, h: 0.22,
    fontSize: 9, fontFace: "Calibri", color: C.iceBlue, align: "center"
  });

  // Horizontal arrow to next box
  if (i < pipeData.length - 1) {
    const ax = x + pBW + 0.04;
    s3.addShape(pres.shapes.LINE, {
      x: ax, y: pBY + pBH / 2, w: 0.24, h: 0,
      line: { color: C.iceBlue, width: 2 }
    });
    s3.addText("▶", {
      x: ax + 0.08, y: pBY + pBH / 2 - 0.18, w: 0.2, h: 0.36,
      fontSize: 11, color: C.iceBlue, align: "center"
    });
  }
});

// Vertical connector: MARBERT bottom → Threshold top
// MARBERT bottom y = pBY + pBH = 2.15
// "10 Confidence Scores" label: y=2.16 to 2.5
// Threshold top: y=2.6
s3.addShape(pres.shapes.LINE, {
  x: mCX, y: pBY + pBH, w: 0, h: 0.45,
  line: { color: C.iceBlue, width: 1.5 }
});
s3.addText("10 Confidence Scores  (0–1 each)", {
  x: mCX - 1.5, y: pBY + pBH + 0.03, w: 3.0, h: 0.3,
  fontSize: 9, fontFace: "Calibri", color: C.iceBlue,
  align: "center", italic: true
});

// Threshold box — centered on mCX
const tW = 2.8, tH = 0.8, tX = mCX - tW / 2, tY = 2.65; // tX=5.65
s3.addShape(pres.shapes.RECTANGLE, {
  x: tX, y: tY, w: tW, h: tH,
  fill: { color: "92400E" }, line: { color: "92400E" }
});
s3.addText("Threshold Logic\nAny score ≥ 0.7?", {
  x: tX, y: tY, w: tW, h: tH,
  fontSize: 13, fontFace: "Calibri", color: C.white,
  bold: true, align: "center", valign: "middle"
});

// Vertical: threshold bottom → branch junction
// Threshold bottom: tY + tH = 2.65 + 0.8 = 3.45
const branchY = 3.6;
s3.addShape(pres.shapes.LINE, {
  x: mCX, y: tY + tH, w: 0, h: branchY - (tY + tH),
  line: { color: C.iceBlue, width: 1.5 }
});

// Horizontal branch
const brLeft = mCX - 1.65;  // 5.40
const brRight = mCX + 1.65; // 8.70
s3.addShape(pres.shapes.LINE, {
  x: brLeft, y: branchY, w: brRight - brLeft, h: 0,
  line: { color: C.iceBlue, width: 1.5 }
});

// Left branch — RELEASE
const relW = 2.0, relH = 0.85, relCX = brLeft;
const relX = relCX - relW / 2; // 4.40
const relY = branchY + 0.18;
s3.addShape(pres.shapes.LINE, {
  x: relCX, y: branchY, w: 0, h: 0.18,
  line: { color: C.green, width: 1.5 }
});
s3.addShape(pres.shapes.RECTANGLE, {
  x: relX, y: relY, w: relW, h: relH,
  fill: { color: C.green }, line: { color: C.green }
});
s3.addText("✓ RELEASE\nAll scores < 0.7", {
  x: relX, y: relY, w: relW, h: relH,
  fontSize: 12, fontFace: "Calibri", color: C.white,
  bold: true, align: "center", valign: "middle"
});

// Right branch — HUMAN REVIEW
const revW = 2.0, revH = 0.85, revCX = brRight;
const revX = revCX - revW / 2; // 7.70
const revY = branchY + 0.18;
s3.addShape(pres.shapes.LINE, {
  x: revCX, y: branchY, w: 0, h: 0.18,
  line: { color: C.red, width: 1.5 }
});
s3.addShape(pres.shapes.RECTANGLE, {
  x: revX, y: revY, w: revW, h: revH,
  fill: { color: C.red }, line: { color: C.red }
});
s3.addText("⚠ HUMAN REVIEW\nAny score ≥ 0.7", {
  x: revX, y: revY, w: revW, h: revH,
  fontSize: 12, fontFace: "Calibri", color: C.white,
  bold: true, align: "center", valign: "middle"
});
s3.addText("+ AceGPT generates Arabic\nexplanation for reviewers", {
  x: revX - 0.15, y: revY + revH + 0.08, w: revW + 0.3, h: 0.42,
  fontSize: 8.5, fontFace: "Calibri", color: C.iceBlue,
  align: "center", italic: true
});

// ===========================================================================
// SLIDE 4 — WHY MARBERT?
// ===========================================================================
const s4 = pres.addSlide();
s4.background = { color: C.lightBg };

s4.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 1.05,
  fill: { color: C.navy }, line: { color: C.navy }
});
s4.addText("WHY MARBERT?", {
  x: 0.5, y: 0, w: 9, h: 1.05,
  fontSize: 28, fontFace: "Georgia", color: C.white,
  bold: true, align: "left", valign: "middle", margin: 0
});

const stats = [
  {
    stat:   "1 Billion+",
    label:  "Arabic tweets in training data",
    detail: "Dialect-rich, short-text, code-switched — mirrors real SMS messaging patterns including Levantine Arabic"
  },
  {
    stat:   "163M",
    label:  "Model parameters",
    detail: "Efficient: runs comfortably on a single mid-range GPU without heavy or expensive infrastructure"
  },
  {
    stat:   "5–20ms",
    label:  "Latency per message",
    detail: "Processes millions of messages per day with minimal backpressure on the messaging pipeline"
  },
  {
    stat:   "Apache 2.0",
    label:  "Open-source license",
    detail: "Syriatel owns the deployment. No vendor lock-in. Full control over data, weights, and retraining"
  },
  {
    stat:   "On-Prem",
    label:  "100% data sovereignty",
    detail: "No customer message ever leaves Syriatel’s infrastructure to reach an external API or cloud service"
  },
];

stats.forEach((s, i) => {
  const y = 1.2 + i * 0.83;
  s4.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y, w: 1.85, h: 0.65,
    fill: { color: C.blue }, line: { color: C.blue }
  });
  s4.addText(s.stat, {
    x: 0.4, y, w: 1.85, h: 0.65,
    fontSize: 15, fontFace: "Georgia", color: C.white,
    bold: true, align: "center", valign: "middle"
  });
  s4.addText(s.label, {
    x: 2.45, y: y + 0.02, w: 7.1, h: 0.3,
    fontSize: 13, fontFace: "Calibri", color: C.textDark, bold: true, align: "left"
  });
  s4.addText(s.detail, {
    x: 2.45, y: y + 0.33, w: 7.1, h: 0.3,
    fontSize: 10.5, fontFace: "Calibri", color: C.textMid, align: "left"
  });
});

// ===========================================================================
// SLIDE 5 — KEY BENEFITS
// ===========================================================================
const s5 = pres.addSlide();
s5.background = { color: C.darkNavy };

s5.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.95,
  fill: { color: C.navy }, line: { color: C.navy }
});
s5.addText("KEY BENEFITS", {
  x: 0.5, y: 0, w: 9, h: 0.95,
  fontSize: 26, fontFace: "Georgia", color: C.white,
  bold: true, align: "left", valign: "middle", margin: 0
});

const benefits = [
  {
    title:  "Data Sovereignty",
    body:   "All processing happens on-premises. No customer message ever reaches an external API. Full compliance with telecom regulatory requirements.",
    accent: "1D4ED8"
  },
  {
    title:  "Massive Scale",
    body:   "Millions of messages per day on a single GPU. 5–20ms latency per message. Celery workers scale horizontally as volume grows.",
    accent: "065F46"
  },
  {
    title:  "Human-in-the-Loop",
    body:   "AI flags — humans decide. No auto-rejection. Full moderator dashboard with approval, quarantine, and complete audit trail.",
    accent: "92400E"
  },
  {
    title:  "Cost-Effective",
    body:   "$500–2k/month GPU compute vs. $30k+/month in external API costs at this volume. Model improves with every moderator decision.",
    accent: "581C87"
  },
];

const bW = 2.2, bH = 3.55, bStartX = 0.15, bGap = 0.13, bY = 1.05;

benefits.forEach((b, i) => {
  const x = bStartX + i * (bW + bGap);
  s5.addShape(pres.shapes.RECTANGLE, {
    x, y: bY, w: bW, h: bH,
    fill: { color: "1A2744" },
    line: { color: b.accent, width: 1.5 },
    shadow: makeShadow()
  });
  s5.addShape(pres.shapes.RECTANGLE, {
    x, y: bY, w: bW, h: 0.07,
    fill: { color: b.accent }, line: { color: b.accent }
  });
  s5.addText(b.title, {
    x: x + 0.15, y: bY + 0.15, w: bW - 0.3, h: 0.72,
    fontSize: 14, fontFace: "Georgia", color: C.white, bold: true, align: "left"
  });
  s5.addText(b.body, {
    x: x + 0.15, y: bY + 0.95, w: bW - 0.3, h: 2.45,
    fontSize: 11, fontFace: "Calibri", color: C.iceBlue, align: "left"
  });
});

s5.addText("Built for Syriatel — Powered by Open-Source AI", {
  x: 0.5, y: 4.88, w: 9, h: 0.38,
  fontSize: 11, fontFace: "Calibri", color: C.iceBlue,
  align: "center", italic: true, charSpacing: 1
});

// ===========================================================================
// SAVE
// ===========================================================================
pres.writeFile({ fileName: "C:\\Projects\\text_analytics\\Syriatel_AI_Moderation_Pitch.pptx" })
  .then(() => console.log("Saved: Syriatel_AI_Moderation_Pitch.pptx"))
  .catch(e => { console.error(e); process.exit(1); });
