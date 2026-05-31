from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.text import normalize_payload_text
from app.core.time import utc_now
from app.db.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse


router = APIRouter()


def serialize_notification(notification: Notification) -> dict[str, object]:
    return normalize_payload_text(
        NotificationResponse.model_validate(notification).model_dump(mode="json")
    )


@router.get("/{identity_id}", response_model=list[NotificationResponse])
def get_notifications(
    identity_id: str,
    db: Session = Depends(get_db),
) -> list[dict[str, object]]:
    notifications = (
        db.query(Notification)
        .filter(Notification.recipient_identity_id == identity_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return [serialize_notification(notification) for notification in notifications]


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    notification = db.get(Notification, notification_id)

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    notification.status = "read"
    notification.read_at = utc_now()
    db.commit()
    db.refresh(notification)

    return serialize_notification(notification)
