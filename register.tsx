import { Composition, Folder } from "remotion";
import { MarketingPromo } from "./MarketingPromo";
import { AppDemo } from "./AppDemo";
import { PromoA } from "./PromoA";
import { PromoB } from "./PromoB";
import { PromoC } from "./PromoC";
import { PromoV2Dark } from "./PromoV2Dark";
import { PromoV2 } from "./PromoV2";
import { PromoV3 } from "./PromoV3";
import { PromoV3Synth } from "./PromoV3Synth";
import { PromoV4 } from "./PromoV4";
import { PromoV5 } from "./PromoV5";
import { PromoV6 } from "./PromoV6";
import { PromoV7 } from "./PromoV7";
import { PromoV8 } from "./PromoV8";
import { PromoV9 } from "./PromoV9";
import { PromoV10 } from "./PromoV10";
import { KineticPitch } from "./KineticPitch";

export const Register: React.FC = () => {
  return (
    <Folder name="llm-wiki">
      <Composition
        id="KineticPitch"
        component={KineticPitch}
        durationInFrames={970}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV10"
        component={PromoV10}
        durationInFrames={1680}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV9"
        component={PromoV9}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV8"
        component={PromoV8}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV7"
        component={PromoV7}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV6"
        component={PromoV6}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV5"
        component={PromoV5}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV4"
        component={PromoV4}
        durationInFrames={1560}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV3Synth"
        component={PromoV3Synth}
        durationInFrames={1590}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV3"
        component={PromoV3}
        durationInFrames={1590}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV2Dark"
        component={PromoV2Dark}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoV2"
        component={PromoV2}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoC"
        component={PromoC}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoB"
        component={PromoB}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoA"
        component={PromoA}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AppDemo"
        component={AppDemo}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MarketingPromo"
        component={MarketingPromo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
