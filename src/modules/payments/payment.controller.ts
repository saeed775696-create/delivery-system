import { paymentService } from "./payment.service";

// إنشاء دفع
export const createPaymentController = async (req: any, res: any) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    return res.json(payment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// تأكيد يدوي (الكريمي)
export const confirmPaymentController = async (req: any, res: any) => {
  try {
    const { paymentId } = req.body;

    const payment = await paymentService.confirmManualPayment(paymentId);

    return res.json(payment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
