"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "ADMIN"
  ) {
    throw new Error("غير مصرح");
  }

  return session;
}

export async function updateSiteSettings(
  formData: FormData
): Promise<void> {
  try {
    await requireAdmin();

    const siteName = formData.get("siteName");
    const siteDescription = formData.get(
      "siteDescription"
    );
    const contactEmail = formData.get("contactEmail");
    const contactPhone = formData.get("contactPhone");
    const currency = formData.get("currency");

    const propertiesPerPageValue =
      formData.get("propertiesPerPage");

    if (
      typeof siteName !== "string" ||
      !siteName.trim()
    ) {
      return;
    }

    if (
      typeof siteDescription !== "string" ||
      !siteDescription.trim()
    ) {
      return;
    }

    if (
      typeof contactEmail !== "string" ||
      !contactEmail.trim()
    ) {
      return;
    }

    if (typeof contactPhone !== "string") {
      return;
    }

    if (
      currency !== "YER" &&
      currency !== "SAR" &&
      currency !== "USD"
    ) {
      return;
    }

    const propertiesPerPage = Number(
      propertiesPerPageValue
    );

    if (
      !Number.isInteger(propertiesPerPage) ||
      propertiesPerPage < 3 ||
      propertiesPerPage > 50
    ) {
      return;
    }

    const bookingsEnabled =
      formData.get("bookingsEnabled") === "on";

    const autoConfirmBookings =
      formData.get("autoConfirmBookings") === "on";

    const registrationEnabled =
      formData.get("registrationEnabled") === "on";

    const maintenanceMode =
      formData.get("maintenanceMode") === "on";

    const emailNotifications =
      formData.get("emailNotifications") === "on";

    await prisma.siteSettings.upsert({
      where: {
        id: "site",
      },

      create: {
        id: "site",
        siteName: siteName.trim(),
        siteDescription: siteDescription.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        currency,
        propertiesPerPage,
        bookingsEnabled,
        autoConfirmBookings,
        registrationEnabled,
        maintenanceMode,
        emailNotifications,
      },

      update: {
        siteName: siteName.trim(),
        siteDescription: siteDescription.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        currency,
        propertiesPerPage,
        bookingsEnabled,
        autoConfirmBookings,
        registrationEnabled,
        maintenanceMode,
        emailNotifications,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/properties");
  } catch (error) {
    console.error(
      "UPDATE_SITE_SETTINGS_ERROR",
      error
    );
  }
}