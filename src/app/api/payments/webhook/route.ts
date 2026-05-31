import { handleLocalWalletWebhook } from "@/modules/payments/payment.webhook";

export async function POST(req: Request) {
  const body = await req.json();

  return handleLocalWalletWebhook(
    { body },
    {
      status: (code: number) => ({
        send: (msg: string) => new Response(msg, { status: code }),
      }),
    },
  );
}
