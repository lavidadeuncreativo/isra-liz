import WeddingExperience from "@/components/WeddingExperience";
import { wedding } from "@/data/wedding";
import { platformRsvpConfigured } from "@/lib/platform-rsvp";

export default function Home() {
  return <WeddingExperience data={wedding} rsvpLinkedOnly={platformRsvpConfigured()}/>;
}
