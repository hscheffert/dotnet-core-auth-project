import { v4 as uuidv4 } from 'uuid';

// This file contains some utilities for dealing with autocomplete
// It also has some information on why things are the way they are
//
// Chrome: https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
// Lastpass: https://lastpass.com/support.php?cmd=showfaq&id=10512

/**
 * Disables browser AutoComplete/AutoFill, whatever you want to call it.
 *
 * This does mess with the **Name** attribute, but you should not be using that directly anyway
 */
let disableAutoCompleteTags = () => ({
    autoComplete: "new-password", // Forces chrome into thinking this is a password. The only way to disable autocomplete on Chrome
    // "data-lpignore": "true", // Indicates to Lastpass that it should not worry about this element
    name: `${uuidv4()}`
});

export { disableAutoCompleteTags };
