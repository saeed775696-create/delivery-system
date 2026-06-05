import { notFound } from 'next/navigation';

interface MenuDetailPageProps {
  params: { id: string };
}

export default function MenuDetailPage({ params }: MenuDetailPageProps) {
  // TODO: جلب بيانات القسم (store section) حسب params.id
  // يمكنك لاحقاً إضافة استعلام من قاعدة البيانات

  if (!params.id) {
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">تفاصيل القسم</h1>
      <p className="text-muted-foreground">معرف القسم: {params.id}</p>
      {/* لاحقاً: عرض المنتجات المرتبطة بهذا القسم */}
    </div>
  );
}