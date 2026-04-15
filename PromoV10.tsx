import { loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
  staticFile,
  Sequence,
} from "remotion";
import { Audio } from "@remotion/media";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
import { LightLeak } from "@remotion/light-leaks";
import { light } from "../../styles/colors";
import { Typewriter } from "../../components/Typewriter";

const { fontFamily } = loadFont();

// ---------------------------------------------------------------------------
// Spring presets
// ---------------------------------------------------------------------------
const SNAPPY = { damping: 15, stiffness: 200 } as const;
const GENTLE = { damping: 20, stiffness: 80 } as const;
const BOUNCY = { damping: 8, stiffness: 150 } as const;

// ---------------------------------------------------------------------------
// Terminal colors (stays dark even in light mode)
// ---------------------------------------------------------------------------
const term = {
  bg: "#1a1a1a",
  border: "#2a2a2a",
  titleBar: "#1e1e1e",
  green: "#7dcea0",
  amber: "#e0af40",
  cyan: "#5bbcd6",
  red: "#e06c75",
  text: "#abb2bf",
  textMuted: "#666",
  prompt: "#5bbcd6",
} as const;

// ---------------------------------------------------------------------------
// Transition duration
// ---------------------------------------------------------------------------
const T = 15;

// ---------------------------------------------------------------------------
// Floating Particles — deterministic, no Math.random
// ---------------------------------------------------------------------------
const FloatingParticles: React.FC<{ count?: number; color?: string }> = ({
  count = 30,
  color = "#e0af4015",
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = (i * 137.5) % 100; // golden angle spread
        const baseY = (i * 89.3) % 100;
        const size = 2 + (i % 3);
        const speed = 0.15 + (i % 5) * 0.05;
        const y = baseY - frame * speed;
        const opacity = interpolate(
          ((y + 200) % 200),
          [0, 50, 150, 200],
          [0, 0.6, 0.6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${((y % 120) + 120) % 120}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Gradient background helper
// ---------------------------------------------------------------------------
const gradientBg = (center = "50% 30%") =>
  `radial-gradient(ellipse at ${center}, #ffffff 0%, ${light.bg} 70%)`;

// ---------------------------------------------------------------------------
// Big Terminal — fills more of the screen, live typewriter
// ---------------------------------------------------------------------------
const BigTerminal: React.FC<{
  command: string;
  output: string[];
  promptPrefix?: string;
}> = ({ command, output, promptPrefix = "~/wiki $" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowScale = spring({
    frame,
    fps,
    config: SNAPPY,
  });

  const commandDoneFrame = command.length * 2 + 10;

  return (
    <div
      style={{
        transform: `scale(${windowScale})`,
        backgroundColor: term.bg,
        borderRadius: 16,
        border: `1px solid ${term.border}`,
        overflow: "hidden",
        width: 1500,
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 18px",
          backgroundColor: term.titleBar,
          borderBottom: `1px solid ${term.border}`,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#ff5f57",
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#febc2e",
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#28c840",
          }}
        />
        <span
          style={{
            marginLeft: 14,
            fontSize: 14,
            color: term.textMuted,
            fontFamily: "'SF Mono', monospace",
          }}
        >
          Terminal
        </span>
      </div>

      {/* Terminal body */}
      <div style={{ padding: "28px 32px", minHeight: 200 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span
            style={{
              color: term.prompt,
              fontFamily: "'SF Mono', monospace",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {promptPrefix}
          </span>
          <Typewriter
            text={command}
            speed={2}
            color="#f0f0f0"
            fontSize={26}
            startFrame={0}
          />
        </div>

        {/* Output lines */}
        {output.map((line, i) => {
          const lineDelay = commandDoneFrame + i * 10;
          const lineOpacity = interpolate(
            frame,
            [lineDelay, lineDelay + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const lineColor = line.startsWith("\u2713")
            ? term.green
            : line.startsWith("\u2192") || line.startsWith("\uD83D\uDCE5")
              ? term.amber
              : term.text;
          return (
            <div
              key={i}
              style={{
                opacity: lineOpacity,
                marginTop: i === 0 ? 20 : 6,
                fontSize: 22,
                color: lineColor,
                fontFamily: "'SF Mono', monospace",
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Scene 1 — Hook (120 frames / 4s)
// "One CLI command." + "50 cross-linked wiki pages."
// With floating particles + word highlight on "50"
// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineScale = spring({ frame, fps, config: BOUNCY });
  const headlineOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const subOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight wipe animation on "50"
  const highlightProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });

  return (
    <AbsoluteFill
      style={{
        background: gradientBg(),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FloatingParticles count={35} color="#e0af4015" />
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontSize: 90,
            fontWeight: 800,
            color: light.textPrimary,
            margin: 0,
            fontFamily,
            transform: `scale(${headlineScale})`,
            opacity: headlineOpacity,
            lineHeight: 1.1,
          }}
        >
          One CLI command.
        </h1>
        <p
          style={{
            fontSize: 48,
            color: light.textPrimary,
            fontFamily,
            fontWeight: 600,
            marginTop: 32,
            opacity: subOpacity,
            transform: `scale(${subScale})`,
          }}
        >
          <span
            style={{
              fontSize: 68,
              fontWeight: 800,
              position: "relative",
              display: "inline-block",
            }}
          >
            {/* Highlight wipe behind "50" */}
            <span
              style={{
                position: "absolute",
                left: -6,
                right: -6,
                top: -2,
                bottom: -2,
                backgroundColor: `${light.amber}25`,
                borderRadius: 8,
                transform: `scaleX(${highlightProgress})`,
                transformOrigin: "left center",
              }}
            />
            <span style={{ color: light.amber, position: "relative" }}>50</span>
          </span>{" "}
          cross-linked wiki pages.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 2 — Problem (150 frames / 5s)
// With floating particles
// ---------------------------------------------------------------------------
const Problem: React.FC = () => {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Opacity = interpolate(frame, [45, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [45, 60], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const retentionOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const retentionY = interpolate(frame, [90, 110], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: gradientBg("50% 60%"),
        justifyContent: "center",
        alignItems: "center",
        padding: "0 120px",
      }}
    >
      <FloatingParticles count={25} color="#e06c7512" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 1100,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: 50,
            fontWeight: 700,
            color: light.textPrimary,
            fontFamily,
            margin: 0,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          You read{" "}
          <span style={{ fontSize: 68, color: light.amber, fontWeight: 800 }}>
            200
          </span>{" "}
          articles a year.
        </p>
        <p
          style={{
            fontSize: 50,
            fontWeight: 700,
            color: light.textPrimary,
            fontFamily,
            margin: 0,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
          }}
        >
          You remember maybe{" "}
          <span style={{ fontSize: 68, color: light.amber, fontWeight: 800 }}>
            10
          </span>
          .
        </p>
        <p
          style={{
            fontSize: 30,
            color: light.textSecondary,
            fontFamily,
            fontWeight: 500,
            marginTop: 28,
            opacity: retentionOpacity,
            transform: `translateY(${retentionY}px)`,
          }}
        >
          The problem isn't reading. It's retention.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 3 — Solution Reveal (150 frames / 5s)
// "LLM Wiki" + logo trio
// ---------------------------------------------------------------------------
const SolutionReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120, overshootClamping: false },
  });
  const headlineOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const logos = [
    { src: staticFile("assets/logos/claude-ai-icon.svg"), label: "Engine", delay: 30 },
    { src: staticFile("assets/logos/terminal-icon.svg"), label: "Interface", delay: 45 },
    { src: staticFile("assets/logos/obsidian-logo-gradient.svg"), label: "Viewer", delay: 60 },
  ];

  const subtextDelay = 75;
  const subtextWords = "A persistent, interlinked knowledge base".split(" ");

  return (
    <AbsoluteFill
      style={{
        background: gradientBg(),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: light.amber,
            fontFamily,
            margin: 0,
            transform: `scale(${headlineScale})`,
            opacity: headlineOpacity,
          }}
        >
          LLM Wiki
        </h1>

        {/* Logo trio */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 80,
            marginTop: 48,
          }}
        >
          {logos.map((logo, i) => {
            const logoOpacity = interpolate(
              frame,
              [logo.delay, logo.delay + 15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const logoY = interpolate(
              frame,
              [logo.delay, logo.delay + 15],
              [12, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  opacity: logoOpacity,
                  transform: `translateY(${logoY}px)`,
                }}
              >
                <Img src={logo.src} style={{ width: 44, height: 44 }} />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: light.textSecondary,
                    fontFamily,
                  }}
                >
                  {logo.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Subtext word reveal */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            marginTop: 40,
            maxWidth: 900,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {subtextWords.map((word, i) => {
            const wordDelay = subtextDelay + i * 4;
            const wordOpacity = interpolate(
              frame,
              [wordDelay, wordDelay + 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const wordY = interpolate(
              frame,
              [wordDelay, wordDelay + 8],
              [10, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );
            return (
              <span
                key={i}
                style={{
                  fontSize: 32,
                  fontWeight: 500,
                  color: light.textSecondary,
                  fontFamily,
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 4 — Ingest Demo (270 frames / 9s)
// LIVE terminal with typewriter — fills the screen
// ---------------------------------------------------------------------------
const IngestDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const labelY = interpolate(frame, [0, 20], [15, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const bottomOpacity = interpolate(frame, [200, 225], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Source type badges (staggered entrance)
  const badges = [
    { label: "Web", color: light.cyan, x: -780, y: -300, delay: 140 },
    { label: "YouTube", color: "#FF0000", x: 780, y: -300, delay: 155 },
    { label: "PDF", color: light.green, x: -800, y: 0, delay: 170 },
    { label: "GitHub", color: light.textPrimary, x: 800, y: 0, delay: 185 },
    { label: "Reddit", color: "#FF4500", x: -780, y: 300, delay: 200 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: gradientBg("50% 20%"),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: light.textPrimary,
            fontFamily,
            margin: 0,
          }}
        >
          Feed it anything.
        </h2>
      </div>

      {/* LIVE terminal */}
      <div style={{ marginTop: 20 }}>
        <BigTerminal
          command="/ingest https://youtube.com/watch?v=zjkBMFhNj_g"
          output={[
            "\uD83D\uDCE5 Pulling transcript via yt-dlp...",
            "\u2713 Created wiki/sources/karpathy-llm-os.md",
            "\u2713 Created wiki/entities/andrej-karpathy.md",
            "\u2713 Created wiki/concepts/llm-operating-system.md",
            "\u2192 Transcript + entities + concepts extracted",
          ]}
        />
      </div>

      {/* Floating source type badges */}
      {badges.map((badge, i) => {
        const badgeProgress = spring({
          frame: frame - badge.delay,
          fps: 30,
          config: SNAPPY,
        });
        const badgeOpacity = interpolate(badgeProgress, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${badge.x}px), calc(-50% + ${badge.y}px)) scale(${badgeProgress})`,
              opacity: badgeOpacity,
            }}
          >
            <div
              style={{
                backgroundColor: light.bgCard,
                border: `2px solid ${badge.color}`,
                borderRadius: 24,
                padding: "8px 20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: badge.color,
                  fontFamily,
                }}
              >
                {badge.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* Bottom label */}
      <div style={{ position: "absolute", bottom: 60, opacity: bottomOpacity }}>
        <p
          style={{
            fontSize: 22,
            color: light.textMuted,
            fontFamily,
            fontWeight: 500,
            margin: 0,
          }}
        >
          10+ source types. One command.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 5 — Wiki Output (210 frames / 7s)
// Obsidian screenshot with FIXED Ken Burns (no clipping)
// ---------------------------------------------------------------------------
const WikiOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 210;

  // Gentle Ken Burns inside properly clipped container
  const kenBurnsScale = interpolate(frame, [0, totalFrames], [1, 1.1], {
    extrapolateRight: "clamp",
  });

  const imgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const overlayOpacity = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const overlayY = interpolate(frame, [25, 50], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const badgeOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Full-width Obsidian screenshot — Ken Burns INSIDE overflow:hidden */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          opacity: imgOpacity,
        }}
      >
        <Img
          src={staticFile("assets/screenshots/obsidian-wiki-page.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kenBurnsScale})`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Overlay text card */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: `translateX(-50%) translateY(${overlayY}px)`,
          opacity: overlayOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(28, 36, 51, 0.88)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            padding: "20px 48px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <h2
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#F0F0F0",
              fontFamily,
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            Structured. Cross-linked. Searchable.
          </h2>
        </div>
      </div>

      {/* Badge */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 80,
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(75, 163, 118, 0.9)",
            borderRadius: 20,
            padding: "10px 24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          <span
            style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily }}
          >
            Auto-generated from source
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 6 — Graph Building (240 frames / 8s)
// ANIMATED nodes + SVG line-drawing + smooth counter + pulsing glow
// ---------------------------------------------------------------------------
const NODE_POSITIONS = [
  { x: 280, y: 180 },
  { x: 660, y: 140 },
  { x: 1060, y: 190 },
  { x: 1440, y: 160 },
  { x: 400, y: 380 },
  { x: 820, y: 350 },
  { x: 1240, y: 390 },
  { x: 280, y: 580 },
  { x: 680, y: 560 },
  { x: 1100, y: 600 },
  { x: 1500, y: 540 },
  { x: 560, y: 760 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
  [3, 4], [4, 5], [3, 6], [4, 7], [5, 8],
  [6, 7], [7, 8], [6, 9], [7, 10], [8, 10],
  [9, 10], [0, 11], [3, 11], [6, 11],
];

const NODE_LABELS = [
  "Attention", "GPT", "RLHF", "Karpathy", "LLM OS",
  "DPO", "Scaling", "Fine-tune", "PEFT", "MoE",
  "LoRA", "Tokenizer",
];

const GraphBuilding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const graphStart = 15;

  // Smooth counter: 0 -> 500 with bezier easing
  const smoothCount = Math.floor(
    interpolate(frame, [0, 180], [0, 500], {
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
  );
  const formattedCount = smoothCount >= 1000
    ? smoothCount.toLocaleString()
    : smoothCount.toString();

  const counterScale = spring({
    frame,
    fps,
    config: BOUNCY,
  });

  const subtextOpacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtextY = interpolate(frame, [150, 170], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: gradientBg("50% 40%"),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Connection lines with SVG line-drawing animation */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {CONNECTIONS.map(([from, to], i) => {
          const x1 = NODE_POSITIONS[from].x;
          const y1 = NODE_POSITIONS[from].y;
          const x2 = NODE_POSITIONS[to].x;
          const y2 = NODE_POSITIONS[to].y;
          const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

          const connectionDelay = graphStart + Math.max(from, to) * 14 + 5;
          const drawProgress = interpolate(
            frame,
            [connectionDelay, connectionDelay + 20],
            [lineLength, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const lineOpacity = interpolate(
            frame,
            [connectionDelay, connectionDelay + 5],
            [0, 0.4],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={light.cyan}
              strokeWidth={2}
              opacity={lineOpacity}
              strokeDasharray={lineLength}
              strokeDashoffset={drawProgress}
            />
          );
        })}
      </svg>

      {/* Animated nodes with labels + pulsing glow */}
      {NODE_POSITIONS.map((pos, i) => {
        const nodeDelay = graphStart + i * 14;
        const nodeScale = spring({
          frame: frame - nodeDelay,
          fps,
          config: BOUNCY,
        });
        const nodeColor =
          i % 3 === 0 ? light.amber : i % 3 === 1 ? light.cyan : light.green;

        // Pulsing glow synced to frame
        const pulseIntensity = interpolate(
          (frame + i * 7) % 30,
          [0, 15, 30],
          [12, 22, 12],
        );

        const labelOpacity = interpolate(
          frame,
          [nodeDelay + 10, nodeDelay + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div key={`node-${i}`}>
            {/* Node dot */}
            <div
              style={{
                position: "absolute",
                left: pos.x - 12,
                top: pos.y - 12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: nodeColor,
                transform: `scale(${nodeScale})`,
                boxShadow: `0 0 ${pulseIntensity}px ${nodeColor}88`,
              }}
            />
            {/* Node label */}
            <div
              style={{
                position: "absolute",
                left: pos.x - 50,
                top: pos.y + 18,
                width: 100,
                textAlign: "center",
                opacity: labelOpacity,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: light.textSecondary,
                  fontFamily,
                }}
              >
                {NODE_LABELS[i]}
              </span>
            </div>
          </div>
        );
      })}

      {/* Counter overlay — top right */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 100,
          textAlign: "right",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: light.amber,
            fontFamily,
            transform: `scale(${counterScale})`,
            lineHeight: 1,
          }}
        >
          {formattedCount}
        </div>
        <p
          style={{
            fontSize: 28,
            color: light.textMuted,
            fontFamily,
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          pages
        </p>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          textAlign: "center",
          left: 0,
          right: 0,
          opacity: subtextOpacity,
          transform: `translateY(${subtextY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 30,
            color: light.green,
            fontFamily,
            fontWeight: 600,
            margin: 0,
          }}
        >
          The graph grows itself.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 7 — Query Demo (240 frames / 8s)
// LIVE terminal with /query command
// ---------------------------------------------------------------------------
const QueryDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bottomOpacity = interpolate(frame, [180, 205], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: gradientBg("50% 20%"),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Top label */}
      <div style={{ position: "absolute", top: 60, opacity: labelOpacity }}>
        <h2
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: light.textPrimary,
            fontFamily,
            margin: 0,
          }}
        >
          Ask your wiki. Get grounded answers.
        </h2>
      </div>

      {/* LIVE terminal */}
      <div style={{ marginTop: 20 }}>
        <BigTerminal
          command='/query "Compare RLHF vs DPO for alignment"'
          output={[
            "Synthesizing from 8 sources...",
            "\u2192 RLHF uses a reward model trained on preferences...",
            "\u2192 DPO bypasses reward modeling entirely...",
            "\u2192 DPO is simpler but RLHF scales better...",
            "\u2713 Sources: [[rlhf-overview]], [[dpo]], [[alignment-techniques]]",
          ]}
        />
      </div>

      {/* Bottom badge */}
      <div style={{ position: "absolute", bottom: 60, opacity: bottomOpacity }}>
        <div
          style={{
            backgroundColor: light.bgCard,
            border: `2px solid ${light.cyan}`,
            borderRadius: 24,
            padding: "10px 28px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: light.cyan,
              fontFamily,
            }}
          >
            Cites your sources, not the internet.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 8 — CTA (330 frames / 11s)
// "Build yours in 5 minutes." + GitHub + logos
// With floating particles
// ---------------------------------------------------------------------------
const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });
  const headlineOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });
  const urlY = interpolate(frame, [30, 50], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const logoData = [
    { src: staticFile("assets/logos/claude-ai-icon.svg"), label: "Engine", delay: 60 },
    { src: staticFile("assets/logos/terminal-icon.svg"), label: "Interface", delay: 72 },
    { src: staticFile("assets/logos/obsidian-logo-gradient.svg"), label: "Viewer", delay: 84 },
  ];

  const glowIntensity = interpolate(
    frame,
    [50, 80, 110, 140, 170, 200],
    [0, 10, 0, 10, 0, 10],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: gradientBg(),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FloatingParticles count={30} color="#5bbcd610" />
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: 76,
            fontWeight: 800,
            color: light.textPrimary,
            fontFamily,
            margin: 0,
            transform: `scale(${headlineScale})`,
            opacity: headlineOpacity,
            textShadow: `0 0 ${glowIntensity}px ${light.amber}44`,
          }}
        >
          Build yours in{" "}
          <span style={{ color: light.amber }}>5 minutes</span>.
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 36,
            opacity: urlOpacity,
            transform: `translateY(${urlY}px)`,
          }}
        >
          <Img
            src={staticFile("assets/logos/github-mark.svg")}
            style={{ width: 28, height: 28, opacity: 0.6 }}
          />
          <p
            style={{
              fontSize: 30,
              color: light.cyan,
              fontFamily,
              fontWeight: 600,
              margin: 0,
            }}
          >
            github.com/RonanCodes/llm-wiki
          </p>
        </div>

        <div style={{ display: "flex", gap: 80, marginTop: 50 }}>
          {logoData.map((logo, i) => {
            const logoOpacity = interpolate(
              frame,
              [logo.delay, logo.delay + 15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const logoY = interpolate(
              frame,
              [logo.delay, logo.delay + 15],
              [10, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  opacity: logoOpacity,
                  transform: `translateY(${logoY}px)`,
                }}
              >
                <Img src={logo.src} style={{ width: 44, height: 44 }} />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: light.textSecondary,
                    fontFamily,
                  }}
                >
                  {logo.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// SFX helper — places a sound effect at a specific frame
// ---------------------------------------------------------------------------
const SFX: React.FC<{
  src: string;
  at: number;
  volume?: number;
  duration?: number;
}> = ({ src, at, volume = 0.5, duration = 90 }) => (
  <Sequence from={at} durationInFrames={duration}>
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

// ---------------------------------------------------------------------------
// Light leak overlay duration
// ---------------------------------------------------------------------------
const LIGHT_LEAK_DURATION = 60;

// ---------------------------------------------------------------------------
// Composition — ~1560 frames / 52s @ 30fps
//
// TransitionSeries structure with light leak overlays:
//   Seq → Transition → Seq → Overlay → Seq → Transition → Seq → ...
//
// Light leaks placed:
//   1. After Problem → before Solution (amber, seed=3)
//   2. After Wiki Output → before Graph Building (cyan, seed=5, hueShift=200)
//
// clockWipe for Wiki Output → Graph transition
// flip for Query → CTA transition
// ---------------------------------------------------------------------------
export const PromoV10: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* ====== BACKGROUND MUSIC — Duel of the Fates, skip 15s intro ====== */}
      <Audio
        src={staticFile("audio/duel-of-the-fates-trimmed.mp3")}
        volume={(f) => {
          // Fade in over 2s (60 frames)
          if (f < 60) return interpolate(f, [0, 60], [0, 0.18]);
          // Fade out over 3s (90 frames)
          if (f > durationInFrames - 90)
            return interpolate(
              f,
              [durationInFrames - 90, durationInFrames],
              [0.18, 0],
              { extrapolateRight: "clamp" },
            );
          return 0.18;
        }}
      />

      {/* ====== SOUND EFFECTS — pro collection ====== */}

      {/* Typing during ingest terminal (~frame 370) */}
      <SFX src="audio/pro-typing-fast-matched.mp3" at={370} volume={0.25} duration={120} />

      {/* Badge appear sounds — all 5 badges */}
      <SFX src="audio/pro-appear-click.mp3" at={515} volume={0.1} />
      <SFX src="audio/pro-appear-click.mp3" at={530} volume={0.1} />
      <SFX src="audio/pro-appear-click.mp3" at={545} volume={0.1} />
      <SFX src="audio/pro-appear-click.mp3" at={560} volume={0.1} />
      <SFX src="audio/pro-appear-click.mp3" at={575} volume={0.1} />

      {/* Node sounds during graph building */}
      {NODE_POSITIONS.map((_, i) => (
        <SFX
          key={`node-sfx-${i}`}
          src="audio/pro-node-chime.mp3"
          at={835 + i * 14}
          volume={0.12}
          duration={30}
        />
      ))}

      {/* Typing during query terminal (~frame 1045) */}
      <SFX src="audio/pro-typing-fast-matched.mp3" at={1045} volume={0.25} duration={120} />

      {/* Clean ding on CTA */}
      <SFX src="audio/chime-airplane-ding.mp3" at={1275} volume={0.1} />

      {/* ====== VISUAL SCENES ====== */}
      <TransitionSeries>
        {/* Scene 1 — Hook: 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        {/* Scene 2 — Problem: 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Light Leak Overlay #1 — amber between Problem and Solution */}
        <TransitionSeries.Sequence durationInFrames={LIGHT_LEAK_DURATION}>
          <AbsoluteFill>
            <LightLeak seed={3} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 3 — Solution Reveal: 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <SolutionReveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 4 — Ingest Demo (LIVE terminal): 9s */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <IngestDemo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5 — Wiki Output (Obsidian screenshot): 7s */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <WikiOutput />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Light Leak Overlay #2 — cyan between Wiki Output and Graph */}
        <TransitionSeries.Sequence durationInFrames={LIGHT_LEAK_DURATION}>
          <AbsoluteFill>
            <LightLeak seed={5} hueShift={200} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={clockWipe({ width: 1920, height: 1080 })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 6 — Graph Building (animated nodes): 8s */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <GraphBuilding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 7 — Query Demo (LIVE terminal): 8s */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <QueryDemo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={flip({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 8 — CTA: 11s */}
        <TransitionSeries.Sequence durationInFrames={330}>
          <CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
