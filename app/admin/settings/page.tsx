import {
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Mail,
  Moon,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import { getSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "@/actions/site-settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
              <Settings className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <p className="text-xs font-medium text-cyan-400">
                إدارة المنصة
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                إعدادات سَكَني
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            تحكم في معلومات المنصة والحجوزات والتسجيل
            والإشعارات والإعدادات العامة من مكان واحد.
          </p>
        </div>

        <form action={updateSiteSettings}>
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Main Settings */}
            <div className="space-y-6 xl:col-span-2">
              {/* Platform Information */}
              <SettingsCard
                icon={<Globe2 className="h-5 w-5" />}
                title="معلومات المنصة"
                description="المعلومات الأساسية التي تظهر للمستخدمين."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="اسم المنصة"
                    name="siteName"
                    defaultValue={settings.siteName}
                    placeholder="سَكَني"
                  />

                  <Field
                    label="البريد الإلكتروني"
                    name="contactEmail"
                    type="email"
                    defaultValue={settings.contactEmail}
                    placeholder="admin@sakani.com"
                  />

                  <Field
                    label="رقم الهاتف"
                    name="contactPhone"
                    defaultValue={settings.contactPhone}
                    placeholder="+967 ..."
                    icon={<Phone className="h-4 w-4" />}
                  />

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                      العملة
                    </label>

                    <select
                      name="currency"
                      defaultValue={settings.currency}
                      className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                    >
                      <option value="YER">
                        ريال يمني (YER)
                      </option>

                      <option value="SAR">
                        ريال سعودي (SAR)
                      </option>

                      <option value="USD">
                        دولار أمريكي (USD)
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                      وصف المنصة
                    </label>

                    <textarea
                      name="siteDescription"
                      defaultValue={
                        settings.siteDescription
                      }
                      rows={4}
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                      placeholder="وصف مختصر عن منصة سَكَني..."
                    />
                  </div>
                </div>
              </SettingsCard>

              {/* Booking Settings */}
              <SettingsCard
                icon={
                  <CalendarDays className="h-5 w-5" />
                }
                title="إعدادات الحجوزات"
                description="تحكم في طريقة استقبال وإدارة حجوزات المستخدمين."
              >
                <div className="space-y-3">
                  <Toggle
                    name="bookingsEnabled"
                    checked={settings.bookingsEnabled}
                    icon={
                      <CalendarDays className="h-4 w-4" />
                    }
                    title="السماح بالحجوزات"
                    description="السماح للمستخدمين بإنشاء حجوزات جديدة."
                  />

                  <Toggle
                    name="autoConfirmBookings"
                    checked={settings.autoConfirmBookings}
                    icon={
                      <CheckCircle2 className="h-4 w-4" />
                    }
                    title="تأكيد الحجوزات تلقائيًا"
                    description="تأكيد الحجز مباشرة دون انتظار موافقة المدير."
                  />
                </div>
              </SettingsCard>

              {/* Users & Notifications */}
              <SettingsCard
                icon={<Users className="h-5 w-5" />}
                title="المستخدمون والإشعارات"
                description="إدارة التسجيل والتنبيهات الخاصة بالمنصة."
              >
                <div className="space-y-3">
                  <Toggle
                    name="registrationEnabled"
                    checked={settings.registrationEnabled}
                    icon={
                      <ShieldCheck className="h-4 w-4" />
                    }
                    title="السماح بالتسجيل"
                    description="السماح للزوار بإنشاء حسابات جديدة."
                  />

                  <Toggle
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    icon={
                      <Bell className="h-4 w-4" />
                    }
                    title="إشعارات البريد الإلكتروني"
                    description="تفعيل الإشعارات البريدية الخاصة بالمنصة."
                  />
                </div>
              </SettingsCard>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              {/* Display */}
              <SettingsCard
                icon={<Building2 className="h-5 w-5" />}
                title="إعدادات العرض"
                description="التحكم في طريقة عرض المحتوى."
              >
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-300">
                    العقارات في الصفحة
                  </label>

                  <input
                    type="number"
                    name="propertiesPerPage"
                    min={3}
                    max={50}
                    defaultValue={
                      settings.propertiesPerPage
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-slate-600">
                    من 3 إلى 50 عقارًا في الصفحة الواحدة.
                  </p>
                </div>
              </SettingsCard>

              {/* System */}
              <SettingsCard
                icon={<Wrench className="h-5 w-5" />}
                title="النظام"
                description="إعدادات تشغيل المنصة."
              >
                <Toggle
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  icon={
                    <Moon className="h-4 w-4" />
                  }
                  title="وضع الصيانة"
                  description="إيقاف الوصول العام للمنصة مؤقتًا."
                  danger
                />
              </SettingsCard>

              {/* Contact */}
              <div className="rounded-2xl border border-white/[0.07] bg-slate-900/50 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
                  <Mail className="h-5 w-5 text-cyan-300" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-white">
                  الدعم والتواصل
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  استخدم بيانات التواصل الموجودة في إعدادات
                  المنصة ليتمكن المستخدمون من الوصول إليك.
                </p>

                <div className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <p className="text-[11px] text-slate-600">
                    البريد الحالي
                  </p>

                  <p className="mt-1 truncate text-xs font-medium text-slate-300">
                    {settings.contactEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="sticky bottom-4 z-20 mt-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-cyan-400/10 bg-slate-950/90 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  حفظ إعدادات المنصة
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  سيتم تطبيق التغييرات على إعدادات سَكَني.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/15 hover:text-cyan-200"
              >
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

/* =========================================================
   Settings Card
========================================================= */

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/50 shadow-xl shadow-black/10 backdrop-blur-sm">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-300">
            {icon}
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   Input
========================================================= */

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-300">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 ${
            icon ? "pr-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   Toggle
========================================================= */

function Toggle({
  name,
  checked,
  icon,
  title,
  description,
  danger = false,
}: {
  name: string;
  checked: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ${
        danger
          ? "border-red-400/10 bg-red-400/[0.03] hover:border-red-400/20"
          : "border-white/[0.06] bg-white/[0.02] hover:border-cyan-400/10 hover:bg-cyan-400/[0.02]"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-400/10 text-red-300"
              : "bg-cyan-400/10 text-cyan-300"
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">
            {title}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={checked}
          className="peer sr-only"
        />

        <div
          className={`h-6 w-11 rounded-full border transition ${
            danger
              ? "border-red-400/10 bg-red-950/50 peer-checked:bg-red-500/30"
              : "border-white/10 bg-slate-800 peer-checked:bg-cyan-400/20"
          }`}
        />

        <div
          className={`absolute right-1 top-1 h-4 w-4 rounded-full bg-slate-500 transition peer-checked:translate-x-[-20px] ${
            danger
              ? "peer-checked:bg-red-400"
              : "peer-checked:bg-cyan-300"
          }`}
        />
      </div>
    </label>
  );
}