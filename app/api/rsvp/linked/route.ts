import { NextResponse } from "next/server";
import { getLinkedRsvp, platformRsvpConfigured, submitLinkedRsvp, validInviteCode } from "@/lib/platform-rsvp";

type SubmittedGuest={id?:unknown;rsvp?:unknown;dietary?:unknown};

export async function POST(request:Request){
  if(!platformRsvpConfigured()){
    return NextResponse.json({ok:false,message:"La conexión con el RSVP todavía no está disponible."},{status:503});
  }

  let parsed: unknown;
  try{parsed=await request.json();}
  catch{return NextResponse.json({ok:false,message:"Datos inválidos."},{status:400});}
  const body = parsed !== null && typeof parsed === "object" ? parsed as Record<string, unknown> : {};

  const code=typeof body?.code==="string"?body.code.trim():"";
  const message=typeof body?.message==="string"?body.message.trim():"";
  const guests:SubmittedGuest[]=Array.isArray(body?.guests)?body.guests:[];
  if(!validInviteCode(code)||message.length>1000||guests.length===0||guests.length>100){
    return NextResponse.json({ok:false,message:"Revisa las respuestas antes de enviarlas."},{status:400});
  }
  if(typeof body?.company==="string"&&body.company.trim()){
    return NextResponse.json({ok:true,message:"Respuesta recibida."});
  }

  try{
    const linked=await getLinkedRsvp(code);
    if(!linked)return NextResponse.json({ok:false,message:"Invitación no encontrada."},{status:404});

    const ids=new Set(linked.household.guests.map(g=>g.id));
    const unique=new Set(guests.map(g=>g.id));
    if(guests.length!==ids.size||unique.size!==ids.size||
      guests.some(g=>typeof g.id!=="string"||!ids.has(g.id)||
        (g.rsvp!=="yes"&&g.rsvp!=="no")||
        (g.dietary!==undefined&&typeof g.dietary!=="string")||
        (typeof g.dietary==="string"&&g.dietary.length>500))){
      return NextResponse.json({ok:false,message:"Falta responder por una persona o hay datos inválidos."},{status:400});
    }

    const confirmedGuests = guests.map((guest) => ({
      id: guest.id as string,
      rsvp: guest.rsvp as "yes" | "no",
      dietary: typeof guest.dietary === "string" ? guest.dietary : undefined,
    }));
    await submitLinkedRsvp(code,confirmedGuests,message);
    return NextResponse.json({ok:true,message:"¡Gracias! Su respuesta quedó guardada para Isra y Liz."});
  }catch{
    return NextResponse.json({ok:false,message:"No pudimos guardar su confirmación. Por favor, intenten nuevamente."},{status:502});
  }
}
