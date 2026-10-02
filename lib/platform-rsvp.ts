import "server-only";

export type LinkedGuest={
  id:string;
  firstName:string;
  lastName:string;
  rsvp:"yes"|"no"|"pending";
  dietary?:string|null;
};

export type LinkedHousehold={
  id:string;
  name:string;
  inviteCode:string;
  spotsAllowed:number;
  message?:string|null;
  guests:LinkedGuest[];
};

export type LinkedWedding={
  id:string;
  slug:string;
  personOne:string;
  personTwo:string;
  weddingDate:string;
};

export type LinkedRsvp={wedding:LinkedWedding;household:LinkedHousehold};

export function platformRsvpConfigured(){
  return Boolean(
    process.env.WEDDING_PLATFORM_SUPABASE_URL &&
    process.env.WEDDING_PLATFORM_SUPABASE_ANON_KEY &&
    process.env.WEDDING_PLATFORM_WEDDING_SLUG
  );
}

export function validInviteCode(value:string){
  return /^[A-Za-z0-9]{6,32}$/.test(value);
}

async function invokeRpc<T>(name:string,body:Record<string,unknown>):Promise<T>{
  const base=process.env.WEDDING_PLATFORM_SUPABASE_URL;
  const key=process.env.WEDDING_PLATFORM_SUPABASE_ANON_KEY;
  if(!base||!key||!platformRsvpConfigured()){
    throw new Error("La conexión del RSVP todavía no está configurada.");
  }

  const res=await fetch(`${base.replace(/\/$/,"")}/rest/v1/rpc/${name}`,{
    method:"POST",
    headers:{"Content-Type":"application/json",apikey:key},
    body:JSON.stringify(body),
    cache:"no-store",
  });

  if(!res.ok) {
    // Avoid reflecting internal DB details to the visitor.
    throw new Error("No pudimos conectar con las confirmaciones. Intenta de nuevo.");
  }
  return await res.json() as T;
}

export async function getLinkedRsvp(code:string):Promise<LinkedRsvp|null>{
  if(!validInviteCode(code))return null;
  const result=await invokeRpc<LinkedRsvp|null>("get_public_rsvp",{p_code:code});
  if(!result?.wedding||!result.household)return null;
  // A personal invitation must never render another couple's guest list.
  if(result.wedding.slug!==process.env.WEDDING_PLATFORM_WEDDING_SLUG)return null;
  return result;
}

// The submission only needs the identity and confirmed answer of each guest.
export type RsvpSubmissionGuest = {
  id: string;
  rsvp: "yes" | "no";
  dietary?: string;
};

export async function submitLinkedRsvp(code:string,guests:RsvpSubmissionGuest[],message:string){
  const saved=await invokeRpc<boolean>("submit_public_rsvp",{
    p_code:code,
    p_guests:guests.map(g=>({id:g.id,rsvp:g.rsvp,dietary:g.rsvp==="yes"?(g.dietary||""):""})),
    p_message:message||null,
  });
  if(saved!==true)throw new Error("No pudimos guardar tu respuesta.");
}
