var deferredPrompt;
var enableNotificationsBtns = document.querySelectorAll(
  '.enable-notifications'
);

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    const options = {
      body: 'You successfully subscribed to our Notification service!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        {
          action: 'confirm',
          title: 'Okay',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
        {
          action: 'cancel',
          title: 'Cancel',
          icon: '/src/images/icons/app-icon-96x96.png',
        },
      ],
    };

    navigator.serviceWorker.ready.then((swreg) => {
      swreg.showNotification('Successfully subscribed', options);
    });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then((sub) => {
      if (sub === null) {
        // Create a new subscription
        const vapidPublicKey =
          'BHlJzj2gec6Q_KrnyiBzXj9fdRNP96EsTSMakws_NoOOEHWEHIaskjBbLkQ68O4RV7NZV9Nj_PHfuMtgu7WHdB0';
        const convertedVapidPublicKey = urlBase64ToUnit8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      } else {
        // We have a subscription
      }
    })
    .then((newSub) => {
      return fetch(
        'https://pwa-simple-ig-default-rtdb.asia-southeast1.firebasedatabase.app/subscription.json',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(newSub),
        }
      );
    })
    .then((res) => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission((result) => {
    console.log('User Choice', result);

    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (const element of enableNotificationsBtns) {
    element.style.display = 'inline-block';
    element.addEventListener('click', askForNotificationPermission);
  }
}
