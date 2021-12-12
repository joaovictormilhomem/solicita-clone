export function spawnNotification(body, title) {
  if (Notification.permission === 'default')
    Notification.requestPermission();
    
  let options = {
    body: body,
    icon: './favicon.ico'
  }
  let notification = new Notification(title, options);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      notification.close();
    }
  });

  return notification;
}