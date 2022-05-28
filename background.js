function getKeyFromStorage (key) {
  // getKeyFromStorge: wrapper for chrome.storage.local.get(),
  //                   return promise containing the value of provided key
  return new Promise((resolve, _) => {
    chrome.storage.local.get( key, result => resolve(result[key]) );
  });
}

// prompt user to configure after install
chrome.runtime.onInstalled.addListener(i => {
  if (i.reason == 'install') {
    // wait 1 sec before opening the window to prevent the browser from stealing the focus
    setTimeout(() => {
      chrome.windows.create({url: 'popup.html', type: 'popup', height: 300, width: 450 })
    }, 1000);
  }
});

(async () => {
  const notification_id = 'batteryLevelAlert',
        battery = await navigator.getBattery(),
        do_not_show_notification_again = await getKeyFromStorage('do_not_show_notification_again');

  let notification_exist = notification_showed = false;

  // clear battery level notification (if exist) when the device connected to a power adapter
  battery.onchargingchange = async () => {
    if (battery.charging) {
      console.log('[debug]:', 'Connected to power adapter!');

      if (notification_exist) {
        chrome.notifications.clear(notification_id);
        notification_exist = notification_showed = false;
      }
    }
  }

  battery.onlevelchange = async () => {
    const battery_percentage = parseInt( (battery.level * 100).toFixed(0) ),
          triggerLevel = await getKeyFromStorage('triggerLevel'),
          enable_warning = await getKeyFromStorage('warning'),
          warning_triggerLevel = await getKeyFromStorage('warning_triggerLevel');

    console.log('[debug]:', 'Battery level changed:', `${battery_percentage}%`);

    if ( ! battery.charging ) {
      // show notification only if do_not_show_notification_again is not specified or the notification never shows before
      if ( ( !(do_not_show_notification_again) || !(notification_showed) ) && battery_percentage <= triggerLevel ) {
        const notification_options = {
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Battery',
          message: `${battery_percentage}% remaining`,
          priority: 1
        };

        // check if any existing battery level notification
        if ( ! notification_exist ) {
          // create a new notification if not exist
          chrome.notifications.create(notification_id, notification_options);
          notification_exist = true
        } else {
          // update it if exists
          chrome.notifications.update(notification_id, notification_options);
        }
      }

      if ( enable_warning && battery_percentage == (warning_triggerLevel || triggerLevel) ) {
        alert(`${battery_percentage}% remaining`);
      }
    }
  }

  chrome.notifications.onClosed.addListener((id, _) => { 
    console.log('[debug]:', 'Notification closed.');
    notification_exist = false
  });
})();
