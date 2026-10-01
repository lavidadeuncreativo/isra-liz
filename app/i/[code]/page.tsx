import { notFound } from "next/navigation";
import WeddingExperience from "@/components/WeddingExperience";
import { wedding } from "@/data/wedding";
import { getLinkedRsvp, platformRsvpConfigured, validInviteCode } from "@/lib/platform-rsvp";

export const dynamic="force-dynamic";

export default async function PersonalizedInvitation({
  params,
}:{params:Promise<{code:string}>}){
  const {code}=await params;
  if(!validInviteCode(code))notFound();

  if(!platformRsvpConfigured()){
    return <main className="invite-unavailable">
      <h1>Estamos preparando las confirmaciones.</h1>
      <p>Vuelve a intentarlo un poco más tarde, por favor.</p>
    </main>;
  }

  let result;
  try {
    result=await getLinkedRsvp(code);
  }catch{
    return <main className="invite-unavailable">
      <h1>No pudimos abrir tu invitación por ahora.</h1>
      <p>Intenta nuevamente en unos minutos.</p>
    </main>;
  }
  if(!result)notFound();

  return <WeddingExperience
    data={wedding}
    linkedHousehold={result.household}
  />;
}
