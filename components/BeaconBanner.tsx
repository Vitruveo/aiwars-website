import Reveal from "@/components/Reveal";
import ActivationTabs from "@/components/ActivationTabs";

// Mint page banner: the activations a shard switches on, one tab each.
export default function BeaconBanner() {
  return (
    <div className="mt-6">
      <Reveal>
        <ActivationTabs />
      </Reveal>
    </div>
  );
}
