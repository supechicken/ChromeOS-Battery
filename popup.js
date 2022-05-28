function getKeyFromStorage (key) {
  // getKeyFromStorge: wrapper for chrome.storage.local.get(),
  //                   return promise containing the value of provided key
  return new Promise((resolve, _) => {
    chrome.storage.local.get( key, result => resolve(result[key]) );
  });
}

function changeCheckboxValue (element, val) {
  // changeCheckboxValue: change the value of a checkbox and trigger the onchange event
  element.checked = val;
  element.dispatchEvent( new Event('change') );
}

/* level_input */
document.getElementById('level_input').onkeyup = (e) => {
  const element = e.currentTarget;

  getKeyFromStorage('triggerLevel').then(currentValue => {
    if (element.value != '' && element.value != currentValue && e.key == 'Enter') {
      chrome.storage.local.set({ triggerLevel: parseInt(element.value) });
      alert(`Level set: ${element.value}%`);
    }
  });

  updateSettings();
}
/* --- */

/* do_not_show_notification_again */
document.getElementById('do_not_show_notification_again').onchange = (e) => {
  const element = e.currentTarget;
  chrome.storage.local.set({ do_not_show_notification_again: element.checked });
}
/* --- */

/* warning */
document.getElementById('warning').onchange = (e) => {
  const element = e.currentTarget,
        enable_warning_level_container = document.getElementById('enable_warning_level_container'),
        enable_warning_level_checkbox = document.getElementById('enable_warning_level');

  if (element.checked) {
    enable_warning_level_container.style.visibility = 'visible';
    chrome.storage.local.set({ warning: true });
  } else {
    changeCheckboxValue(enable_warning_level_checkbox, false);
    enable_warning_level_container.style.visibility = 'hidden';
    chrome.storage.local.set({ warning: false });
  }

  updateSettings();
}
/* --- */

/* enable_warning_level */
document.getElementById('enable_warning_level').onchange = (e) => {
  const element = e.currentTarget,
        warning_level_input_container = document.getElementById('warning_level_input_container');

  if (element.checked) {
    warning_level_input_container.style.visibility = 'visible';
  } else {
    warning_level_input_container.style.visibility = 'hidden';
  }
}
/* --- */

/* warning_level_input */
document.getElementById('warning_level_input').onkeyup = (e) => {
  const element = e.currentTarget;

  getKeyFromStorage('warning_triggerLevel').then(currentValue => {
    if (element.value != '' && element.value != currentValue && e.key == 'Enter') {
      chrome.storage.local.set({ warning_triggerLevel: parseInt(element.value) });
      updateSettings();
      alert(`Level set: ${element.value}%`);
    }
  });
}
/* --- */

// save value in textbox elements when the textbox lost focus
[ 'level_input', 'warning_level_input' ].forEach(id => {
  const element = document.getElementById(id);

  element.onblur = () => {
    element.dispatchEvent( new KeyboardEvent('keyup', { key: 'Enter' }) );
  }
});

async function updateSettings (init) {
  // updateSettings: Update infomation on the top of popup, restore checkbox value if init == true
  const triggerLevel = await getKeyFromStorage('triggerLevel'),
        warning_triggerLevel = await getKeyFromStorage('warning_triggerLevel');

  document.getElementById('currentSettings').innerText =
    `Configured battery level: ${triggerLevel ? `${triggerLevel}%` : 'not set'}\n` +
    `Configured battery level (fullscreen warning): ${warning_triggerLevel ? `${warning_triggerLevel}%` : 'not set'}\n`

  if (init) {
    changeCheckboxValue( document.getElementById('do_not_show_notification_again'), await getKeyFromStorage('do_not_show_notification_again') );
    changeCheckboxValue( document.getElementById('enable_warning_level'), await getKeyFromStorage('warning_triggerLevel') );
    changeCheckboxValue( document.getElementById('warning'), await getKeyFromStorage('warning') );
  }
}

updateSettings(true);
