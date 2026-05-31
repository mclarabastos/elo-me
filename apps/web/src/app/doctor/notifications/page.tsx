import { getNotifications } from "@/lib/api";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const dynamic = "force-dynamic";

const DOCTOR_DEMO_IDENTITY_ID = "auth_doctor_ana_demo";

export default async function DoctorNotificationsPage() {
  const notifications = await getNotifications(DOCTOR_DEMO_IDENTITY_ID);

  return (
    <NotificationsList
      role="doctor"
      title="Notificações"
      description=""
      notifications={notifications}
    />
  );
}