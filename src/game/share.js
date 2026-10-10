import { STAT_LABELS } from "../data/questions";

export function shareText({ personality, stats, score, rank, challengeCode }) {
  const top = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, value]) => `${STAT_LABELS[key]}: ${value}%`)
    .join("\n");

  const challengeLine = challengeCode
    ? `\nChallenge code: ${challengeCode}`
    : "";
  const rankLine = rank ? `\nRank: ${rank.emoji} ${rank.name}` : "";

  return `WHO DEY MAD? 🇳🇬

I just got:
${personality.name} ${personality.emoji}
${personality.tagline}
XP: ${score}${rankLine}

${top}

${personality.description}

What's YOUR Naija personality?${challengeLine}`;
}

export async function shareResult({
  personality,
  stats,
  score,
  rank,
  challengeCode,
  file,
}) {
  const text = shareText({ personality, stats, score, rank, challengeCode });
  const url = challengeCode
    ? `${window.location.origin}/friends?code=${challengeCode}`
    : window.location.origin;

  const packed = `${text}\n${url}`;

  if (typeof navigator.share === "function") {
    try {
      const payload = { title: "WHO DEY MAD? 🇳🇬", text, url };
      if (file && navigator.canShare?.({ files: [file] })) {
        payload.files = [file];
      }
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
  }

  await navigator.clipboard.writeText(packed);
  return "copied";
}

export function renderResultCard({ personality, stats, score, rank }) {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#07140d");
  bg.addColorStop(0.45, "#0b1220");
  bg.addColorStop(1, "#05070b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(0, 200, 83, 0.18)";
  ctx.beginPath();
  ctx.arc(180, 160, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(61, 220, 132, 0.12)";
  ctx.beginPath();
  ctx.arc(900, 1180, 320, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "800 52px Outfit, system-ui, sans-serif";
  ctx.fillText("WHO DEY MAD? 🇳🇬", 80, 120);

  ctx.fillStyle = "rgba(248,250,252,0.62)";
  ctx.font = "500 28px Outfit, system-ui, sans-serif";
  ctx.fillText("YOUR NAIJA PERSONALITY", 80, 180);

  ctx.fillStyle = personality.color || "#3DDC84";
  ctx.font = "800 64px Outfit, system-ui, sans-serif";
  wrapText(ctx, `${personality.emoji}  ${personality.name}`, 80, 280, 920, 72);

  ctx.fillStyle = "rgba(248,250,252,0.78)";
  ctx.font = "500 30px Outfit, system-ui, sans-serif";
  wrapText(ctx, personality.description, 80, 470, 920, 42);

  const keys = [
    ["streetIq", "Street IQ"],
    ["wahala", "Wahala Level"],
    ["financial", "Financial Sense"],
    ["lagos", "Lagos Survival"],
  ];

  keys.forEach(([key, label], i) => {
    const y = 760 + i * 90;
    ctx.fillStyle = "rgba(248,250,252,0.7)";
    ctx.font = "600 26px Outfit, system-ui, sans-serif";
    ctx.fillText(label.toUpperCase(), 80, y);
    ctx.fillStyle = "#F8FAFC";
    ctx.font = "800 26px Outfit, system-ui, sans-serif";
    ctx.fillText(`${stats[key]}%`, 920, y, 80);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, 80, y + 16, 920, 14, 8);
    ctx.fill();
    ctx.fillStyle = "#00C853";
    roundRect(ctx, 80, y + 16, 920 * (stats[key] / 100), 14, 8);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(248,250,252,0.9)";
  ctx.font = "700 32px Outfit, system-ui, sans-serif";
  const rankLabel = rank ? `  ·  ${rank.name}` : "";
  ctx.fillText(`${score} XP${rankLabel}  ·  What's YOUR Naija personality?`, 80, 1288);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      resolve(new File([blob], "who-dey-mad-result.png", { type: "image/png" }));
    }, "image/png");
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursor = y;
  for (const word of words) {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line.trim(), x, cursor);
      line = `${word} `;
      cursor += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cursor);
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
