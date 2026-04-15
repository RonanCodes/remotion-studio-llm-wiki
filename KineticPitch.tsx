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
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { LightLeak } from "@remotion/light-leaks";
import { light } from "../../styles/colors";

const { fontFamily } = loadFont();

// ---------------------------------------------------------------------------
// Spring presets
// ---------------------------------------------------------------------------
const SNAPPY = { damping: 15, stiffness: 200 } as const;
const BOUNCY = { damping: 8, stiffness: 150 } as const;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const DARK_BG = "#0a0a0a";
const AMBER = "#e0af40";
const CYAN = "#5bbcd6";
const GREEN = "#7dcea0";
const CORAL = "#e06c75";

// ---------------------------------------------------------------------------
// SFX helper
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
// Scene 1 — "The Input" (frames 0–179)
// ---------------------------------------------------------------------------
const WORD_CLOUD = [
  "LLMs",
  "Claude Code",
  "Codex",
  "Ralph Loop",
  "OpenClaw",
  "Agentic Engineering",
  "fine-tuning",
  "RAG",
  "MCP",
  "vibe coding",
];

const WORD_COLORS = [AMBER, CYAN, GREEN];

const Scene1Input: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Kinetic word cloud */}
      {WORD_CLOUD.map((word, i) => {
        const appearFrame = i * 12;
        const angle = ((i * 137.5) % 360) * (Math.PI / 180);
        const radius = 380 + (i % 3) * 70;
        const cx = 960 + Math.cos(angle) * radius;
        const cy = 540 + Math.sin(angle) * radius;

        const wordScale = spring({
          frame: frame - appearFrame,
          fps,
          config: BOUNCY,
        });
        const drift = interpolate(
          frame,
          [appearFrame, appearFrame + 120],
          [0, 15],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        // Fade out early so words clear before main text appears
        const fadeOutStart = Math.max(appearFrame + 12, 70);
        const fadeOutEnd = fadeOutStart + 20;
        const wordOpacity = interpolate(
          frame,
          [appearFrame, appearFrame + 8, fadeOutStart, fadeOutEnd],
          [0, 0.9, 0.9, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={word}
            style={{
              position: "absolute",
              left: cx,
              top: cy + drift,
              transform: `translate(-50%, -50%) scale(${Math.max(0, wordScale)})`,
              fontSize: 32,
              fontWeight: 700,
              color: WORD_COLORS[i % 3],
              opacity: Math.max(0, wordOpacity),
              letterSpacing: 1,
            }}
          >
            {word}
          </div>
        );
      })}

      {/* "You read 200 articles a year." */}
      {(() => {
        const fadeStart = 90;
        const headOpacity = interpolate(
          frame,
          [fadeStart, fadeStart + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const headY = interpolate(
          frame,
          [fadeStart, fadeStart + 20],
          [20, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }
        );
        return (
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: `translate(-50%, -50%) translateY(${headY}px)`,
              opacity: headOpacity,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 64, fontWeight: 800, color: "#fff" }}>
              You read{" "}
              <span style={{ color: AMBER }}>200</span> articles a year.
            </div>
          </div>
        );
      })()}

      {/* "How many can you recall?" */}
      {(() => {
        const subStart = 130;
        const subOpacity = interpolate(
          frame,
          [subStart, subStart + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            style={{
              position: "absolute",
              top: "56%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: subOpacity,
              fontSize: 36,
              color: "#aaa",
              fontWeight: 500,
            }}
          >
            How many can you recall?
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 2 — "The Decay" (120 frames)
// ---------------------------------------------------------------------------
const DECAY_ITEMS = [
  { number: "200", color: AMBER, label: "articles read", delay: 0 },
  { number: "→ 10", color: GREEN, label: "notes taken", delay: 30 },
  { number: "→ 0", color: CORAL, label: "retained", delay: 60 },
];

const Scene2Decay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bottomTextOpacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {DECAY_ITEMS.map((item, i) => {
          const scale = spring({
            frame: frame - item.delay,
            fps,
            config: BOUNCY,
          });
          // Dim previous numbers when next appears
          const nextDelay = DECAY_ITEMS[i + 1]?.delay ?? Infinity;
          const dimOpacity =
            frame >= nextDelay
              ? interpolate(frame, [nextDelay, nextDelay + 10], [1, 0.3], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 1;

          const visible = frame >= item.delay;

          return (
            <div
              key={item.number}
              style={{
                textAlign: "center",
                transform: `scale(${visible ? Math.max(0, scale) : 0})`,
                opacity: dimOpacity,
              }}
            >
              <div
                style={{
                  fontSize: 160,
                  fontWeight: 900,
                  color: item.color,
                  lineHeight: 1,
                }}
              >
                {item.number}
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: "#bbb",
                  marginTop: 12,
                  fontWeight: 500,
                  letterSpacing: 1,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: "50%",
          transform: "translate(-50%)",
          opacity: bottomTextOpacity,
          fontSize: 42,
          color: "#ccc",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        The problem isn&apos;t reading. It&apos;s retention.
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 3 — "The Solution" (150 frames)
// ---------------------------------------------------------------------------
const SOLUTION_WORDS = [
  "A",
  "persistent,",
  "interlinked",
  "knowledge",
  "base",
];

const LOGO_TRIO = [
  { src: "assets/logos/claude-ai-icon.svg", label: "Engine" },
  { src: "assets/logos/terminal-icon.svg", label: "Interface" },
  { src: "assets/logos/obsidian-logo-gradient.svg", label: "Viewer" },
];

const Scene3Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: BOUNCY });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: light.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* LLM Wiki title */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          color: AMBER,
          transform: `scale(${Math.max(0, titleScale)})`,
          marginBottom: 24,
        }}
      >
        LLM Wiki
      </div>

      {/* Word-by-word reveal */}
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 900,
        }}
      >
        {SOLUTION_WORDS.map((word, i) => {
          const wordDelay = 20 + i * 4;
          const wordScale = spring({
            frame: frame - wordDelay,
            fps,
            config: SNAPPY,
          });
          const wordOpacity = interpolate(
            frame,
            [wordDelay, wordDelay + 6],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <span
              key={`${word}-${i}`}
              style={{
                fontSize: 40,
                fontWeight: 600,
                color: light.textPrimary,
                opacity: Math.max(0, wordOpacity),
                transform: `scale(${Math.max(0, wordScale)})`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Logo trio */}
      <div
        style={{
          display: "flex",
          gap: 80,
          marginTop: 60,
          alignItems: "center",
        }}
      >
        {LOGO_TRIO.map((logo, i) => {
          const logoDelay = 60 + i * 12;
          const logoScale = spring({
            frame: frame - logoDelay,
            fps,
            config: BOUNCY,
          });
          const logoOpacity = interpolate(
            frame,
            [logoDelay, logoDelay + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={logo.label}
              style={{
                textAlign: "center",
                transform: `scale(${Math.max(0, logoScale)})`,
                opacity: Math.max(0, logoOpacity),
              }}
            >
              <Img
                src={staticFile(logo.src)}
                style={{ width: 64, height: 64 }}
              />
              <div
                style={{
                  fontSize: 18,
                  color: light.textSecondary,
                  marginTop: 8,
                  fontWeight: 600,
                }}
              >
                {logo.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 4 — "The Flow" (180 frames)
// ---------------------------------------------------------------------------
const SOURCE_TYPES = [
  { name: "Web", color: "#4285F4" },
  { name: "YouTube", color: "#FF0000" },
  { name: "PDF", color: "#E44D26" },
  { name: "GitHub", color: "#333" },
  { name: "Tweet", color: "#1DA1F2" },
];

const WIKI_PAGES = [
  "andrej-karpathy.md",
  "llm-operating-system.md",
  "attention-mechanism.md",
  "scaling-laws.md",
  "rlhf-overview.md",
];

const Scene4Flow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bottomOpacity = interpolate(frame, [140, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bottomY = interpolate(frame, [140, 155], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Arrow pulse
  const arrowPulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [0.6, 1, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: light.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Left: source pills */}
      <div
        style={{
          position: "absolute",
          left: 160,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {SOURCE_TYPES.map((src, i) => {
          const delay = i * 20;
          const slideX = spring({
            frame: frame - delay,
            fps,
            config: SNAPPY,
          });
          const opacity = interpolate(
            frame,
            [delay, delay + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const x = interpolate(Math.max(0, slideX), [0, 1], [-200, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={src.name}
              style={{
                transform: `translateX(${x}px)`,
                opacity: Math.max(0, opacity),
                padding: "14px 32px",
                borderRadius: 40,
                backgroundColor: src.color,
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
                textAlign: "center",
                minWidth: 160,
                boxShadow: `0 4px 16px ${src.color}40`,
              }}
            >
              {src.name}
            </div>
          );
        })}
      </div>

      {/* Center arrow */}
      <div
        style={{
          fontSize: 160,
          fontWeight: 300,
          color: AMBER,
          opacity: arrowPulse,
          textShadow: `0 0 40px ${AMBER}60`,
        }}
      >
        →
      </div>

      {/* Right: wiki pages */}
      <div
        style={{
          position: "absolute",
          right: 160,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {WIKI_PAGES.map((page, i) => {
          const delay = 10 + i * 20;
          const slideX = spring({
            frame: frame - delay,
            fps,
            config: SNAPPY,
          });
          const opacity = interpolate(
            frame,
            [delay, delay + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const x = interpolate(Math.max(0, slideX), [0, 1], [200, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={page}
              style={{
                transform: `translateX(${x}px)`,
                opacity: Math.max(0, opacity),
                padding: "12px 24px",
                borderRadius: 8,
                backgroundColor: light.bgCard,
                border: `1px solid ${light.border}`,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 22,
                color: CYAN,
                fontWeight: 600,
              }}
            >
              {page}
            </div>
          );
        })}
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: `translate(-50%) translateY(${bottomY}px)`,
          opacity: bottomOpacity,
          fontSize: 44,
          fontWeight: 700,
          color: light.textPrimary,
        }}
      >
        One command. Infinite connections.
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 5 — "The Graph" (120 frames)
// ---------------------------------------------------------------------------
const GRAPH_NODES: { x: number; y: number }[] = Array.from(
  { length: 15 },
  (_, i) => {
    // Deterministic spread across 1920x1080
    const angle = ((i * 137.5) % 360) * (Math.PI / 180);
    const radius = 200 + (i * 47) % 300;
    return {
      x: 960 + Math.cos(angle) * radius,
      y: 540 + Math.sin(angle) * radius,
    };
  }
);

const GRAPH_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
  [5, 10], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 13], [13, 14], [0, 14],
  [6, 11], [7, 12], [8, 13], [1, 3],
];

const Scene5Graph: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth counter 0 -> 500
  const counterVal = Math.round(
    interpolate(frame, [0, 100], [0, 500], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  const counterScale = spring({ frame, fps, config: SNAPPY });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: light.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Connection lines with strokeDasharray animation */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {GRAPH_CONNECTIONS.map(([from, to], i) => {
          const maxNode = Math.max(from, to);
          const lineDelay = maxNode * 6 + 3;
          const dx = GRAPH_NODES[to].x - GRAPH_NODES[from].x;
          const dy = GRAPH_NODES[to].y - GRAPH_NODES[from].y;
          const lineLen = Math.sqrt(dx * dx + dy * dy);

          const drawProgress = interpolate(
            frame,
            [lineDelay, lineDelay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <line
              key={`conn-${i}`}
              x1={GRAPH_NODES[from].x}
              y1={GRAPH_NODES[from].y}
              x2={GRAPH_NODES[to].x}
              y2={GRAPH_NODES[to].y}
              stroke={CYAN}
              strokeWidth={2}
              opacity={0.4}
              strokeDasharray={lineLen}
              strokeDashoffset={lineLen * (1 - drawProgress)}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {GRAPH_NODES.map((pos, i) => {
        const nodeDelay = i * 6;
        const nodeScale = spring({
          frame: frame - nodeDelay,
          fps,
          config: BOUNCY,
        });
        const nodeColor =
          i % 3 === 0 ? AMBER : i % 3 === 1 ? CYAN : GREEN;

        return (
          <div
            key={`node-${i}`}
            style={{
              position: "absolute",
              left: pos.x - 14,
              top: pos.y - 14,
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: nodeColor,
              transform: `scale(${Math.max(0, nodeScale)})`,
              boxShadow: `0 0 20px ${nodeColor}80`,
            }}
          />
        );
      })}

      {/* Counter overlay */}
      <div
        style={{
          position: "absolute",
          transform: `scale(${Math.max(0, counterScale)})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            color: AMBER,
            lineHeight: 1,
            textShadow: `0 4px 30px ${AMBER}40`,
          }}
        >
          {counterVal}
        </div>
        <div
          style={{
            fontSize: 28,
            color: light.textSecondary,
            fontWeight: 600,
            marginTop: 8,
            letterSpacing: 2,
          }}
        >
          CONNECTED PAGES
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 6 — CTA (150 frames)
// ---------------------------------------------------------------------------
const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headScale = spring({ frame, fps, config: BOUNCY });

  // Breathing glow
  const glowIntensity = interpolate(
    frame % 60,
    [0, 30, 60],
    [10, 25, 10],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const urlOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlY = interpolate(frame, [30, 45], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: light.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Headline */}
      <div
        style={{
          transform: `scale(${Math.max(0, headScale)})`,
          fontSize: 72,
          fontWeight: 800,
          color: light.textPrimary,
          textAlign: "center",
          textShadow: `0 0 ${glowIntensity}px ${AMBER}30`,
        }}
      >
        Build yours in{" "}
        <span style={{ color: AMBER }}>5 minutes</span>.
      </div>

      {/* GitHub URL */}
      <div
        style={{
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Img
          src={staticFile("assets/logos/github-mark.svg")}
          style={{ width: 32, height: 32 }}
        />
        <span
          style={{
            fontSize: 32,
            color: light.textSecondary,
            fontWeight: 600,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}
        >
          github.com/RonanCodes/llm-wiki
        </span>
      </div>

      {/* Logo trio */}
      <div
        style={{
          display: "flex",
          gap: 80,
          marginTop: 60,
          alignItems: "center",
        }}
      >
        {LOGO_TRIO.map((logo, i) => {
          const logoDelay = 50 + i * 12;
          const logoScale = spring({
            frame: frame - logoDelay,
            fps,
            config: BOUNCY,
          });
          const logoOpacity = interpolate(
            frame,
            [logoDelay, logoDelay + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={logo.label}
              style={{
                textAlign: "center",
                transform: `scale(${Math.max(0, logoScale)})`,
                opacity: Math.max(0, logoOpacity),
              }}
            >
              <Img
                src={staticFile(logo.src)}
                style={{ width: 56, height: 56 }}
              />
              <div
                style={{
                  fontSize: 16,
                  color: light.textSecondary,
                  marginTop: 8,
                  fontWeight: 600,
                }}
              >
                {logo.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene timeline constants (for TransitionSeries)
// ---------------------------------------------------------------------------
const SCENE1_DUR = 180;
const SCENE2_DUR = 160;
const SCENE3_DUR = 150;
const SCENE4_DUR = 180;
const SCENE5_DUR = 120;
const SCENE6_DUR = 150;
const LIGHT_LEAK_DUR = 30;
const TRANSITION_DUR = 15;

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
export const KineticPitch: React.FC = () => {
  const { fps } = useVideoConfig();

  // Calculate cumulative start frames for SFX placement.
  // TransitionSeries with transitions shortens the timeline:
  //   - LightLeak overlay between scene 2 and 3 does NOT shorten
  //   - Transition between scene 4 and 5 shortens by TRANSITION_DUR
  //   - Transition between scene 5 and 6 shortens by TRANSITION_DUR
  const s1Start = 0;
  const s2Start = SCENE1_DUR;
  const s3Start = s2Start + SCENE2_DUR; // overlay doesn't shorten
  const s4Start = s3Start + SCENE3_DUR;
  const s5Start = s4Start + SCENE4_DUR - TRANSITION_DUR;
  const s6Start = s5Start + SCENE5_DUR - TRANSITION_DUR;

  // Background music volume with fade in/out
  const totalDur =
    SCENE1_DUR +
    SCENE2_DUR +
    SCENE3_DUR +
    SCENE4_DUR +
    SCENE5_DUR +
    SCENE6_DUR -
    TRANSITION_DUR * 2; // two transitions shorten

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <TransitionSeries>
        {/* Scene 1: The Input */}
        <TransitionSeries.Sequence durationInFrames={SCENE1_DUR}>
          <Scene1Input />
        </TransitionSeries.Sequence>

        {/* Hard cut to Scene 2 */}
        <TransitionSeries.Sequence durationInFrames={SCENE2_DUR}>
          <Scene2Decay />
        </TransitionSeries.Sequence>

        {/* Light leak overlay into Scene 3 */}
        <TransitionSeries.Overlay durationInFrames={LIGHT_LEAK_DUR}>
          <LightLeak />
        </TransitionSeries.Overlay>

        {/* Scene 3: The Solution */}
        <TransitionSeries.Sequence durationInFrames={SCENE3_DUR}>
          <Scene3Solution />
        </TransitionSeries.Sequence>

        {/* Scene 4: The Flow */}
        <TransitionSeries.Sequence durationInFrames={SCENE4_DUR}>
          <Scene4Flow />
        </TransitionSeries.Sequence>

        {/* Wipe transition to Scene 5 */}
        <TransitionSeries.Transition
          presentation={wipe()}
          timing={linearTiming({ durationInFrames: TRANSITION_DUR })}
        />

        {/* Scene 5: The Graph */}
        <TransitionSeries.Sequence durationInFrames={SCENE5_DUR}>
          <Scene5Graph />
        </TransitionSeries.Sequence>

        {/* Slide transition to Scene 6 */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DUR })}
        />

        {/* Scene 6: CTA */}
        <TransitionSeries.Sequence durationInFrames={SCENE6_DUR}>
          <Scene6CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* ---- SFX Layer ---- */}
      {/* Bass drop at start */}
      <SFX src="audio/pro-impact-bass-drop.mp3" at={0} volume={0.15} />

      {/* Appear clicks for each decay number */}
      <SFX
        src="audio/pro-appear-click.mp3"
        at={s2Start}
        volume={0.1}
        duration={30}
      />
      <SFX
        src="audio/pro-appear-click.mp3"
        at={s2Start + 30}
        volume={0.1}
        duration={30}
      />
      <SFX
        src="audio/pro-appear-click.mp3"
        at={s2Start + 60}
        volume={0.1}
        duration={30}
      />

      {/* Node chimes during graph building (every 6 frames, 15 nodes) */}
      {GRAPH_NODES.map((_, i) => (
        <SFX
          key={`node-sfx-${i}`}
          src="audio/pro-node-chime.mp3"
          at={s5Start + i * 6}
          volume={0.08}
          duration={20}
        />
      ))}

      {/* Background music */}
      <Sequence from={0} durationInFrames={totalDur}>
        <Audio
          src={staticFile("audio/music-synthwave-tech.mp3")}
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 30], [0, 0.15], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(
              f,
              [totalDur - 60, totalDur],
              [0.15, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
