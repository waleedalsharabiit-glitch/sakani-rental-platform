import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PropertyEditForm from "./property-edit-form";
import PropertyImages from "./property-images";
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPropertyPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

const [property, users, categories] = await Promise.all([
  prisma.property.findUnique({
    where: {
      id,
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  }),

  prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  }),

  prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  }),
]);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white lg:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            إدارة العقارات
          </p>

          <h1 className="text-3xl font-bold">
            تعديل العقار
          </h1>

          <p className="mt-2 text-slate-400">
            تعديل بيانات: {property.title}
          </p>
        </div>

        <PropertyEditForm
          property={{
            id: property.id,
            title: property.title,
            slug: property.slug,
            description: property.description ?? "",
            price: property.price,
            address: property.address,
            city: property.city,
            latitude: property.latitude,
            longitude: property.longitude,
            ownerId: property.ownerId,
            categoryId: property.categoryId,
          }}
          users={users}
          categories={categories}
        />

        <PropertyImages
  propertyId={property.id}
  images={property.images}
/>
      </div>
    </main>
  );
}