

import { getNotifications } from "@/lib/api";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const dynamic = "force-dynamic";

const CLINIC_DEMO_IDENTITY_ID = "auth_clinic_neurorio_demo";

export default async function ClinicNotificationsPage() {
  const notifications = await getNotifications(CLINIC_DEMO_IDENTITY_ID);

  return (
    <NotificationsList
      role="clinic"
      title="Notificações"
      description=""
      notifications={notifications}
    />
  );
}