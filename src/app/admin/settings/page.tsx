import { db } from "@/db";
import { settings } from "@/db/schema";
import Card, { CardHeader } from "@/components/ui/Card";
import { Settings as SettingsIcon } from "lucide-react";

export const dynamic = "force-dynamic";

async function getSettings() {
  try {
    return await db.select().from(settings);
  } catch {
    return [];
  }
}

export default async function AdminSettingsPage() {
  const allSettings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">الإعدادات</h1>
        <p className="text-slate-500">إعدادات النظام العامة</p>
      </div>

      <Card>
        <CardHeader title="إعدادات النظام" />
        {allSettings.length > 0 ? (
          <div className="space-y-3">
            {allSettings.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-700">{s.key}</p>
                </div>
                <span className="font-mono text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <SettingsIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>لا توجد إعدادات حالياً</p>
          </div>
        )}
      </Card>
    </div>
  );
}