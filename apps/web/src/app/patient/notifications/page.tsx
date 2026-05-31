import { getNotifications } from "@/lib/api";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const dynamic = "force-dynamic";

const PATIENT_DEMO_IDENTITY_ID = "auth_patient_rose_demo";

export default async function PatientNotificationsPage() {
  const notifications = await getNotifications(PATIENT_DEMO_IDENTITY_ID);

  return (
    <NotificationsList
      role="patient"
      title="Notificações"
      description=""
      notifications={notifications}
    />
  );
}