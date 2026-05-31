import { confirmPaymentController } from "@/modules/payments/payment.controller";

export async function POST(req: Request) {
  const body = await req.json();

  return confirmPaymentController(
    { body },
    {
      json: (data: any) => Response.json(data),
      status: (code: number) => ({
        json: (data: any) => Response.json(data, { status: code }),
      }),
    },
  );
}
